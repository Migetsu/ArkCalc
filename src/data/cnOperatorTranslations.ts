export interface CNOperatorTranslation {
  talents?: {
    name?: string;
    description?: string;
  }[];
  quote?: string;
  trait?: string;
}

export const CN_OPERATOR_TRANSLATIONS: Record<string, CNOperatorTranslation> = {
  // Astgenne the Lightchaser (Angelina Alter)
  char_1047_halo2: {
    talents: [
      {
        name: 'Floating Above the Earth',
        description:
          "Astgenne's attacks deal additional Arts damage equal to 30% (+5%) of ATK, increased to 45% (+10%) against lighter enemies (weight ≤ 3); While airborne, causes enemies within attack range to become Weightless.",
      },
      {
        name: 'Dance in the Heavens',
        description:
          'When deployed, all airborne allied operators gain +18% (+5%) ATK and restore 10% (+2%) max HP per second while blocking.',
      },
    ],
    quote: 'When you need her, she will surely ride the wind back to your side.',
    trait: 'Controls a floating Drone to attack enemies; Drone damage increases the longer it attacks the same target.',
  },

  // Ulpianus
  char_1038_ulpian: {
    talents: [
      {
        name: 'Surging Tide',
        description:
          'When deployed, Abyssal Hunters gain +18% (+3%) Max HP and +20% (+3%) ATK. Reduces damage taken from Seaborn enemies by 30%.',
      },
      {
        name: 'Anchor of the Abyss',
        description:
          'Attacks ignore 250 DEF. Defeating an enemy grants +2 SP and restores 10% Max HP.',
      },
    ],
    quote: 'Even in the deepest trench, the light of reason never extinguishes.',
  },

  // Pepe
  char_1037_pepe: {
    talents: [
      {
        name: 'Dancing Hammer',
        description:
          'When attacking, has a 25% chance to increase ATK to 180% and Stun the target for 1.5 seconds.',
      },
      {
        name: 'Golden Scepter',
        description:
          'Gains +15% ATK and +15 ASPD when blocking enemies. Takes 15% less Physical damage.',
      },
    ],
    quote: 'The golden sands remember every beat of joy and courage.',
  },

  // Marcille
  char_1039_marcil: {
    talents: [
      {
        name: 'Ancient Sorcery',
        description:
          'Normal attacks deal Splash Arts damage. Attacks against dungeon monsters or beasts deal +35% damage.',
      },
      {
        name: 'Dungeon Gourmet',
        description:
          'When deployed, all allies recover +0.2 SP per second and gain +10% Max HP.',
      },
    ],
    quote: 'Food is the staff of life, even in the darkest depths of the labyrinth.',
  },

  // Lappland the Decadenza
  char_1041_lappd2: {
    talents: [
      {
        name: 'Wolf Pack Carnival',
        description:
          'Attacks summon phantom wolf blades, dealing Arts damage and inflicting Necrosis damage. Silences special abilities of targets.',
      },
      {
        name: 'Echoes of Syracuse',
        description:
          'When an enemy in range is defeated, increases ATK by +5% (stacks up to 6 times) and gains +10 ASPD.',
      },
    ],
    quote: 'The music never ends in Syracuse. Dance with me until the dawn breaks.',
  },

  // Lemuen
  char_1042_lemuen: {
    talents: [
      {
        name: 'Holy Light Trajectory',
        description:
          'Ranged attacks mark enemy weak points. Marked targets take +20% Arts and Physical damage from all allies.',
      },
      {
        name: 'Wheelchair Arsenal',
        description:
          'Cannot be Stunned or Frozen. Gains +15% ATK and expanded attack range when skill is not active.',
      },
    ],
    quote: 'Distance is no obstacle for faith and a calibrated scope.',
  },

  // Narantuya
  char_1033_narant: {
    talents: [
      {
        name: 'Wind of the Steppe',
        description:
          'Attacks ignore 15% of physical defense; Attacks against targets with low defense deal critical damage.',
      },
      {
        name: 'Skyward Hunt',
        description:
          'Priority attacks aerial targets. Deals +30% damage to aerial targets.',
      },
    ],
    quote: 'The arrows of the steppe seek the wind and never miss their prey.',
  },

  // Civilight Eterna
  char_1034_monstr: {
    talents: [
      {
        name: 'Memory of Theresa',
        description:
          'Allies in attack range receive True damage mitigation and continuous HP regeneration equal to 7% of ATK.',
      },
      {
        name: 'Crown of Babel',
        description:
          'Babel and Kazdel operators gain +10% ATK and +15% DEF when deployed.',
      },
    ],
    quote: 'A civilization that endures is one that remembers every soul.',
  },

  // Wiš'del
  char_1035_wisdel: {
    talents: [
      {
        name: 'Resonating Remnant',
        description:
          'Attacks trigger explosive chain detonations, dealing massive Physical damage and summoning soul shadows to block enemies.',
      },
      {
        name: 'Living Legend',
        description:
          'When deployed, summons wandering souls to scout and inflict Burn damage on contact.',
      },
    ],
    quote: 'I carry every ghost from Kazdel, and none of them will let us fall.',
  },

  // Logos
  char_1036_logos: {
    talents: [
      {
        name: 'Word of Doom',
        description:
          'Attacks simultaneously strike up to 3 targets with Arts damage, continuously shredding their RES by 10% (stacks up to 30%).',
      },
      {
        name: 'Gargoyle Constitution',
        description:
          'Reduces incoming Arts damage by 25% and absorbs projectile attacks from enemy casters.',
      },
    ],
    quote: 'Words carved in bone outlive the empire that spoke them.',
  },

  // Snegurochka (Winter Time)
  char_4208_wintim: {
    talents: [
      {
        name: 'Winter Breath',
        description:
          'Attacks inflict Cold status on enemies. Frozen enemies take +25% Arts damage.',
      },
    ],
    quote: 'Snowflakes carry the quiet warmth of a frozen homeland.',
  },
};
