// src/data/eventsData.ts
// Generated strictly from https://arknights.wiki.gg/wiki/Headhunting/Banners/Upcoming

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
  prompt6En?: string | null;
  prompt6Ru?: string | null;
  prompt6Cn?: string | null;
  sixStarOps: EventOperatorAvatar[];
  prompt5En?: string | null;
  prompt5Ru?: string | null;
  prompt5Cn?: string | null;
  fiveStarOps: EventOperatorAvatar[];
  shopItems: EventShopItem[];
  farmingStages: EventFarmingStage[];
  summaryEn: string;
  summaryRu: string;
  summaryCn: string;
}

export const ARKNIGHTS_EVENTS: ArknightsEvent[] = [
  {
    "id": "banner_standard_headhunting_orienteering_8",
    "nameEn": "Orienteering #8 (Directional Selection)",
    "nameRu": "Orienteering #8 (Выборочный хедхантинг)",
    "nameCn": "定向甄选 #8",
    "headerTagEn": "[Standard Headhunting] Orienteering #8",
    "headerTagRu": "[Standard Headhunting] Orienteering #8",
    "headerTagCn": "[Standard Headhunting] Orienteering #8",
    "type": "headhunting",
    "status": "cn_active",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_orienteering_8.png",
    "cnStartDate": "2026/09/29",
    "cnEndDate": "2026/10/13",
    "globalEstimatedArrival": "2027/03",
    "prompt6En": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Ru": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Cn": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "sixStarOps": [
      {
        "charId": "char_mon3tr",
        "name": "Mon3tr",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_mon3tr.png"
      },
      {
        "charId": "char_mantra",
        "name": "Mantra",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_mantra.png"
      },
      {
        "charId": "char_pramanix_the_prerita",
        "name": "Pramanix the Prerita",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_pramanix_the_prerita.png"
      },
      {
        "charId": "char_bellone",
        "name": "Bellone",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_bellone.png"
      },
      {
        "charId": "char_degenbrecher",
        "name": "Degenbrecher",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_degenbrecher.png"
      },
      {
        "charId": "char_blaze_the_igniting_spark",
        "name": "Blaze the Igniting Spark",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_blaze_the_igniting_spark.png"
      }
    ],
    "prompt5En": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Ru": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Cn": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "fiveStarOps": [
      {
        "charId": "char_mitm",
        "name": "Mitm",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_mitm.png"
      },
      {
        "charId": "char_kichisei",
        "name": "Kichisei",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_kichisei.png"
      },
      {
        "charId": "char_surfer",
        "name": "Surfer",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_surfer.png"
      },
      {
        "charId": "char_paprika",
        "name": "Paprika",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_paprika.png"
      },
      {
        "charId": "char_cairn",
        "name": "Cairn",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_cairn.png"
      },
      {
        "charId": "char_ripresa",
        "name": "Ripresa",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_ripresa.png"
      }
    ],
    "shopItems": [],
    "farmingStages": [],
    "summaryEn": "Current active Directional Selection banner on CN server. Select 3 out of 6 rate-up 6★ and 3 out of 6 rate-up 5★ operators.",
    "summaryRu": "Текущий активный баннер выборочного хедхантинга на CN сервере. Выберите 3 из 6 доступных 6★ и 3 из 6 доступных 5★ оперативников.",
    "summaryCn": "国服当前正在进行的第八期定向甄选。可在6名六星与6名五星干员中自选各3名进行定向寻访。"
  },
  {
    "id": "banner_limited_headhunting_crossover_some_evening_of_white_and_mystic_blue",
    "nameEn": "Some Evening of White and Mystic Blue (Persona 3 Reload)",
    "nameRu": "Some Evening of White and Mystic Blue (Коллаб Persona 3 Reload)",
    "nameCn": "白与幽蓝的夜 (女神异闻录3联动)",
    "headerTagEn": "[Limited Headhunting - Crossover] Some Evening of White and Mystic Blue",
    "headerTagRu": "[Limited Headhunting - Crossover] Some Evening of White and Mystic Blue",
    "headerTagCn": "[Limited Headhunting - Crossover] Some Evening of White and Mystic Blue",
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
        "avatarUrl": "/avatars/avatar_makoto_yuki.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_yukari_takeba",
        "name": "Yukari Takeba",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_yukari_takeba.png"
      },
      {
        "charId": "char_aegis",
        "name": "Aegis",
        "rarity": 5,
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
        "tokenType": "p3_token"
      },
      {
        "itemId": "2004",
        "nameEn": "Strategic Battle Record",
        "nameRu": "Запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 120,
        "costPerItem": 4,
        "tokenType": "p3_token"
      },
      {
        "itemId": "30073",
        "nameEn": "Loxic Kohl",
        "nameRu": "Локсиковый коль",
        "nameCn": "轻锰矿",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "p3_token"
      },
      {
        "itemId": "30013",
        "nameEn": "Orirock Cluster",
        "nameRu": "Кластер орирока",
        "nameCn": "固源岩组",
        "count": 25,
        "costPerItem": 10,
        "tokenType": "p3_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "P3-8",
        "itemId": "30073",
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
    "summaryEn": "Persona 3 Reload crossover limited headhunting featuring Makoto Yuki, Yukari Takeba, and Aegis.",
    "summaryRu": "Лимитированная коллаборация с Persona 3 Reload: Макото Юки, Юкари Такэба и Айгис.",
    "summaryCn": "女神异闻录3重制版大型联动限定寻访，结城理、岳羽由加莉与埃癸斯登场。"
  },
  {
    "id": "banner_standard_headhunting_joint_operation_23",
    "nameEn": "Joint Operation #23",
    "nameRu": "Joint Operation #23 (Совместная операция)",
    "nameCn": "联合行动 #23",
    "headerTagEn": "[Standard Headhunting] Joint Operation #23",
    "headerTagRu": "[Standard Headhunting] Joint Operation #23",
    "headerTagCn": "[Standard Headhunting] Joint Operation #23",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_joint_operation_23.png",
    "cnStartDate": "2026/08/18",
    "cnEndDate": "2026/09/01",
    "globalEstimatedArrival": "2027/01",
    "prompt6En": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Ru": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Cn": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "sixStarOps": [
      {
        "charId": "char_ch_en_the_dawnstreak",
        "name": "Ch'en the Dawnstreak",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_ch_en_the_dawnstreak.png"
      },
      {
        "charId": "char_haruka",
        "name": "Haruka",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_haruka.png"
      },
      {
        "charId": "char_necrass",
        "name": "Necrass",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_necrass.png"
      },
      {
        "charId": "char_vulpisfoglia",
        "name": "Vulpisfoglia",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_vulpisfoglia.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_ukusik",
        "name": "Ukusik",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_ukusik.png"
      },
      {
        "charId": "char_poncirus",
        "name": "Poncirus",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_poncirus.png"
      },
      {
        "charId": "char_nowell",
        "name": "Nowell",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_nowell.png"
      },
      {
        "charId": "char_grain_buds",
        "name": "Grain Buds",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_grain_buds.png"
      },
      {
        "charId": "char_almond",
        "name": "Almond",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_almond.png"
      },
      {
        "charId": "char_figurino",
        "name": "Figurino",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_figurino.png"
      }
    ],
    "shopItems": [],
    "farmingStages": [],
    "summaryEn": "Joint Operation #23 with a strictly curated pool of 4 six-stars and 6 five-stars.",
    "summaryRu": "Баннер Joint Operation #23 со строго фиксированным пулом из 4 шестизвёздочных и 6 пятизвёздочных оперативников.",
    "summaryCn": "联合行动第23期，特选4位六星与6位五星干员。"
  },
  {
    "id": "banner_limited_headhunting_carnival_trails_end_winds_rest",
    "nameEn": "Trails End Winds Rest (Summer Carnival)",
    "nameRu": "Trails End Winds Rest (Летний карнавал)",
    "nameCn": "行止风歇 (夏日嘉年华)",
    "headerTagEn": "[Limited Headhunting - Carnival] Trails End Winds Rest",
    "headerTagRu": "[Limited Headhunting - Carnival] Trails End Winds Rest",
    "headerTagCn": "[Limited Headhunting - Carnival] Trails End Winds Rest",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_carnival_trails_end_winds_rest.png",
    "cnStartDate": "2026/08/01",
    "cnEndDate": "2026/08/15",
    "globalEstimatedArrival": "2027/01",
    "sixStarOps": [
      {
        "charId": "char_angelina_the_mellow_wish",
        "name": "Angelina the Mellow Wish",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_angelina_the_mellow_wish.png"
      },
      {
        "charId": "char_thumpy",
        "name": "Thumpy",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_thumpy.png"
      },
      {
        "charId": "char_pepe",
        "name": "Pepe",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_pepe.png"
      },
      {
        "charId": "char_hoshiguma_the_breacher",
        "name": "Hoshiguma the Breacher",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_hoshiguma_the_breacher.png"
      },
      {
        "charId": "char_eyjafjalla_the_hv_t_aska",
        "name": "Eyjafjalla the Hvít Aska",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_eyjafjalla_the_hv_t_aska.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_jacinta",
        "name": "Jacinta",
        "rarity": 5,
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
        "nameRu": "Запись боя (T4)",
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
    "summaryEn": "Sargon Summer Carnival celebration introducing Pepe and new alter versions of favorite operators.",
    "summaryRu": "Летний карнавал Саргона: дебют лимитированного 6★ гварда Pepe и альтер-версий популярных оперативников.",
    "summaryCn": "夏日嘉年华大型主题活动，佩佩与全新异格干员登场。"
  },
  {
    "id": "banner_standard_headhunting_limited_time_dithyramb_unending_rerun",
    "nameEn": "Dithyramb Unending (Rerun)",
    "nameRu": "Dithyramb Unending (Реран)",
    "nameCn": "永不落幕的赞歌 (复刻)",
    "headerTagEn": "[Standard Headhunting - Limited-Time] Dithyramb Unending Rerun",
    "headerTagRu": "[Standard Headhunting - Limited-Time] Dithyramb Unending Rerun",
    "headerTagCn": "[Standard Headhunting - Limited-Time] Dithyramb Unending Rerun",
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
        "avatarUrl": "/avatars/avatar_tragodia.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_tippi",
        "name": "Tippi",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_tippi.png"
      },
      {
        "charId": "char_alanna",
        "name": "Alanna",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_alanna.png"
      }
    ],
    "shopItems": [],
    "farmingStages": [],
    "summaryEn": "Limited-time rerun headhunting featuring 6★ Supporter Tragodia.",
    "summaryRu": "Ограниченный реран баннера с 6★ саппортером Tragodia.",
    "summaryCn": "永不落幕的赞歌复刻特选寻访，六星辅助干员酒神登场。"
  },
  {
    "id": "banner_standard_headhunting_limited_time_deterministic_chaos",
    "nameEn": "Deterministic Chaos",
    "nameRu": "Deterministic Chaos (Детерминированный хаос)",
    "nameCn": "确定性混沌",
    "headerTagEn": "[Standard Headhunting - Limited-Time] Deterministic Chaos",
    "headerTagRu": "[Standard Headhunting - Limited-Time] Deterministic Chaos",
    "headerTagCn": "[Standard Headhunting - Limited-Time] Deterministic Chaos",
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
        "avatarUrl": "/avatars/avatar_aphrissa.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_pedro",
        "name": "Pedro",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_pedro.png"
      },
      {
        "charId": "char_wulfenite",
        "name": "Wulfenite",
        "rarity": 5,
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
        "nameEn": "Cutting Fluid",
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
    "summaryEn": "Limited-time headhunting introducing 6★ Caster Aphrissa.",
    "summaryRu": "Ограниченный баннер с новым 6★ кастером Aphrissa.",
    "summaryCn": "常驻特选寻访活动，六星术师干员缪因登场。"
  },
  {
    "id": "banner_standard_headhunting_joint_operation_22",
    "nameEn": "Joint Operation #22",
    "nameRu": "Joint Operation #22 (Совместная операция)",
    "nameCn": "联合行动 #22",
    "headerTagEn": "[Standard Headhunting] Joint Operation #22",
    "headerTagRu": "[Standard Headhunting] Joint Operation #22",
    "headerTagCn": "[Standard Headhunting] Joint Operation #22",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_joint_operation_22.png",
    "cnStartDate": "2026/06/26",
    "cnEndDate": "2026/07/10",
    "globalEstimatedArrival": "2026/11",
    "prompt6En": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Ru": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "prompt6Cn": "Only the following 6★ and 5★ Operators that will appear in a pull on this banner.",
    "sixStarOps": [
      {
        "charId": "char_ines",
        "name": "Ines",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_ines.png"
      },
      {
        "charId": "char_ho_olheyak",
        "name": "Ho'olheyak",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_ho_olheyak.png"
      },
      {
        "charId": "char_nasti",
        "name": "Nasti",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_nasti.png"
      },
      {
        "charId": "char_lemuen",
        "name": "Lemuen",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_lemuen.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_ripresa",
        "name": "Ripresa",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_ripresa.png"
      },
      {
        "charId": "char_melanite",
        "name": "Melanite",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_melanite.png"
      },
      {
        "charId": "char_santalla",
        "name": "Santalla",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_santalla.png"
      },
      {
        "charId": "char_snow_hunter",
        "name": "Snow Hunter",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_snow_hunter.png"
      },
      {
        "charId": "char_gracebearer",
        "name": "Gracebearer",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_gracebearer.png"
      },
      {
        "charId": "char_firewhistle",
        "name": "Firewhistle",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_firewhistle.png"
      }
    ],
    "shopItems": [],
    "farmingStages": [],
    "summaryEn": "Joint Operation #22 with exclusive rate-ups for Ines, Ho'olheyak, Nasti, and Lemuen.",
    "summaryRu": "Баннер Joint Operation #22 со специальным пулом из Инес, Хольхеяк, Насти и Лемуен.",
    "summaryCn": "联合行动第二十二期，特选伊内丝、霍尔海雅、纳斯提与莱穆安。"
  },
  {
    "id": "banner_limited_headhunting_triumphant_hunt_sharpened_by_flame_rerun",
    "nameEn": "Sharpened by Flame (Rerun)",
    "nameRu": "Sharpened by Flame (Реран Monster Hunter)",
    "nameCn": "落叶逐火 (怪物猎人复刻)",
    "headerTagEn": "[Limited Headhunting - Triumphant Hunt] Sharpened by Flame Rerun",
    "headerTagRu": "[Limited Headhunting - Triumphant Hunt] Sharpened by Flame Rerun",
    "headerTagCn": "[Limited Headhunting - Triumphant Hunt] Sharpened by Flame Rerun",
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
        "avatarUrl": "/avatars/avatar_kirin_r_yato.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_rathalos_s_noir_corne",
        "name": "Rathalos S Noir Corne",
        "rarity": 5,
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
        "tokenType": "mh_token"
      },
      {
        "itemId": "30053",
        "nameEn": "Aketon",
        "nameRu": "Акетон",
        "nameCn": "酮凝集组",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "mh_token"
      },
      {
        "itemId": "31013",
        "nameEn": "Coagulating Gel",
        "nameRu": "Коагулирующий гель",
        "nameCn": "凝胶",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "mh_token"
      }
    ],
    "farmingStages": [
      {
        "stageCode": "CF-8",
        "itemId": "30053",
        "itemNameEn": "Aketon",
        "itemNameRu": "Акетон",
        "dropRatePercent": 78,
        "apCost": 21,
        "sanityPerItem": 26.9
      },
      {
        "stageCode": "CF-7",
        "itemId": "31013",
        "itemNameEn": "Coagulating Gel",
        "itemNameRu": "Коагулирующий гель",
        "dropRatePercent": 75,
        "apCost": 21,
        "sanityPerItem": 28
      }
    ],
    "summaryEn": "Celebrated Monster Hunter collaboration rerun featuring Kirin R Yato and Rathalos S Noir Corne.",
    "summaryRu": "Реран популярной коллаборации с Monster Hunter: Kirin R Yato и Rathalos S Noir Corne.",
    "summaryCn": "怪物猎人联动经典复刻，麒麟R夜刀再度限时登场。"
  },
  {
    "id": "banner_limited_headhunting_crossover_hunters_of_the_umbral_wilds",
    "nameEn": "Hunters of the Umbral Wilds (Monster Hunter Part 2)",
    "nameRu": "Hunters of the Umbral Wilds (Monster Hunter Часть 2)",
    "nameCn": "幽境狩人 (怪物猎人第二期)",
    "headerTagEn": "[Limited Headhunting - Crossover] Hunters of the Umbral Wilds",
    "headerTagRu": "[Limited Headhunting - Crossover] Hunters of the Umbral Wilds",
    "headerTagCn": "[Limited Headhunting - Crossover] Hunters of the Umbral Wilds",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_limited_headhunting_crossover_hunters_of_the_umbral_wilds.png",
    "cnStartDate": "2026/06/01",
    "cnEndDate": "2026/06/15",
    "globalEstimatedArrival": "2026/11",
    "sixStarOps": [
      {
        "charId": "char_violet_mizutsune_orchid",
        "name": "Violet Mizutsune Orchid",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_violet_mizutsune_orchid.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_zinogre_s_catapult",
        "name": "Zinogre S Catapult",
        "rarity": 5,
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
        "tokenType": "mh2_token"
      },
      {
        "itemId": "30053",
        "nameEn": "Aketon Pack",
        "nameRu": "Акетон",
        "nameCn": "炽合金",
        "count": 20,
        "costPerItem": 15,
        "tokenType": "mh2_token"
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
    "summaryRu": "Вторая часть коллаборации Monster Hunter: Violet Mizutsune Orchid и Zinogre S Catapult.",
    "summaryCn": "怪物猎人第二期大型联动，泡狐龙款梓兰与雷狼龙款空爆登场。"
  },
  {
    "id": "banner_standard_headhunting_orienteering_7",
    "nameEn": "Orienteering #7 (Directional Selection)",
    "nameRu": "Orienteering #7 (Выборочный хедхантинг)",
    "nameCn": "定向甄选 #7",
    "headerTagEn": "[Standard Headhunting] Orienteering #7",
    "headerTagRu": "[Standard Headhunting] Orienteering #7",
    "headerTagCn": "[Standard Headhunting] Orienteering #7",
    "type": "headhunting",
    "status": "upcoming_global",
    "bannerPosterUrl": "/banners/banner_standard_headhunting_orienteering_7.png",
    "cnStartDate": "2026/05/15",
    "cnEndDate": "2026/05/29",
    "globalEstimatedArrival": "2026/10",
    "prompt6En": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Ru": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "prompt6Cn": "Choose three of the following 6★ Operators; only these 6★ that will appear in a pull on this banner.",
    "sixStarOps": [
      {
        "charId": "char_blaze_the_igniting_spark",
        "name": "Blaze the Igniting Spark",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_blaze_the_igniting_spark.png"
      },
      {
        "charId": "char_entelechia",
        "name": "Entelechia",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_entelechia.png"
      },
      {
        "charId": "char_leizi_the_thunderbringer",
        "name": "Leizi the Thunderbringer",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_leizi_the_thunderbringer.png"
      },
      {
        "charId": "char_pramanix_the_prerita",
        "name": "Pramanix the Prerita",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_pramanix_the_prerita.png"
      },
      {
        "charId": "char_qiubai",
        "name": "Qiubai",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_qiubai.png"
      },
      {
        "charId": "char_typhon",
        "name": "Typhon",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_typhon.png"
      }
    ],
    "prompt5En": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Ru": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "prompt5Cn": "Choose three of the following 5★ Operators; they have a 60% chance to be the 5★ that appears in a pull on this banner.",
    "fiveStarOps": [
      {
        "charId": "char_perfumer_the_distilled",
        "name": "Perfumer the Distilled",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_perfumer_the_distilled.png"
      },
      {
        "charId": "char_spuria",
        "name": "Spuria",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_spuria.png"
      },
      {
        "charId": "char_vetochki",
        "name": "Vetochki",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_vetochki.png"
      },
      {
        "charId": "char_taraxacum",
        "name": "Taraxacum",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_taraxacum.png"
      },
      {
        "charId": "char_figurino",
        "name": "Figurino",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_figurino.png"
      },
      {
        "charId": "char_cantabile",
        "name": "Cantabile",
        "rarity": 5,
        "avatarUrl": "/avatars/avatar_cantabile.png"
      }
    ],
    "shopItems": [],
    "farmingStages": [],
    "summaryEn": "Directional Selection #7 on CN server with customizable 6★ and 5★ selections.",
    "summaryRu": "Седьмой выпуск выборочного хедхантинга на CN сервере.",
    "summaryCn": "第七期定向甄选活动，自选心仪的六星与五星干员组合。"
  },
  {
    "id": "banner_limited_headhunting_celebration_sealed_with_time",
    "nameEn": "Sealed With Time (6th Anniversary Celebration)",
    "nameRu": "Sealed With Time (6-я годовщина)",
    "nameCn": "封存岁月 (六周年庆典)",
    "headerTagEn": "[Limited Headhunting - Celebration] Sealed With Time",
    "headerTagRu": "[Limited Headhunting - Celebration] Sealed With Time",
    "headerTagCn": "[Limited Headhunting - Celebration] Sealed With Time",
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
        "avatarUrl": "/avatars/avatar_closure.png"
      },
      {
        "charId": "char_exusiai_the_new_covenant",
        "name": "Exusiai the New Covenant",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_exusiai_the_new_covenant.png"
      },
      {
        "charId": "char_kal_tsit_esperanta",
        "name": "Kal'tsit - Esperanta",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_kal_tsit_esperanta.png"
      },
      {
        "charId": "char_lappland_the_decadenza",
        "name": "Lappland the Decadenza",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_lappland_the_decadenza.png"
      },
      {
        "charId": "char_wi_adel",
        "name": "Wiš'adel",
        "rarity": 6,
        "avatarUrl": "/avatars/avatar_wi_adel.png"
      }
    ],
    "fiveStarOps": [
      {
        "charId": "char_crackborne",
        "name": "Crackborne",
        "rarity": 5,
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
        "nameRu": "Запись боя (T4)",
        "nameCn": "高级作战记录",
        "count": 200,
        "costPerItem": 4,
        "tokenType": "anniv_token"
      },
      {
        "itemId": "30023",
        "nameEn": "Sugar Pack",
        "nameRu": "Пачка сахара",
        "nameCn": "糖组",
        "count": 30,
        "costPerItem": 15,
        "tokenType": "anniv_token"
      },
      {
        "itemId": "30073",
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
        "itemId": "30023",
        "itemNameEn": "Sugar Pack",
        "itemNameRu": "Пачка сахара",
        "dropRatePercent": 82,
        "apCost": 21,
        "sanityPerItem": 25.6
      },
      {
        "stageCode": "ST-7",
        "itemId": "30073",
        "itemNameEn": "Loxic Kohl",
        "itemNameRu": "Локсиковый коль",
        "dropRatePercent": 80.5,
        "apCost": 21,
        "sanityPerItem": 26.1
      }
    ],
    "summaryEn": "Monumental 6th Anniversary Celebration introducing Closure as an operator and anniversary rate-ups.",
    "summaryRu": "Грандиозная 6-я годовщина игры: дебют Closure в качестве оператора и юбилейные рейты.",
    "summaryCn": "六周年重磅庆典寻访，可露希尔实装及众多经典周年限定干员集结。"
  }
];
