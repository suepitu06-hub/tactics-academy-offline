import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/database/db";
import { LESSONS } from "@/data/lessons";
import { calculateXP, calculateLevel, todayKey } from "@/utils";
import type { ProgressStats } from "@/types";

export function useProgress(): ProgressStats {
  const db = getDB();

  const completed = useLiveQuery(
    async () => (db ? await db.lessons_progress.filter((p) => p.completed).count() : 0),
    [],
    0,
  );
  const bookmarks = useLiveQuery(
    async () => {
      if (!db) return 0;
      const [a, b, c] = await Promise.all([
        db.lessons_progress.filter((p) => p.bookmarked).count(),
        db.formation_bookmarks.count(),
        db.dictionary_bookmarks.count(),
      ]);
      return a + b + c;
    },
    [],
    0,
  );
  const quizStats = useLiveQuery(
    async () => {
      if (!db) return { taken: 0, avg: 0 };
      const all = await db.quiz_results.toArray();
      if (all.length === 0) return { taken: 0, avg: 0 };
      const avg = Math.round(all.reduce((s, r) => s + r.score, 0) / all.length);
      return { taken: all.length, avg };
    },
    [],
    { taken: 0, avg: 0 },
  );
  const streak = useLiveQuery(
    async () => {
      if (!db) return { current: 0, longest: 0 };
      const rows = await db.streaks.orderBy("date").toArray();
      const days = rows.map((r) => r.date);
      let longest = 0, run = 0, prev: string | null = null;
      for (const d of days) {
        if (!prev) run = 1;
        else {
          const p = new Date(prev);
          const c = new Date(d);
          const diff = Math.round((c.getTime() - p.getTime()) / 86400000);
          run = diff === 1 ? run + 1 : 1;
        }
        longest = Math.max(longest, run);
        prev = d;
      }
      // current streak: does it end today or yesterday?
      let current = 0;
      const today = todayKey();
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
      if (prev === today || prev === yesterday) current = run;
      return { current, longest };
    },
    [],
    { current: 0, longest: 0 },
  );

  const lessonsCompleted = completed ?? 0;
  const totalLessons = LESSONS.length;
  const quizzesTaken = quizStats?.taken ?? 0;
  const quizAverage = quizStats?.avg ?? 0;
  const bm = bookmarks ?? 0;
  const xp = calculateXP(lessonsCompleted, quizzesTaken, quizAverage);
  const level = calculateLevel(xp);

  return {
    lessonsCompleted,
    totalLessons,
    quizzesTaken,
    quizAverage,
    bookmarks: bm,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
    xp,
    level,
  };
}

export async function markStreak() {
  const db = getDB();
  if (!db) return;
  const today = todayKey();
  const existing = await db.streaks.where("date").equals(today).first();
  if (!existing) await db.streaks.add({ date: today });
}
