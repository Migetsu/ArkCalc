const CDN_ARK = 'https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main';

export function getAvatarUrl(charId: string): string {
  // Use Yuanyan CDN for reliable avatars
  return `${CDN_ARK}/avatar/${charId}.png`;
}

export function getCharacterPortraitUrl(charId: string, elite = 2): string {
  const suffix = elite === 2 ? '_2' : '_1';
  // Portraits are also available from Yuanyan CDN under "character" folder
  return `${CDN_ARK}/character/${charId}${suffix}.png`;
}

export function getSkillIconUrl(iconIdOrSkillId: string): string {
  const cleanId = iconIdOrSkillId.startsWith('skill_icon_')
    ? iconIdOrSkillId
    : `skill_icon_${iconIdOrSkillId}`;
  return `${CDN_ARK}/skill/${cleanId}.png`;
}

export function getItemIconUrl(iconIdOrItemId: string): string {
  // Yuanyan repo stores item icons in "item" folder
  return `${CDN_ARK}/item/${iconIdOrItemId}.png`;
}

export function getEquipIconUrl(typeIcon: string): string {
  // Keep existing equip icons path (if needed)
  return `${CDN_ARK}/equip/type/${typeIcon}.png`;
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

export const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>';
