// scripts/sync-cn-patches.js
/**
 * Automated CN Patches & Operator Localization Parser
 * 
 * Fetches character_table from official Hypergryph/Kengxxiao CN and YoStar EN repositories.
 * Detects newly released CN-exclusive operators, extracts their stats, traits, and talents,
 * and updates local translation definitions while preserving existing manual translations.
 * Also runs upcoming banner schedule sync.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cnOperatorsCompletePath = path.resolve(__dirname, '../src/data/translations/cnOperatorsComplete.ts');
const eventsDataPath = path.resolve(__dirname, '../src/data/eventsData.ts');

const CN_EXCEL_URL = 'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel';
const EN_EXCEL_URL = 'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel';

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ArkCalc-CNSyncBot/1.0 (https://ark-calc.vercel.app)'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function cleanArknightsTags(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\{([^}]+)\}/g, '$1')
    .trim();
}

// Common archetype translations for automated fallback
const SUBPROF_TRAITS = {
  // Guard
  sword: {
    en: 'Attacks deal damage twice.',
    ru: 'Мастер клинка: обычные атаки наносят урон дважды.'
  },
  musha: {
    en: 'Cannot be healed by allies. Recovers HP with each attack. Gains ASPD as HP decreases.',
    ru: 'Муша: не может быть исцелен союзниками. Восстанавливает HP при каждой атаке; скорость атаки возрастает по мере снижения здоровья.'
  },
  lord: {
    en: 'Can launch ranged attacks dealing 80% damage.',
    ru: 'Лорд: способен атаковать воздушные и наземные цели на дистанции (дистанционные атаки наносят 80% урона).'
  },
  centurion: {
    en: 'Attacks all blocked enemies simultaneously.',
    ru: 'Центурион: атакует всех заблокированных противников одновременно.'
  },
  instructor: {
    en: 'Can attack enemies from a distance; increases ATK of melee operators behind.',
    ru: 'Инструктор: увеличенная дальность ближнего боя; усиливает союзников-рукопашников.'
  },
  reaper: {
    en: 'Cannot be healed by allies. Attacks deal AoE damage; restores HP per enemy hit (up to block count).',
    ru: 'Жнец: не может быть исцелен союзниками. Атаки наносят урон по площади и восстанавливают HP за каждого задетого врага.'
  },
  // Sniper
  fastshot: {
    en: 'Prioritizes aerial enemies.',
    ru: 'Зенитчик: в приоритете атакует воздушные цели.'
  },
  sharpshooter: {
    en: 'Prioritizes enemies with lowest DEF within attack range.',
    ru: 'Снайпер-стрелок: в приоритете атакует врагов с наименьшей защитой в радиусе поражения.'
  },
  heavyshooter: {
    en: 'High base ATK and reduced attack range.',
    ru: 'Тяжелый снайпер: огромная сила атаки при уменьшенной дальности.'
  },
  // Caster
  corecaster: {
    en: 'Attacks deal Arts damage.',
    ru: 'Боевой маг: обычные атаки наносят урон искусством.'
  },
  splashcaster: {
    en: 'Attacks deal AoE Arts damage.',
    ru: 'Маг площади: атаки наносят урон искусством по площади вокруг цели.'
  },
  mechaburster: {
    en: 'Controls a floating Drone to attack enemies; Drone damage increases the longer it attacks the same target.',
    ru: 'Дрон-маг: управляет дроном; урон дрона нарастает по мере атаки по одной цели.'
  },
  // Defender
  protector: {
    en: 'Blocks 3 enemies.',
    ru: 'Защитник: блокирует 3 противников.'
  },
  guardian: {
    en: 'Can use skills to heal allies.',
    ru: 'Хранитель: использует навыки для исцеления союзников.'
  },
  juggernaut: {
    en: 'Cannot be healed by allies.',
    ru: 'Джаггернаут: не может быть исцелен союзниками.'
  },
  // Specialist
  traper: {
    en: 'Can summon and place tactical traps.',
    ru: 'Ловушечник: использует тактические ловушки на поле боя.'
  },
  hookmaster: {
    en: 'Can pull enemies towards this unit.',
    ru: 'Крючник: способен притягивать врагов гарпуном.'
  },
  stalker: {
    en: 'Has 50% physical and Arts dodge; attacks all enemies within range simultaneously.',
    ru: 'Сталкер: имеет 50% уклонение; атакует всех врагов в радиусе одновременно.'
  }
};

async function syncCnOperators() {
  console.log('--- Step 1: Fetching CN and EN character tables ---');
  const [cnChars, enChars] = await Promise.all([
    fetchJson(`${CN_EXCEL_URL}/character_table.json`),
    fetchJson(`${EN_EXCEL_URL}/character_table.json`).catch(() => ({}))
  ]);

  console.log(`Loaded CN operators: ${Object.keys(cnChars).length}, EN operators: ${Object.keys(enChars).length}`);

  // Find CN-exclusive operators
  const cnExclusiveIds = Object.keys(cnChars).filter((id) => {
    if (!id.startsWith('char_')) return false;
    const char = cnChars[id];
    if (char.isNotObtainable) return false;
    // If operator does not exist in EN table, it is CN exclusive
    return !enChars[id];
  });

  console.log(`Identified ${cnExclusiveIds.length} CN-exclusive operators.`);

  // Read existing cnOperatorsComplete.ts
  let existingContent = fs.readFileSync(cnOperatorsCompletePath, 'utf8');

  let newlyAddedCount = 0;
  const newEntries = [];

  for (const charId of cnExclusiveIds) {
    // Check if operator already in cnOperatorsComplete.ts
    if (existingContent.includes(`"${charId}":`) || existingContent.includes(`'${charId}':`) || existingContent.includes(`${charId}:`)) {
      continue;
    }

    const char = cnChars[charId];
    const appellation = char.appellation || '';
    const nameCn = char.name || '';
    const nameEn = appellation || nameCn;
    const nameRu = appellation || nameCn;

    const subProf = char.subProfessionId || '';
    const traitInfo = SUBPROF_TRAITS[subProf] || {
      en: 'Specialized tactical operative.',
      ru: 'Специализированный тактический оперативник.'
    };

    // Extract talents
    const talents = [];
    if (Array.isArray(char.talents)) {
      for (const t of char.talents) {
        if (!t || !Array.isArray(t.candidates) || t.candidates.length === 0) continue;
        const highestCandidate = t.candidates[t.candidates.length - 1];
        if (!highestCandidate || !highestCandidate.name) continue;

        const talentName = cleanArknightsTags(highestCandidate.name);
        const talentDesc = cleanArknightsTags(highestCandidate.description);

        talents.push({
          nameEn: talentName,
          nameRu: talentName,
          descriptionEn: talentDesc,
          descriptionRu: talentDesc
        });
      }
    }

    newEntries.push({
      charId,
      nameEn,
      nameRu,
      quoteEn: 'Doctor, Rhodes Island is ready for deployment.',
      quoteRu: 'Доктор, оперативник готов к боевому развертыванию.',
      traitEn: traitInfo.en,
      traitRu: traitInfo.ru,
      talents
    });

    newlyAddedCount++;
  }

  if (newlyAddedCount > 0) {
    console.log(`Found ${newlyAddedCount} new CN operators to add!`);
    
    // Format TypeScript additions
    let serialized = '\n';
    for (const entry of newEntries) {
      serialized += `  // ${entry.nameEn} (Auto-synced CN operator)\n`;
      serialized += `  ${entry.charId}: {\n`;
      serialized += `    nameEn: ${JSON.stringify(entry.nameEn)},\n`;
      serialized += `    nameRu: ${JSON.stringify(entry.nameRu)},\n`;
      serialized += `    quoteEn: ${JSON.stringify(entry.quoteEn)},\n`;
      serialized += `    quoteRu: ${JSON.stringify(entry.quoteRu)},\n`;
      serialized += `    traitEn: ${JSON.stringify(entry.traitEn)},\n`;
      serialized += `    traitRu: ${JSON.stringify(entry.traitRu)},\n`;
      serialized += `    talents: [\n`;
      for (const t of entry.talents) {
        serialized += `      {\n`;
        serialized += `        nameEn: ${JSON.stringify(t.nameEn)},\n`;
        serialized += `        nameRu: ${JSON.stringify(t.nameRu)},\n`;
        serialized += `        descriptionEn: ${JSON.stringify(t.descriptionEn)},\n`;
        serialized += `        descriptionRu: ${JSON.stringify(t.descriptionRu)},\n`;
        serialized += `      },\n`;
      }
      serialized += `    ],\n`;
      serialized += `  },\n\n`;
    }

    // Insert before closing bracket of CN_OPERATORS_LOCALIZATION
    const talentMapIdx = existingContent.indexOf('export const CN_TALENT_NAMES_MAP');
    if (talentMapIdx !== -1) {
      const beforeTalentMap = existingContent.slice(0, talentMapIdx);
      const afterTalentMap = existingContent.slice(talentMapIdx);
      const closingIdx = beforeTalentMap.lastIndexOf('};');
      if (closingIdx !== -1) {
        const updated = beforeTalentMap.slice(0, closingIdx) + serialized + beforeTalentMap.slice(closingIdx) + afterTalentMap;
        fs.writeFileSync(cnOperatorsCompletePath, updated, 'utf8');
        console.log(`✓ Successfully updated ${cnOperatorsCompletePath} with ${newlyAddedCount} new operators.`);
      }
    }
  } else {
    console.log('✓ All CN operators are already up to date in cnOperatorsComplete.ts.');
  }

  // Step 2: Trigger banner sync
  console.log('--- Step 2: Running banner schedule sync ---');
  try {
    const bannerScript = path.resolve(__dirname, 'sync-banners.js');
    if (fs.existsSync(bannerScript)) {
      const { spawnSync } = await import('child_process');
      const res = spawnSync('node', [bannerScript], { stdio: 'inherit' });
      if (res.status === 0) {
        console.log('✓ Banner schedule sync completed successfully.');
      }
    }
  } catch (err) {
    console.warn('Banner sync warning:', err.message);
  }

  console.log('--- CN Patches & Operators Sync Finished ---');
}

syncCnOperators().catch((err) => {
  console.error('Error during CN sync:', err);
  process.exit(1);
});
