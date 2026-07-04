import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import * as Icons from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { LESSONS } from "@/data/lessons";
import { getDB } from "@/database/db";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { calculateProgress } from "@/utils";
import { useProgress } from "@/hooks/useProgress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learn — Basic Football Tactics Edu" },
      { name: "description", content: "Browse football tactics learning categories: basics, passing, attacking, defending, set pieces and more." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const stats = useProgress();
  const db = getDB();

  const perCategory = useLiveQuery(
    async () => {
      const map = new Map<string, number>();
      if (!db) return map;
      const completed = await db.lessons_progress.filter((p) => p.completed).toArray();
      const done = new Set(completed.map((p) => p.lessonId));
      for (const c of CATEGORIES) {
        const total = LESSONS.filter((l) => l.category === c.id).length;
        const doneCount = LESSONS.filter((l) => l.category === c.id && done.has(l.id)).length;
        map.set(c.id, total === 0 ? 0 : Math.round((doneCount / total) * 100));
      }
      return map;
    },
    [],
    new Map<string, number>(),
  );

  const totalPct = calculateProgress(stats.lessonsCompleted, stats.totalLessons);

  return (
    <>
      <PageHeader title="Learn" subtitle="Football tactics, step by step" showSearch showSettings />

      <section className="card-soft mb-5 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Your progress</p>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black">{totalPct}%</p>
              <p className="text-xs opacity-90">{stats.lessonsCompleted} of {stats.totalLessons} lessons</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">Level</p>
              <p className="text-2xl font-black">{stats.level}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${totalPct}%` }} />
          </div>
        </div>
      </section>

      <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h2>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = (Icons as any)[c.icon] ?? Icons.BookOpen;
          const count = LESSONS.filter((l) => l.category === c.id).length;
          const pct = perCategory?.get(c.id) ?? 0;
          return (
            <Link
              key={c.id}
              to="/category/$id"
              params={{ id: c.id }}
              className="card-soft group flex flex-col p-4 transition-transform active:scale-[0.97]"
            >
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-sm font-bold leading-tight">{c.title}</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{count} lessons</p>
              <div className="mt-3">
                <ProgressBar value={pct} label={`${c.title} progress`} />
                <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{pct}%</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/bookmarks" className="card-soft flex items-center gap-3 p-4 active:scale-[0.97] transition-transform">
          <Icons.Bookmark size={22} className="text-accent-foreground" />
          <div>
            <p className="text-sm font-bold">Bookmarks</p>
            <p className="text-[11px] text-muted-foreground">Saved items</p>
          </div>
        </Link>
        <Link to="/search" className="card-soft flex items-center gap-3 p-4 active:scale-[0.97] transition-transform">
          <Icons.Search size={22} className="text-primary" />
          <div>
            <p className="text-sm font-bold">Search</p>
            <p className="text-[11px] text-muted-foreground">Everything, offline</p>
          </div>
        </Link>
      </div>
    </>
  );
}
