import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Bookmark, CheckCircle2, Clock, ArrowRight, Lightbulb, ListChecks, Sparkles } from "lucide-react";
import { getLesson, LESSONS } from "@/data/lessons";
import { CATEGORIES } from "@/data/categories";
import { getDB } from "@/database/db";
import { PageHeader } from "@/components/PageHeader";
import { FootballField } from "@/components/svg/FootballField";
import { difficultyBg } from "@/utils";
import { markStreak } from "@/hooks/useProgress";

export const Route = createFileRoute("/lesson/$id")({
  loader: ({ params }) => {
    const lesson = getLesson(params.id);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.lesson.title} — Lesson` : "Lesson" },
      { name: "description", content: loaderData?.lesson.summary ?? "Football tactics lesson" },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { lesson } = Route.useLoaderData();
  const navigate = useNavigate();
  const db = getDB();
  const category = CATEGORIES.find((c) => c.id === lesson.category);

  const record = useLiveQuery(
    async () => (db ? await db.lessons_progress.where("lessonId").equals(lesson.id).first() : undefined),
    [lesson.id],
  );

  const nextLesson = (() => {
    const idx = LESSONS.findIndex((l) => l.id === lesson.id);
    return LESSONS[idx + 1];
  })();

  const toggleBookmark = async () => {
    if (!db) return;
    const existing = await db.lessons_progress.where("lessonId").equals(lesson.id).first();
    if (existing) {
      await db.lessons_progress.update(existing.id!, { bookmarked: !existing.bookmarked });
    } else {
      await db.lessons_progress.add({ lessonId: lesson.id, completed: false, bookmarked: true, lastRead: Date.now() });
    }
  };

  const markComplete = async () => {
    if (!db) return;
    const existing = await db.lessons_progress.where("lessonId").equals(lesson.id).first();
    if (existing) {
      await db.lessons_progress.update(existing.id!, { completed: !existing.completed, lastRead: Date.now() });
    } else {
      await db.lessons_progress.add({ lessonId: lesson.id, completed: true, bookmarked: false, lastRead: Date.now() });
    }
    await markStreak();
  };

  const completed = !!record?.completed;
  const bookmarked = !!record?.bookmarked;

  return (
    <>
      <PageHeader
        title={category?.title ?? "Lesson"}
        back={category ? `/category/${category.id}` : "/"}
        right={
          <button
            onClick={toggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
          >
            <Bookmark size={20} className={bookmarked ? "fill-accent text-accent-foreground" : ""} />
          </button>
        }
      />

      <article className="fade-in space-y-5">
        <header>
          <h1 className="text-2xl font-black leading-tight">{lesson.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`chip ${difficultyBg(lesson.difficulty)}`}>{lesson.difficulty}</span>
            <span className="chip"><Clock size={12} /> {lesson.readingTime} min read</span>
          </div>
        </header>

        <div className="card-soft overflow-hidden">
          <FootballField
            players={sampleFieldFor(lesson.illustration)}
            showLabels={false}
            showArrows={lesson.illustration === "arrow"}
            showPassingLines={lesson.illustration === "users"}
          />
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Explanation</h2>
          <p className="text-[15px] leading-relaxed">{lesson.explanation}</p>
        </section>

        <section className="card-soft p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Lightbulb size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Tips</h3>
          </div>
          <ul className="space-y-2">
            {lesson.tips.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Example</h2>
          <p className="rounded-xl bg-muted p-4 text-sm italic">{lesson.example}</p>
        </section>

        <section className="card-soft p-4">
          <div className="mb-2 flex items-center gap-2 text-accent-foreground">
            <ListChecks size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Key points</h3>
          </div>
          <ul className="space-y-2">
            {lesson.keyPoints.map((k: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="shrink-0 text-success" />
                {k}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 p-4">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Sparkles size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Summary</h3>
          </div>
          <p className="text-sm font-semibold">{lesson.summary}</p>
        </section>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={markComplete}
            className={completed ? "btn-outline flex items-center justify-center gap-2 py-3.5" : "btn-primary flex items-center justify-center gap-2 py-3.5"}
          >
            <CheckCircle2 size={18} />
            {completed ? "Completed — undo" : "Mark as complete"}
          </button>
          {nextLesson && (
            <button
              onClick={() => navigate({ to: "/lesson/$id", params: { id: nextLesson.id } })}
              className="btn-outline flex items-center justify-center gap-2 py-3.5"
            >
              Next lesson <ArrowRight size={18} />
            </button>
          )}
        </div>
      </article>
    </>
  );
}

// Small helper: generic diagrams per illustration type
function sampleFieldFor(kind: string) {
  if (kind === "arrow" || kind === "target") {
    return [
      { role: "GK", x: 50, y: 95 },
      { role: "CB", x: 40, y: 78 },
      { role: "CB", x: 60, y: 78 },
      { role: "CM", x: 50, y: 55 },
      { role: "LW", x: 20, y: 30 },
      { role: "ST", x: 50, y: 20 },
      { role: "RW", x: 80, y: 30 },
    ];
  }
  if (kind === "shield") {
    return [
      { role: "GK", x: 50, y: 95 },
      { role: "LB", x: 15, y: 78 }, { role: "CB", x: 38, y: 82 }, { role: "CB", x: 62, y: 82 }, { role: "RB", x: 85, y: 78 },
      { role: "CM", x: 30, y: 60 }, { role: "CDM", x: 50, y: 65 }, { role: "CM", x: 70, y: 60 },
      { role: "LW", x: 25, y: 40 }, { role: "ST", x: 50, y: 35 }, { role: "RW", x: 75, y: 40 },
    ];
  }
  if (kind === "users") {
    return [
      { role: "A", x: 30, y: 55 },
      { role: "B", x: 50, y: 45 },
      { role: "C", x: 70, y: 55 },
    ];
  }
  return [
    { role: "GK", x: 50, y: 95 },
    { role: "LB", x: 15, y: 75 }, { role: "CB", x: 38, y: 78 }, { role: "CB", x: 62, y: 78 }, { role: "RB", x: 85, y: 75 },
    { role: "LM", x: 15, y: 50 }, { role: "CM", x: 40, y: 52 }, { role: "CM", x: 60, y: 52 }, { role: "RM", x: 85, y: 50 },
    { role: "ST", x: 40, y: 22 }, { role: "ST", x: 60, y: 22 },
  ];
}
