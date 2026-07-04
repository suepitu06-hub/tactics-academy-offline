import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { searchLessons, searchDictionary, filterFormation } from "@/utils";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Basic Football Tactics Edu" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const lessons = searchLessons(q);
  const terms = searchDictionary(q);
  const formations = q ? filterFormation(q) : [];

  const empty = q.length > 0 && lessons.length === 0 && terms.length === 0 && formations.length === 0;

  return (
    <>
      <PageHeader title="Search" back="/" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        placeholder="Search lessons, formations, terms…"
        aria-label="Search everything"
        className="mb-5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />

      {q.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Type anything — everything works offline.</p>
      )}

      {empty && <EmptyState emoji="🔍" title="No results" hint="Try a different word." />}

      {lessons.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Lessons</h2>
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id}>
                <Link to="/lesson/$id" params={{ id: l.id }} className="card-soft block p-3 text-sm font-semibold">{l.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {formations.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Formations</h2>
          <ul className="space-y-2">
            {formations.map((f) => (
              <li key={f.id}>
                <Link to="/formations/$id" params={{ id: f.id }} className="card-soft block p-3 text-sm font-semibold">{f.name} · <span className="font-normal text-muted-foreground">{f.style}</span></Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {terms.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Dictionary</h2>
          <ul className="space-y-2">
            {terms.map((t) => (
              <li key={t.id} className="card-soft p-3">
                <p className="text-sm font-bold">{t.term}</p>
                <p className="text-xs text-muted-foreground">{t.definition}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
