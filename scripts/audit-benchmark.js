import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const benchmarkPath = path.resolve(__dirname, '../src/data/penguinStatsBenchmark.ts');

let content = fs.readFileSync(benchmarkPath, 'utf-8');

// 1. Aketon update
const oldAketonRegex = /'30053':\s*\{[\s\S]*?tier:\s*3,[\s\S]*?stages:\s*\[[\s\S]*?\],\s*\},/;
const newAketon = `'30053': {
    itemId: '30053',
    itemName: 'Aketon',
    itemNameRu: 'Акетон',
    tier: 3,
    stages: [
      {
        stageCode: '14-14',
        stageId: 'main_14-12',
        apCost: 21,
        dropRate: 79.7,
        sanityPerItem: 26.4,
        tag: 'Best Sanity',
        tagRu: 'Лучшая выносливость (14-14)',
        notes: 'Акетон: 79.7% шанс дропа, 21 Sanity / заход, ~26.4 AP на единицу',
      },
      {
        stageCode: '14-17',
        stageId: 'main_14-15',
        apCost: 24,
        dropRate: 90.4,
        sanityPerItem: 26.5,
        tag: 'Highest Rate',
        tagRu: 'Высокий шанс (14-17)',
        notes: 'Акетон: 90.4% шанс дропа (Tough), 24 Sanity / заход, ~26.5 AP на единицу',
      },
      {
        stageCode: '14-20',
        stageId: 'main_14-18',
        apCost: 24,
        dropRate: 88.9,
        sanityPerItem: 27,
        tag: 'Recommended',
        tagRu: 'Рекомендуемая (14-20)',
        notes: 'Акетон: 88.9% шанс дропа, 24 Sanity / заход',
      },
      {
        stageCode: '14-6',
        stageId: 'main_14-05',
        apCost: 21,
        dropRate: 77.7,
        sanityPerItem: 27,
        tag: 'Recommended',
        tagRu: 'Альтернатива (14-6)',
        notes: 'Акетон: 77.7% шанс дропа, 21 Sanity / заход',
      },
      {
        stageCode: '10-4',
        stageId: 'main_10-03',
        apCost: 21,
        dropRate: 55.1,
        sanityPerItem: 38.1,
        tag: 'Recommended',
        tagRu: 'Эпизод 10',
        notes: 'Акетон: 55.1% шанс дропа, 38.1 AP на единицу',
      },
      {
        stageCode: '3-1',
        stageId: 'main_03-01',
        apCost: 15,
        dropRate: 37,
        sanityPerItem: 40.5,
        tag: 'Recommended',
        tagRu: 'Ранняя игра 3-1',
        notes: 'Акетон: 37% шанс дропа, 40.5 AP на единицу',
      },
    ],
  },`;

content = content.replace(oldAketonRegex, newAketon);

// 2. Polyester Pack: 14-20 has 69.7% rate vs 2-6 with 36.8%
content = content.replace(
  /stageCode:\s*'2-6',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(2-6\)',/,
  "stageCode: '2-6',\n        stageId: 'main_02-06',\n        apCost: 12,\n        dropRate: 36.8,\n        sanityPerItem: 32.6,\n        tag: 'Recommended',\n        tagRu: 'Низкая цена за заход (2-6)',"
);
content = content.replace(
  /stageCode:\s*'14-20',[\s\S]*?tag:\s*'Recommended',[\s\S]*?tagRu:\s*'Рекомендуемая',/,
  "stageCode: '14-20',\n        stageId: 'main_14-18',\n        apCost: 24,\n        dropRate: 69.7,\n        sanityPerItem: 34.4,\n        tag: 'Highest Rate',\n        tagRu: 'Высокий шанс (14-20)',"
);

// 3. Oriron Cluster: 10-11 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'10-11',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(10-11\)',/,
  "stageCode: '10-11',\n        stageId: 'main_10-10',\n        apCost: 24,\n        dropRate: 45.7,\n        sanityPerItem: 52.6,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 10 (10-11)',"
);

// 4. Loxic Kohl: 6-11 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'6-11',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(6-11\)',/,
  "stageCode: '6-11',\n        stageId: 'main_06-10',\n        apCost: 21,\n        dropRate: 49.9,\n        sanityPerItem: 42.1,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 6 (6-11)',"
);

// 5. Manganese Ore: 17-6 has 59.1% rate, 15-11 has 51.8%
content = content.replace(
  /stageCode:\s*'15-11',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(15-11\)',/,
  "stageCode: '15-11',\n        stageId: 'main_15-10',\n        apCost: 21,\n        dropRate: 51.8,\n        sanityPerItem: 40.5,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 15 (15-11)',"
);
content = content.replace(
  /stageCode:\s*'17-6',[\s\S]*?tag:\s*'Recommended',[\s\S]*?tagRu:\s*'Рекомендуемая',/,
  "stageCode: '17-6',\n        stageId: 'main_17-05',\n        apCost: 24,\n        dropRate: 59.1,\n        sanityPerItem: 40.6,\n        tag: 'Highest Rate',\n        tagRu: 'Высокий шанс (17-6)',"
);

// 6. RMA70-12: 7-10 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'7-10',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(7-10\)',/,
  "stageCode: '7-10',\n        stageId: 'main_07-10',\n        apCost: 18,\n        dropRate: 34,\n        sanityPerItem: 53,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 7 (7-10)',"
);

// 7. Coagulating Gel: 12-5 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'12-5',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(12-5\)',/,
  "stageCode: '12-5',\n        stageId: 'main_12-04',\n        apCost: 21,\n        dropRate: 35,\n        sanityPerItem: 60,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 12 (12-5)',"
);

// 8. Incandescent Alloy: S3-6 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'S3-6',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(S3-6\)',/,
  "stageCode: 'S3-6',\n        stageId: 'sub_03-2-2',\n        apCost: 15,\n        dropRate: 39.6,\n        sanityPerItem: 37.9,\n        tag: 'Recommended',\n        tagRu: 'Низкая стоимость (S3-6)',"
);

// 9. Crystalline Component: R8-11 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'R8-11',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(R8-11\)',/,
  "stageCode: 'R8-11',\n        stageId: 'main_08-11',\n        apCost: 21,\n        dropRate: 58.2,\n        sanityPerItem: 36.1,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 8 (R8-11)',"
);

// 10. Semi-Synthetic Solvent: 12-10 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'12-10',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(12-10\)',/,
  "stageCode: '12-10',\n        stageId: 'main_12-09',\n        apCost: 21,\n        dropRate: 34.2,\n        sanityPerItem: 61.4,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 12 (12-10)',"
);

// 11. Compound Cutting Fluid: 12-17 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'12-17',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(12-17\)',/,
  "stageCode: '12-17',\n        stageId: 'main_12-16',\n        apCost: 21,\n        dropRate: 47,\n        sanityPerItem: 44.7,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 12 (12-17)',"
);

// 12. Transmuted Salt: 11-3 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'11-3',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(11-3\)',/,
  "stageCode: '11-3',\n        stageId: 'main_11-03',\n        apCost: 21,\n        dropRate: 31.4,\n        sanityPerItem: 66.8,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 11 (11-3)',"
);

// 13. Fuscous Fiber: 17-17 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'17-17',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(17-17\)',/,
  "stageCode: '17-17',\n        stageId: 'main_17-16',\n        apCost: 21,\n        dropRate: 30.9,\n        sanityPerItem: 68.1,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 17 (17-17)',"
);

// 14. Aggregate Cyclicene: 17-8 change from Highest Rate to Recommended
content = content.replace(
  /stageCode:\s*'17-8',[\s\S]*?tag:\s*'Highest Rate',[\s\S]*?tagRu:\s*'Высокий шанс \(17-8\)',/,
  "stageCode: '17-8',\n        stageId: 'main_17-07',\n        apCost: 21,\n        dropRate: 28.2,\n        sanityPerItem: 74.4,\n        tag: 'Recommended',\n        tagRu: 'Эпизод 17 (17-8)',"
);

fs.writeFileSync(benchmarkPath, content, 'utf-8');
console.log('✓ Successfully audited and corrected benchmark tags in penguinStatsBenchmark.ts');
