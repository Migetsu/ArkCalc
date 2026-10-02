/**
 * Complete English and Russian translations for all CN-exclusive Operator Skills
 * Eliminates all Chinese characters from skill tabs, skill headers, and skill descriptions.
 */

export interface SkillTranslationEntry {
  en: string;
  ru: string;
}

export const CN_SKILL_DATABASE: Record<string, SkillTranslationEntry> = {
  // Angelina the Mellow Wish
  'skchr_aglna2_1': { en: 'Fast Delivery', ru: 'Быстрая доставка' },
  'skchr_aglna2_2': { en: 'Custom Gravity', ru: 'Пользовательская гравитация' },
  'skchr_aglna2_3': { en: "Lime's Secret", ru: 'Секрет Лайма' },

  // SilverAsh the Reignfrost
  'skchr_svash2_1': { en: 'Tactical Maneuver', ru: 'Тактический манёвр' },
  'skchr_svash2_2': { en: 'Glacial Edge', ru: 'Ледниковое остриё' },
  'skchr_svash2_3': { en: 'Era of Change', ru: 'Эра перемен' },

  // Closure
  'skchr_closur_1': { en: 'Recursive Logic', ru: 'Рекурсивная логика' },
  'skchr_closur_2': { en: 'Model Expansion', ru: 'Расширение модели' },
  'skchr_closur_3': { en: 'Q.E.D.', ru: 'Что и требовалось доказать' },

  // Ch'en the Dawnstreak
  'skchr_chen3_1': { en: 'Chi Xiao: Nightfall', ru: 'Чи Сяо: Ночной рывок' },
  'skchr_chen3_2': { en: 'Chi Xiao: Shadowless', ru: 'Чи Сяо: Бестеневой след' },
  'skchr_chen3_3': { en: 'Chi Xiao: Heaven Sigh', ru: 'Чи Сяо: Вздох небес' },

  // Zima the Raging Tide
  'skchr_headb2_1': { en: 'Never Bow Down', ru: 'Не склонять головы' },
  'skchr_headb2_2': { en: 'Relentless Wrath', ru: 'Неумолимый гнев' },
  'skchr_headb2_3': { en: 'Unstoppable Force', ru: 'Неудержимая сила' },

  // Hoshiguma the Breacher
  'skchr_hsgma2_1': { en: 'Bitter Karma', ru: 'Горькая карма' },
  'skchr_hsgma2_2': { en: 'Primordial Darkness', ru: 'Изначальная тьма' },
  'skchr_hsgma2_3': { en: 'Aspect of the Abyss', ru: 'Облик преисподней' },

  // Pramanix the Prerita
  'skchr_sbell2_1': { en: 'Bell of Blizzard', ru: 'Колокол бурана' },
  'skchr_sbell2_2': { en: 'Frostfall Crest', ru: 'Морозная вершина' },
  'skchr_sbell2_3': { en: 'Bowing Peaks', ru: 'Поклон гор' },

  // Leizi the Thunderbringer
  'skchr_leizi2_1': { en: 'Enduring Spirit', ru: 'Неугасимый дух' },
  'skchr_leizi2_2': { en: 'Thunderous Majesty', ru: 'Громовое величие' },
  'skchr_leizi2_3': { en: 'Illuminated Realm', ru: 'Озарённое царство' },

  // Kal'tsit·Esperanta
  'skchr_kalts2_1': { en: 'Emergency Defense Line', ru: 'Экстренный рубеж обороны' },
  'skchr_kalts2_2': { en: 'Protective Denial', ru: 'Защитный запрет' },
  'skchr_kalts2_3': { en: 'Unshackled Rebirth', ru: 'Возрождение без оков' },

  // Astgenne the Lightchaser
  'skchr_halo2_1': { en: 'Star Chart Flickering', ru: 'Мерцание звёздной карты' },
  'skchr_halo2_2': { en: 'Starlight Gravity', ru: 'Гравитация звёздного луча' },
  'skchr_halo2_3': { en: 'Confluent Chain', ru: 'Слитная цепь' },

  // Perfumer the Distilled
  'skchr_flwr2_1': { en: 'Joy of the Mountain', ru: 'Радость горы' },
  'skchr_flwr2_2': { en: 'Embers of the Shrine', ru: 'Пепел святилища' },

  // Violet Mizutsune Orchid
  'skchr_orchd2_1': { en: 'Power Shot', ru: 'Силовой выстрел' },
  'skchr_orchd2_2': { en: 'Aerial Rapid Fire', ru: 'Воздушный залп' },
  'skchr_orchd2_3': { en: "Dragon's Arrow", ru: 'Стрела дракона' },

  // Zinogre S Catapult
  'skchr_catap2_1': { en: 'High-Pressure Slash', ru: 'Рассечение высокого давления' },
  'skchr_catap2_2': { en: 'Ultra Amped Discharge', ru: 'Сверхзаряженный высвободитель' },

  // Ulpianus
  'skchr_ulpian_1': { en: 'Deep Sea Surge', ru: 'Глубинный прилив' },
  'skchr_ulpian_2': { en: 'Abyssal Cleave', ru: 'Бездненный рассекатель' },
  'skchr_ulpian_3': { en: 'Tide of Leviathan', ru: 'Прилив Левиафана' },

  // Narantuya
  'skchr_narant_1': { en: 'Swift Gale', ru: 'Быстрый шквал' },
  'skchr_narant_2': { en: 'Desert Whirlwind', ru: 'Вихрь пустыни' },
  'skchr_narant_3': { en: 'Storm of Endless Sands', ru: 'Буря бесконечных песков' },

  // Pepe
  'skchr_pepe_1': { en: 'Heavy Hammer', ru: 'Тяжёлый молот' },
  'skchr_pepe_2': { en: 'Golden Bash', ru: 'Золотой сокрушитель' },
  'skchr_pepe_3': { en: 'Dance of the Pharaoh', ru: 'Танец Фараона' },

  // Wiš'adel
  'skchr_wisad_1': { en: 'Spiteful Bloom', ru: 'Цветок злобы' },
  'skchr_wisad_2': { en: 'Soul Ignition', ru: 'Воспламенение душ' },
  'skchr_wisad_3': { en: 'Manifestation of Despair', ru: 'Воплощение отчаяния' },

  // Logos
  'skchr_logos_1': { en: 'Word of Decree', ru: 'Слово указа' },
  'skchr_logos_2': { en: 'Inscribed Resonance', ru: 'Начертанный резонанс' },
  'skchr_logos_3': { en: 'Final Elegy', ru: 'Финальная элегия' },

  // Lappland the Decadenza
  'skchr_lappd2_1': { en: 'Soul Tether', ru: 'Привязка душ' },
  'skchr_lappd2_2': { en: "Wolf's Verdict", ru: 'Вердикт волка' },
  'skchr_lappd2_3': { en: 'Carnival of Lunacy', ru: 'Карнавал безумия' },

  // Makoto Yuki
  'skchr_makoto_1': { en: "Orpheus's Harp", ru: 'Арфа Орфея' },
  'skchr_makoto_2': { en: 'Chains of Thanatos', ru: 'Оковы Танатоса' },
  'skchr_makoto_3': { en: 'Blade of Tomorrow', ru: 'Клинок завтрашнего дня' },

  // Aegis
  'skchr_aigis_1': { en: 'Orgía Mode', ru: 'Режим Оргии' },
  'skchr_aigis_2': { en: 'All-Out Fire', ru: 'Шквальный огонь' },

  // Yukari Takeba
  'skchr_yukari_1': { en: 'Cyclone Arrow', ru: 'Стрела циклона' },
  'skchr_yukari_2': { en: 'Clear Mind, Calm Water', ru: 'Чистый разум' },

  // Wang
  'skchr_wang_1': { en: 'Positioning Momentum', ru: 'Набор темпа' },
  'skchr_wang_2': { en: 'Connecting Stars', ru: 'Созвездие' },
  'skchr_wang_3': { en: 'Calamity of the Realm', ru: 'Бедствие поднебесной' },

  // Mantra
  'skchr_mantra_1': { en: 'Resonant Collapse', ru: 'Резонансный коллапс' },
  'skchr_mantra_2': { en: 'Synaptic Link', ru: 'Синаптическая связь' },
  'skchr_mantra_3': { en: 'Truth in Silence', ru: 'Истина в тишине' },

  // Veen (Вий)
  'skchr_veen_1': { en: 'From the Call', ru: 'Из зова' },
  'skchr_veen_2': { en: 'Washed in Blood', ru: 'Омытый кровью' },
  'skchr_veen_3': { en: 'Inscribed in Iron', ru: 'Высеченный в железе' },

  // Aphrissa
  'skchr_aphris_1': { en: 'Continuous Mapping', ru: 'Непрерывное отображение' },
  'skchr_aphris_2': { en: 'Critical Detonation', ru: 'Критическая детонация' },
  'skchr_aphris_3': { en: 'Essence of Chaos', ru: 'Суть хаоса' },

  // Mechanist
  'skchr_mcnist_1': { en: 'Cluster Analysis', ru: 'Кластерный анализ' },
  'skchr_mcnist_2': { en: 'Defense Coordination', ru: 'Координация обороны' },
  'skchr_mcnist_3': { en: 'Engineering Cross', ru: 'Инженерный крест' },

  // Bellone
  'skchr_demetr_1': { en: "Patriarch's Poise", ru: 'Выдержка патриарха' },
  'skchr_demetr_2': { en: "Strategist's Gambit", ru: 'Гамбит стратега' },
  'skchr_demetr_3': { en: 'Reckoning', ru: 'Расплата' },

  // Togawa Sakiko
  'skchr_oblvns_1': { en: 'Awakening of Crescent Moon', ru: 'Пробуждение полумесяца' },
  'skchr_oblvns_2': { en: 'Ball of the Full Moon', ru: 'Бал полнолуния' },
  'skchr_oblvns_3': { en: 'Echo of the Waning Moon', ru: 'Эхо убывающей луны' },

  // Thumpy
  'skchr_thumpy_1': { en: 'Not Leaving Yet?', ru: 'Ещё не уходишь?' },
  'skchr_thumpy_2': { en: 'Take Your Time~', ru: 'Не торопись~' },
  'skchr_thumpy_3': { en: 'Halt Right There!', ru: 'Стоять на месте!' },

  // Titi
  'skchr_titi_1': { en: 'Corrosion Delay', ru: 'Замедление коррозии' },
  'skchr_titi_2': { en: 'Protective Seal', ru: 'Защитная печать' },
  'skchr_titi_3': { en: 'Blooming Days', ru: 'Дни расцвета' },

  // Nasti
  'skchr_nasti_1': { en: 'Guarding', ru: 'Охранение' },
  'skchr_nasti_2': { en: 'Executing', ru: 'Исполнение' },
  'skchr_nasti_3': { en: 'Sanctuary Foothold', ru: 'Оплот убежища' },

  // Haruka
  'skchr_haruka_1': { en: 'Night Chirp Feather', ru: 'Перо ночной птицы' },
  'skchr_haruka_2': { en: 'Chasm Firefly', ru: 'Светляк ущелья' },
  'skchr_haruka_3': { en: 'Late Summer Shimmer', ru: 'Мерцание лета' },

  // Raidian
  'skchr_radian_1': { en: 'Rhythm Line', ru: 'Линия ритма' },
  'skchr_radian_2': { en: 'Ring Scale Field', ru: 'Чешуйчатое кольцо' },
  'skchr_radian_3': { en: 'Hand in Hand', ru: 'Рука об руку' },

  // Akkord
  'skchr_akkord_1': { en: 'Off-beat Accent', ru: 'Синкопированный акцент' },
  'skchr_akkord_2': { en: 'Shock Tuning', ru: 'Ударная настройка' },

  // Снегурочка
  'skchr_wintim_1': { en: 'Data Analysis', ru: 'Анализ данных' },
  'skchr_wintim_2': { en: 'Causal Attribution', ru: 'Причинный вывод' },

  // Matsukiri
  'skchr_makiri_1': { en: 'Entrance Arrangement', ru: 'Входной порядок' },
  'skchr_makiri_2': { en: 'Masterful Gambits', ru: 'Мастерский гамбит' },

  // Jacinta
  'skchr_jcinta_1': { en: 'Support Command: Type γ', ru: 'Команда поддержки: Тип γ' },
  'skchr_jcinta_2': { en: 'Shade Under Umbrella', ru: 'Тень под зонтом' },

  // Varkáris
  'skchr_varkis_1': { en: 'Torrents', ru: 'Стремительный поток' },
  'skchr_varkis_2': { en: 'Will of the Kin', ru: 'Воля собратьев' },

  // Yūtenji Nyamu
  'skchr_amoris_1': { en: 'Fierce as Flame', ru: 'Пылкий как пламя' },
  'skchr_amoris_2': { en: 'Flourish like Wheat', ru: 'Цветущий как нива' },

  // Hadiya
  'skchr_hadiya_1': { en: 'Desert Tactics', ru: 'Тактика пустыни' },
  'skchr_hadiya_2': { en: 'Blade Horn Edge', ru: 'Остриё рога' },

  // Kichisei
  'skchr_kichi_1': { en: 'Welcome In!', ru: 'Добро пожаловать!' },
  'skchr_kichi_2': { en: 'Lucky Stars Shining!', ru: 'Счастливая звезда!' },

  // Skybox
  'skchr_skybx_1': { en: 'Originium Gunpowder', ru: 'Ориджиниевый порох' },
  'skchr_skybx_2': { en: 'EMP Grace', ru: 'Электромагнитная благодать' },

  // Ripresa
  'skchr_liesel_1': { en: 'Ensemble Downbeat', ru: 'Вступление ансамбля' },
  'skchr_liesel_2': { en: 'Until Finale', ru: 'До финала' },

  // Timeslot
  'skchr_tmslot_1': { en: 'ATK Up: Type γ', ru: 'Усиление атаки: Тип γ' },
  'skchr_tmslot_2': { en: 'Tech & Tradition', ru: 'Технологии и традиции' },

  // Record Keeper
  'skchr_reckpr_1': { en: 'Analogy Insight', ru: 'Озарение по аналогии' },
  'skchr_reckpr_2': { en: 'Key Mechanism', ru: 'Ключевой механизм' },

  // Укусик (Turdus)
  'skchr_turdus_1': { en: 'Fire Tong Spell', ru: 'Заклятье щипцов' },
  'skchr_turdus_2': { en: 'Hide and Seek!', ru: 'Прятки!' },

  // Taraxacum
  'skchr_taraxa_1': { en: 'Where to Land', ru: 'Где приземлиться' },
  'skchr_taraxa_2': { en: 'Riding the Wind', ru: 'По ветру' },

  // Веточки (Branch)
  'skchr_branch_1': { en: 'Desperate Stand', ru: 'Отчаянное сопротивление' },
  'skchr_branch_2': { en: 'Will to Survive', ru: 'Воля к жизни' },

  // Crackborne
  'skchr_tanya_1': { en: 'Purification', ru: 'Очищение' },
  'skchr_tanya_2': { en: 'Collapse', ru: 'Прорыв' },

  // Ju
  'skchr_ju_1': { en: 'Unstrung Bow', ru: 'Тугая тетива' },
  'skchr_ju_2': { en: 'Flightless Wing', ru: 'Отяжелевшее крыло' },

  // Snow Hunter
  'skchr_snhunt_1': { en: 'Power Strike: Type β', ru: 'Мощный удар: Тип β' },
  'skchr_snhunt_2': { en: 'Blizzard Crossbow', ru: 'Вьюжный арбалет' },

  // Misumi Uika
  'skchr_dolris_1': { en: 'What I Yearn For', ru: 'То, по чему тоскую' },
  'skchr_dolris_2': { en: 'What I Pity', ru: 'То, кого жалею' },

  // Ботани (Botany)
  'skchr_botany_1': { en: 'Harmonic Rupture', ru: 'Гармонический разрыв' },
  'skchr_botany_2': { en: 'Quiet Domain Echo', ru: 'Эхо тихой зоны' },

  // Pedro
  'skchr_pedro_1': { en: 'Marked Shot', ru: 'Прицельная метка' },
  'skchr_pedro_2': { en: 'Relay Evacuation', ru: 'Поочерёдная эвакуация' },

  // Yahata Umiri
  'skchr_tmoris_1': { en: 'Trembling String', ru: 'Дрожащая струна' },
  'skchr_tmoris_2': { en: 'Place of Void', ru: 'Обитель пустоты' },

  // Wakaba Mutsumi
  'skchr_mortis_1': { en: 'Multi-headed Beast', ru: 'Многоглавый зверь' },
  'skchr_mortis_2': { en: 'Destruction & Nurture', ru: 'Разрушение и питание' },

  // Cairn
  'skchr_cairn_1': { en: 'Coverage Rest', ru: 'Укрывающий привал' },
  'skchr_cairn_2': { en: 'Concussive Guidance', ru: 'Ударная наводка' }
};

/**
 * Returns translated skill name or clean fallback
 */
export function getCNSkillTranslation(skillId: string, lang: 'en' | 'ru' = 'en'): string | null {
  const entry = CN_SKILL_DATABASE[skillId];
  if (!entry) return null;
  return lang === 'ru' ? entry.ru : entry.en;
}
