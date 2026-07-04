import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, Trophy, Zap, Shield, Repeat, Shuffle, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getQuestionsByCategory } from "@/data/quiz";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/database/db";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Basic Football Tactics Edu" },
      { name: "description", content: "Test your football tactics knowledge with 100+ offline questions across basics, formations, attacking, defending and transitions." },
    ],
  }),
  component: QuizIndex,
});

const CATS = [
  { id: "basics", title: "Basics", icon: HelpCircle, color: "from-primary/20 to-primary/5", text: "text-primary" },
  { id: "formation", title: "Formation", icon: LayoutGrid, color: "from-accent/30 to-accent/10", text: "text-accent-foreground" },
  { id: "attacking", title: "Attacking", icon: Zap, color: "from-primary/25 to-primary/5", text: "text-primary" },
  { id: "defending", title: "Defending", icon: Shield, color: "from-primary/20 to-muted", text: "text-primary" },
  { id: "transition", title: "Transition", icon: Repeat, color: "from-accent/30 to-primary/10", text: "text-accent-foreground" },
  { id: "mixed", title: "Mixed", icon: Shuffle, color: "from-primary to-primary-glow", text: "text-primary-foreground" },
] as const;

function QuizIndex() {
  const db = getDB();
  const stats = useLiveQuery(
    async () => {
      if (!db) return { taken: 0, best: 0 };
      const all = await db.quiz_results.toArray();
      if (all.length === 0) return { taken: 0, best: 0 };
      return { taken: all.length, best: Math.max(...all.map((r) => r.score)) };
    },
    [],
    { taken: 0, best: 0 },
  );

  return (
    <>
      <PageHeader title="Quiz" subtitle="Test your football IQ" showSettings />

      <div className="card-soft mb-5 flex items-center gap-4 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/25 text-accent-foreground">
          <Trophy size={22} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your record</p>
          <p className="text-sm font-bold">{stats.taken} quizzes taken · Best {stats.best}%</p>
        </div>
      </div>

      <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Choose a category</h2>

      <div className="grid grid-cols-2 gap-3">
        {CATS.map((c) => {
          const count = getQuestionsByCategory(c.id).length;
          const Icon = c.icon;
          return (
            <Link
              key={c.id}
              to="/quiz/$category"
              params={{ category: c.id }}
              className={`card-soft flex flex-col p-4 active:scale-[0.97] transition-transform bg-gradient-to-br ${c.color}`}
            >
              <Icon size={26} strokeWidth={2.2} className={c.text} />
              <p className="mt-3 font-bold">{c.title}</p>
              <p className="text-[11px] text-muted-foreground">{count} questions</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
