// src/data/eventsData.ts

export interface EventShopItem {
  itemId: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  count: number;
  costPerItem: number;
  tokenType: string;
}

export interface EventFarmingStage {
  stageCode: string;
  itemId: string;
  itemNameEn: string;
  itemNameRu: string;
  dropRatePercent: number;
  apCost: number;
  sanityPerItem: number;
}

export interface EventOperatorAvatar {
  charId: string;
  name: string;
  rarity: 5 | 6;
  role?: 'limited' | 'standard' | 'welfare';
  avatarUrl?: string;
}

export interface ArknightsEvent {
  id: string;
  nameEn: string;
  nameRu: string;
  nameCn: string;
  headerTagEn: string;
  headerTagRu: string;
  headerTagCn: string;
  type: 'side_story' | 'story_collection' | 'intermezzi' | 'rerun' | 'cc' | 'trials' | 'celebration' | 'headhunting';
  status: 'cn_active' | 'upcoming_global' | 'global_active' | 'past_cn_6m';
  bannerPosterUrl: string;
  cnStartDate: string;
  cnEndDate: string;
  globalStartDate?: string;
  globalEndDate?: string;
  globalEstimatedArrival?: string;
  prompt6En?: string;
  prompt6Ru?: string;
  prompt6Cn?: string;
  sixStarOps: EventOperatorAvatar[];
  prompt5En?: string;
  prompt5Ru?: string;
  prompt5Cn?: string;
  fiveStarOps: EventOperatorAvatar[];
  shopItems: EventShopItem[];
  farmingStages: EventFarmingStage[];
  summaryEn: string;
  summaryRu: string;
  summaryCn: string;
}

export const ARKNIGHTS_EVENTS: ArknightsEvent[] = [
  {
    "id": "banner_orienteering_8",
    "nameEn": "Orienteering #8 (Directional Selection)",
    "nameRu": "Orienteering #8 (Выборочный хедхантинг)",
    "nameCn": "定向甄选 #8",
    "headerTagEn": "[Standard Headhunting] Orienteering #8",
    "headerTagRu": "[Стандартный Хедхантинг] Orienteering #8",
    "headerTagCn": "[常驻定向甄选] 第八期",
    "type": "headhunting",
    "status": "cn_active",
    "bannerPosterUrl": "/banners/banner_orienteering_8.png",
    "cnStartDate": "2026/09/29",
    "cnEndDate": "2026/10/13",
    "globalEstimatedArrival": "2027/03",
    "prompt6En": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Ru": "Выберите трёх из следующих 6★ Оперативников: только они будут выпадать среди 6★ в данном баннере.",
    "prompt6Cn": "可选定3名六星干员概率提升；此卡池仅会出现选定的六星干员。",
    "sixStarOps": [
      {
        "charId": "char_4087_ines",
        "name": "Ines",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ines.png"
      },
      {
        "charId": "char_1034_ulpian",
        "name": "Ulpianus",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ulpianus.png"
      },
      {
        "charId": "char_2012_typhon",
        "name": "Typhon",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_typhon.png"
      },
      {
        "charId": "char_1032_excu2",
        "name": "Executor the Ex Foedere",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_executor_the_ex_foedere.png"
      },
      {
        "charId": "char_4098_vvana",
        "name": "Viviana",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_viviana.png"
      },
      {
        "charId": "char_4116_blkkgt",
        "name": "Degenbrecher",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_degenbrecher.png"
      }
    ],
    "prompt5En": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Ru": "Выберите трёх из следующих 5★ Оперативников: у них будет 60% шанс выпадения среди 5★.",
    "prompt5Cn": "可选定3名五星干员概率提升；在抽到五星干员时有60%概率为选定干员。",
    "fiveStarOps": [
      {
        "charId": "char_4015_spuria",
        "name": "Spuria",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_spuria.png"
      },
      {
        "charId": "char_4105_almond",
        "name": "Almond",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_almond.png"
      },
      {
        "charId": "char_4102_threye",
        "name": "Valarqvin",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_valarqvin.png"
      },
      {
        "charId": "char_494_vendla",
        "name": "Vendela",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_vendela.png"
      },
      {
        "charId": "char_464_cement",
        "name": "Cement",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_cement.png"
      },
      {
        "charId": "char_4109_baslin",
        "name": "Bassline",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_bassline.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 300000,
        "costPerItem": 1,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "2004",
        "nameEn": "Strategic Battle Record",
        "nameRu": "Стратегическая запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 80,
        "costPerItem": 5,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "30073",
        "nameEn": "Sugar Pack",
        "nameRu": "Пачка сахара",
        "nameCn": "糖组",
        "count": 15,
        "costPerItem": 15,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "30083",
        "nameEn": "Polyester Pack",
        "nameRu": "Полиэстеровый набор",
        "nameCn": "聚酯组",
        "count": 15,
        "costPerItem": 15,
        "tokenType": "headhunt_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "CE-6",
        "itemId": "4001",
        "itemNameEn": "LMD",
        "itemNameRu": "LMD",
        "dropRatePercent": 100,
        "apCost": 36,
        "sanityPerItem": 0.0036
      },
      {
        "stageCode": "LS-6",
        "itemId": "2004",
        "itemNameEn": "Battle Record",
        "itemNameRu": "Опыт",
        "dropRatePercent": 100,
        "apCost": 36,
        "sanityPerItem": 3.6
      }
    ],
    "summaryEn": "Directional Selection banner currently active on CN server. Allows players to choose 3 rate-up 6★ and 3 rate-up 5★ operators.",
    "summaryRu": "Актуальный выборочный хедхантинг на CN сервере. Позволяет выбрать 3 желаемых 6★ и 3 5★ оперативника с гарантированным шансом выпадения.",
    "summaryCn": "国服当前正在进行的定向甄选活动。可自选3名6星与3名5星干员进行概率提升。"
  },
  {
    "id": "banner_p3r_crossover",
    "nameEn": "Some Evening of White and Mystic Blue",
    "nameRu": "Some Evening of White and Mystic Blue (Коллаб Persona 3)",
    "nameCn": "白与幽蓝的夜 (女神异闻录3联动)",
    "headerTagEn": "[Limited Headhunting - Crossover] Some Evening of White and Mystic Blue",
    "headerTagRu": "[Лимитированный Хедхантинг - Коллаборация] Some Evening of White and Mystic Blue",
    "headerTagCn": "[限定寻访 · 联动] 白与幽蓝的夜",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_crossover_some_evening_of_white_and_mystic_blue.png",
    "cnStartDate": "2026/09/04",
    "cnEndDate": "2026/09/18",
    "globalEstimatedArrival": "2027/02",
    "sixStarOps": [
      {
        "charId": "char_makoto_yuki",
        "name": "Makoto Yuki",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_makoto_yuki.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_yukari_takeba",
        "name": "Yukari Takeba",
        "rarity": 5,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_yukari_takeba.png"
      },
      {
        "charId": "char_aegis",
        "name": "Aegis",
        "rarity": 5,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_aegis.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 500000,
        "costPerItem": 1,
        "tokenType": "crossover_token"
      },
      {
        "itemId": "2004",
        "nameEn": "Strategic Battle Record",
        "nameRu": "Стратегическая запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 120,
        "costPerItem": 4,
        "tokenType": "crossover_token"
      },
      {
        "itemId": "30093",
        "nameEn": "Loxic Kohl",
        "nameRu": "Локсиковый коль",
        "nameCn": "轻锰矿",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "crossover_token"
      },
      {
        "itemId": "30013",
        "nameEn": "Orirock Cluster",
        "nameRu": "Кластер орирока",
        "nameCn": "固源岩组",
        "count": 25,
        "costPerItem": 10,
        "tokenType": "crossover_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "P3-8",
        "itemId": "30093",
        "itemNameEn": "Loxic Kohl",
        "itemNameRu": "Локсиковый коль",
        "dropRatePercent": 78.5,
        "apCost": 21,
        "sanityPerItem": 26.7
      },
      {
        "stageCode": "P3-7",
        "itemId": "30013",
        "itemNameEn": "Orirock Cluster",
        "itemNameRu": "Кластер орирока",
        "dropRatePercent": 82.1,
        "apCost": 18,
        "sanityPerItem": 21.9
      }
    ],
    "summaryEn": "Exclusive limited crossover banner featuring Persona 3 Reload protagonist Makoto Yuki, Yukari Takeba, and Aegis.",
    "summaryRu": "Эксклюзивная лимитированная коллаборация с Persona 3 Reload: Макото Юки, Юкари Такэба и Айгис.",
    "summaryCn": "女神异闻录3重制版联动限定寻访，结城理、岳羽由加莉与埃癸斯登场。"
  },
  {
    "id": "banner_joint_operation_23",
    "nameEn": "Joint Operation #23",
    "nameRu": "Joint Operation #23 (Совместная операция)",
    "nameCn": "联合行动 #23",
    "headerTagEn": "[Standard Headhunting] Joint Operation #23",
    "headerTagRu": "[Стандартный Хедхантинг] Joint Operation #23",
    "headerTagCn": "[常驻标准寻访] 联合行动 #23",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_joint_operation_23.png",
    "cnStartDate": "2026/08/18",
    "cnEndDate": "2026/09/01",
    "globalEstimatedArrival": "2027/01",
    "prompt6En": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Ru": "Только следующие 6★ и 5★ Оперативники могут выпасть в данном баннере.",
    "prompt6Cn": "在本次寻访中出现的六星及五星干员仅限以下干员。",
    "sixStarOps": [
      {
        "charId": "char_chen_dawnstreak",
        "name": "Ch'en the Dawnstreak",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ch_en_the_dawnstreak.png"
      },
      {
        "charId": "char_haruka",
        "name": "Haruka",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_haruka.png"
      },
      {
        "charId": "char_necrass",
        "name": "Necrass",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_necrass.png"
      },
      {
        "charId": "char_vulpisfoglia",
        "name": "Vulpisfoglia",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_vulpisfoglia.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_ukusik",
        "name": "Ukusik",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ukusik.png"
      },
      {
        "charId": "char_poncirus",
        "name": "Poncirus",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_poncirus.png"
      },
      {
        "charId": "char_nowell",
        "name": "Nowell",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_nowell.png"
      },
      {
        "charId": "char_grain_buds",
        "name": "Grain Buds",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_grain_buds.png"
      },
      {
        "charId": "char_almond",
        "name": "Almond",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_almond.png"
      },
      {
        "charId": "char_figurino",
        "name": "Figurino",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_figurino.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 200000,
        "costPerItem": 1,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "30063",
        "nameEn": "Manganese Ore",
        "nameRu": "Марганцевая руда",
        "nameCn": "锰矿",
        "count": 15,
        "costPerItem": 15,
        "tokenType": "headhunt_token"
      }
    ],
    "farmingStages": [],
    "summaryEn": "Joint Operation #23 curated pool featuring exclusively the specified 4 six-star and 6 five-star operators.",
    "summaryRu": "Баннер Joint Operation #23 с пулом, ограниченным строго четырьмя 6★ и шестью 5★ оперативниками.",
    "summaryCn": "联合行动第二十三期，卡池内仅包含指定的4位六星与6位五星干员。"
  },
  {
    "id": "banner_trails_end_winds_rest",
    "nameEn": "Trails End Winds Rest (Sargon Summer Carnival)",
    "nameRu": "Trails End Winds Rest (Летний карнавал Саргона)",
    "nameCn": "行止风歇 (夏日嘉年华)",
    "headerTagEn": "[Limited Headhunting - Carnival] Trails End Winds Rest",
    "headerTagRu": "[Лимитированный Хедхантинг - Карнавал] Trails End Winds Rest",
    "headerTagCn": "[限定寻访 · 夏季] 行止风歇",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_carnival_trails_end_winds_rest.png",
    "cnStartDate": "2026/08/01",
    "cnEndDate": "2026/08/15",
    "globalEstimatedArrival": "2027/01",
    "sixStarOps": [
      {
        "charId": "char_pepe",
        "name": "Pepe",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_pepe.png"
      },
      {
        "charId": "char_angelina_alter",
        "name": "Angelina the Mellow Wish",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_angelina_the_mellow_wish.png"
      },
      {
        "charId": "char_hoshiguma_alter",
        "name": "Hoshiguma the Breacher",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_hoshiguma_the_breacher.png"
      },
      {
        "charId": "char_eyja_alter",
        "name": "Eyjafjalla the Hvít Aska",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_eyjafjalla_the_hv_t_aska.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_thumpy",
        "name": "Thumpy",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_thumpy.png"
      },
      {
        "charId": "char_jacinta",
        "name": "Jacinta",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_jacinta.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 600000,
        "costPerItem": 1,
        "tokenType": "carnival_token"
      },
      {
        "itemId": "2004",
        "nameEn": "Strategic Battle Record",
        "nameRu": "Стратегическая запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 150,
        "costPerItem": 4,
        "tokenType": "carnival_token"
      },
      {
        "itemId": "31044",
        "nameEn": "Refined Solvent",
        "nameRu": "Очищенный растворитель",
        "nameCn": "精炼溶剂",
        "count": 15,
        "costPerItem": 35,
        "tokenType": "carnival_token"
      },
      {
        "itemId": "30033",
        "nameEn": "Polyester Pack",
        "nameRu": "Полиэстеровый набор",
        "nameCn": "聚酯组",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "carnival_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "TR-8",
        "itemId": "31043",
        "itemNameEn": "Semi-Synthetic Solvent",
        "itemNameRu": "Полусинтетический растворитель",
        "dropRatePercent": 77.2,
        "apCost": 21,
        "sanityPerItem": 27.2
      },
      {
        "stageCode": "TR-7",
        "itemId": "30033",
        "itemNameEn": "Polyester Pack",
        "itemNameRu": "Полиэстеровый набор",
        "dropRatePercent": 81,
        "apCost": 18,
        "sanityPerItem": 22.2
      }
    ],
    "summaryEn": "Sargon Summer Carnival celebration introducing 6★ limited guard Pepe and new alter versions of beloved Rhodes Island operators.",
    "summaryRu": "Летний карнавал Саргона: дебют лимитированного 6★ гварда Pepe и альтер-версий популярных оперативников.",
    "summaryCn": "夏日嘉年华主题限定活动，佩佩与多位全新异格干员登场。"
  },
  {
    "id": "banner_dithyramb_unending_rerun",
    "nameEn": "Dithyramb Unending (Rerun)",
    "nameRu": "Dithyramb Unending (Реран)",
    "nameCn": "永不落幕的赞歌 (复刻)",
    "headerTagEn": "[Standard Headhunting - Limited-Time] Dithyramb Unending Rerun",
    "headerTagRu": "[Стандартный Хедхантинг - Ограниченный] Dithyramb Unending Rerun",
    "headerTagCn": "[常驻特选寻访] 永不落幕的赞歌 复刻",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_limited_time_dithyramb_unending_rerun.png",
    "cnStartDate": "2026/07/20",
    "cnEndDate": "2026/08/03",
    "globalEstimatedArrival": "2026/12",
    "sixStarOps": [
      {
        "charId": "char_tragodia",
        "name": "Tragodia",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_tragodia.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_tippi",
        "name": "Tippi",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_tippi.png"
      },
      {
        "charId": "char_alanna",
        "name": "Alanna",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_alanna.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 300000,
        "costPerItem": 1,
        "tokenType": "event_token"
      },
      {
        "itemId": "30083",
        "nameEn": "Oriron Pack",
        "nameRu": "Набор орирона",
        "nameCn": "异铁组",
        "count": 15,
        "costPerItem": 15,
        "tokenType": "event_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "DU-8",
        "itemId": "30083",
        "itemNameEn": "Oriron Pack",
        "itemNameRu": "Набор орирона",
        "dropRatePercent": 74,
        "apCost": 21,
        "sanityPerItem": 28.4
      }
    ],
    "summaryEn": "Dithyramb Unending rerun banner featuring 6★ Supporter Tragodia.",
    "summaryRu": "Реран баннера Dithyramb Unending с 6★ саппортером Tragodia.",
    "summaryCn": "永不落幕的赞歌复刻特选寻访，六星辅助干员酒神登场。"
  },
  {
    "id": "banner_deterministic_chaos",
    "nameEn": "Deterministic Chaos",
    "nameRu": "Deterministic Chaos (Детерминированный хаос)",
    "nameCn": "确定性混沌",
    "headerTagEn": "[Standard Headhunting - Limited-Time] Deterministic Chaos",
    "headerTagRu": "[Стандартный Хедхантинг - Ограниченный] Deterministic Chaos",
    "headerTagCn": "[常驻特选寻访] 确定性混沌",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_limited_time_deterministic_chaos.png",
    "cnStartDate": "2026/07/10",
    "cnEndDate": "2026/07/24",
    "globalEstimatedArrival": "2026/12",
    "sixStarOps": [
      {
        "charId": "char_aphrissa",
        "name": "Aphrissa",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_aphrissa.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_pedro",
        "name": "Pedro",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_pedro.png"
      },
      {
        "charId": "char_wulfenite",
        "name": "Wulfenite",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_wulfenite.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 400000,
        "costPerItem": 1,
        "tokenType": "chaos_token"
      },
      {
        "itemId": "30103",
        "nameEn": "Compound Cutting Fluid",
        "nameRu": "Смазочно-охлаждающая жидкость",
        "nameCn": "化合切削液",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "chaos_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "DC-8",
        "itemId": "30103",
        "itemNameEn": "Cutting Fluid",
        "itemNameRu": "Жидкость",
        "dropRatePercent": 76.5,
        "apCost": 21,
        "sanityPerItem": 27.5
      }
    ],
    "summaryEn": "Standard limited-time headhunting banner introducing 6★ Caster Aphrissa.",
    "summaryRu": "Ограниченный стандартный баннер с новым 6★ кастером Aphrissa.",
    "summaryCn": "常驻特选寻访活动，六星术师干员缪因登场。"
  },
  {
    "id": "banner_joint_operation_22",
    "nameEn": "Joint Operation #22",
    "nameRu": "Joint Operation #22 (Совместная операция)",
    "nameCn": "联合行动 #22",
    "headerTagEn": "[Standard Headhunting] Joint Operation #22",
    "headerTagRu": "[Стандартный Хедхантинг] Joint Operation #22",
    "headerTagCn": "[常驻标准寻访] 联合行动 #22",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_joint_operation_22.png",
    "cnStartDate": "2026/06/26",
    "cnEndDate": "2026/07/10",
    "globalEstimatedArrival": "2026/11",
    "prompt6En": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Ru": "Только следующие 6★ и 5★ Оперативники могут выпасть в данном баннере.",
    "prompt6Cn": "在本次寻访中出现的六星及五星干员仅限以下干员。",
    "sixStarOps": [
      {
        "charId": "char_4087_ines",
        "name": "Ines",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ines.png"
      },
      {
        "charId": "char_hoolheyak",
        "name": "Ho'olheyak",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ho_olheyak.png"
      },
      {
        "charId": "char_nasti",
        "name": "Nasti",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_nasti.png"
      },
      {
        "charId": "char_lemuen",
        "name": "Lemuen",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_lemuen.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_ripresa",
        "name": "Ripresa",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_ripresa.png"
      },
      {
        "charId": "char_melanite",
        "name": "Melanite",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_melanite.png"
      },
      {
        "charId": "char_santalla",
        "name": "Santalla",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_santalla.png"
      },
      {
        "charId": "char_snow_hunter",
        "name": "Snow Hunter",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_snow_hunter.png"
      },
      {
        "charId": "char_gracebearer",
        "name": "Gracebearer",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_gracebearer.png"
      },
      {
        "charId": "char_firewhistle",
        "name": "Firewhistle",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_firewhistle.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 250000,
        "costPerItem": 1,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "30023",
        "nameEn": "Sugar Pack",
        "nameRu": "Сахарный набор",
        "nameCn": "糖组",
        "count": 15,
        "costPerItem": 15,
        "tokenType": "headhunt_token"
      }
    ],
    "farmingStages": [],
    "summaryEn": "Joint Operation #22 with exclusive rate-ups for Ines, Ho'olheyak, Nasti, and Lemuen.",
    "summaryRu": "Баннер Joint Operation #22 с гарантированным пулом из Инес, Хольхеяк, Насти и Лемуен.",
    "summaryCn": "联合行动第二十二期，特选伊内丝、霍尔海雅、纳斯提与莱穆安。"
  },
  {
    "id": "banner_sharpened_by_flame_rerun",
    "nameEn": "Sharpened by Flame (Rerun)",
    "nameRu": "Sharpened by Flame (Реран MH коллаборации)",
    "nameCn": "落叶逐火 (复刻)",
    "headerTagEn": "[Limited Headhunting - Triumphant Hunt] Sharpened by Flame Rerun",
    "headerTagRu": "[Лимитированный Хедхантинг] Sharpened by Flame Rerun",
    "headerTagCn": "[限定寻访 · 狩猎] 落叶逐火 复刻",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_triumphant_hunt_sharpened_by_flame_rerun.png",
    "cnStartDate": "2026/06/15",
    "cnEndDate": "2026/06/29",
    "globalEstimatedArrival": "2026/11",
    "sixStarOps": [
      {
        "charId": "char_kirin_r_yato",
        "name": "Kirin R Yato",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_kirin_r_yato.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_rathalos_noir",
        "name": "Rathalos S Noir Corne",
        "rarity": 5,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_rathalos_s_noir_corne.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 400000,
        "costPerItem": 1,
        "tokenType": "hunt_token"
      },
      {
        "itemId": "30043",
        "nameEn": "Polyketon Pack",
        "nameRu": "Кетоновый набор",
        "nameCn": "酮凝集组",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "hunt_token"
      },
      {
        "itemId": "30073",
        "nameEn": "Coagulating Gel",
        "nameRu": "Коагулирующий гель",
        "nameCn": "凝胶",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "hunt_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "CF-8",
        "itemId": "30043",
        "itemNameEn": "Polyketon",
        "itemNameRu": "Кетон",
        "dropRatePercent": 78,
        "apCost": 21,
        "sanityPerItem": 26.9
      },
      {
        "stageCode": "CF-7",
        "itemId": "30073",
        "itemNameEn": "Gel",
        "itemNameRu": "Гель",
        "dropRatePercent": 75,
        "apCost": 21,
        "sanityPerItem": 28
      }
    ],
    "summaryEn": "Celebrated Monster Hunter collaboration rerun featuring the powerhouse Specialist Kirin R Yato.",
    "summaryRu": "Легендарный реран коллаборации с Monster Hunter: мета-специалист Kirin R Yato.",
    "summaryCn": "怪物猎人联动经典复刻，麒麟R夜刀再度限时登场。"
  },
  {
    "id": "banner_hunters_of_the_umbral_wilds",
    "nameEn": "Hunters of the Umbral Wilds",
    "nameRu": "Hunters of the Umbral Wilds (Коллаборация MH Часть 2)",
    "nameCn": "幽境狩人 (怪物猎人第二期联动)",
    "headerTagEn": "[Limited Headhunting - Crossover] Hunters of the Umbral Wilds",
    "headerTagRu": "[Лимитированный Хедхантинг - Коллаборация] Hunters of the Umbral Wilds",
    "headerTagCn": "[限定寻访 · 联动] 幽境狩人",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_crossover_hunters_of_the_umbral_wilds.png",
    "cnStartDate": "2026/06/01",
    "cnEndDate": "2026/06/15",
    "globalEstimatedArrival": "2026/11",
    "sixStarOps": [
      {
        "charId": "char_mizutsune_orchid",
        "name": "Violet Mizutsune Orchid",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_violet_mizutsune_orchid.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_zinogre_catapult",
        "name": "Zinogre S Catapult",
        "rarity": 5,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_zinogre_s_catapult.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 500000,
        "costPerItem": 1,
        "tokenType": "hunt_token2"
      },
      {
        "itemId": "30053",
        "nameEn": "Aketon Pack",
        "nameRu": "Акетон",
        "nameCn": "炽合金",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "hunt_token2"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "HW-8",
        "itemId": "30053",
        "itemNameEn": "Aketon",
        "itemNameRu": "Акетон",
        "dropRatePercent": 77,
        "apCost": 21,
        "sanityPerItem": 27.3
      }
    ],
    "summaryEn": "Monster Hunter Part 2 crossover headhunting featuring Violet Mizutsune Orchid and Zinogre S Catapult.",
    "summaryRu": "Вторая часть коллаборации с Monster Hunter: Violet Mizutsune Orchid и Zinogre S Catapult.",
    "summaryCn": "怪物猎人第二期大型联动，泡狐龙款梓兰与雷狼龙款空爆登场。"
  },
  {
    "id": "banner_orienteering_7",
    "nameEn": "Orienteering #7 (Directional Selection)",
    "nameRu": "Orienteering #7 (Выборочный хедхантинг)",
    "nameCn": "定向甄选 #7",
    "headerTagEn": "[Standard Headhunting] Orienteering #7",
    "headerTagRu": "[Стандартный Хедхантинг] Orienteering #7",
    "headerTagCn": "[常驻定向甄选] 第七期",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_orienteering_7.png",
    "cnStartDate": "2026/05/15",
    "cnEndDate": "2026/05/29",
    "globalEstimatedArrival": "2026/10",
    "prompt6En": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Ru": "Выберите трёх из следующих 6★ Оперативников: только они будут выпадать среди 6★ в данном баннере.",
    "prompt6Cn": "可选定3名六星干员概率提升；此卡池仅会出现选定的六星干员。",
    "sixStarOps": [
      {
        "charId": "char_blaze_alter",
        "name": "Blaze the Igniting Spark",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_blaze_the_igniting_spark.png"
      },
      {
        "charId": "char_entelechia",
        "name": "Entelechia",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_entelechia.png"
      },
      {
        "charId": "char_leizi_alter",
        "name": "Leizi the Thunderbringer",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_leizi_the_thunderbringer.png"
      },
      {
        "charId": "char_pramanix_alter",
        "name": "Pramanix the Prerita",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_pramanix_the_prerita.png"
      },
      {
        "charId": "char_qiubai",
        "name": "Qiubai",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_qiubai.png"
      },
      {
        "charId": "char_typhon",
        "name": "Typhon",
        "rarity": 6,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_typhon.png"
      }
    ],
    "prompt5En": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Ru": "Выберите трёх из следующих 5★ Оперативников: у них будет 60% шанс выпадения среди 5★.",
    "prompt5Cn": "可选定3名五星干员概率提升；在抽到五星干员时有60%概率为选定干员。",
    "fiveStarOps": [
      {
        "charId": "char_perfumer_alter",
        "name": "Perfumer the Distilled",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_perfumer_the_distilled.png"
      },
      {
        "charId": "char_spuria",
        "name": "Spuria",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_spuria.png"
      },
      {
        "charId": "char_vetochki",
        "name": "Vetochki",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_vetochki.png"
      },
      {
        "charId": "char_taraxacum",
        "name": "Taraxacum",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_taraxacum.png"
      },
      {
        "charId": "char_figurino",
        "name": "Figurino",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_figurino.png"
      },
      {
        "charId": "char_cantabile",
        "name": "Cantabile",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_cantabile.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 300000,
        "costPerItem": 1,
        "tokenType": "headhunt_token"
      },
      {
        "itemId": "30013",
        "nameEn": "Orirock Cluster",
        "nameRu": "Кластер орирока",
        "nameCn": "固源岩组",
        "count": 20,
        "costPerItem": 10,
        "tokenType": "headhunt_token"
      }
    ],
    "farmingStages": [],
    "summaryEn": "Directional Selection #7 on CN server with customizable 6★ and 5★ selections.",
    "summaryRu": "Седьмой выпуск выборочного хедхантинга на CN сервере с настраиваемыми рейтами 6★ и 5★.",
    "summaryCn": "第七期定向甄选活动，自选心仪的六星与五星干员组合。"
  },
  {
    "id": "banner_sealed_with_time",
    "nameEn": "Sealed With Time (6th Anniversary Celebration)",
    "nameRu": "Sealed With Time (Празднование 6-й годовщины)",
    "nameCn": "封存岁月 (六周年庆典)",
    "headerTagEn": "[Limited Headhunting - Celebration] Sealed With Time",
    "headerTagRu": "[Лимитированный Хедхантинг - Празднование] Sealed With Time",
    "headerTagCn": "[限定寻访 · 庆典] 封存岁月",
    "type": "celebration",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_celebration_sealed_with_time.png",
    "cnStartDate": "2026/05/01",
    "cnEndDate": "2026/05/15",
    "globalEstimatedArrival": "2026/10",
    "sixStarOps": [
      {
        "charId": "char_closure",
        "name": "Closure",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_closure.png"
      },
      {
        "charId": "char_exusiai_alter",
        "name": "Exusiai the New Covenant",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_exusiai_the_new_covenant.png"
      },
      {
        "charId": "char_kaltsit_alter",
        "name": "Kal'tsit - Esperanta",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_kal_tsit_esperanta.png"
      },
      {
        "charId": "char_lappland_alter",
        "name": "Lappland the Decadenza",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_lappland_the_decadenza.png"
      },
      {
        "charId": "char_wisadel",
        "name": "Wiš'adel",
        "rarity": 6,
        "role": "limited",
        "avatarUrl": "/avatars/avatar_wi_adel.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_crackborne",
        "name": "Crackborne",
        "rarity": 5,
        "role": "standard",
        "avatarUrl": "/avatars/avatar_crackborne.png"
      }
    ],
    "shopItems": [
      {
        "itemId": "4001",
        "nameEn": "LMD",
        "nameRu": "LMD (Юани)",
        "nameCn": "龙门币",
        "count": 1000000,
        "costPerItem": 1,
        "tokenType": "anniv_token"
      },
      {
        "itemId": "2004",
        "nameEn": "Strategic Battle Record",
        "nameRu": "Стратегическая запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 200,
        "costPerItem": 4,
        "tokenType": "anniv_token"
      },
      {
        "itemId": "30073",
        "nameEn": "Sugar Pack",
        "nameRu": "Пачка сахара",
        "nameCn": "糖组",
        "count": 30,
        "costPerItem": 15,
        "tokenType": "anniv_token"
      },
      {
        "itemId": "30093",
        "nameEn": "Loxic Kohl",
        "nameRu": "Локсиковый коль",
        "nameCn": "轻锰矿",
        "count": 30,
        "costPerItem": 15,
        "tokenType": "anniv_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "ST-8",
        "itemId": "30073",
        "itemNameEn": "Sugar Pack",
        "itemNameRu": "Пачка сахара",
        "dropRatePercent": 82,
        "apCost": 21,
        "sanityPerItem": 25.6
      },
      {
        "stageCode": "ST-7",
        "itemId": "30093",
        "itemNameEn": "Loxic Kohl",
        "itemNameRu": "Локсиковый коль",
        "dropRatePercent": 80.5,
        "apCost": 21,
        "sanityPerItem": 26.1
      }
    ],
    "summaryEn": "Monumental 6th Anniversary Celebration introducing Closure as an operator and grand anniversary rate-ups.",
    "summaryRu": "Грандиозная 6-я годовщина игры с дебютом Closure в роли оператора и масштабными наградами.",
    "summaryCn": "六周年重磅庆典寻访，可露希尔实装及众多经典周年限定干员集结。"
  }
];
