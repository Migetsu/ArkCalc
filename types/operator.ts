export interface CatalogOperator {
  id: string
  name: string
  appellation: string
  rarity: 1 | 2 | 3 | 4 | 5 | 6
  profession: string
  subProfessionId?: string
  position: 'MELEE' | 'RANGED'
  tagList: string[]
  nationId?: string | null
  groupId?: string | null
  teamId?: string | null
  faction: string
  itemUsage?: string
  itemDesc?: string
  description?: string
  avatar: string
  portrait?: string
  skills?: Array<{
    skillId: string
    name: string
    icon?: string
  }>
}

export interface FactionInfo {
  id: string
  name: string
  count: number
}
