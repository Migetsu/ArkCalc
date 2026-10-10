// Base types for ArkCalc
export interface Operator {
  id: string
  name: string
  rarity: 1 | 2 | 3 | 4 | 5 | 6
  profession: string
  avatar?: string
}

export interface Material {
  id: string
  name: string
  tier: 1 | 2 | 3 | 4 | 5
  icon?: string
}

export interface UserProfile {
  id?: string
  username: string
  avatar_url?: string | null
  doctor_id?: string | null
  level: number
  server: string
}

export interface UserOperator {
  operator_id: string
  elite: number
  level: number
  potential: number
  skill_level: number
  masteries: Record<string, number>
  modules: Record<string, number>
  is_favorite: boolean
}

export type UserInventory = Record<string, number>

export interface UserSettings {
  theme: string
  server: string
  language: string
  show_unreleased: boolean
}

export * from './database.types'
export * from './penguin'
