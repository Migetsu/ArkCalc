import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');

// 512x512 Rhodes Island PRTS Master Icon SVG
const masterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient (Deep Industrial Slate / PRTS Dark) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <!-- Cyan Glowing Crystal Blade Gradient -->
    <linearGradient id="cyanBladeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="35%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="cyanBladeRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="45%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>

    <!-- Top Prismatic Diamond Facet -->
    <linearGradient id="prismFacet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <!-- Golden Originium Core Gradient -->
    <linearGradient id="amberCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="45%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <!-- Ambient Cyan Radial Bloom -->
    <radialGradient id="neonGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.38" />
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Amber Glow Behind Core -->
    <radialGradient id="amberGlow" cx="50%" cy="52%" r="35%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>

    <!-- Soft Drop Shadow Filter for Crystal Wings -->
    <filter id="shadowA" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#00f0ff" flood-opacity="0.35" />
    </filter>

    <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#f59e0b" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Solid Square Base (Full bleed for perfect maskable Android/iOS cropping) -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Outer Tactical HUD Octagon / Ring -->
  <polygon
    points="150,40 362,40 472,150 472,362 362,472 150,472 40,362 40,150"
    fill="none"
    stroke="#1e293b"
    stroke-width="2"
  />

  <!-- Subtle Corner Tactical Dots -->
  <circle cx="80" cy="80" r="3" fill="#38bdf8" opacity="0.4" />
  <circle cx="432" cy="80" r="3" fill="#38bdf8" opacity="0.4" />
  <circle cx="80" cy="432" r="3" fill="#38bdf8" opacity="0.4" />
  <circle cx="432" cy="432" r="3" fill="#38bdf8" opacity="0.4" />

  <line x1="80" y1="90" x2="80" y2="120" stroke="#38bdf8" stroke-width="1.5" opacity="0.25" />
  <line x1="90" y1="80" x2="120" y2="80" stroke="#38bdf8" stroke-width="1.5" opacity="0.25" />
  <line x1="432" y1="90" x2="432" y2="120" stroke="#38bdf8" stroke-width="1.5" opacity="0.25" />
  <line x1="422" y1="80" x2="392" y2="80" stroke="#38bdf8" stroke-width="1.5" opacity="0.25" />

  <!-- Center Ambient Radiant Glow -->
  <circle cx="256" cy="235" r="175" fill="url(#neonGlow)" />
  <circle cx="256" cy="270" r="110" fill="url(#amberGlow)" />

  <!-- The Master "A" Emblem with Shadow -->
  <g filter="url(#shadowA)">
    <!-- Top Diamond Prism Facet -->
    <polygon points="256,76 332,165 256,220 180,165" fill="url(#prismFacet)" opacity="0.65" />

    <!-- Left Wing / Blade of "A" -->
    <path d="M256,76 L115,356 L178,380 L256,195 Z" fill="url(#cyanBladeLeft)" />

    <!-- Right Wing / Blade of "A" -->
    <path d="M256,76 L397,356 L334,380 L256,195 Z" fill="url(#cyanBladeRight)" />

    <!-- Left Wing Highlight Spine -->
    <line x1="256" y1="76" x2="115" y2="356" stroke="#ffffff" stroke-width="2" opacity="0.5" />
    <line x1="256" y1="76" x2="397" y2="356" stroke="#7dd3fc" stroke-width="2" opacity="0.4" />
  </g>

  <!-- Inner Center Hexagon Void (Dark Rhodes Island obsidian core) -->
  <polygon
    points="256,195 315,280 256,350 197,280"
    fill="#070a12"
    stroke="#00f0ff"
    stroke-width="4.5"
    stroke-linejoin="round"
  />

  <!-- Golden Originium Core Prism -->
  <polygon
    points="256,230 292,280 256,328 220,280"
    fill="url(#amberCore)"
    filter="url(#coreGlow)"
  />

  <!-- Core Facet Cut -->
  <polygon points="256,230 292,280 256,328" fill="#fef08a" opacity="0.3" />

  <!-- Bottom Tactical Chevrons (Promotion / Elite 2 Indicator) -->
  <g>
    <!-- Primary Elite Chevron -->
    <path
      d="M200,412 L256,450 L312,412"
      fill="none"
      stroke="#f59e0b"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Secondary Upper Chevron Accent -->
    <path
      d="M216,396 L256,424 L296,396"
      fill="none"
      stroke="#00f0ff"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.85"
    />
  </g>

  <!-- Apex Brilliant Star Accent -->
  <circle cx="256" cy="76" r="6" fill="#ffffff" />
  <circle cx="256" cy="76" r="14" fill="#00f0ff" opacity="0.4" />
</svg>
`;

async function generate() {
  console.log('Generating high-resolution PWA & Mobile shortcut icons...');

  const svgBuffer = Buffer.from(masterSvg);

  const targets = [
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const t of targets) {
    const outPath = path.join(publicDir, t.name);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated ${t.name} (${t.size}x${t.size})`);
  }

  // Also write an updated, razor-sharp favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterSvg.trim(), 'utf-8');
  console.log('✓ Updated favicon.svg');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
