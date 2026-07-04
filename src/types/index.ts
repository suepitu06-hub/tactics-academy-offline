export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  readingTime: number; // minutes
  illustration: "field" | "arrow" | "shield" | "target" | "users" | "zap";
  explanation: string;
  tips: string[];
  summary: string;
  example: string;
  keyPoints: string[];
}

export interface LessonCategory {
  id: string;
  title: string;
  icon: string; // lucide name
  description: string;
}

export interface FormationPlayer {
  role: string; // GK, CB, LB, RB, CM, LM, RM, ST, LW, RW, CAM, CDM
  x: number; // 0-100
  y: number; // 0-100 (0 = attack top, 100 = defense bottom)
}

export interface Formation {
  id: string;
  name: string;
  difficulty: Difficulty;
  style: string;
  advantages: string[];
  disadvantages: string[];
  bestAgainst: string;
  bestFor: string;
  explanation: string;
  players: FormationPlayer[];
}

export type QuizCategory = "basics" | "formation" | "attacking" | "defending" | "transition" | "mixed";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  type: "mcq" | "truefalse" | "match" | "scenario";
  question: string;
  answers: string[];
  correct: number; // index
  explanation: string;
}

export interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  example: string;
  related: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (stats: ProgressStats) => boolean;
}

export interface ProgressStats {
  lessonsCompleted: number;
  totalLessons: number;
  quizzesTaken: number;
  quizAverage: number;
  bookmarks: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
}
