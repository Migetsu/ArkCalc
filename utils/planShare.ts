import type { TargetPlanItem, OperatorData } from '~/types'

export interface CompactPlanItem {
  id: string // operatorId
  ce: number // currentElite
  te: number // targetElite
  cl: number // currentLevel
  tl: number // targetLevel
  si?: number // selectedSkillIndex
  cm: number // currentMastery
  tm: number // targetMastery
  mid?: string // selectedModuleId
  cmod: number // currentModule
  tmod: number // targetModule
}

export interface ExportedPlanPayload {
  version: number
  app: 'ArkCalc'
  title?: string
  createdAt: string
  targets: Array<{
    operatorId: string
    operatorName?: string
    currentElite: number
    targetElite: number
    currentLevel: number
    targetLevel: number
    selectedSkillIndex?: number
    currentMastery: number
    targetMastery: number
    selectedModuleId?: string
    currentModule: number
    targetModule: number
  }>
}

/**
 * Base64URL encoder supporting full Unicode UTF-8 across Node and Browsers.
 */
export function encodeBase64Url(input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64url')
  }
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Base64URL decoder supporting full Unicode UTF-8 across Node and Browsers.
 */
export function decodeBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8')
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Converts full TargetPlanItems to minimal compact representation for URL sharing.
 */
export function serializeToCompact(targets: TargetPlanItem[]): CompactPlanItem[] {
  return targets.map((t) => ({
    id: t.operatorId,
    ce: t.currentElite,
    te: t.targetElite,
    cl: t.currentLevel,
    tl: t.targetLevel,
    si: t.selectedSkillIndex,
    cm: t.currentMastery,
    tm: t.targetMastery,
    mid: t.selectedModuleId,
    cmod: t.currentModule,
    tmod: t.targetModule,
  }))
}

/**
 * Rehydrates compact representation into full TargetPlanItems by matching against operators catalog.
 */
export function deserializeFromCompact(
  compactItems: CompactPlanItem[],
  operatorsCatalog: OperatorData[]
): TargetPlanItem[] {
  const opsMap = new Map<string, OperatorData>(operatorsCatalog.map((op) => [op.id, op]))
  const results: TargetPlanItem[] = []

  for (const c of compactItems) {
    const operator = opsMap.get(c.id)
    if (!operator) continue

    results.push({
      operatorId: c.id,
      operator,
      currentElite: c.ce ?? 0,
      targetElite: c.te ?? 2,
      currentLevel: c.cl ?? 1,
      targetLevel: c.tl ?? 90,
      selectedSkillIndex: c.si,
      currentMastery: c.cm ?? 0,
      targetMastery: c.tm ?? 3,
      selectedModuleId: c.mid ?? 'none',
      currentModule: c.cmod ?? 0,
      targetModule: c.tmod ?? 3,
    })
  }

  return results
}

/**
 * Encodes plan targets into a compact, shareable Base64URL string for URL Query parameters.
 */
export function encodePlanToQueryString(targets: TargetPlanItem[]): string {
  const compact = serializeToCompact(targets)
  return encodeBase64Url(JSON.stringify(compact))
}

/**
 * Decodes a shareable Base64URL string into full TargetPlanItems.
 */
export function decodePlanFromQueryString(
  queryString: string,
  operatorsCatalog: OperatorData[]
): TargetPlanItem[] {
  try {
    const jsonStr = decodeBase64Url(queryString.trim())
    const compact: CompactPlanItem[] = JSON.parse(jsonStr)
    if (!Array.isArray(compact)) return []
    return deserializeFromCompact(compact, operatorsCatalog)
  } catch (err) {
    console.warn('[PlanShare] Failed to decode plan from query string:', err)
    return []
  }
}

/**
 * Generates structured, readable JSON payload for export or file download.
 */
export function exportPlanToJsonString(targets: TargetPlanItem[], title = 'My Promotion Plan'): string {
  const payload: ExportedPlanPayload = {
    version: 1,
    app: 'ArkCalc',
    title,
    createdAt: new Date().toISOString(),
    targets: targets.map((t) => ({
      operatorId: t.operatorId,
      operatorName: t.operator.name,
      currentElite: t.currentElite,
      targetElite: t.targetElite,
      currentLevel: t.currentLevel,
      targetLevel: t.targetLevel,
      selectedSkillIndex: t.selectedSkillIndex,
      currentMastery: t.currentMastery,
      targetMastery: t.targetMastery,
      selectedModuleId: t.selectedModuleId,
      currentModule: t.currentModule,
      targetModule: t.targetModule,
    })),
  }
  return JSON.stringify(payload, null, 2)
}

/**
 * Parses user-provided JSON text or full file content into TargetPlanItems.
 * Supports both full ExportedPlanPayload format and direct Compact array.
 */
export function parseImportedPlanJson(
  rawJson: string,
  operatorsCatalog: OperatorData[]
): TargetPlanItem[] {
  const parsed = JSON.parse(rawJson.trim())
  const opsMap = new Map<string, OperatorData>(operatorsCatalog.map((op) => [op.id, op]))
  const results: TargetPlanItem[] = []

  // Case 1: Structured payload with "targets" array
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.targets)) {
    for (const t of parsed.targets) {
      const op = opsMap.get(t.operatorId)
      if (!op) continue
      results.push({
        operatorId: t.operatorId,
        operator: op,
        currentElite: Number(t.currentElite ?? 0),
        targetElite: Number(t.targetElite ?? 2),
        currentLevel: Number(t.currentLevel ?? 1),
        targetLevel: Number(t.targetLevel ?? 90),
        selectedSkillIndex: t.selectedSkillIndex !== undefined ? Number(t.selectedSkillIndex) : undefined,
        currentMastery: Number(t.currentMastery ?? 0),
        targetMastery: Number(t.targetMastery ?? 3),
        selectedModuleId: t.selectedModuleId ?? 'none',
        currentModule: Number(t.currentModule ?? 0),
        targetModule: Number(t.targetModule ?? 3),
      })
    }
    return results
  }

  // Case 2: Array of raw TargetPlanItem or CompactPlanItem
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const opId = item.operatorId || item.id
      const op = opsMap.get(opId)
      if (!op) continue

      results.push({
        operatorId: opId,
        operator: op,
        currentElite: Number(item.currentElite ?? item.ce ?? 0),
        targetElite: Number(item.targetElite ?? item.te ?? 2),
        currentLevel: Number(item.currentLevel ?? item.cl ?? 1),
        targetLevel: Number(item.targetLevel ?? item.tl ?? 90),
        selectedSkillIndex: item.selectedSkillIndex !== undefined
          ? Number(item.selectedSkillIndex)
          : item.si !== undefined
            ? Number(item.si)
            : undefined,
        currentMastery: Number(item.currentMastery ?? item.cm ?? 0),
        targetMastery: Number(item.targetMastery ?? item.tm ?? 3),
        selectedModuleId: item.selectedModuleId || item.mid || 'none',
        currentModule: Number(item.currentModule ?? item.cmod ?? 0),
        targetModule: Number(item.targetModule ?? item.tmod ?? 3),
      })
    }
  }

  return results
}
