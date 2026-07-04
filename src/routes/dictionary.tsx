import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { DICTIONARY } from "@/data/dictionary";
import { PageHeader } from "@/components/PageHeader";
import { getDB } from "@/database/db";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Football Dictionary — Basic Football Tactics Edu" },
      { name: "description", content: "Offline football glossary with 80+ tactical terms: pressing, false 9, half space, gegenpressing and more." },
    ],
  }),
  component: DictionaryPage,
});

function DictionaryPage() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const db = getDB();

  const bookmarks = useLiveQuery(
    async () => (db ? await db.dictionary_bookmarks.toArray() : []),
    [],
    [],
  );
  const marked = new Set(bookmarks?.map((b) => b.termId));

  const list = DICTIONARY.filter(
    (t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.definition.toLowerCase().includes(q.toLowerCase()),
  ).sort((a, b) => a.term.localeCompare(b.term));

  const toggle = async (termId: string) => {
    if (!db) return;
    const existing = await db.dictionary_bookmarks.where("termId").equals(termId).first();
    if (existing) await db.dictionary_bookmarks.delete(existing.id!);
    else await db.dictionary_bookmarks.add({ termId, date: Date.now() });
  };

  return (
    <>
      <PageHeader title="Dictionary" subtitle={`${DICTIONARY.length} football terms`} showSettings />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search terms…"
        aria-label="Search dictionary"
        className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />

      {list.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">🔍 No term found</div>
      ) : (
        <ul className="space-y-2">
          {list.map((t) => {
            const open = openId === t.id;
            return (
              <li key={t.id} className="card-soft">
                <button
                  onClick={() => setOpenId(open ? null : t.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                  aria-expanded={open}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{t.term}</p>
                    {!open && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{t.definition}</p>}
                  </div>
                  <button
                    aria-label={marked.has(t.id) ? "Remove bookmark" : "Bookmark term"}
                    onClick={(e) => { e.stopPropagation(); toggle(t.id); }}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                  >
                    <Bookmark size={18} className={marked.has(t.id) ? "fill-accent text-accent-foreground" : ""} />
                  </button>
                </button>
                {open && (
                  <div className="fade-in space-y-2 border-t border-border p-4 text-sm">
                    <p>{t.definition}</p>
                    <p className="rounded-lg bg-muted p-2 text-xs italic">e.g. {t.example}</p>
                    {t.related.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {t.related.map((r) => (
                          <span key={r} className="chip">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
