import { defineEventHandler, getRouterParam, createError, setResponseHeaders } from 'h3'
import type { OperatorSkinItem } from '~/types'

const ACESHIP_SKIN_TABLE_CDN =
  'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/skin_table.json'
const ACESHIP_SKIN_TABLE_GITHUB =
  'https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/skin_table.json'

let cachedSkinTable: Record<string, any> | null = null
let skinTableTimestamp = 0
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function cleanDescription(text?: string | null): string | undefined {
  if (!text) return undefined
  return text.replace(/<[^>]+>/g, '').trim()
}

async function getSkinTable(): Promise<Record<string, any> | null> {
  const now = Date.now()
  if (cachedSkinTable && now - skinTableTimestamp < CACHE_TTL_MS) {
    return cachedSkinTable
  }

  try {
    const data = await $fetch<Record<string, any>>(ACESHIP_SKIN_TABLE_CDN, {
      timeout: 8000,
      headers: { Accept: 'application/json' },
    })
    cachedSkinTable = data
    skinTableTimestamp = now
    return cachedSkinTable
  } catch (err) {
    console.warn('[Skin API] jsDelivr skin table fetch failed, trying GitHub:', err)
    try {
      const data = await $fetch<Record<string, any>>(ACESHIP_SKIN_TABLE_GITHUB, {
        timeout: 10000,
        headers: { Accept: 'application/json' },
      })
      cachedSkinTable = data
      skinTableTimestamp = now
      return cachedSkinTable
    } catch (err2) {
      console.warn('[Skin API] GitHub skin table fetch failed:', err2)
      return cachedSkinTable
    }
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    'Content-Type': 'application/json',
  })

  const targetId = getRouterParam(event, 'id')
  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'Operator ID is required' })
  }

  const skinTable = await getSkinTable()
  const charSkins = skinTable?.charSkins as Record<string, any> | undefined

  if (charSkins && typeof charSkins === 'object') {
    const matched = Object.values(charSkins).filter((s) => s.charId === targetId)

    if (matched.length > 0) {
      const skins: OperatorSkinItem[] = []

      for (const s of matched) {
        const rawSkinId = String(s.skinId)
        const portraitId = s.portraitId || rawSkinId.replace('#', '_')

        // Primary user-specified CDN: https://aceship.github.io/AN-EN-Tags/img/characters/{skinId}.png
        const aceshipUrl = `https://aceship.github.io/AN-EN-Tags/img/characters/${encodeURIComponent(rawSkinId)}.png`
        // CDN mirror with 100% reliable image assets
        const cdnUrl = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/${encodeURIComponent(portraitId)}.png`
        const avatarUrl = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${s.avatarId || targetId}.png`

        let type: 'elite0' | 'elite2' | 'alternative' = 'alternative'
        let name = s.displaySkin?.skinName || s.displaySkin?.skinGroupName || 'Альтернативный образ'

        if (rawSkinId.endsWith('#1') && !rawSkinId.includes('@')) {
          type = 'elite0'
          name = 'Elite 0 (Базовый)'
        } else if (rawSkinId.endsWith('#1+') && !rawSkinId.includes('@')) {
          type = 'elite0'
          name = 'Elite 0 (Алтарь)'
        } else if (rawSkinId.endsWith('#2') && !rawSkinId.includes('@')) {
          type = 'elite2'
          name = 'Elite 2 (Продвинутый)'
        }

        skins.push({
          skinId: rawSkinId,
          charId: s.charId,
          portraitId,
          name,
          skinGroupName: s.displaySkin?.skinGroupName || undefined,
          type,
          illustrator: Array.isArray(s.displaySkin?.drawerList)
            ? s.displaySkin.drawerList.join(', ')
            : undefined,
          description: cleanDescription(s.displaySkin?.content),
          dialog: cleanDescription(s.displaySkin?.dialog),
          avatarUrl,
          aceshipUrl,
          cdnUrl,
        })
      }

      // Sort: Elite 0 first, Elite 2 second, then alternative skins
      skins.sort((a, b) => {
        const order = { elite0: 0, elite2: 1, alternative: 2 }
        if (order[a.type] !== order[b.type]) {
          return order[a.type] - order[b.type]
        }
        return a.name.localeCompare(b.name)
      })

      return skins
    }
  }

  // Fallback: Default Elite 0 and Elite 2 skins if skin_table not reachable
  const fallbackSkins: OperatorSkinItem[] = [
    {
      skinId: `${targetId}#1`,
      charId: targetId,
      portraitId: `${targetId}_1`,
      name: 'Elite 0 (Базовый)',
      type: 'elite0',
      aceshipUrl: `https://aceship.github.io/AN-EN-Tags/img/characters/${encodeURIComponent(targetId + '#1')}.png`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/${targetId}_1.png`,
      avatarUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${targetId}.png`,
    },
    {
      skinId: `${targetId}#2`,
      charId: targetId,
      portraitId: `${targetId}_2`,
      name: 'Elite 2 (Продвинутый)',
      type: 'elite2',
      aceshipUrl: `https://aceship.github.io/AN-EN-Tags/img/characters/${encodeURIComponent(targetId + '#2')}.png`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/${targetId}_2.png`,
      avatarUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${targetId}.png`,
    },
  ]

  return fallbackSkins
})
