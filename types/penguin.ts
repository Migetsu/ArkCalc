export type PenguinServer = 'CN' | 'US' | 'JP' | 'KR'

export interface PenguinItemExistence {
  exist: boolean
  openTime?: number
  closeTime?: number
}

export interface PenguinItem {
  itemId: string
  name: string
  name_i18n: Record<string, string>
  existence: Record<string, PenguinItemExistence>
  rarity: number
  itemType: string
  sortId: number
  spriteCoord?: [number, number]
  alias?: Record<string, string[]>
  pron?: Record<string, string[]>
}

export interface PenguinStage {
  stageId: string
  zoneId: string
  code: string
  code_i18n: Record<string, string>
  apCost: number
  existence: Record<string, PenguinItemExistence>
  minClearTime?: number
}

export interface PenguinMatrixItem {
  stageId: string
  itemId: string
  quantity: number
  times: number
  start?: number
  end?: number
}

export interface PenguinMatrixResponse {
  matrix: PenguinMatrixItem[]
}

export interface FarmStageEfficiency {
  stageId: string
  stageCode: string
  apCost: number
  quantity: number
  times: number
  dropRate: number // quantity / times
  apPerDrop: number // (apCost * times) / quantity
}
