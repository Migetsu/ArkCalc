# ⬡ ArkCalc // PRTS Tactical Command Terminal

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.6-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia](https://img.shields.io/badge/Pinia-4.0-FFD859?style=flat-square&logo=vuedotjs&logoColor=black)](https://pinia.vuejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Rhodes Island PRTS Tactical Terminal** — комплексный веб-сервис для игроков **Arknights**, объединяющий планировщик прокачки операторов с расчетом дельты материалов и рекомендациями оптимального фарма (Penguin Statistics), радар баннеров и калькулятор накопления круток (Gacha Spark Calculator), а также комбинаторный калькулятор открытого рекрутинга (Public Recruitment).

---

## 📑 Содержание

1. [Особенности и модули](#-особенности-и-модули)
2. [Технологический стек](#-технологический-стек)
3. [Структура проекта](#-структура-проекта)
4. [Локальная установка и запуск](#-локальная-установка-и-запуск)
5. [Переменные окружения](#-переменные-окружения)
6. [Тестирование и проверка качества](#-тестирование-и-проверка-качества)
7. [Деплой на Vercel](#-деплой-на-vercel)
8. [Архитектура данных и кэширования](#-архитектура-данных-и-кэширования)
9. [Дисклеймер](#-дисклеймер)

---

## ⚡ Особенности и модули

### 1. `PLN-01` — Планировщик прокачки и дельта материалов (`/planner`)
- **Конфигурация целей**: настройка рангов элиты (E0 $\rightarrow$ E2), диапазона уровней (Lvl 1 $\rightarrow$ 90), мастерства навыков (S3 M1–M3) и этапов модулей (Stages 1–3).
- **Расчет дельты инвентаря**: точное вычисление необходимого количества ресурсов за вычетом текущего склада игрока ($\max(0, \text{required} - \text{owned})$).
- **Penguin Statistics v2 Matrix Integration**: автоматический подбор наиболее эффективных стадий фарма на основе метрики **Sanity-to-Drop** (расход разума на один предмет) с отображением процента выпадения и альтернативных уровней.
- **IndexedDB локальный кэш**: хранение матриц выпадения (5 000+ записей) в браузере для моментальной загрузки без повторных сетевых запросов.

### 2. `GCH-02` — Радар баннеров и Spark-калькулятор (`/gacha`)
- **Таймлайн баннеров**: парсинг расписания с [Arknights Wiki.gg](https://arknights.wiki.gg/wiki/Headhunting/Banners/Upcoming) с адаптацией даты под Global сервер (офсет ~175 дней).
- **Живой обратный отсчет**: интерактивные PRTS-часы до начала или завершения активного хедхантинга.
- **Проекция ресурсов**: учет Orundum, Originite Prime (1 OP = 180 Orundum) и билетов (Single / 10-roll).
- **Модель доходов**: калькуляция ежедневных миссий, Monthly Card (+200/день), еженедельных заданий, аннигиляции (1 800/нед) и магазина зеленых сертификатов (600 Orundum + 4 билета/мес).
- **Гарант (Spark)**: трекинг прогресса до 300 круток (лимитированные баннеры) или 120 круток (коллаборации).

### 3. `RCR-03` — Калькулятор рекрутинга (`/recruitment`)
- **Комбинаторика 1–3 тегов**: алгоритмический перебор всех доступных комбинаций для слота рекрутинга.
- **Официальные правила Arknights**:
  - Строгая изоляция 6★ операторов (требуется тег `Top Operator`).
  - Гарантированные 5★ при наличии `Senior Operator`.
  - Роботы (1★) требуют тег `Robot`.
  - Отсеивание 1–2★ без тега `Starter`.
- **Сортировка по ценности гаранта**: комбинации ранжируются по приоритету: 6★ (600) $\rightarrow$ 5★ (500) $\rightarrow$ 4★ (400) $\rightarrow$ Robot (350) $\rightarrow$ 3★ (300).

### 4. `INV-04` — Склад и инвентарь (`/inventory`)
- Управление запасами материалов, чипов и валюты (LMD, EXP, Orundum, OP).
- Фильтрация по тирам (T1–T5) и категориям.

### 5. `SET-05` — Настройки терминала и синхронизация (`/settings`)
- **4 темы PRTS**: *Rhodes Dark* (классический темный с неоновым цианом), *Neon Cyberpunk*, *Originium Amber* и *PRTS Clean Slate*.
- **Синхронизация профиля**: сохранение настроек и склада в **Supabase** (PostgreSQL).
- **PRTS Account Gateway**: серверная интеграция на Python (`api/sync_arkprts.py`) через библиотеку `arkprts` для импорта склада и ростера прямо с игровых серверов Yostar.

### 6. `SYS-00` — PRTS Toasts & Loading Skeletons
- Плавающая глобальная очередь уведомлений с автозакрытием, прогресс-баром и паузой при наведении.
- Высокотехнологичные скелетоны загрузки (`AppSkeleton`, `OperatorCardSkeleton`, `FarmingTableSkeleton`, `BannerCardSkeleton`) с диагональной анимацией свечения.

---

## 🛠 Технологический стек

| Область | Технологии |
|---|---|
| **Фреймворк** | [Nuxt 4.6](https://nuxt.com/) (SSR / Node / Nitro Server Engine) |
| **Интерфейс** | [Vue 3.5](https://vuejs.org/) (Composition API, `<script setup>`), [Vite 8](https://vitejs.dev/) |
| **Стилизация** | SCSS / SASS (PRTS Dark Industrial Design System, Flexbox/Grid, CSS Variables) |
| **Стейт-менеджмент** | [Pinia 4](https://pinia.vuejs.org/) + `pinia-plugin-persistedstate` (LocalStorage) |
| **Локальная БД** | IndexedDB API (`utils/indexedDb.ts`) для кэширования матриц Penguin Stats |
| **Облачная БД** | [Supabase](https://supabase.com/) (`@nuxtjs/supabase`, PostgreSQL, Row-Level Security) |
| **Serverless** | Vercel Serverless Functions ([Python 3](https://docs.python.org/3/) `api/sync_arkprts.py`) |
| **Тестирование** | [Vitest 5.0](https://vitest.dev/) (38 unit-тестов), `vue-tsc` (TypeScript 5.9 strict) |
| **Хостинг / CI-CD** | [Vercel](https://vercel.com/) (Preset: `vercel` в Nitro) |

---

## 📁 Структура проекта

```text
ArkCalc/
├── api/                           # Vercel Serverless Functions
│   ├── sync_arkprts.py            # Python-шлюз синхронизации аккаунта через arkprts
│   └── requirements.txt           # Python-зависимости (arkprts)
├── assets/
│   ├── data/                      # Локальные фоллбэки (операторы, баннеры, материалы)
│   └── scss/                      # SCSS дизайн-система PRTS (_variables.scss, main.scss)
├── components/                    # Vue компоненты
│   ├── ui/                        # Скелетоны загрузки (AppSkeleton, OperatorCardSkeleton и др.)
│   ├── AccountSyncModal.vue       # Модальное окно авторизации и синхронизации PRTS
│   ├── AppToastContainer.vue      # Глобальный плавающий контейнер тостов
│   ├── BannerTimeline.vue         # Интерактивный таймлайн баннеров
│   ├── GachaCalculator.vue        # Калькулятор накопления круток
│   └── RecruitmentCalculator.vue  # Калькулятор открытого рекрутинга
├── composables/                   # Nuxt Composable-функции
│   ├── usePenguinStats.ts         # Доступ к Penguin Statistics Store
│   └── useToast.ts                # Глобальный фасад всплывающих уведомлений
├── pages/                         # Маршруты страниц (Nuxt Pages)
│   ├── index.vue                  # Главная страница Tactical Dashboard
│   ├── planner.vue                # Модуль PLN-01: Планировщик прокачки и дельта материалов
│   ├── gacha.vue                  # Модуль GCH-02: Калькулятор круток и таймлайн
│   ├── recruitment.vue            # Модуль RCR-03: Калькулятор рекрутинга
│   ├── inventory.vue              # Модуль INV-04: Инвентарь и склад
│   └── settings.vue               # Модуль SET-05: Настройки терминала и синхронизация
├── server/
│   └── api/                       # Серверные маршруты Nitro
│       ├── banners.get.ts         # API парсинга и кэширования баннеров с wiki.gg
│       ├── operators.get.ts       # API операторов
│       ├── penguin/matrix.get.ts  # Проксирование матрицы Penguin Stats
│       └── sync_arkprts.post.ts   # Шлюз вызова Python-функции синхронизации
├── stores/                        # Pinia хранилища
│   ├── operatorStore.ts           # База операторов
│   ├── penguinStore.ts            # Кэш матрицы Penguin Stats (IDB + Memory)
│   ├── plannerStore.ts            # Активные цели прокачки
│   └── userStore.ts               # Профиль доктора, склад, настройки
├── tests/
│   └── unit/                      # Юнит-тесты на Vitest
│       ├── gachaCalculator.spec.ts        # Тесты формулы накопления круток
│       ├── materialCalculator.spec.ts     # Тесты дельты материалов и затрат
│       └── recruitmentCalculator.spec.ts  # Тесты комбинаторики и правил рекрутинга
├── types/                         # TypeScript интерфейсы и типы
├── utils/                         # Чистые расчетные утилиты
│   ├── gachaCalculator.ts         # Расчет доходов и спарка
│   ├── indexedDb.ts               # Утилита IndexedDB кэша
│   ├── materialCalculator.ts      # Агрегация затрат и вычисление дельты
│   └── recruitmentCalculator.ts   # Алгоритм подмножеств и фильтрация тегов
├── nuxt.config.ts                 # Конфигурация Nuxt 4
├── package.json                   # Зависимости и скрипты
├── vercel.json                    # Конфигурация деплоя на Vercel
└── vitest.config.ts               # Конфигурация Vitest
```

---

## 🚀 Локальная установка и запуск

### Требования
- **Node.js**: `v20.0.0` или выше
- **npm** (или **pnpm** / **yarn**)
- **Python**: `3.9+` (опционально, требуется только для локального тестирования `api/sync_arkprts.py`)

### 1. Клонирование репозитория
```bash
git clone https://github.com/Migetsu/ArkCalc.git
cd ArkCalc
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта (см. [Переменные окружения](#-переменные-окружения)):
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```
Приложение будет доступно по адресу: **`http://localhost:3000`**

### 5. Сборка для продакшна
```bash
npm run build
npm run preview
```

---

## 🔑 Переменные окружения

| Переменная | Описание | Обязательно |
|---|---|:---:|
| `SUPABASE_URL` | URL инстанса Supabase | Да (для синхронизации профиля) |
| `SUPABASE_KEY` | Публичный анонимный API ключ Supabase (anon key) | Да (для синхронизации профиля) |
| `VERCEL` | Флаг окружения Vercel (выставляется Vercel автоматически) | Опционально |

> *Примечание: Если переменные Supabase не заданы, приложение автоматически переключается в локальный режим работы через LocalStorage и IndexedDB, обеспечивая полную автономность без облачного бэкенда.*

---

## 🧪 Тестирование и проверка качества

В проекте настроен полный цикл контроля качества кода:

```bash
# Запуск всех юнит-тестов (Vitest)
npm run test

# Запуск тестов в режиме отслеживания изменений (Watch mode)
npm run test:watch

# Проверка статической типизации TypeScript (vue-tsc)
npx vue-tsc --noEmit

# Продакшн-сборка Nuxt 4
npm run build
```

### Покрытие тестами:
- **`materialCalculator.spec.ts`**: тестирование агрегации затрат E1/E2, уровней, навыков, модулей, дельты со складом и фильтров.
- **`gachaCalculator.spec.ts`**: тестирование таймеров, F2P доходов, Monthly Card, аннигиляции, конвертации OP и расчетов гаранта.
- **`recruitmentCalculator.spec.ts`**: тестирование генерации подмножеств, правил для 6★/5★/1★/2★ и алгоритма приоритизации гарантов.

---

## 🌐 Деплой на Vercel

Проект оптимизирован для работы на платформе **Vercel** с использованием гибридного SSR Nitro сервера и Python Serverless функций.

### Способ 1: Подключение через GitHub (Рекомендуется)
1. Сделайте форк или запушьте проект в ваш репозиторий GitHub.
2. Перейдите в [Vercel Dashboard](https://vercel.com/new) и нажмите **Import Project**.
3. Выберите репозиторий `ArkCalc`.
4. Vercel автоматически определит настройки из `vercel.json`:
   - **Framework Preset**: `Nuxt.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
5. В разделе **Environment Variables** добавьте:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
6. Нажмите **Deploy**.

### Способ 2: Деплой через Vercel CLI
```bash
# Установка Vercel CLI
npm install -g vercel

# Логин и деплой
vercel

# Деплой в продакшн
vercel --prod
```

### Поддержка Serverless Python (`api/sync_arkprts.py`)
Vercel автоматически определяет файлы в директории `api/` с расширением `.py` и устанавливает зависимости из `api/requirements.txt`, поднимая изолированный Serverless рантайм для синхронизации аккаунтов.

---

## 💾 Архитектура данных и кэширования

```
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
├──────────────────────────┬─────────────────────────────┤
│      Pinia Stores        │       Client Storage        │
│  (user, planner, ops)    │                             │
│           │              │  ┌───────────────────────┐  │
│           ▼              │  │      IndexedDB        │  │
│    LocalStorage          │  │ (Penguin Stats Matrix │  │
│  (Preferences, Targets)  │  │ & Operator Blueprints)│  │
│                          │  └───────────────────────┘  │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│     Cloud Datastore      │ │       External APIs       │
│  Supabase (PostgreSQL)   │ │  - Penguin Statistics v2  │
│  (Sync Profile & Depot)  │ │  - Arknights Wiki.gg      │
└──────────────────────────┘ └───────────────────────────┘
```

1. **Многоуровневый кэш**: тяжелые матричные данные Penguin Stats кэшируются в IndexedDB (`arkcalc_cache_db`), что снижает объем трафика на 98% при повторных заходах.
2. **Сериализация прокси**: для совместимости реактивных объектов Vue 3 с `structuredClone` браузера используется глубокая очистка метаданных (`toSerializable`).
3. **Безотказность (Graceful Degradation)**: при отсутствии сети или сбое внешних API приложение использует встроенные резервные наборы данных (`assets/data/`).

---

## 📄 Дисклеймер

**ArkCalc** — некоммерческий фанатский проект. Все права на интеллектуальную собственность, иллюстрации, звуки, имена персонажей и логотипы принадлежат **HYPERGRYPH Network Technology Co., Ltd.**, **Yostar Limited** и их соответствующим правообладателям.

---

<p align="center">
  <b>RHODES ISLAND PHARMACEUTICAL SERVICES // PRTS TACTICAL SYSTEM</b><br>
  <i>Designed for Doctors of Terra</i>
</p>
