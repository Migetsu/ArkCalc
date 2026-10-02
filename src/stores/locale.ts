// src/stores/locale.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';

export type AppLanguage = 'en' | 'ru' | 'cn';

const STORAGE_KEY = 'ark_app_language';

const TRANSLATIONS = {
  en: {
    // Navigation
    'nav.operators': 'Operators',
    'nav.roster': 'My Roster',
    'nav.inventory': 'Depot',
    'nav.calculator': 'Calculator',
    'nav.events': 'Events & Timeline',
    'nav.recruitment': 'Recruitment',
    'nav.wiki': 'Wiki & Archive',
    'nav.tools': 'Tools & Archive',
    'nav.toolsDesc': 'Roster, Recruitment, Wiki',
    'nav.rosterDesc': 'Track operator masteries & levels',
    'nav.recruitmentDesc': 'Tag combination solver & guarantees',
    'nav.wikiDesc': 'Operator database, voices & skins',
    'nav.settings': 'Settings',
    'nav.cloudSync': 'Cloud Sync',
    'nav.subtitle': 'Arknights Offline Planner & Material Engine',

    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.ready': 'Ready',
    'common.deficit': 'Deficit',
    'common.inStock': 'In Stock',
    'common.needed': 'Needed',
    'common.remaining': 'Remaining',
    'common.total': 'Total',
    'common.progress': 'Progress',
    'common.details': 'Details',
    'common.view': 'View',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.confirm': 'Confirm',

    // Calculator / Summary
    'calc.totalLmd': 'Total LMD',
    'calc.totalExp': 'Total EXP',
    'calc.materials': 'Materials',
    'calc.sanityEstimate': 'Sanity Estimate',
    'calc.accumulated': 'Accumulated',
    'calc.accordingToPlans': 'According to plans',
    'calc.leftToFarm': 'Left to farm',
    'calc.levels': 'Levels',
    'calc.elite': 'Elite',
    'calc.craft': 'Crafting',
    'calc.tabDirect': 'Direct Deficit',
    'calc.tabFarm': 'Farming Plan',
    'calc.tabCraftingTree': 'Crafting Tree',
    'calc.primaryResources': 'Primary Resources (LMD & EXP)',
    'calc.balanceAndRemaining': 'Depot balance vs. target plan requirements',
    'calc.lmdTitle': 'Lungmen Dollars (LMD)',
    'calc.expTitle': 'Battle Records (EXP)',
    'calc.upgradeMaterials': 'Upgrade Materials',
    'calc.allCollected': 'Plans not configured or all resources collected!',
    'calc.allCollectedHint': 'Add operators in the "Operators" tab to calculate materials.',
    'calc.baseIncomeTitle': 'RIIC Base Passive Income',
    'calc.baseIncomeHint': 'Base generates ~50k LMD & ~40k EXP daily without spending Sanity',
    'calc.eventShopDeduction': 'Deduct Active Event Shop Supplies',
    'calc.eventShopDeductionHint': 'Subtracted available event store supplies from your calculated deficit',
    'calc.eventShopActive': 'Active Event Shop Applied',
    'calc.sanitySaved': 'Sanity saved',

    // Events
    'events.title': 'Arknights Events & Global Schedule',
    'events.subtitle': 'Current CN events, 6-month retrospective, and upcoming EN releases',
    'events.tabCn': 'CN Server (Current & Upcoming for Global)',
    'events.tabGlobal': 'Global / EN Server Timeline',
    'events.activeNow': 'Active Now on CN',
    'events.comingSoon': 'Coming Soon to Global',
    'events.past6m': 'Past Event (~6 Months)',
    'events.featuredOps': 'Featured Operators',
    'events.eventShop': 'Event Shop Supplies',
    'events.farmingStages': 'Optimal Farming Stages',
    'events.applyToCalc': 'Apply Shop Supplies to Calculator',
    'events.appliedToCalc': 'Shop Supplies Applied to Calculator',
    'events.dropRate': 'Drop Rate',
    'events.apCost': 'Cost',
    'events.sanityPerDrop': 'Sanity / Drop',
    'events.typeSideStory': 'Side Story',
    'events.typeCelebration': 'Anniversary / Celebration',
    'events.typeRerun': 'Rerun',
    'events.typeStoryCollection': 'Story Collection',
    'events.cnDates': 'CN Dates',
    'events.globalEstimated': 'Global Arrival',
    'events.viewDetails': 'View Event Details, Shop & Farm',
    'events.defaultPrompt6': 'Featured 6★ Operators on this banner:',
    'events.defaultPrompt5': 'Featured 5★ Operators on this banner:',

    // Settings
    'settings.title': 'Settings & Sync',
    'settings.languageTitle': 'Interface & Game Data Language',
    'settings.languageHint': 'Select default language for website UI and material translations',
    'settings.yostarSyncTitle': 'Arknights Account 1-Click Sync',
    'settings.yostarSyncHint': 'Direct synchronization with your official game account (inventory & characters)',
    'settings.getCode': 'Get Verification Code',
    'settings.linkAndSync': 'Link & Sync',
    'settings.fastSync': '1-Click Update Data',
    'settings.accountLinked': 'Account Linked',
    'settings.manualImport': 'Manual Import (ArkPRTS / JSON)',
    'settings.exportData': 'Export Backup',
    'settings.clearAll': 'Clear Local Data',
  },
  ru: {
    // Navigation
    'nav.operators': 'Оперативники',
    'nav.roster': 'Мой ростер',
    'nav.inventory': 'Склад',
    'nav.calculator': 'Калькулятор',
    'nav.events': 'События и таймлайн',
    'nav.recruitment': 'Рекрутинг',
    'nav.wiki': 'База знаний',
    'nav.tools': 'База и Утилиты',
    'nav.toolsDesc': 'Ростер, рекрутинг и вики',
    'nav.rosterDesc': 'Уровни, навыки и модули',
    'nav.recruitmentDesc': 'Подбор тегов и гарантированные 4-6★',
    'nav.wikiDesc': 'Архив оперативников, озвучка и скины',
    'nav.settings': 'Настройки',
    'nav.cloudSync': 'Синхронизация',
    'nav.subtitle': 'Офлайн-калькулятор и планировщик ресурсов Arknights',

    // Common
    'common.close': 'Закрыть',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.search': 'Поиск...',
    'common.filter': 'Фильтр',
    'common.all': 'Все',
    'common.loading': 'Загрузка...',
    'common.success': 'Успешно',
    'common.error': 'Ошибка',
    'common.ready': 'Готово',
    'common.deficit': 'Дефицит',
    'common.inStock': 'На складе',
    'common.needed': 'Нужно',
    'common.remaining': 'Осталось',
    'common.total': 'Всего',
    'common.progress': 'Прогресс',
    'common.details': 'Подробнее',
    'common.view': 'Просмотр',
    'common.apply': 'Применить',
    'common.clear': 'Очистить',
    'common.confirm': 'Подтвердить',

    // Calculator / Summary
    'calc.totalLmd': 'Всего LMD',
    'calc.totalExp': 'Всего EXP',
    'calc.materials': 'Материалы',
    'calc.sanityEstimate': 'Оценка Sanity',
    'calc.accumulated': 'Накоплено',
    'calc.accordingToPlans': 'По планам',
    'calc.leftToFarm': 'Осталось накопить',
    'calc.levels': 'Уровни',
    'calc.elite': 'Элита',
    'calc.craft': 'Крафт',
    'calc.tabDirect': 'Прямой дефицит',
    'calc.tabFarm': 'План фарма карт',
    'calc.tabCraftingTree': 'Дерево крафта',
    'calc.primaryResources': 'Основные ресурсы (LMD и опыт)',
    'calc.balanceAndRemaining': 'Баланс склада и остаток по планам',
    'calc.lmdTitle': 'LMD (Юани Лунмэня)',
    'calc.expTitle': 'Боевые записи (EXP)',
    'calc.upgradeMaterials': 'Материалы улучшения',
    'calc.allCollected': 'Планы не настроены или все ресурсы собраны!',
    'calc.allCollectedHint': 'Добавьте оперативников во вкладке «Оперативники» для расчета необходимых ресурсов.',
    'calc.baseIncomeTitle': 'Пассивный доход базы (RIIC)',
    'calc.baseIncomeHint': 'База приносит ~50k LMD и ~40k EXP в день без траты Sanity',
    'calc.eventShopDeduction': 'Учесть товары магазина активного ивента',
    'calc.eventShopDeductionHint': 'Вычитает ресурсы из магазина ивента из дефицита планов',
    'calc.eventShopActive': 'Магазин ивента учтен',
    'calc.sanitySaved': 'Сэкономлено Sanity',

    // Events
    'events.title': 'События Arknights и расписание серверов',
    'events.subtitle': 'Текущие ивенты CN, хроника за полгода и грядущие релизы на Global (EN)',
    'events.tabCn': 'Сервер CN (Текущие и новинки для Global)',
    'events.tabGlobal': 'Хронология Global / EN сервера',
    'events.activeNow': 'Идет на CN прямо сейчас',
    'events.comingSoon': 'Скоро на Global сервере',
    'events.past6m': 'Прошедший ивент (~6 месяцев)',
    'events.featuredOps': 'Ключевые оперативники',
    'events.eventShop': 'Товары ивентового магазина',
    'events.farmingStages': 'Лучшие карты для фарма',
    'events.applyToCalc': 'Учесть товары магазина в калькуляторе',
    'events.appliedToCalc': 'Магазин применен в калькуляторе',
    'events.dropRate': 'Шанс дропа',
    'events.apCost': 'Заход',
    'events.sanityPerDrop': 'Sanity / дроп',
    'events.typeSideStory': 'Side Story',
    'events.typeCelebration': 'Годовщина / Праздник',
    'events.typeRerun': 'Реран',
    'events.typeStoryCollection': 'Коллекция историй',
    'events.cnDates': 'Даты на CN',
    'events.globalEstimated': 'Ожидается на Global',
    'events.viewDetails': 'Подробности ивента, магазин и фарм',
    'events.defaultPrompt6': 'Ключевые 6★ Оперативники в данном баннере:',
    'events.defaultPrompt5': 'Ключевые 5★ Оперативники в данном баннере:',

    // Settings
    'settings.title': 'Настройки и синхронизация',
    'settings.languageTitle': 'Язык интерфейса и данных игры',
    'settings.languageHint': 'Выберите основной язык для интерфейса сайта и названий материалов',
    'settings.yostarSyncTitle': 'Синхронизация с аккаунтом Arknights в 1 клик',
    'settings.yostarSyncHint': 'Прямое подключение к официальному серверу игры (инвентарь и ростер)',
    'settings.getCode': 'Получить код',
    'settings.linkAndSync': 'Подключить и синхронизировать',
    'settings.fastSync': 'Обновить данные в 1 клик',
    'settings.accountLinked': 'Аккаунт привязан',
    'settings.manualImport': 'Ручной импорт (ArkPRTS / JSON)',
    'settings.exportData': 'Экспорт резервной копии',
    'settings.clearAll': 'Очистить локальные данные',
  },
  cn: {
    // Navigation
    'nav.operators': '干员规划',
    'nav.roster': '我的干员',
    'nav.inventory': '仓库库存',
    'nav.calculator': '材料计算',
    'nav.events': '活动排期',
    'nav.recruitment': '公开招募',
    'nav.wiki': '档案图鉴',
    'nav.tools': '档案与工具',
    'nav.toolsDesc': '干员练度、公开招募与资料',
    'nav.rosterDesc': '已拥有干员与养成进度',
    'nav.recruitmentDesc': '公招组合与保底计算',
    'nav.wikiDesc': '干员档案、语音与立绘',
    'nav.settings': '系统设置',
    'nav.cloudSync': '云端同步',
    'nav.subtitle': '明日方舟离线规划与材料计算引擎',

    // Common
    'common.close': '关闭',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.search': '搜索...',
    'common.filter': '筛选',
    'common.all': '全部',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',
    'common.ready': '已就绪',
    'common.deficit': '缺口',
    'common.inStock': '已有库存',
    'common.needed': '总需求',
    'common.remaining': '尚缺',
    'common.total': '总计',
    'common.progress': '进度',
    'common.details': '详情',
    'common.view': '查看',
    'common.apply': '应用',
    'common.clear': '清除',
    'common.confirm': '确认',

    // Calculator / Summary
    'calc.totalLmd': '龙门币总需',
    'calc.totalExp': '经验总需',
    'calc.materials': '养成材料',
    'calc.sanityEstimate': '理智消耗估算',
    'calc.accumulated': '现有积累',
    'calc.accordingToPlans': '规划目标总计',
    'calc.leftToFarm': '仍需获取',
    'calc.levels': '等级提升',
    'calc.elite': '精英化',
    'calc.craft': '工坊合成',
    'calc.tabDirect': '直接缺口',
    'calc.tabFarm': '关卡刷取规划',
    'calc.tabCraftingTree': '合成树展开',
    'calc.primaryResources': '核心资源（龙门币与作战记录）',
    'calc.balanceAndRemaining': '库存结余与规划目标比对',
    'calc.lmdTitle': '龙门币 (LMD)',
    'calc.expTitle': '作战记录 (EXP)',
    'calc.upgradeMaterials': '升级材料',
    'calc.allCollected': '当前无规划或所有材料已备齐！',
    'calc.allCollectedHint': '请在“干员规划”页面添加培养计划以计算材料。',
    'calc.baseIncomeTitle': '基建每日被动产出',
    'calc.baseIncomeHint': '基建每日无理智产出约 5万 龙门币与 4万 经验',
    'calc.eventShopDeduction': '计入当前活动商店库存',
    'calc.eventShopDeductionHint': '自动从缺口中扣除活动商店可兑换的物资',
    'calc.eventShopActive': '已应用活动商店兑换',
    'calc.sanitySaved': '已节省理智',

    // Events
    'events.title': '明日方舟活动与排期一览',
    'events.subtitle': 'CN服当前活动、近半年活动回顾及国际服未来排期',
    'events.tabCn': '国服 (CN) 当前与未来国际服预览',
    'events.tabGlobal': '国际服 (Global) 排期时间线',
    'events.activeNow': '国服进行中',
    'events.comingSoon': '即将上线国际服',
    'events.past6m': '近6个月内往期活动',
    'events.featuredOps': '重点干员',
    'events.eventShop': '活动商店兑换物',
    'events.farmingStages': '推荐刷取关卡',
    'events.applyToCalc': '将活动兑换计入计算器',
    'events.appliedToCalc': '活动物资已计入计算器',
    'events.dropRate': '掉落率',
    'events.apCost': '理智消耗',
    'events.sanityPerDrop': '理智/掉落',
    'events.typeSideStory': 'Side Story',
    'events.typeCelebration': '周年庆典',
    'events.typeRerun': '活动复刻',
    'events.typeStoryCollection': '故事集',
    'events.cnDates': '国服开放时间',
    'events.globalEstimated': '国际服预计时间',
    'events.viewDetails': '查看活动详情、商店与掉落',
    'events.defaultPrompt6': '本期卡池UP六星干员：',
    'events.defaultPrompt5': '本期卡池UP五星干员：',

    // Settings
    'settings.title': '系统设置与数据同步',
    'settings.languageTitle': '界面与游戏数据语言',
    'settings.languageHint': '选择网站界面和材料翻译的默认语言',
    'settings.yostarSyncTitle': '游戏账号一键直连同步',
    'settings.yostarSyncHint': '直接同步游戏服务器上的仓库库存与干员练度',
    'settings.getCode': '获取验证码',
    'settings.linkAndSync': '验证并同步',
    'settings.fastSync': '一键更新数据',
    'settings.accountLinked': '已绑定账号',
    'settings.manualImport': '手动导入 (ArkPRTS / JSON)',
    'settings.exportData': '导出备份文件',
    'settings.clearAll': '清空本地数据',
  },
};

export const useLocaleStore = defineStore('locale', () => {
  function getInitialLang(): AppLanguage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ru' || stored === 'cn') {
        return stored;
      }
    } catch {
      // ignore
    }
    // Default is strictly English per user request!
    return 'en';
  }

  const currentLang = ref<AppLanguage>(getInitialLang());

  function setLanguage(lang: AppLanguage) {
    currentLang.value = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem('ark_item_language', lang);
    } catch {
      // ignore
    }
  }

  function t(key: string): string {
    const dict = TRANSLATIONS[currentLang.value] || TRANSLATIONS.en;
    return (dict as any)[key] || (TRANSLATIONS.en as any)[key] || key;
  }

  return {
    currentLang,
    setLanguage,
    t,
  };
});
