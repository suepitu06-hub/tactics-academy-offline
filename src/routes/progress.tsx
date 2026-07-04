import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import { ACHIEVEMENTS } from "@/data/achievements";
import { xpForNextLevel, calculateProgress } from "@/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Basic Football Tactics Edu" },
      { name: "description", content: "Track lessons completed, quiz averages, streaks, XP, level and achievements." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const s = useProgress();
  const pct = calculateProgress(s.lessonsCompleted, s.totalLessons);
  const nextXP = xpForNextLevel(s.level);

  return (
    <>
      <PageHeader title="Progress" subtitle="Your learning journey" showSettings />

      <section className="card-soft mb-4 overflow-hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary-glow p-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Level</p>
              <p className="text-4xl font-black">{s.level}</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Icons.Trophy size={30} />
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs opacity-90">
              <span>{s.xp} XP</span>
              <span>{nextXP} XP</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (s.xp / nextXP) * 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard icon="BookOpenCheck" label="Lessons" value={`${s.lessonsCompleted}/${s.totalLessons}`} accent />
        <StatCard icon="Target" label="Quiz average" value={`${s.quizAverage}%`} />
        <StatCard icon="Bookmark" label="Bookmarks" value={s.bookmarks} />
        <StatCard icon="Flame" label="Current streak" value={`${s.currentStreak}d`} />
        <StatCard icon="Zap" label="Longest streak" value={`${s.longestStreak}d`} />
        <StatCard icon="HelpCircle" label="Quizzes taken" value={s.quizzesTaken} />
      </div>

      <div className="card-soft mb-4 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Learning progress</p>
        <p className="mt-1 text-2xl font-black">{pct}%</p>
        <ProgressBar value={pct} className="mt-3" />
      </div>

      <h2 className="mb-3 mt-6 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Achievements</h2>
      <div className="grid grid-cols-3 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.requirement(s);
          const Icon = (Icons as any)[a.icon] ?? Icons.Award;
          return (
            <div
              key={a.id}
              className={
                "card-soft flex flex-col items-center gap-1.5 p-3 text-center " +
                (unlocked ? "" : "opacity-40 grayscale")
              }
              title={a.description}
            >
              <div
                className={
                  "grid h-11 w-11 place-items-center rounded-full " +
                  (unlocked ? "bg-gradient-to-br from-accent to-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                }
              >
                <Icon size={20} />
              </div>
              <p className="text-[10px] font-bold leading-tight">{a.title}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/bookmarks" className="card-soft flex items-center gap-3 p-4">
          <Icons.Bookmark size={22} className="text-accent-foreground" />
          <div><p className="text-sm font-bold">Bookmarks</p></div>
        </Link>
        <Link to="/settings" className="card-soft flex items-center gap-3 p-4">
          <Icons.Settings size={22} className="text-primary" />
          <div><p className="text-sm font-bold">Settings</p></div>
        </Link>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string | number; accent?: boolean }) {
  const Icon = (Icons as any)[icon] ?? Icons.Circle;
  return (
    <div className="card-soft p-3">
      <div className={"mb-2 inline-grid h-8 w-8 place-items-center rounded-lg " + (accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
