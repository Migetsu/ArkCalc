import { describe, it, expect } from 'vitest'
import type { OperatorSkinItem } from '~/types'

describe('Skin Gallery & CDN URL Generator (SkinGallery Logic)', () => {
  function createSkinItem(
    rawSkinId: string,
    charId: string,
    portraitId: string,
    skinName?: string,
    skinGroupName?: string
  ): OperatorSkinItem {
    let type: 'elite0' | 'elite2' | 'alternative' = 'alternative'
    let name = skinName || skinGroupName || 'Альтернативный образ'

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

    return {
      skinId: rawSkinId,
      charId,
      portraitId,
      name,
      skinGroupName,
      type,
      aceshipUrl: `https://aceship.github.io/AN-EN-Tags/img/characters/${encodeURIComponent(rawSkinId)}.png`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/${encodeURIComponent(portraitId)}.png`,
      avatarUrl: `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${charId}.png`,
    }
  }

  it('generates correct Aceship CDN URLs for Elite 0 and Elite 2', () => {
    const e0 = createSkinItem('char_102_texas#1', 'char_102_texas', 'char_102_texas_1')
    const e2 = createSkinItem('char_102_texas#2', 'char_102_texas', 'char_102_texas_2')

    expect(e0.type).toBe('elite0')
    expect(e0.name).toBe('Elite 0 (Базовый)')
    expect(e0.aceshipUrl).toBe(
      'https://aceship.github.io/AN-EN-Tags/img/characters/char_102_texas%231.png'
    )
    expect(e0.cdnUrl).toBe(
      'https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/char_102_texas_1.png'
    )

    expect(e2.type).toBe('elite2')
    expect(e2.name).toBe('Elite 2 (Продвинутый)')
    expect(e2.aceshipUrl).toBe(
      'https://aceship.github.io/AN-EN-Tags/img/characters/char_102_texas%232.png'
    )
    expect(e2.cdnUrl).toBe(
      'https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/char_102_texas_2.png'
    )
  })

  it('correctly categorizes and encodes alternative skins with special characters', () => {
    const winterSkin = createSkinItem(
      'char_102_texas@winter#1',
      'char_102_texas',
      'char_102_texas_winter#1',
      'Winter Messenger',
      'Icefield Messenger'
    )

    expect(winterSkin.type).toBe('alternative')
    expect(winterSkin.name).toBe('Winter Messenger')
    expect(winterSkin.skinGroupName).toBe('Icefield Messenger')
    expect(winterSkin.aceshipUrl).toBe(
      'https://aceship.github.io/AN-EN-Tags/img/characters/char_102_texas%40winter%231.png'
    )
    expect(winterSkin.cdnUrl).toBe(
      'https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/characters/char_102_texas_winter%231.png'
    )
  })

  it('orders skins systematically: Elite 0 first, Elite 2 second, followed by alternative skins', () => {
    const rawList: OperatorSkinItem[] = [
      createSkinItem('char_172_svrash@summer#4', 'char_172_svrash', 'char_172_svrash_summer#4', 'Seeker SKm01'),
      createSkinItem('char_172_svrash#2', 'char_172_svrash', 'char_172_svrash_2'),
      createSkinItem('char_172_svrash#1', 'char_172_svrash', 'char_172_svrash_1'),
    ]

    const sorted = [...rawList].sort((a, b) => {
      const order = { elite0: 0, elite2: 1, alternative: 2 }
      if (order[a.type] !== order[b.type]) {
        return order[a.type] - order[b.type]
      }
      return a.name.localeCompare(b.name)
    })

    expect(sorted[0]?.type).toBe('elite0')
    expect(sorted[1]?.type).toBe('elite2')
    expect(sorted[2]?.type).toBe('alternative')
    expect(sorted[2]?.name).toBe('Seeker SKm01')
  })
})
