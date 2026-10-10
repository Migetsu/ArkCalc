import fallbackBanners from '~/assets/data/banners.json'

export interface RateUpOperator {
  name: string
  rarity: number
  profession?: string
  icon: string
}

export interface UpcomingBanner {
  id: string
  name: string
  title: string
  bannerImg: string
  bannerImage: string
  type: string
  category: string
  cnStartDate: string
  cnEndDate: string
  sparkCost: number
  freePulls: number
  description: string
  operators: RateUpOperator[]
  featuredOperators: any[]
}

const parseWikiHtml = (html: string): UpcomingBanner[] => {
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i)
  if (!tableMatch) return []

  const tableHtml = tableMatch[0]
  const rowMatches = tableHtml.match(/<tr>[\s\S]*?<\/tr>/gi) || []
  const banners: UpcomingBanner[] = []

  for (let i = 0; i < rowMatches.length; i++) {
    const row = rowMatches[i]!
    if (row.includes('<th')) continue

    // Title match
    const titleMatch = row.match(/<div[^>]*background:var\(--theme-highlight-background\)[^>]*><b>([\s\S]*?)<\/b><\/div>/i)
      || row.match(/<b>(&#91;[\s\S]*?&#93;[\s\S]*?)<\/b>/i)
      || row.match(/<div class="banner"[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/i)

    let title = ''
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1]
        .replace(/&#91;/g, '[')
        .replace(/&#93;/g, ']')
        .replace(/&#32;/g, ' ')
        .replace(/&#8208;/g, '-')
        .replace(/&#8211;/g, '–')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]+>/g, '')
        .trim()
    }

    // Image match
    const imgMatch = row.match(/<img[^>]*class="banner"[^>]*src="([^"]+)"/i)
      || row.match(/<img[^>]*src="([^"]+)"[^>]*class="banner"/i)
      || row.match(/<div class="banner"[\s\S]*?<img[^>]*src="([^"]+)"/i)

    let bannerImg = ''
    if (imgMatch && imgMatch[1]) {
      bannerImg = imgMatch[1].startsWith('http') ? imgMatch[1] : 'https://arknights.wiki.gg' + imgMatch[1]
    }

    // CN dates match
    const dateMatch = row.match(/<b>CN date:<\/b>\s*([0-9]{4}\/[0-9]{2}\/[0-9]{2})\s*(?:&#8211;|–|-)\s*([0-9]{4}\/[0-9]{2}\/[0-9]{2})/i)
      || row.match(/CN date:<\/b>\s*([0-9]{4}\/[0-9]{2}\/[0-9]{2})/i)

    let cnStartDate = ''
    let cnEndDate = ''
    if (dateMatch) {
      if (dateMatch[1]) cnStartDate = dateMatch[1].replace(/\//g, '-')
      if (dateMatch[2]) cnEndDate = dateMatch[2].replace(/\//g, '-')
    }

    // Operators in rate-up cell
    const opMatches = [...row.matchAll(/<div class="character-tooltip"[^>]*data-star="(\d+)"[^>]*data-class="([^"]*)"[^>]*data-name="([^"]*)"[\s\S]*?<img[^>]*src="([^"]+)"/gi)]
    const operators: RateUpOperator[] = []

    for (const op of opMatches) {
      const star = parseInt(op[1] || '6', 10)
      const profession = op[2] || 'Guard'
      const name = (op[3] || '')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
      let icon = op[4] || ''
      if (icon && !icon.startsWith('http')) {
        icon = 'https://arknights.wiki.gg' + icon
      }
      operators.push({
        name,
        rarity: star,
        profession,
        icon,
      })
    }

    // Description
    const secondCellMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/i)
    let description = ''
    if (secondCellMatch && secondCellMatch[1]) {
      const descMatches = secondCellMatch[1].match(/(Choose three of the following[^<]+|Only the following[^<]+)/gi)
      if (descMatches) {
        description = descMatches.map((d: string) => d.replace(/&#91;/g, '[').replace(/&#93;/g, ']').trim()).join(' ')
      }
    }

    if (title || cnStartDate) {
      const cleanName = title.replace(/^\[.*?\]\s*/, '') || title
      let type = 'standard'
      let category = 'Standard'
      if (title.toLowerCase().includes('limited')) {
        type = 'limited'
        category = 'Limited'
      } else if (title.toLowerCase().includes('crossover')) {
        type = 'crossover'
        category = 'Collab'
      } else if (title.toLowerCase().includes('joint operation')) {
        type = 'joint'
        category = 'Joint Operation'
      } else if (title.toLowerCase().includes('orienteering')) {
        type = 'orienteering'
        category = 'Orienteering'
      }

      const featuredOperators = operators.map((op, oIdx) => ({
        id: `op_${oIdx}_${op.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: op.name,
        rarity: op.rarity,
        profession: op.profession || 'Specialist',
        isLimited: type === 'limited' || type === 'crossover',
        avatar: op.icon,
      }))

      banners.push({
        id: `banner_${i}`,
        name: cleanName,
        title,
        bannerImg,
        bannerImage: bannerImg,
        type,
        category,
        cnStartDate,
        cnEndDate,
        sparkCost: type === 'limited' ? 300 : (type === 'crossover' ? 120 : 0),
        freePulls: title.toLowerCase().includes('carnival') || title.toLowerCase().includes('celebration') ? 24 : 0,
        description,
        operators,
        featuredOperators,
      })
    }
  }

  // Sort chronologically: oldest/earliest at top, newest/more recent at bottom
  banners.sort((a, b) => new Date(a.cnStartDate).getTime() - new Date(b.cnEndDate || b.cnStartDate).getTime())
  return banners
}

export default defineEventHandler(async () => {
  try {
    const response = await fetch('https://arknights.wiki.gg/wiki/Headhunting/Banners/Upcoming', {
      headers: {
        'User-Agent': 'ArkCalc-App/1.0 (Mozilla/5.0 Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`Wiki HTTP error ${response.status}`)
    }

    const html = await response.text()
    const parsed = parseWikiHtml(html)

    if (parsed.length > 0) {
      return {
        source: 'wiki.gg',
        updatedAt: new Date().toISOString(),
        banners: parsed,
      }
    }
  } catch (err: any) {
    console.warn('[Banner Parser] Live parse failed, using fallback json:', err?.message || err)
  }

  // Fallback
  return {
    source: 'local-fallback',
    updatedAt: new Date().toISOString(),
    banners: fallbackBanners as UpcomingBanner[],
  }
})
