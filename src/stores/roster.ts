import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, type UserRosterOperator, type OperatorTargetPlan } from '@/services/db';
import { useGameDataStore } from '@/stores/gamedata';
import { usePlannerStore } from '@/stores/planner';
import { useAuthStore } from '@/stores/auth';

const LS_ROSTER_KEY = 'ark_roster_v1';

export const useRosterStore = defineStore('roster', () => {
  const roster = ref<Record<string, UserRosterOperator>>({});
  const isLoaded = ref<boolean>(false);

  const gameData = useGameDataStore();
  const planner = usePlannerStore();

  const rosterList = computed<UserRosterOperator[]>(() => Object.values(roster.value));
  const rosterCount = computed(() => rosterList.value.length);

  async function loadRoster() {
    try {
      const records = await db.roster.toArray();
      const map: Record<string, UserRosterOperator> = {};
      for (const r of records) {
        if (r && r.charId) {
          map[r.charId] = r;
        }
      }
      // Fallback from localStorage if Dexie is empty
      if (records.length === 0) {
        const raw = localStorage.getItem(LS_ROSTER_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            Object.assign(map, parsed);
            await db.roster.bulkPut(Object.values(map));
          } catch {
            // ignore
          }
        }
      }
      roster.value = map;
      isLoaded.value = true;
    } catch (err) {
      console.error('Failed to load roster:', err);
    }
  }

  async function saveRoster(list: UserRosterOperator[]) {
    const map: Record<string, UserRosterOperator> = {};
    for (const r of list) {
      if (r && r.charId) {
        map[r.charId] = r;
      }
    }
    roster.value = map;
    try {
      localStorage.setItem(LS_ROSTER_KEY, JSON.stringify(map));
      await db.roster.clear();
      await db.roster.bulkPut(list);
    } catch (e) {
      console.warn('Could not save roster to Dexie:', e);
    }
    useAuthStore().triggerAutoSync();
  }

  async function clearAllRoster() {
    roster.value = {};
    localStorage.removeItem(LS_ROSTER_KEY);
    await db.roster.clear();
    useAuthStore().triggerAutoSync();
  }

  /**
   * Builds the maximum possible upgrade target for an operator based on game data
   */
  function buildFullTargetForOperator(charId: string): OperatorTargetPlan['target'] {
    const op = gameData.getOperator(charId);
    const rarity = op?.rarity ?? 6;

    // Max elite
    let maxElite = 2;
    if (op?.phases) {
      maxElite = Math.max(0, op.phases.length - 1);
    } else if (rarity <= 2) {
      maxElite = 0;
    } else if (rarity === 3) {
      maxElite = 1;
    }

    // Max level
    let maxLevel = 90;
    if (op?.phases && op.phases[maxElite]) {
      maxLevel = op.phases[maxElite].maxLevel;
    } else {
      if (rarity === 6) maxLevel = 90;
      else if (rarity === 5) maxLevel = 80;
      else if (rarity === 4) maxLevel = 70;
      else if (rarity === 3) maxLevel = 55;
      else maxLevel = 30;
    }

    // Target skills (Level 7)
    const skillsCount = op?.skills?.length || 3;
    const targetSkills = Array(skillsCount).fill(7);

    // Target masteries (M3 for all skills if rarity >= 4)
    const targetMasteries = rarity >= 4 ? Array(skillsCount).fill(3) : Array(skillsCount).fill(0);

    // Target modules (Stage 3 for all available modules)
    const targetModules: Record<string, number> = {};
    if (op?.modules) {
      for (const mod of op.modules) {
        // Exclude default base trait module 'uniequip_001' if it has no stages
        targetModules[mod.id] = 3;
      }
    }

    return {
      elite: maxElite,
      level: maxLevel,
      skills: targetSkills,
      masteries: targetMasteries,
      modules: targetModules,
    };
  }

  function buildComfortTargetForOperator(charId: string): OperatorTargetPlan['target'] {
    const op = gameData.getOperator(charId);
    const rarity = op?.rarity || 6;
    let maxElite = 2;
    if (op?.phases) {
      maxElite = Math.max(0, op.phases.length - 1);
    } else if (rarity <= 2) {
      maxElite = 0;
    } else if (rarity === 3) {
      maxElite = 1;
    }

    const maxLvl = op?.phases?.[maxElite]?.maxLevel || 60;
    const targetLevel = Math.min(60, maxLvl);
    const skillsCount = op?.skills?.length || 3;
    const targetSkills = Array(skillsCount).fill(7);

    // M3 on the signature / last skill
    const targetMasteries = Array(skillsCount).fill(0);
    if (rarity >= 4 && skillsCount > 0) {
      targetMasteries[skillsCount - 1] = 3;
    }

    // Stage 1 for the primary module
    const targetModules: Record<string, number> = {};
    if (op?.modules && op.modules.length > 0) {
      targetModules[op.modules[0].id] = 1;
    }

    return {
      elite: maxElite,
      level: targetLevel,
      skills: targetSkills,
      masteries: targetMasteries,
      modules: targetModules,
    };
  }

  /**
   * Adds an operator from roster to the planner with target preset ('full' | 'comfort')
   */
  async function addOperatorToPlan(charId: string, preset: 'full' | 'comfort' = 'full') {
    const ro = roster.value[charId];
    if (!ro) return;

    const op = gameData.getOperator(charId);
    const skillsCount = op?.skills?.length || 3;

    const current: OperatorTargetPlan['current'] = {
      elite: ro.elite ?? 0,
      level: ro.level ?? 1,
      skills: Array.isArray(ro.skills) && ro.skills.length > 0 ? ro.skills : Array(skillsCount).fill(1),
      masteries: Array.isArray(ro.masteries) && ro.masteries.length > 0 ? ro.masteries : Array(skillsCount).fill(0),
      modules: ro.modules || {},
    };

    const target = preset === 'comfort' ? buildComfortTargetForOperator(charId) : buildFullTargetForOperator(charId);

    const plan: OperatorTargetPlan = {
      charId,
      current,
      target,
    };

    await planner.savePlan(plan);
  }

  /**
   * Batch adds operators matching the filter to plans with target preset
   */
  async function addBatchToPlan(charIds: string[], preset: 'full' | 'comfort' = 'full') {
    for (const charId of charIds) {
      await addOperatorToPlan(charId, preset);
    }
  }

  // Compatibility aliases
  const addOperatorToPlanAsFull = (charId: string) => addOperatorToPlan(charId, 'full');
  const addBatchToPlanAsFull = (charIds: string[]) => addBatchToPlan(charIds, 'full');

  /**
   * Checks if an operator is already fully maxed out on account
   */
  function isFullyMaxed(charId: string): boolean {
    const ro = roster.value[charId];
    if (!ro) return false;
    const target = buildFullTargetForOperator(charId);

    if (ro.elite < target.elite) return false;
    if (ro.level < target.level) return false;

    // Check masteries
    if (target.masteries.some((m, idx) => (ro.masteries?.[idx] || 0) < m)) {
      return false;
    }

    // Check modules
    for (const [modId, reqLvl] of Object.entries(target.modules)) {
      if ((ro.modules?.[modId] || 0) < reqLvl) {
        return false;
      }
    }

    return true;
  }

  return {
    roster,
    rosterList,
    rosterCount,
    isLoaded,
    loadRoster,
    saveRoster,
    clearAllRoster,
    buildFullTargetForOperator,
    buildComfortTargetForOperator,
    addOperatorToPlan,
    addBatchToPlan,
    addOperatorToPlanAsFull,
    addBatchToPlanAsFull,
    isFullyMaxed,
  };
});
