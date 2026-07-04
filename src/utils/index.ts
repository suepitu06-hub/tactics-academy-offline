import { LESSONS } from "@/data/lessons";
import { DICTIONARY } from "@/data/dictionary";
import { FORMATIONS } from "@/data/formations";
import type { ProgressStats } from "@/types";

export function calculateProgress(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function calculateXP(lessonsCompleted: number, quizzesTaken: number, quizAverage: number) {
  return lessonsCompleted * 20 + quizzesTaken * 15 + Math.round(quizAverage * 0.5);
}

export function calculateLevel(xp: number) {
  // 100 xp = level up, curve slightly
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpForNextLevel(level: number) {
  return Math.pow(level, 2) * 50;
}

export function searchLessons(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LESSONS.filter(
    (l) => l.title.toLowerCase().includes(q) || l.explanation.toLowerCase().includes(q) || l.category.toLowerCase().includes(q),
  ).slice(0, 20);
}

export function searchDictionary(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DICTIONARY.filter(
    (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
  ).slice(0, 20);
}

export function filterFormation(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return FORMATIONS;
  return FORMATIONS.filter(
    (f) => f.name.toLowerCase().includes(q) || f.style.toLowerCase().includes(q),
  );
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function motivationMessage(percent: number) {
  if (percent === 100) return "Perfect! You are a football tactics master.";
  if (percent >= 80) return "Excellent work — you clearly know the game.";
  if (percent >= 60) return "Solid effort. Keep going and you'll master it.";
  if (percent >= 40) return "Not bad — review the lessons and try again.";
  return "Every expert starts here. Review and try again!";
}

export function difficultyColor(d: string) {
  if (d === "Beginner") return "text-success";
  if (d === "Intermediate") return "text-accent-foreground";
  return "text-destructive";
}

export function difficultyBg(d: string) {
  if (d === "Beginner") return "bg-success/15 text-success";
  if (d === "Intermediate") return "bg-accent/25 text-accent-foreground";
  return "bg-destructive/15 text-destructive";
}

export type { ProgressStats };
