import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { FORMATIONS } from "@/data/formations";
import { PageHeader } from "@/components/PageHeader";
import { FootballField } from "@/components/svg/FootballField";
import { difficultyBg } from "@/utils";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formations — Basic Football Tactics Edu" },
      { name: "description", content: "Explore football formations: 4-4-2, 4-3-3, 3-5-2, 4-2-3-1 and more with animated pitch diagrams." },
    ],
  }),
  component: FormationsPage,
});

function FormationsPage() {
  const [q, setQ] = useState("");
  const list = FORMATIONS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.style.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Formations" subtitle="Understand every shape" showSettings />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search formations…"
        aria-label="Search formations"
        className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />

      {list.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">🔍 No formation matches</div>
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <Link
              key={f.id}
              to="/formations/$id"
              params={{ id: f.id }}
              className="card-soft flex items-center gap-3 overflow-hidden active:scale-[0.98] transition-transform"
            >
              <div className="h-28 w-24 shrink-0 bg-muted">
                <FootballField players={f.players} showLabels={false} />
              </div>
              <div className="min-w-0 flex-1 py-3 pr-3">
                <p className="font-black tracking-tight">{f.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.style}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`chip ${difficultyBg(f.difficulty)}`}>{f.difficulty}</span>
                </div>
              </div>
              <ChevronRight size={20} className="mr-3 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
