import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { BookOpen, LayoutGrid, Book } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { getDB } from "@/database/db";
import { getLesson } from "@/data/lessons";
import { getFormation } from "@/data/formations";
import { DICTIONARY } from "@/data/dictionary";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — Basic Football Tactics Edu" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const db = getDB();
  const data = useLiveQuery(
    async () => {
      if (!db) return { lessons: [], formations: [], terms: [] };
      const [lp, fb, dbm] = await Promise.all([
        db.lessons_progress.filter((p) => p.bookmarked).toArray(),
        db.formation_bookmarks.toArray(),
        db.dictionary_bookmarks.toArray(),
      ]);
      return {
        lessons: lp.map((p) => getLesson(p.lessonId)).filter(Boolean),
        formations: fb.map((f) => getFormation(f.formationId)).filter(Boolean),
        terms: dbm.map((d) => DICTIONARY.find((t) => t.id === d.termId)).filter(Boolean),
      };
    },
    [],
    { lessons: [], formations: [], terms: [] },
  );

  const empty = data.lessons.length === 0 && data.formations.length === 0 && data.terms.length === 0;

  return (
    <>
      <PageHeader title="Bookmarks" back="/" />
      {empty ? (
        <EmptyState emoji="⭐" title="No bookmark yet" hint="Save lessons, formations and terms to find them here." />
      ) : (
        <div className="space-y-6">
          {data.lessons.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <BookOpen size={16} /> Lessons
              </h2>
              <ul className="space-y-2">
                {data.lessons.map((l: any) => (
                  <li key={l.id}>
                    <Link to="/lesson/$id" params={{ id: l.id }} className="card-soft block p-3 text-sm font-semibold">{l.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.formations.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <LayoutGrid size={16} /> Formations
              </h2>
              <ul className="space-y-2">
                {data.formations.map((f: any) => (
                  <li key={f.id}>
                    <Link to="/formations/$id" params={{ id: f.id }} className="card-soft block p-3 text-sm font-semibold">{f.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.terms.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Book size={16} /> Dictionary
              </h2>
              <ul className="space-y-2">
                {data.terms.map((t: any) => (
                  <li key={t.id} className="card-soft p-3">
                    <p className="text-sm font-bold">{t.term}</p>
                    <p className="text-xs text-muted-foreground">{t.definition}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
