import Dexie, { type Table } from 'dexie';

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

// Оперативник в наличии на аккаунте игрока (импортированный из ArkPRTS / Skland)
export interface UserRosterOperator {
  charId: string;
  elite: number;
  level: number;
  skills: number[];
  masteries: number[];
  modules: Record<string, number>;
  potential?: number;
  favor?: number;
  updatedAt?: string;
}

export class AppDatabase extends Dexie {
  inventory!: Table<UserInventory>;
  plans!: Table<OperatorTargetPlan>;
  roster!: Table<UserRosterOperator>;

  constructor() {
    super('ARKCalcDB');
    this.version(1).stores({
      inventory: 'itemId',
      plans: 'charId'
    });
    this.version(2).stores({
      inventory: 'itemId',
      plans: 'charId',
      roster: 'charId',
    });
  }
}

export const db = new AppDatabase();
