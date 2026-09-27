const CDN_ARK = 'https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main';

export function getAvatarUrl(charId: string): string {
  // Use Yuanyan CDN for reliable avatars
  return `${CDN_ARK}/avatar/${charId}.png`;
}

export function getCharacterPortraitUrl(charId: string, elite = 2): string {
  const suffix = elite === 2 ? '_2b' : '_1b';
  return `https://fastly.jsdelivr.net/gh/yuanyan3060/Arknights-Bot-Resource@main/skin/${charId}${suffix}.png`;
}

export function getCharacterPortraitFallbackUrl(charId: string, elite = 2): string {
  const suffix = elite === 2 ? '_2' : '_1';
  return `https://fastly.jsdelivr.net/gh/Aceship/Arknight-Images@main/characters/${charId}${suffix}.png`;
}

export function getCharacterPortraitSecondaryFallbackUrl(charId: string, elite = 2): string {
  const suffix = elite === 2 ? '_2' : '_1';
  return `https://fastly.jsdelivr.net/gh/yuanyan3060/Arknights-Bot-Resource@main/portrait/${charId}${suffix}.png`;
}

export function getSkinIllustrationUrl(portraitId: string): string {
  if (!portraitId) return '';
  return `https://fastly.jsdelivr.net/gh/yuanyan3060/Arknights-Bot-Resource@main/skin/${encodeURIComponent(portraitId)}b.png`;
}

export function getSkinIllustrationFallbackUrl(portraitId: string): string {
  if (!portraitId) return '';
  return `https://fastly.jsdelivr.net/gh/Aceship/Arknight-Images@main/characters/${encodeURIComponent(portraitId)}.png`;
}

export function getSkinAvatarUrl(avatarId: string): string {
  if (!avatarId) return '';
  return `https://fastly.jsdelivr.net/gh/yuanyan3060/Arknights-Bot-Resource@main/avatar/${encodeURIComponent(avatarId)}.png`;
}

export function getChibiWebmUrl(operatorName: string, skinIndex = 0): string {
  if (!operatorName) return '';
  const clean = operatorName.replace(/['"\s]/g, '_').replace(/_+/g, '_').trim();
  if (skinIndex === 0) {
    return `https://arknights.wiki.gg/images/${encodeURIComponent(clean)}.webm`;
  }
  return `https://arknights.wiki.gg/images/${encodeURIComponent(clean)}_Skin_${skinIndex}.webm`;
}

export function getChibiPosterUrl(operatorName: string, skinIndex = 0): string {
  if (!operatorName) return '';
  const clean = operatorName.replace(/['"\s]/g, '_').replace(/_+/g, '_').trim();
  if (skinIndex === 0) {
    return `https://arknights.wiki.gg/images/thumb/${encodeURIComponent(clean)}.webm/356px--${encodeURIComponent(clean)}.webm.jpg`;
  }
  return `https://arknights.wiki.gg/images/thumb/${encodeURIComponent(clean)}_Skin_${skinIndex}.webm/356px--${encodeURIComponent(clean)}_Skin_${skinIndex}.webm.jpg`;
}

export function getSkillIconUrl(iconIdOrSkillId: string): string {
  if (!iconIdOrSkillId) return '';
  const cleanId = iconIdOrSkillId.startsWith('skill_icon_')
    ? iconIdOrSkillId
    : `skill_icon_${iconIdOrSkillId}`;
  return `${CDN_ARK}/skill/${cleanId}.png`;
}

export function getSkillIconFallbackUrl(iconIdOrSkillId: string): string {
  if (!iconIdOrSkillId) return '';
  const cleanId = iconIdOrSkillId.startsWith('skill_icon_')
    ? iconIdOrSkillId
    : `skill_icon_${iconIdOrSkillId}`;
  return `https://fastly.jsdelivr.net/gh/Aceship/Arknight-Images@main/skills/${encodeURIComponent(cleanId)}.png`;
}

export function getItemIconUrl(iconIdOrItemId: string): string {
  // Yuanyan repo stores item icons in "item" folder
  return `${CDN_ARK}/item/${iconIdOrItemId}.png`;
}

// Module equipment illustration / icon (from fexli ArknightsResource or jsdelivr mirror)
export function getEquipIconUrl(equipIcon: string): string {
  if (!equipIcon) return PLACEHOLDER_EQUIP_ICON;
  return `https://raw.githubusercontent.com/fexli/ArknightsResource/main/equip/${equipIcon}.png`;
}

export function getEquipIconFallbackUrl(equipIcon: string): string {
  return `https://fastly.jsdelivr.net/gh/fexli/ArknightsResource@main/equip/${equipIcon}.png`;
}

// Module archetype / branch type icon (e.g. phy-x, sum-y from Aceship repo)
export function getEquipTypeIconUrl(typeIcon: string): string {
  if (!typeIcon) return '';
  return `https://raw.githubusercontent.com/Aceship/Arknight-Images/main/equip/type/${typeIcon}.png`;
}

export function getEquipTypeIconFallbackUrl(typeIcon: string): string {
  return `https://fastly.jsdelivr.net/gh/Aceship/Arknight-Images@main/equip/type/${typeIcon}.png`;
}

export function getClassIconUrl(profession: string): string {
  const profMap: Record<string, string> = {
    WARRIOR: 'guard',
    SNIPER: 'sniper',
    PIONEER: 'vanguard',
    TANK: 'defender',
    MEDIC: 'medic',
    SUPPORT: 'supporter',
    CASTER: 'caster',
    SPECIAL: 'specialist',
  };
  const name = profMap[profession.toUpperCase()] || profession.toLowerCase();
  return `${CDN_ARK}/classes/class_${name}.png`;
}

export const PLACEHOLDER_ITEM_ICON =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>';

export const PLACEHOLDER_EQUIP_ICON =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';

export const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>';
