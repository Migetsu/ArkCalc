Полное техническое задание (ТЗ) для ИИ-агента: Разработка ARK-Calc
1. Архитектурный обзор проекта:

Цель: Создать автономное веб-приложение (Single Page Application) без постоянного backend-сервера для планирования прокачки оперативников Arknights, расчета ресурсов, разложения крафта и учета склада.

Ключевые принципы:

    1. Offline-First: Данные пользователя (склад, план прокачки) хранятся исключительно в IndexedDB браузера клиента.

    2. CDN-Driven Metadata: Игровые данные и графические ресурсы запрашиваются напрямую из публичных репозиториев GitHub через бесплатные CDN (jsDelivr / raw.githubusercontent).

    3. Реактивный расчет: Изменение уровня, мастерств или запасов на складе мгновенно пересчитывает граф ресурсов без перезагрузки страницы.

2.1 JSON-данные игры (Global / EN / CN):
    Основной репозиторий: [https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/en_US/gamedata/excel/](https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/en_US/gamedata/excel/)

    Файлы:
        character_table.json: Статы оперативников, требования к E1/E2, мастерствам скиллов ($M1 \to M3$).
        item_table.json: Все предметы/материалы, их тиры (T1–T5), иконки и базовые формулы.
        building_data.json: Рецепты мастерской (Workshop) для крафта материалов.
        uniequip_table.json: Данные о модулях (X, Y, Δ), требования к их открытию и прокачке (Lvl 1–3).
        gamedata_const.json: Константы стоимости уровней (EXP и LMD на каждый уровень для каждого тира элиты).

2.2 Графические ресурсы (CDN):

    Корневой URL: [https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/](https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/)
    
    Шаблоны путей:
        Аватарки персонажей: {CDN}/img/avatars/{char_id}.png (например, char_002_kalts.png)
        Портреты / E2 арты: {CDN}/img/characters/{char_id}_2.png
        Иконки скиллов: {CDN}/img/skills/skill_icon_{skill_id}.png
        Иконки предметов/материалов: {CDN}/img/items/{item_id}.png
        Иконки модулей: {CDN}/img/equip/{equip_id}.png

3. Стек технологий и структура проекта:

[Фреймворк]           : Vue 3 (Composition API, <script setup>, TypeScript)
[Сборщик]             : Vite
[Стор состояния]       : Pinia
[Локальная база БД]    : Dexie.js (обертка над IndexedDB)
[Стилизация]          : Tailwind CSS
[Виртуализация UI]    : vue-virtual-scroller (обязательно для списка 300+ персонажей)

Структура файлов проекта:
src/
├── assets/
├── components/
│   ├── common/
│   │   ├── ItemIcon.vue          # Компонент иконки предмета с рамкой тира
│   │   └── QuantityInput.vue     # Инпут для ввода количества на складе
│   ├── operator/
│   │   ├── OperatorCard.vue      # Карточка персонажа в списке
│   │   ├── OperatorSelector.vue  # Каталог с фильтрами (класс, редкость)
│   │   └── PlanEditorModal.vue   # Модалка настройки Текущее -> Целевое состояние
│   ├── inventory/
│   │   └── InventoryGrid.vue     # Таблица склада по категориям (T1-T5, Чипы, Книги)
│   └── calculator/
│       ├── ResourceSummary.vue   # Общий итоговый список со дефицитом (красный цвет)
│       └── CraftingTree.vue      # Дерево рецептов разложения сложных ресурсов
├── stores/
│   ├── gamedata.ts               # Загрузка и кэширование JSON с GitHub CDN
│   ├── inventory.ts              # Управление складом в IndexedDB
│   └── planner.ts                # Планы прокачки и запуск калькулятора
├── services/
│   ├── calculatorEngine.ts       # Математика опыта, LMD и рекурсивный граф крафта
│   └── prtsSync.ts               # Клиентская синхронизация по токену (ручной вызов)
└── App.vue

4. Схема локальной базы данных (Dexie.js / IndexedDB):
ИИ-агент должен инициализировать следующую структуру IndexedDB:
// src/services/db.ts
import Dexie, { Table } from 'dexie';

// Запись о количестве предметов на складе пользователя
export interface UserInventory {
  itemId: string; // Пример: "30013" (MTL_SL_G3)
  amount: number; // Количество
}

// Запись плана прокачки оперативника
export interface OperatorTargetPlan {
  charId: string; // Пример: "char_002_kalts"
  current: {
    elite: number; // 0, 1, 2
    level: number; // 1-90
    skills: number[]; // Стандартно [7, 7, 7] (уровень каждого скилла)
    masteries: number[]; // [0, 3, 0] -> 2-й скилл прокачан на M3
    modules: Record<string, number>; // { "uniequip_001_kalts": 3 } (ID модуля -> Уровень 1-3)
  };
  target: {
    elite: number;
    level: number;
    skills: number[];
    masteries: number[];
    modules: Record<string, number>;
  };
}

export class AppDatabase extends Dexie {
  inventory!: Table<UserInventory>;
  plans!: Table<OperatorTargetPlan>;

  constructor() {
    super('ARKCalcDB');
    this.version(1).stores({
      inventory: 'itemId',
      plans: 'charId'
    });
  }
}

export const db = new AppDatabase();

5. Алгоритмы и Математическая Логика (Calculator Engine):
Это важнейшая часть, которую ИИ-агент должен точно реализовать в calculatorEngine.ts.

5.1 Алгоритм расчета EXP и LMD на уровни:
Данные о затратах EXP и LMD хранятся в gamedata_const.json в виде массивов:
    characterExpMap: Массив EXP, требуемый для перехода с уровня $N$ на $N+1$.
    characterUpgradeCostMap: Массив LMD, требуемый для перехода с уровня $N$ на $N+1$.
    characterEvolveCostTable: Массив стоимости возвышения (Promotion E0$\to$E1, E1$\to$E2) по редкостям и элитам.
Формула расчета:
$$\text{Total LMD} = \sum_{i=\text{Level}_{\text{cur}}}^{\text{Level}_{\text{target}}-1} \text{CostMap}[i] + \text{EvolveCost}[\text{TargetElite}]$$

$$\text{Total EXP} = \sum_{i=\text{Level}_{\text{cur}}}^{\text{Level}_{\text{target}}-1} \text{ExpMap}[i]$$

Примечание: Если целая элита перескакивает (например с E0 Lvl 50 до E2 Lvl 60), калькулятор суммирует остаток текущей элиты + стоимость повышения элиты + полный проход следующей элиты.

5.2 Алгоритм графа крафта и разложения ресурсов (Crafting Tree Resolver):
Материалы бывают прямыми (нужными для прокачки) и промежуточными (компоненты крафта).

Агрегация потребностей ($Req_{raw}$):
Пройтись по всем оперативникам в активных планах (planner.ts). Сложить все требуемые предметы для перехода:

$E_{cur} \to E_{target}$, $M_{cur} \to M_{target}$ и $Mod_{cur} \to Mod_{target}$. Получить словарь вида { itemId: requiredAmount }.

Сверка со складом ($Stock$):
Для каждого предмета вычисляется прямой дефицит:
$$\text{Deficit}[itemId] = \max(0, Req_{raw}[itemId] - Stock[itemId])$$

Рекурсивное разложение T4/T3 материалов в компоненты:
Если Deficit[itemId] > 0 и предмет имеет рецепт крафта в building_data.json:
function decomposeItem(itemId: string, neededAmount: number) {
  const recipe = buildingData.workshopRecipes[itemId];
  if (!recipe) return; // Элемент базовый (T1 или руда), разложить нельзя

  // Расчет требуемого LMD на крафт
  totalCraftLMD += recipe.cost * neededAmount;

  for (const ingredient of recipe.costs) {
    const subItemId = ingredient.id;
    const subCountNeeded = ingredient.count * neededAmount;

    // Проверяем, есть ли ингредиент на складе
    const availableOnStock = userStock[subItemId] || 0;

    if (availableOnStock >= subCountNeeded) {
      // На складе хватает, «уменьшаем» виртуальный склад
      userStock[subItemId] -= subCountNeeded;
    } else {
      // На складе не хватает: берем все остатки и рекурсивно разлагаем недостающее
      const missingCount = subCountNeeded - availableOnStock;
      userStock[subItemId] = 0; 
      decomposeItem(subItemId, missingCount);
    }
  }
}
Выходные данные калькулятора:
    Чистый остаток к фарму: Сколько базовых компонентов (T1–T3, руда, чипы) нужно получить с этапов.
    Недостаток с учетом крафта: Итоговая подсвеченная подборка (красный цвет #EF4444 в UI).
    Суммарная стоимость крафта в LMD.

6. Синхронизация с аккаунтом (Модуль ArkPRTS / Token):
Реализуется как изоляционный клиентский модуль prtsSync.ts со строгим соблюдением безопасности:
    Пользовательский ввод: Пользователь вводит только OAuth Token / HG Token в настройках приложения. Пароли не запрашиваются.
    Только manual-trigger: Синхронизация выполняется исключительно при нажатии кнопки «Обновить данные аккаунта».
    Запрет фоновых интервалов (setInterval): Запрещено делать автоматические фоновые запросы по таймеру, чтобы избежать разрыва активной игровой сессии пользователя ("Account logged in elsewhere").

7. Пошаговая инструкция по разработке для ИИ-агента:
Передавай эти шаги ИИ-агенту последовательно:
    Шаг 1: Инициализация и БД.
        Создать проект Vite + Vue 3 + TS + Tailwind. Настроить Dexie.js со схемами inventory и plans.

    Шаг 2: Сервис загрузки игровых данных.
        Написать модуль gamedata.ts. Реализовать загрузку JSON с GitHub, их первичную очистку (удаление лишних текстовых описаний для экономии RAM) и сохранение структуры в Pinia.

    Шаг 3: Каталог оперативников и Редактор планов.
        Сделать UI выбора оперативников (vue-virtual-scroller). Реализовать модальное окно с ползунками уровня, переключателями элит (E0-E2) и кнопками выборки мастерств (M0-M3) и модулей.

    Шаг 4: Движок расчета (Calculator Engine).
        Написать логику calculatorEngine.ts по спецификации из Раздела 5 (формулы EXP/LMD + рекурсивное разложение рецептов мастерской).

    Шаг 5: Таблица склада и Подсветка дефицита.
        Сделать UI ввода имеющихся ресурсов с фильтрацией по тирам (T1-T5, Чипы, Книги). Связать данные со складом в IndexedDB и выводить итоговый дефицит с красной подсветкой.

    Шаг 6: Резервное копирование.
        Добавить импорт/экспорт всей IndexedDB базы в .json файл в один клик.

---

## 8. Модуль кросс-девайс синхронизации (Cross-Device Sync)

Чтобы синхронизировать склад и планы между ПК и мобильным устройством без поднятия собственного backend-сервера:

1. **PWA Поддержка (`vite-plugin-pwa`):**
   * Настроить `vite.config.ts` с плагином `VitePWA` для генерации Web App Manifest и Service Worker.
   * Приложение должно устанавливаться на рабочий стол/экран телефона и работать в офлайн-режиме.

2. **Облачная синхронизация конфига (GitHub Gist API / Google Drive):**
   * Создать сервис `syncService.ts`.
   * **GitHub Gist:** Пользователь указывает свой GitHub Personal Access Token в настройках. Приложение создаёт/обновляет приватный гист `ark_calc_user_data.json` с дампом IndexedDB.
   * При старте приложения на новом устройстве нажатие кнопки «Загрузить из облака» вытягивает актуальный `.json` и перезаписывает локальную IndexedDB.

---

## 9. Обновленный Шаг 1 в инструкции по разработке:
* **Шаг 1: Инициализация и PWA.**
  Создать проект Vite + Vue 3 + TS + Tailwind CSS + `vite-plugin-pwa`. Настроить `Dexie.js` со схемами `inventory` и `plans`. Добавить базовую манифест-конфигурацию для PWA (иконка, splash screen, offline caching).