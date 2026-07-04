import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronRight, CheckCircle2, Bookmark } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { getLessonsByCategory } from "@/data/lessons";
import { getDB } from "@/database/db";
import { PageHeader } from "@/components/PageHeader";
import { difficultyBg } from "@/utils";

export const Route = createFileRoute("/category/$id")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.id === params.id);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.cat.title} — Lessons` : "Category" },
      { name: "description", content: loaderData?.cat.description ?? "Football tactics lessons" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const lessons = getLessonsByCategory(cat.id);
  const db = getDB();

  const progress = useLiveQuery(
    async () => (db ? await db.lessons_progress.toArray() : []),
    [],
    [],
  );
  const done = new Set(progress?.filter((p) => p.completed).map((p) => p.lessonId));
  const marked = new Set(progress?.filter((p) => p.bookmarked).map((p) => p.lessonId));

  return (
    <>
      <PageHeader title={cat.title} subtitle={cat.description} back="/" />

      {lessons.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">📖 No lesson found</div>
      ) : (
        <ul className="space-y-3">
          {lessons.map((l, i) => (
            <li key={l.id}>
              <Link
                to="/lesson/$id"
                params={{ id: l.id }}
                className="card-soft flex items-center gap-3 p-4 active:scale-[0.98] transition-transform"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{l.title}</p>
                    {done.has(l.id) && <CheckCircle2 size={16} className="shrink-0 text-success" />}
                    {marked.has(l.id) && <Bookmark size={14} className="shrink-0 fill-accent text-accent-foreground" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`chip ${difficultyBg(l.difficulty)}`}>{l.difficulty}</span>
                    <span className="text-[11px] text-muted-foreground">{l.readingTime} min</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
