import { createFileRoute, notFound } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Bookmark, CheckCircle2, XCircle } from "lucide-react";
import { getFormation } from "@/data/formations";
import { PageHeader } from "@/components/PageHeader";
import { FootballField } from "@/components/svg/FootballField";
import { getDB } from "@/database/db";
import { difficultyBg } from "@/utils";

export const Route = createFileRoute("/formations/$id")({
  loader: ({ params }) => {
    const formation = getFormation(params.id);
    if (!formation) throw notFound();
    return { formation };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.formation.name} formation` : "Formation" },
      { name: "description", content: loaderData?.formation.explanation ?? "Football formation" },
    ],
  }),
  component: FormationDetail,
});

type Mode = "possession" | "attack" | "defense";

function FormationDetail() {
  const { formation } = Route.useLoaderData();
  const [mode, setMode] = useState<Mode>("possession");
  const db = getDB();

  const bookmark = useLiveQuery(
    async () => (db ? await db.formation_bookmarks.where("formationId").equals(formation.id).first() : undefined),
    [formation.id],
  );

  const toggleBookmark = async () => {
    if (!db) return;
    if (bookmark) await db.formation_bookmarks.delete(bookmark.id!);
    else await db.formation_bookmarks.add({ formationId: formation.id, date: Date.now() });
  };

  // Compute shape variants
  const players = formation.players.map((p) => {
    let y = p.y;
    if (mode === "attack") y = Math.max(6, y - 12);
    if (mode === "defense") y = Math.min(95, y + 10);
    return { ...p, y };
  });

  return (
    <>
      <PageHeader
        title={formation.name}
        subtitle={formation.style}
        back="/formations"
        right={
          <button
            onClick={toggleBookmark}
            aria-label={bookmark ? "Remove bookmark" : "Save formation"}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
          >
            <Bookmark size={20} className={bookmark ? "fill-accent text-accent-foreground" : ""} />
          </button>
        }
      />

      <div className="fade-in space-y-5">
        <div className="card-soft overflow-hidden">
          <FootballField players={players} showLabels showPassingLines showArrows={mode === "attack"} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(["possession", "attack", "defense"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "btn-primary py-2.5 text-xs capitalize"
                  : "btn-outline py-2.5 text-xs capitalize"
              }
            >
              {m} shape
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`chip ${difficultyBg(formation.difficulty)}`}>{formation.difficulty}</span>
          <span className="chip">{formation.style}</span>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Explanation</h2>
          <p className="text-[15px] leading-relaxed">{formation.explanation}</p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="card-soft p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-success">
              <CheckCircle2 size={16} /> Advantages
            </h3>
            <ul className="space-y-1.5 text-sm">
              {formation.advantages.map((a, i) => (
                <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />{a}</li>
              ))}
            </ul>
          </div>
          <div className="card-soft p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-destructive">
              <XCircle size={16} /> Disadvantages
            </h3>
            <ul className="space-y-1.5 text-sm">
              {formation.disadvantages.map((a, i) => (
                <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Best for</p>
          <p className="mt-1 text-sm">{formation.bestFor}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Suitable against</p>
          <p className="mt-1 text-sm">{formation.bestAgainst}</p>
        </section>
      </div>
    </>
  );
}
