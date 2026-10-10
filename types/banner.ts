export interface FeaturedOperator {
  id: string
  name: string
  rarity: number
  profession: string
  isLimited: boolean
  avatar?: string
}

export interface BannerData {
  id: string
  name: string
  nameZh?: string
  type: 'limited' | 'standard' | 'collab' | 'celebration' | string
  category: string
  cnStartDate: string
  cnEndDate: string
  sparkCost: number
  freePulls: number
  description: string
  featuredOperators: FeaturedOperator[]
  bannerImage?: string
}

export interface BannerWithGlobalDates extends BannerData {
  estimatedGlobalStartDate: Date
  estimatedGlobalEndDate: Date
  daysUntilGlobal: number
  status: 'upcoming' | 'active' | 'passed'
}
