import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e17" />
      <stop offset="50%" stop-color="#080c14" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <!-- Accent Radial Glows -->
    <radialGradient id="cyanGlow" cx="20%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="amberGlow" cx="85%" cy="75%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Crystal Gradients -->
    <linearGradient id="cyanBlade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="amberBlade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Tech Grid Pattern -->
    <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" stroke-opacity="0.4" />
      <circle cx="0" cy="0" r="1.2" fill="#00f0ff" fill-opacity="0.3" />
    </pattern>
  </defs>

  <!-- Base Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#techGrid)" />
  <rect width="1200" height="630" fill="url(#cyanGlow)" />
  <rect width="1200" height="630" fill="url(#amberGlow)" />

  <!-- Outer Tech Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#1e293b" stroke-width="1.5" />
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="100 800" stroke-opacity="0.6" />

  <!-- Corner Brackets -->
  <path d="M 20 50 L 20 20 L 50 20" fill="none" stroke="#00f0ff" stroke-width="3" />
  <path d="M 1150 20 L 1180 20 L 1180 50" fill="none" stroke="#00f0ff" stroke-width="3" />
  <path d="M 20 580 L 20 610 L 50 610" fill="none" stroke="#f59e0b" stroke-width="3" />
  <path d="M 1150 610 L 1180 610 L 1180 580" fill="none" stroke="#f59e0b" stroke-width="3" />

  <!-- PRTS Terminal Header Line -->
  <text x="70" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="#00f0ff">PRTS // RHODES ISLAND TACTICAL SYSTEM // V2.4</text>
  <circle cx="1120" cy="66" r="5" fill="#10b981" />
  <text x="1100" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" letter-spacing="1" fill="#94a3b8" text-anchor="end">ONLINE</text>

  <!-- Left Side: Crystal Emblem (Scaled) -->
  <g transform="translate(80, 130) scale(0.65)">
    <!-- Outer Octagon Frame -->
    <polygon points="256,20 440,96 500,280 400,450 256,500 112,450 12,280 72,96"
             fill="#090d16" stroke="#00f0ff" stroke-width="6" stroke-opacity="0.6" />

    <!-- Crystal Diamond Wings -->
    <path d="M 256,50 L 370,170 L 256,360 L 142,170 Z" fill="url(#cyanBlade)" opacity="0.9" />
    <polygon points="256,170 330,280 256,440 182,280" fill="url(#amberBlade)" opacity="0.95" />
    <circle cx="256" cy="275" r="16" fill="#ffffff" />
    <circle cx="256" cy="275" r="32" fill="#00f0ff" opacity="0.4" />
  </g>

  <!-- Brand Title & Tagline -->
  <g transform="translate(460, 160)">
    <!-- Brand Badge -->
    <rect x="0" y="0" width="180" height="28" rx="6" fill="#00f0ff" fill-opacity="0.12" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.4" />
    <text x="12" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="#38bdf8">ARKNIGHTS TOOL</text>

    <!-- Main Title -->
    <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" letter-spacing="-1" fill="#f8fafc">
      ARK<tspan fill="#00f0ff">-CALC</tspan>
    </text>

    <!-- Subtitle / Value Proposition -->
    <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#94a3b8">
      Material Calculator, Farming Optimizer &amp; Spark Planner
    </text>
    <text x="0" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#64748b">
      Калькулятор прокачки оперативников, фарм с Penguin Stats и расчет круток
    </text>

    <!-- Feature Pills Grid -->
    <g transform="translate(0, 220)">
      <!-- Pill 1: Materials & Crafting -->
      <g transform="translate(0, 0)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#00f0ff" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Elite 2 &amp; Mastery Calc</text>
      </g>

      <!-- Pill 2: Penguin Stats Farming -->
      <g transform="translate(225, 0)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#10b981" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Penguin Stats Rates</text>
      </g>

      <!-- Pill 3: Spark / Gacha Planner -->
      <g transform="translate(450, 0)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#f59e0b" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Gacha &amp; 300 Spark</text>
      </g>

      <!-- Pill 4: Recruitment -->
      <g transform="translate(0, 56)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#a855f7" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Recruitment Tags</text>
      </g>

      <!-- Pill 5: Cloud Sync -->
      <g transform="translate(225, 56)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#38bdf8" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Cloud &amp; Offline PWA</text>
      </g>

      <!-- Pill 6: Fast & Free -->
      <g transform="translate(450, 56)">
        <rect width="210" height="42" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
        <circle cx="22" cy="21" r="6" fill="#ec4899" />
        <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">100% Free &amp; Open</text>
      </g>
    </g>

    <!-- Bottom URL Callout -->
    <g transform="translate(0, 360)">
      <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#38bdf8" letter-spacing="1">https://ark-calc.vercel.app</text>
    </g>
  </g>
</svg>
`;

async function generate() {
  console.log('Generating OpenGraph banner (1200x630)...');
  const svgBuffer = Buffer.from(ogSvg);
  const outPath = path.join(publicDir, 'og-image.png');
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(outPath);
  console.log(`✓ Generated ${outPath}`);
}

generate().catch(err => {
  console.error('Error generating og-image:', err);
  process.exit(1);
});
