import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function run() {
  const spritePath = path.resolve('public/images/item-sprite.png');
  const spriteMeta = await sharp(spritePath).metadata();
  console.log('Sprite Dimensions:', spriteMeta.width, 'x', spriteMeta.height);

  const iconW = spriteMeta.width / 6;
  const iconH = spriteMeta.height / 19;
  console.log('Each icon size:', iconW, 'x', iconH);

  const sprites = JSON.parse(fs.readFileSync('assets/data/itemSprites.json', 'utf8'));
  const destDir = path.resolve('public/images/items');
  fs.mkdirSync(destDir, { recursive: true });

  let count = 0;
  for (const [itemId, coord] of Object.entries(sprites)) {
    const [col, row] = coord;
    const left = Math.floor(col * iconW);
    const top = Math.floor(row * iconH);
    const right = Math.min(spriteMeta.width, Math.floor((col + 1) * iconW));
    const bottom = Math.min(spriteMeta.height, Math.floor((row + 1) * iconH));
    const width = right - left;
    const height = bottom - top;

    if (width > 0 && height > 0) {
      const destPath = path.join(destDir, `${itemId}.png`);
      await sharp(spritePath)
        .extract({ left, top, width, height })
        .png()
        .toFile(destPath);
      count++;
    }
  }

  console.log(`Successfully extracted ${count} item icons into public/images/items/!`);
}

run().catch(console.error);
