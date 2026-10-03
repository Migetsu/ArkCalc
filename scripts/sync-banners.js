// scripts/sync-banners.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventsDataPath = path.resolve(__dirname, '../src/data/eventsData.ts');

const WIKI_API = 'https://arknights.wiki.gg/api.php';

async function fetchWikiPageWikitext(pageTitle) {
  const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&format=json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ArkCalc-BannerSync/1.0 (https://ark-calc.vercel.app)'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${pageTitle}: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`Wiki API error for ${pageTitle}: ${data.error.info}`);
  }
  return data.parse?.wikitext?.['*'] || '';
}

function parseBannerCells(wikitext) {
  const cells = [];
  const cellRegex = /\{\{Banners cell([\s\S]*?)\}\}/g;
  let match;

  while ((match = cellRegex.exec(wikitext)) !== null) {
    const rawContent = match[1];
    const params = {};
    const lines = rawContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(1, eqIdx).trim().toLowerCase();
          const val = trimmed.slice(eqIdx + 1).trim();
          params[key] = val;
        }
      }
    }

    if (params.type || params.cnstart || params.operators || params.name) {
      cells.push(params);
    }
  }

  return cells;
}

function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function estimateGlobalDate(cnDateStr) {
  // Global is typically ~5 to 6 months behind CN
  if (!cnDateStr) return undefined;
  const parts = cnDateStr.split(/[\/\-\s]/);
  if (parts.length >= 2) {
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(month)) {
      month += 5; // ~5-6 month gap
      if (month > 12) {
        year += Math.floor((month - 1) / 12);
        month = ((month - 1) % 12) + 1;
      }
      return `${year}/${String(month).padStart(2, '0')}`;
    }
  }
  return undefined;
}

function cleanDate(dateStr) {
  if (!dateStr) return '';
  // Convert "2026/05/01 12:00:00" -> "2026/05/01"
  return dateStr.split(' ')[0].replace(/-/g, '/');
}

async function run() {
  console.log('🔄 Fetching upcoming banners from arknights.wiki.gg...');
  const upcomingWikitext = await fetchWikiPageWikitext('Headhunting/Banners/Upcoming');
  const upcomingCells = parseBannerCells(upcomingWikitext);
  console.log(`✓ Found ${upcomingCells.length} upcoming banner entries in wiki.`);

  // Also check confirmed 2026 banners for global release dates
  let confirmedCells = [];
  try {
    const currentYear = new Date().getFullYear();
    const confirmedWikitext = await fetchWikiPageWikitext(`Headhunting/Banners/${currentYear}`);
    confirmedCells = parseBannerCells(confirmedWikitext);
    console.log(`✓ Found ${confirmedCells.length} confirmed ${currentYear} banner entries.`);
  } catch (e) {
    console.warn('Could not fetch yearly confirmed banners:', e.message);
  }

  // Load existing eventsData.ts
  const rawFile = fs.readFileSync(eventsDataPath, 'utf-8');
  const jsonMatch = rawFile.match(/export const ARKNIGHTS_EVENTS:\s*ArknightsEvent\[\]\s*=\s*(\[[\s\S]*?\]);/);
  if (!jsonMatch) {
    throw new Error('Could not find ARKNIGHTS_EVENTS array in eventsData.ts');
  }

  let existingEvents = [];
  try {
    existingEvents = JSON.parse(jsonMatch[1]);
  } catch (err) {
    // If JSON.parse fails due to unquoted keys or formatting, eval safely
    existingEvents = Function(`"use strict"; return (${jsonMatch[1]});`)();
  }

  const existingMap = new Map();
  for (const ev of existingEvents) {
    existingMap.set(ev.id, ev);
  }

  let updatedCount = 0;
  let addedCount = 0;

  // Process upcoming cells
  for (const cell of upcomingCells) {
    let rawName = cell.name || '';
    if (cell.type === 'orient' && cell.no) {
      rawName = `Orienteering #${cell.no} (Directional Selection)`;
    } else if (cell.type === 'jo' && cell.no) {
      rawName = `Joint Operation #${cell.no}`;
    }

    if (!rawName) continue;

    const bannerIdSuffix = sanitizeId(rawName);
    const expectedId = cell.type === 'orient'
      ? `banner_standard_headhunting_orienteering_${cell.no}`
      : cell.type === 'jo'
      ? `banner_standard_headhunting_joint_operation_${cell.no}`
      : `banner_${sanitizeId(cell.type || 'headhunting')}_${bannerIdSuffix}`;

    // Check if event already exists by id or partial name match
    let matchedEvent = existingEvents.find(
      (e) => e.id === expectedId || e.nameEn.toLowerCase().includes(rawName.toLowerCase())
    );

    const cnStart = cleanDate(cell.cnstart);
    const cnEnd = cleanDate(cell.cnend);
    const globalArrival = estimateGlobalDate(cnStart);

    // Check if confirmed in yearly list
    const confirmedMatch = confirmedCells.find((c) => c.name && c.name.toLowerCase() === rawName.toLowerCase());
    const globalStart = confirmedMatch?.globalstart ? cleanDate(confirmedMatch.globalstart) : undefined;
    const globalEnd = confirmedMatch?.globalend ? cleanDate(confirmedMatch.globalend) : undefined;

    if (matchedEvent) {
      let changed = false;
      if (cnStart && matchedEvent.cnStartDate !== cnStart) {
        matchedEvent.cnStartDate = cnStart;
        changed = true;
      }
      if (cnEnd && matchedEvent.cnEndDate !== cnEnd) {
        matchedEvent.cnEndDate = cnEnd;
        changed = true;
      }
      if (globalStart && matchedEvent.globalStartDate !== globalStart) {
        matchedEvent.globalStartDate = globalStart;
        changed = true;
      }
      if (globalEnd && matchedEvent.globalEndDate !== globalEnd) {
        matchedEvent.globalEndDate = globalEnd;
        changed = true;
      }
      if (globalArrival && !matchedEvent.globalStartDate && matchedEvent.globalEstimatedArrival !== globalArrival) {
        matchedEvent.globalEstimatedArrival = globalArrival;
        changed = true;
      }
      if (changed) {
        updatedCount++;
        console.log(`  ↻ Updated event: ${matchedEvent.nameEn}`);
      }
    } else {
      // New event found on CN!
      const ops = (cell.operators || cell.operators1 || '').split(',').map((s) => s.trim()).filter(Boolean);
      const sixStarOps = [];
      const fiveStarOps = [];

      for (const opName of ops) {
        const charId = `char_${sanitizeId(opName)}`;
        sixStarOps.push({
          charId,
          name: opName,
          rarity: 6,
          avatarUrl: `/avatars/avatar_${sanitizeId(opName)}.png`
        });
      }

      if (cell.operators2) {
        const fOps = cell.operators2.split(',').map((s) => s.trim()).filter(Boolean);
        for (const opName of fOps) {
          fiveStarOps.push({
            charId: `char_${sanitizeId(opName)}`,
            name: opName,
            rarity: 5,
            avatarUrl: `/avatars/avatar_${sanitizeId(opName)}.png`
          });
        }
      }

      const newEvent = {
        id: expectedId,
        nameEn: rawName,
        nameRu: rawName,
        nameCn: rawName,
        headerTagEn: `[${cell.type ? cell.type.toUpperCase() : 'EVENT'}] ${rawName}`,
        headerTagRu: `[${cell.type ? cell.type.toUpperCase() : 'EVENT'}] ${rawName}`,
        headerTagCn: `[${cell.type ? cell.type.toUpperCase() : 'EVENT'}] ${rawName}`,
        type: 'headhunting',
        status: 'upcoming_global',
        bannerPosterUrl: `/banners/${expectedId}.png`,
        cnStartDate: cnStart,
        cnEndDate: cnEnd,
        globalEstimatedArrival: globalArrival,
        globalStartDate: globalStart,
        globalEndDate: globalEnd,
        sixStarOps,
        fiveStarOps,
        shopItems: [],
        farmingStages: [],
        summaryEn: `Upcoming ${rawName} banner on CN.`,
        summaryRu: `Будущий баннер ${rawName} на CN сервере.`,
        summaryCn: `国服最新寻访：${rawName}`
      };

      existingEvents.push(newEvent);
      addedCount++;
      console.log(`  + Added new banner from wiki: ${rawName}`);
    }
  }

  if (updatedCount === 0 && addedCount === 0) {
    console.log('✨ All banners are already up to date with arknights.wiki.gg. No changes needed.');
    return;
  }

  // Sort events chronologically by cnStartDate descending (latest CN first)
  existingEvents.sort((a, b) => (b.cnStartDate || '').localeCompare(a.cnStartDate || ''));

  // Re-write eventsData.ts
  const updatedFileContent = rawFile.replace(
    /export const ARKNIGHTS_EVENTS:\s*ArknightsEvent\[\]\s*=\s*\[[\s\S]*?\];/,
    `export const ARKNIGHTS_EVENTS: ArknightsEvent[] = ${JSON.stringify(existingEvents, null, 2)};`
  );

  fs.writeFileSync(eventsDataPath, updatedFileContent, 'utf-8');
  console.log(`🎉 Successfully synchronized eventsData.ts! (Updated: ${updatedCount}, Added: ${addedCount})`);
}

run().catch((err) => {
  console.error('❌ Error synchronizing banners:', err);
  process.exit(1);
});
