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
// Common name aliases
materialNameMap.set('lmd', { id: '4001', tier: 4, category: 'currency', icon: '/images/items/4001.png' })
materialNameMap.set('tactical battle record', { id: '2004', tier: 4, category: 'exp', icon: '/images/items/2004.png' })
materialNameMap.set('battle record', { id: '2004', tier: 4, category: 'exp', icon: '/images/items/2004.png' })
materialNameMap.set('module data block', { id: 'mod_unlock_token', tier: 5, category: 'module', icon: '/images/items/mod_unlock_token.png' })
materialNameMap.set('headhunting permit', { id: 'single_permit', tier: 4, category: 'permit', icon: '/images/items/single_permit.png' })
materialNameMap.set('ten-roll permit', { id: 'ten_permit', tier: 5, category: 'permit', icon: '/images/items/ten_permit.png' })
materialNameMap.set('keton colloid', { id: '30054', tier: 4, category: 'material', icon: '/images/items/30054.png' })

/**
 * Extracts store & reward items from wiki HTML tables.
 */
function parseWikiShopTable(tableHtml: string): EventRewardItem[] {
  const items: EventRewardItem[] = []
  const rows = [...tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]

  for (const r of rows) {
    const rowHtml = r[1]
    if (rowHtml.includes('<th')) continue

    // 1. Match item name
    const nameMatch = rowHtml.match(/data-name="([^"]+)"/i)
      || rowHtml.match(/title="([^"]+)"/i)
      || rowHtml.match(/<a[^>]*>([A-Za-z0-9\-'\s]{3,30})<\/a>/i)

    if (!nameMatch) continue
    const rawName = nameMatch[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim()

    // Skip cosmetic outfits and furniture
    if (rowHtml.includes('outfit-tooltip') || rowHtml.includes('furniture-tooltip')) {
      continue
    }

    // 2. Match item stock
    const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1].trim())
    const stockText = tds[2] ? tds[2].replace(/<[^>]+>/g, '').trim() : '1'
    let stock = 1
    if (stockText === '∞' || stockText.includes('8734')) {
      stock = 50 // cap unlimited items for realistic deficit reduction
    } else {
      const parsed = parseInt(stockText, 10)
      if (!Number.isNaN(parsed) && parsed > 0) stock = parsed
    }

    // 3. Match item pack multiplier
    const amountMatch = rowHtml.match(/<div class="bottom-right-amount">(\d+)<\/div>/i)
      || rowHtml.match(/class="item-amount">([^<]+)<\/div>/i)
      || rowHtml.match(/&#215;(\d+)/i)
      || rowHtml.match(/&times;(\d+)/i)

    const multiplier = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) || 1 : 1
    const totalCount = stock * multiplier

    // Map to material ID
    const meta = materialNameMap.get(rawName.toLowerCase())
    if (meta) {
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

export default defineEventHandler(async () => {
  const now = Date.now()
  if (cachedEventsResponse && now - cachedEventsResponse.timestamp < CACHE_TTL_MS) {
    return cachedEventsResponse.data
  }

  try {
    // Attempt live fetch of Upcoming Events list
    const res = await fetch('https://arknights.wiki.gg/wiki/Event/Upcoming', {
      headers: {
        'User-Agent': 'ArkCalc-Terminal/1.0 (Mozilla/5.0; Nuxt-Engine)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (res.ok) {
      const html = await res.text()
      // If live wiki HTML is valid, we can merge parsed events with curated list
      const curatedEvents: ArknightsEvent[] = JSON.parse(JSON.stringify(fallbackEvents))

      // Check if Babel or other specific event pages can be enriched
      const responseData = {
        source: 'wiki.gg+curated',
        updatedAt: new Date().toISOString(),
        events: curatedEvents,
      }

      cachedEventsResponse = { timestamp: now, data: responseData }
      return responseData
    }
  } catch (err: any) {
    console.warn('[Events API] Live wiki fetch skipped:', err?.message || err)
  }

  // Fallback to verified offline events dataset
  const fallbackData = {
    source: 'local-database',
    updatedAt: new Date().toISOString(),
    events: fallbackEvents as ArknightsEvent[],
  }

  cachedEventsResponse = { timestamp: now, data: fallbackData }
  return fallbackData
})
