import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import fallbackOperators from '~/assets/data/operators.json'
import type { TargetPlanItem, OperatorData } from '~/types'

export const usePlannerStore = defineStore(
  'planner',
  () => {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const plannedTargets = ref<TargetPlanItem[]>([])
    const selectedOperatorId = ref<string>(
      (fallbackOperators[0] as OperatorData)?.id || 'char_4025_aprot'
    )

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------
    const totalTargets = computed(() => plannedTargets.value.length)

    const hasTarget = (operatorId: string): boolean => {
      return plannedTargets.value.some((t) => t.operatorId === operatorId)
    }

    const getTarget = (operatorId: string): TargetPlanItem | undefined => {
      return plannedTargets.value.find((t) => t.operatorId === operatorId)
    }

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------
    const addTarget = (target: TargetPlanItem) => {
      const idx = plannedTargets.value.findIndex((t) => t.operatorId === target.operatorId)
      if (idx >= 0) {
        plannedTargets.value[idx] = { ...target }
      } else {
        plannedTargets.value.push({ ...target })
      }
    }

    const removeTarget = (operatorId: string) => {
      plannedTargets.value = plannedTargets.value.filter((t) => t.operatorId !== operatorId)
    }

    const clearTargets = () => {
      plannedTargets.value = []
    }

    const setPlannedTargets = (targets: TargetPlanItem[]) => {
      plannedTargets.value = targets
    }

    const selectOperator = (operatorId: string) => {
      selectedOperatorId.value = operatorId
    }

    return {
      plannedTargets,
      selectedOperatorId,
      totalTargets,
      hasTarget,
      getTarget,
      addTarget,
      removeTarget,
      clearTargets,
      setPlannedTargets,
      selectOperator,
    }
  },
  {
    persist: {
      key: 'arkcalc_planner_store',
      pick: ['plannedTargets', 'selectedOperatorId'],
    },
  }
)
