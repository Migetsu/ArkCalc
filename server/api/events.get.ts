import fallbackEvents from '~/assets/data/events.json'
import materialsCatalog from '~/assets/data/materials.json'

export interface EventRewardItem {
  itemId: string
  name: string
  tier: number
  count: number
  category: 'material' | 'currency' | 'exp' | 'module' | 'skill' | 'chip' | 'permit'
  source: 'shop' | 'milestone' | 'first_clear'
  icon?: string
}

export interface ArknightsEvent {
  id: string
  name: string
  title: string
  type: string
  status: 'active' | 'upcoming' | 'passed'
  cnStartDate: string
  cnEndDate: string
  globalStartDate?: string
  globalEndDate?: string
  daysUntilGlobal?: number
  wikiUrl: string
  description?: string
  rewards: EventRewardItem[]
  totalLmd: number
  totalExp: number
  totalOrundum: number
  totalPermits: number
}

// In-memory cache for 30 minutes to reduce wiki.gg traffic
let cachedEventsResponse: { timestamp: number; data: any } | null = null
const CACHE_TTL_MS = 30 * 60 * 1000

// Build material lookup dictionary (by clean lowercased name)
const materialNameMap = new Map<string, { id: string; tier: number; category: string; icon?: string }>()
for (const m of materialsCatalog) {
  materialNameMap.set(m.name.toLowerCase().trim(), m)
}

// Common name aliases and abbreviations from wiki.gg
const registerAlias = (alias: string, targetId: string, meta?: Partial<{ tier: number; category: string; icon?: string }>) => {
  const existing = materialsCatalog.find((m) => m.id === targetId)
  if (existing) {
    materialNameMap.set(alias.toLowerCase().trim(), {
      id: existing.id,
      tier: meta?.tier ?? existing.tier,
      category: meta?.category ?? existing.category,
      icon: meta?.icon ?? existing.icon,
    })
  } else if (meta) {
    materialNameMap.set(alias.toLowerCase().trim(), {
      id: targetId,
      tier: meta.tier ?? 4,
      category: meta.category ?? 'material',
      icon: meta.icon ?? `/images/items/${targetId}.png`,
    })
  }
}

registerAlias('lmd', '4001', { tier: 4, category: 'currency', icon: '/images/items/4001.png' })
registerAlias('tactical battle record', '2004', { tier: 4, category: 'exp', icon: '/images/items/2004.png' })
registerAlias('strategic battle record', '2004', { tier: 5, category: 'exp', icon: '/images/items/2004.png' })
registerAlias('frontline battle record', '2004', { tier: 3, category: 'exp', icon: '/images/items/2004.png' })
registerAlias('battle record', '2004', { tier: 4, category: 'exp', icon: '/images/items/2004.png' })
registerAlias('module data block', 'mod_unlock_token', { tier: 5, category: 'module', icon: '/images/items/mod_unlock_token.png' })
registerAlias('headhunting permit', 'single_permit', { tier: 4, category: 'permit', icon: '/images/items/single_permit.png' })
registerAlias('ten-roll permit', 'ten_permit', { tier: 5, category: 'permit', icon: '/images/items/ten_permit.png' })
registerAlias('keton colloid', '30054', { tier: 4, category: 'material', icon: '/images/items/30054.png' })
registerAlias('ketone colloid', '30054', { tier: 4, category: 'material', icon: '/images/items/30054.png' })
registerAlias('transmuted salt', '31083', { tier: 3, category: 'material', icon: '/images/items/31083.png' })
registerAlias('transmuted natural salt', '31083', { tier: 3, category: 'material', icon: '/images/items/31083.png' })
registerAlias('refined salt', '31084', { tier: 4, category: 'material', icon: '/images/items/31084.png' })
registerAlias('refined natural salt', '31084', { tier: 4, category: 'material', icon: '/images/items/31084.png' })
registerAlias('data supplement stick', 'mod_update_token_1', { tier: 4, category: 'module', icon: '/images/items/mod_update_token_1.png' })
registerAlias('data-supplement stick', 'mod_update_token_1', { tier: 4, category: 'module', icon: '/images/items/mod_update_token_1.png' })
registerAlias('data supplement instrument', 'mod_update_token_2', { tier: 5, category: 'module', icon: '/images/items/mod_update_token_2.png' })
registerAlias('data-supplement instrument', 'mod_update_token_2', { tier: 5, category: 'module', icon: '/images/items/mod_update_token_2.png' })
registerAlias('skill summary - 3', '3303', { tier: 3, category: 'skill', icon: '/images/items/3303.png' })
registerAlias('skill summary - 2', '3302', { tier: 2, category: 'skill', icon: '/images/items/3302.png' })
registerAlias('skill summary - 1', '3301', { tier: 1, category: 'skill', icon: '/images/items/3301.png' })

function parseQuantityText(qtyStr: string): number {
  if (!qtyStr) return 1
  const clean = qtyStr.trim().toUpperCase()
  if (clean.endsWith('K')) {
    const num = parseFloat(clean.replace('K', ''))
    return Math.round(num * 1000)
  }
  if (clean.endsWith('M')) {
    const num = parseFloat(clean.replace('M', ''))
    return Math.round(num * 1000000)
  }
  const parsed = parseInt(clean.replace(/,/g, ''), 10)
  return Number.isNaN(parsed) ? 1 : parsed
}

/**
 * Extracts store & reward items from wiki HTML tables.
 */
function parseWikiShopTable(tableHtml: string): EventRewardItem[] {
  const items: EventRewardItem[] = []
  const rows = [...tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]

  for (const r of rows) {
    const rowHtml = r[1]
    if (!rowHtml || rowHtml.includes('<th')) continue

    // 1. Match item name
    const nameMatch = rowHtml.match(/data-name="([^"]+)"/i)
      || rowHtml.match(/title="([^"]+)"/i)
      || rowHtml.match(/<a[^>]*>([A-Za-z0-9\-'\s]{3,30})<\/a>/i)

    if (!nameMatch || !nameMatch[1]) continue
    const rawName = nameMatch[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim()

    // Skip cosmetic outfits, furniture, and tokens
    if (
      rowHtml.includes('outfit-tooltip') ||
      rowHtml.includes('furniture-tooltip') ||
      rawName.toLowerCase().includes("token")
    ) {
      continue
    }

    // 2. Match item stock
    const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => (c[1] ? c[1].trim() : ''))
    const stockText = tds[2] ? tds[2].replace(/<[^>]+>/g, '').trim() : '1'
    let stock = 1
    const isInfinite = stockText === '∞' || stockText.includes('8734')
    if (isInfinite) {
      // Do not count infinite overflow exchange items into guaranteed free shop budget
      continue
    } else {
      const parsed = parseInt(stockText, 10)
      if (!Number.isNaN(parsed) && parsed > 0) stock = parsed
    }

    // 3. Match item pack multiplier
    const quantityMatch = rowHtml.match(/<div class="quantity">([^<]+)<\/div>/i)
      || rowHtml.match(/<div class="bottom-right-amount">([^<]+)<\/div>/i)
      || rowHtml.match(/class="item-amount">([^<]+)<\/div>/i)
      || rowHtml.match(/&#215;(\d+)/i)
      || rowHtml.match(/&times;(\d+)/i)

    const multiplier = (quantityMatch && quantityMatch[1]) ? parseQuantityText(quantityMatch[1]) : 1
    const totalCount = stock * multiplier

    // Map to material ID
    const meta = materialNameMap.get(rawName.toLowerCase())
    if (meta && totalCount > 0) {
      items.push({
        itemId: meta.id,
        name: rawName,
        tier: meta.tier,
        count: totalCount,
        category: meta.category as any,
        source: 'shop',
        icon: meta.icon,
      })
    }
  }

  return items
}

/**
 * Attempts to parse store items from arknights.wiki.gg MediaWiki API for a single event.
 */
async function fetchLiveEventStore(event: ArknightsEvent): Promise<ArknightsEvent | null> {
  try {
    const rawPageName = event.wikiUrl.split('/wiki/')[1] || event.name.replace(/\s+/g, '_')
    const pageName = decodeURIComponent(rawPageName)
    if (!pageName || pageName === 'Event/Upcoming') return null

    // 1. Fetch sections list
    const sectionsUrl = `https://arknights.wiki.gg/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=sections&format=json`
    const sectionsRes = await fetch(sectionsUrl, {
      headers: {
        'User-Agent': 'ArkCalc/1.0 (https://github.com/Migetsu/ArkCalc; info@arkcalc.local)',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!sectionsRes.ok) return null
    const sectionsJson = await sectionsRes.json()
    const sections = sectionsJson?.parse?.sections || []

    // Look for shop section
    const storeSection = sections.find((s: any) => {
      const line = (s.line || '').toLowerCase()
      return (
        line.includes('store') ||
        line.includes('camp') ||
        line.includes('market') ||
        line.includes('exchange') ||
        line.includes('workshop') ||
        line.includes('supplies') ||
        line.includes('depot')
      )
    })

    if (!storeSection || !storeSection.index) return null

    // 2. Fetch section HTML
    const storeUrl = `https://arknights.wiki.gg/api.php?action=parse&page=${encodeURIComponent(pageName)}&section=${storeSection.index}&prop=text&format=json`
    const storeRes = await fetch(storeUrl, {
      headers: {
        'User-Agent': 'ArkCalc/1.0 (https://github.com/Migetsu/ArkCalc; info@arkcalc.local)',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!storeRes.ok) return null
    const storeJson = await storeRes.json()
    const html = storeJson?.parse?.text?.['*'] || ''
    if (!html) return null

    const parsedShopItems = parseWikiShopTable(html)
    if (parsedShopItems.length === 0) return null

    // Merge parsed shop items with milestone/first_clear rewards from fallback
    const nonShopRewards = event.rewards.filter((r) => r.source !== 'shop')
    const mergedRewards = [...nonShopRewards, ...parsedShopItems]

    // Recalculate totals
    let totalLmd = 0
    let totalExp = 0
    let totalPermits = 0
    for (const item of mergedRewards) {
      if (item.itemId === '4001') totalLmd += item.count
      if (item.category === 'exp') totalExp += item.count
      if (item.category === 'permit' || item.itemId === 'single_permit') totalPermits += item.count
    }

    return {
      ...event,
      rewards: mergedRewards,
      totalLmd: totalLmd || event.totalLmd,
      totalExp: totalExp || event.totalExp,
      totalPermits: totalPermits || event.totalPermits,
    }
  } catch (err) {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const forceRefresh = query.force === 'true' || query.force === '1'
  const now = Date.now()

  if (!forceRefresh && cachedEventsResponse && now - cachedEventsResponse.timestamp < CACHE_TTL_MS) {
    return cachedEventsResponse.data
  }

  const baseEvents: ArknightsEvent[] = JSON.parse(JSON.stringify(fallbackEvents))
  let enrichedCount = 0

  try {
    // Enrich active event and top upcoming events concurrently
    const eventsToEnrich = baseEvents.slice(0, 3)
    const enrichPromises = eventsToEnrich.map(async (ev, idx) => {
      const enriched = await fetchLiveEventStore(ev)
      if (enriched) {
        baseEvents[idx] = enriched
        enrichedCount++
      }
    })

    await Promise.allSettled(enrichPromises)

    const responseData = {
      source: enrichedCount > 0 ? 'wiki.gg-live' : 'local-database',
      enrichedCount,
      updatedAt: new Date().toISOString(),
      events: baseEvents,
    }

    cachedEventsResponse = { timestamp: now, data: responseData }
    return responseData
  } catch (err: any) {
    console.warn('[Events API] Live enrichment failed, using offline dataset:', err?.message || err)
  }

  const fallbackData = {
    source: 'local-database',
    enrichedCount: 0,
    updatedAt: new Date().toISOString(),
    events: fallbackEvents as ArknightsEvent[],
  }

  cachedEventsResponse = { timestamp: now, data: fallbackData }
  return fallbackData
})
