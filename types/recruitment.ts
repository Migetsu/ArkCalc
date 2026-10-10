export type RecruitmentTagType = 'qualification' | 'position' | 'class' | 'affix'

export interface RecruitmentTag {
  id: string
  name: string
  type: RecruitmentTagType
}

export interface RecruitOperator {
  id: string
  name: string
  rarity: 1 | 2 | 3 | 4 | 5 | 6
  profession: string
  position: 'Melee' | 'Ranged'
  tags: string[]
  avatar: string
}

export interface TagCombination {
  tags: string[]
  operators: RecruitOperator[]
  minRarity: number
  maxRarity: number
  hasGuaranteed4Star: boolean
  hasGuaranteed5Star: boolean
  hasGuaranteed6Star: boolean
  hasRobot: boolean
}
