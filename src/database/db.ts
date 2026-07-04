import Dexie, { type Table } from "dexie";

export interface LessonProgress {
  id?: number;
  lessonId: string;
  completed: boolean;
  bookmarked: boolean;
  lastRead: number;
}

export interface QuizResult {
  id?: number;
  category: string;
  score: number;
  correct: number;
  wrong: number;
  total: number;
  timeSeconds: number;
  date: number;
}

export interface FormationBookmark {
  id?: number;
  formationId: string;
  date: number;
}

export interface DictionaryBookmark {
  id?: number;
  termId: string;
  date: number;
}

export interface AppSetting {
  key: string;
  value: string;
}

export interface StreakRecord {
  id?: number;
  date: string; // YYYY-MM-DD
}

class FootballTacticsDB extends Dexie {
  lessons_progress!: Table<LessonProgress, number>;
  quiz_results!: Table<QuizResult, number>;
  formation_bookmarks!: Table<FormationBookmark, number>;
  dictionary_bookmarks!: Table<DictionaryBookmark, number>;
  settings!: Table<AppSetting, string>;
  streaks!: Table<StreakRecord, number>;

  constructor() {
    super("football_tactics_db");
    this.version(1).stores({
      lessons_progress: "++id, &lessonId, completed, bookmarked",
      quiz_results: "++id, category, date",
      formation_bookmarks: "++id, &formationId",
      dictionary_bookmarks: "++id, &termId",
      settings: "&key",
      streaks: "++id, &date",
    });
  }
}

let _db: FootballTacticsDB | null = null;

export function getDB(): FootballTacticsDB | null {
  if (typeof window === "undefined") return null;
  if (!_db) _db = new FootballTacticsDB();
  return _db;
}
