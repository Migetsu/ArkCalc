import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

// 1. Regular Icon SVG (with rounded corners for favicon and desktop display)
const regularSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="50%" stop-color="#0f141f"/>
      <stop offset="100%" stop-color="#06080c"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#00e5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="96" fill="url(#bgGrad)"/>
  <rect width="510" height="510" x="1" y="1" rx="95" fill="none" stroke="rgba(0, 229, 255, 0.25)" stroke-width="2"/>
  
  <!-- Subtle Tactical Tech Ring & Grid -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="8 8"/>
  <circle cx="256" cy="256" r="175" fill="none" stroke="rgba(0, 229, 255, 0.12)" stroke-width="1.5"/>
  <path d="M 256,24 L 256,54 M 256,458 L 256,488 M 24,256 L 54,256 M 458,256 L 488,256" stroke="rgba(0, 229, 255, 0.4)" stroke-width="3"/>

  <!-- Tactical Hex / Polygon Border -->
  <polygon points="256,56 436,160 436,368 256,472 76,368 76,160" fill="none" stroke="rgba(0, 229, 255, 0.2)" stroke-width="2"/>

  <!-- Rhodes Island Tactical Chevron (Main Prism) -->
  <g filter="url(#glow)">
    <!-- Outer Triangle -->
    <path d="M 256,108 L 392,344 L 120,344 Z" fill="url(#cyanGrad)"/>
    <!-- Inner Dark Cutout -->
    <path d="M 256,170 L 340,320 L 172,320 Z" fill="#0d1117"/>
    <!-- Inner Center Core Prism -->
    <polygon points="256,220 286,274 226,274" fill="url(#cyanGrad)"/>
    <polygon points="256,242 267,264 245,264" fill="#ffffff"/>
  </g>

  <!-- Amber Accent Diamond -->
  <polygon points="256,354 266,368 256,382 246,368" fill="url(#amberGrad)"/>

  <!-- Tactical Labels -->
  <text x="256" y="416" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="28" font-weight="900" letter-spacing="8" fill="#00e5ff">PRTS</text>
  <text x="256" y="438" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="12" font-weight="700" letter-spacing="3" fill="#64748b">TERMINAL // ARKCALC</text>
</svg>`

// 2. Maskable Icon SVG (full-bleed square background with 18% safe padding for Android masks)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="50%" stop-color="#0f141f"/>
      <stop offset="100%" stop-color="#06080c"/>
    </linearGradient>
    <linearGradient id="cyanGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#00e5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="amberGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="glowMask" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Full-bleed background for maskable icon -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>
  
  <!-- Centered safe-zone scaled graphics (~80% scale) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <circle cx="256" cy="256" r="215" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="256" cy="256" r="175" fill="none" stroke="rgba(0, 229, 255, 0.15)" stroke-width="2"/>
    <path d="M 256,24 L 256,54 M 256,458 L 256,488 M 24,256 L 54,256 M 458,256 L 488,256" stroke="rgba(0, 229, 255, 0.4)" stroke-width="3"/>
    <polygon points="256,56 436,160 436,368 256,472 76,368 76,160" fill="none" stroke="rgba(0, 229, 255, 0.2)" stroke-width="2"/>

    <g filter="url(#glowMask)">
      <path d="M 256,108 L 392,344 L 120,344 Z" fill="url(#cyanGradMask)"/>
      <path d="M 256,170 L 340,320 L 172,320 Z" fill="#0d1117"/>
      <polygon points="256,220 286,274 226,274" fill="url(#cyanGradMask)"/>
      <polygon points="256,242 267,264 245,264" fill="#ffffff"/>
    </g>

    <polygon points="256,354 266,368 256,382 246,368" fill="url(#amberGradMask)"/>
    <text x="256" y="416" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="28" font-weight="900" letter-spacing="8" fill="#00e5ff">PRTS</text>
    <text x="256" y="438" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="12" font-weight="700" letter-spacing="3" fill="#64748b">TERMINAL // ARKCALC</text>
  </g>
</svg>`

// 3. Open Graph 1200x630 Card SVG
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06090e"/>
      <stop offset="40%" stop-color="#0b111a"/>
      <stop offset="100%" stop-color="#040609"/>
    </linearGradient>
    <linearGradient id="ogCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#00e5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="ogAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="ogGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)"/>

  <!-- Subtle Tactical Grid Lines -->
  <g stroke="rgba(255, 255, 255, 0.04)" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Cyber Accents -->
  <circle cx="230" cy="315" r="210" fill="none" stroke="rgba(0, 229, 255, 0.12)" stroke-width="2" stroke-dasharray="10 10"/>
  <circle cx="230" cy="315" r="160" fill="none" stroke="rgba(0, 229, 255, 0.2)" stroke-width="1.5"/>

  <!-- Left Side: Rhodes Island PRTS Emblem -->
  <g transform="translate(230, 315) scale(0.95)" filter="url(#ogGlow)">
    <path d="M 0,-140 L 135,90 L -135,90 Z" fill="url(#ogCyan)"/>
    <path d="M 0,-85 L 85,68 L -85,68 Z" fill="#0b111a"/>
    <polygon points="0,-30 30,25 -30,25" fill="url(#ogCyan)"/>
    <polygon points="0,-8 12,14 -12,14" fill="#ffffff"/>
    <polygon points="0,105 10,120 0,135 -10,120" fill="url(#ogAmber)"/>
  </g>

  <!-- Right Side: Content Group -->
  <g transform="translate(480, 110)">
    <!-- Top System Pill -->
    <rect x="0" y="0" width="460" height="32" fill="rgba(0, 229, 255, 0.08)" stroke="rgba(0, 229, 255, 0.3)" stroke-width="1"/>
    <text x="16" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="12" font-weight="700" letter-spacing="3" fill="#00e5ff">RHODES ISLAND // PRTS TACTICAL SUITE</text>

    <!-- Main Title -->
    <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="74" font-weight="900" letter-spacing="3" fill="url(#ogCyan)">ARKCALC</text>

    <!-- Subtitle -->
    <text x="0" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="600" fill="#f8fafc">Arknights Doctor Tactical Planning Terminal</text>

    <!-- Description -->
    <text x="0" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" fill="#94a3b8">Promotion Material Deltas · Gacha Sparks · Recruitment Matrix · Depot Inventory</text>

    <!-- Feature Badges -->
    <g transform="translate(0, 255)">
      <!-- Badge 1 -->
      <rect x="0" y="0" width="145" height="40" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)"/>
      <text x="14" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#38bdf8">[PLN] PLANNER</text>

      <!-- Badge 2 -->
      <rect x="160" y="0" width="135" height="40" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)"/>
      <text x="174" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#fbbf24">[GCH] GACHA</text>

      <!-- Badge 3 -->
      <rect x="310" y="0" width="165" height="40" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)"/>
      <text x="324" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#4ade80">[RCR] RECRUIT</text>

      <!-- Badge 4 -->
      <rect x="490" y="0" width="140" height="40" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.15)"/>
      <text x="504" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#c084fc">[INV] DEPOT</text>
    </g>

    <!-- Bottom Metrics / Status -->
    <text x="0" y="360" font-family="monospace" font-size="13" fill="#64748b" letter-spacing="1">LIVE PENGUIN STATS · SECURE LOCAL CACHE · OFFLINE PWA SUPPORT</text>
  </g>

  <!-- Border Accent -->
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="rgba(0, 229, 255, 0.3)" stroke-width="2"/>
  <rect x="0" y="624" width="1200" height="6" fill="url(#ogCyan)"/>
</svg>`

async function generate() {
  console.log('[PWA Generator] Writing icon.svg and favicon.svg...')
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), regularSvg)
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), regularSvg)

  const regularBuffer = Buffer.from(regularSvg)
  const maskableBuffer = Buffer.from(maskableSvg)
  const ogBuffer = Buffer.from(ogSvg)

  const targets = [
    { name: 'pwa-64x64.png', size: 64, buffer: regularBuffer },
    { name: 'pwa-192x192.png', size: 192, buffer: regularBuffer },
    { name: 'pwa-512x512.png', size: 512, buffer: regularBuffer },
    { name: 'apple-touch-icon.png', size: 180, buffer: regularBuffer },
    { name: 'maskable-icon-512x512.png', size: 512, buffer: maskableBuffer },
    { name: 'favicon.ico', size: 48, buffer: regularBuffer },
  ]

  for (const t of targets) {
    console.log(`[PWA Generator] Generating ${t.name} (${t.size}x${t.size})...`)
    await sharp(t.buffer)
      .resize(t.size, t.size)
      .png()
      .toFile(path.join(publicDir, t.name))
  }

  // Generate 1200x630 Open Graph preview image
  console.log('[PWA Generator] Generating Open Graph preview image (1200x630)...')
  const imagesDir = path.join(publicDir, 'images')
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(imagesDir, 'og-image.png'))

  console.log('[PWA Generator] All PWA & OG assets generated successfully!')
}

generate().catch(console.error)
