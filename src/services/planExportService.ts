import type { OperatorTargetPlan } from '@/services/db';
import type { OperatorSummary } from '@/types/game';
import { getCharacterPortraitUrl } from '@/utils/imageUrl';

// ─── JSON Export / Import ──────────────────────────────────────────────────

export interface PlanExportBundle {
  version: 1;
  exportedAt: string; // ISO-8601
  plans: OperatorTargetPlan[];
}

export function exportPlansToJson(plans: OperatorTargetPlan[]): string {
  const bundle: PlanExportBundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    plans,
  };
  return JSON.stringify(bundle, null, 2);
}

export function importPlansFromJson(json: string): OperatorTargetPlan[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON');
  }

  // Support both raw array (legacy) and wrapped bundle
  if (Array.isArray(parsed)) {
    return validatePlans(parsed);
  }

  const bundle = parsed as PlanExportBundle;
  if (bundle.version !== 1 || !Array.isArray(bundle.plans)) {
    throw new Error('Unrecognized export format');
  }
  return validatePlans(bundle.plans);
}

function validatePlans(raw: unknown[]): OperatorTargetPlan[] {
  return raw.filter(
    (p): p is OperatorTargetPlan =>
      typeof (p as OperatorTargetPlan).charId === 'string' &&
      typeof (p as OperatorTargetPlan).current === 'object' &&
      typeof (p as OperatorTargetPlan).target === 'object',
  );
}

// ─── Canvas Infographic ────────────────────────────────────────────────────

export interface InfographicData {
  plans: OperatorTargetPlan[];
  operators: Record<string, OperatorSummary>;
  totalSanity: number;
  naturalDays: number;
  opEquivalent: number;
  totalLmd: number;
  totalExp: number;
  lang: 'en' | 'ru';
}

const CARD_W = 1200;
const CARD_H = 680;
const ACCENT = '#06b6d4'; // cyan-500
const BG_DARK = '#0f172a'; // slate-950
const BG_CARD = '#1e293b'; // slate-800
const BG_CARD2 = '#0f172a';
const TEXT_PRIMARY = '#f1f5f9';
const TEXT_MUTED = '#94a3b8';
const BORDER = '#334155';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 4000);
    img.src = src;
  });
}

function drawStatBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
  accent: string,
) {
  const W = 260;
  const H = 70;
  ctx.save();
  roundRect(ctx, x, y, W, H, 12);
  ctx.fillStyle = BG_CARD;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = accent;
  roundRect(ctx, x, y, 4, H, 4);
  ctx.fill();

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.fillText(label, x + 16, y + 24);

  ctx.fillStyle = accent;
  ctx.font = 'bold 22px Inter, system-ui, monospace';
  ctx.fillText(value, x + 16, y + 52);
  ctx.restore();
}

export async function renderPlanCard(
  canvas: HTMLCanvasElement,
  data: InfographicData,
): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  // ── Background
  ctx.fillStyle = BG_DARK;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ── Top accent stripe
  const grad = ctx.createLinearGradient(0, 0, CARD_W, 0);
  grad.addColorStop(0, '#0e7490');
  grad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, 5);

  // ── Header
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = 'bold 32px Inter, system-ui, sans-serif';
  ctx.fillText('ArkCalc', 40, 60);

  ctx.fillStyle = ACCENT;
  ctx.font = '600 15px Inter, system-ui, sans-serif';
  ctx.fillText(
    data.lang === 'ru' ? 'План прокачки операторов' : 'Operator Upgrade Plan',
    40,
    88,
  );

  // Date
  const dateStr = new Date().toLocaleDateString(data.lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '500 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, CARD_W - 40, 60);
  ctx.textAlign = 'left';

  // ── Stat badges row
  const stats = [
    {
      label: data.lang === 'ru' ? 'Sanity (оценка)' : 'Sanity (est.)',
      value: `~${data.totalSanity.toLocaleString()} ⚡`,
      accent: '#f59e0b',
    },
    {
      label: data.lang === 'ru' ? 'Дней (240/день)' : 'Days (240/day)',
      value: `~${data.naturalDays}`,
      accent: ACCENT,
    },
    {
      label: 'Originium Prime',
      value: `~${data.opEquivalent} OP`,
      accent: '#8b5cf6',
    },
    {
      label: 'LMD',
      value: `~${(data.totalLmd / 1000).toFixed(0)}k`,
      accent: '#06b6d4',
    },
  ];
  const badgeY = 110;
  const badgeGap = 280;
  stats.forEach((s, i) => {
    drawStatBadge(ctx, 40 + i * badgeGap, badgeY, s.label, s.value, s.accent);
  });

  // ── Divider
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 200);
  ctx.lineTo(CARD_W - 40, 200);
  ctx.stroke();

  // ── Operator cards section label
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.fillText(
    data.lang === 'ru'
      ? `Операторов в плане: ${data.plans.length}`
      : `Operators planned: ${data.plans.length}`,
    40,
    225,
  );

  // ── Operator avatar strip
  const MAX_DISPLAY = 14;
  const displayed = data.plans.slice(0, MAX_DISPLAY);
  const avatarSize = 72;
  const avatarGap = 12;
  const startX = 40;
  const avatarY = 240;

  const imagePromises = displayed.map((plan) => {
    const op = data.operators[plan.charId];
    if (!op) return Promise.resolve(null);
    const url = getCharacterPortraitUrl(plan.charId);
    return loadImageSafe(url);
  });
  const images = await Promise.all(imagePromises);

  displayed.forEach((plan, i) => {
    const op = data.operators[plan.charId];
    const x = startX + i * (avatarSize + avatarGap);
    const y = avatarY;

    // Avatar background
    ctx.save();
    roundRect(ctx, x, y, avatarSize, avatarSize, 10);
    ctx.fillStyle = BG_CARD2;
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.clip();

    const img = images[i];
    if (img) {
      // Draw portrait centered
      const scale = Math.max(avatarSize / img.width, avatarSize / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, x + (avatarSize - dw) / 2, y + (avatarSize - dh) / 2, dw, dh);
    } else if (op) {
      // Fallback: initials
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 20px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(op.name.slice(0, 2).toUpperCase(), x + avatarSize / 2, y + avatarSize / 2 + 7);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    // Operator name below
    if (op) {
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = '500 9px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      const shortName = op.name.length > 7 ? op.name.slice(0, 7) + '…' : op.name;
      ctx.fillText(shortName, x + avatarSize / 2, y + avatarSize + 14);
      ctx.textAlign = 'left';
    }

    // Target elite badge
    const targetElite = plan.target.elite;
    if (targetElite > 0) {
      const eliteColors = ['', '#f59e0b', '#ef4444'];
      ctx.save();
      roundRect(ctx, x + avatarSize - 20, y + avatarSize - 20, 20, 20, 5);
      ctx.fillStyle = eliteColors[targetElite] ?? '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`E${targetElite}`, x + avatarSize - 10, y + avatarSize - 7);
      ctx.textAlign = 'left';
      ctx.restore();
    }
  });

  // Overflow indicator
  if (data.plans.length > MAX_DISPLAY) {
    const extra = data.plans.length - MAX_DISPLAY;
    const x = startX + MAX_DISPLAY * (avatarSize + avatarGap);
    ctx.save();
    roundRect(ctx, x, avatarY, avatarSize, avatarSize, 10);
    ctx.fillStyle = BG_CARD;
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${extra}`, x + avatarSize / 2, avatarY + avatarSize / 2 + 6);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  // ── Footer watermark
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, CARD_H - 48, CARD_W, 48);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, CARD_H - 48);
  ctx.lineTo(CARD_W, CARD_H - 48);
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 13px Inter, system-ui, sans-serif';
  ctx.fillText('arkcalc.app', 40, CARD_H - 17);

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = '500 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Made with ArkCalc • Arknights Planner', CARD_W - 40, CARD_H - 17);
  ctx.textAlign = 'left';
}
