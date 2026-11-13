import { createFileRoute } from "@tanstack/react-router";
import { PencilRuler } from "lucide-react";
import { TacticsBoard } from "@/components/TacticsBoard";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/tactics-board")({
  head: () => ({
    meta: [
      { title: "Tactics Board — Basic Football Tactics Edu" },
      { name: "description", content: "Build and save football tactics offline with formations, players, passing lines, and movement runs." },
      { property: "og:title", content: "Tactics Board — Basic Football Tactics Edu" },
      { property: "og:description", content: "Build and save football tactics offline with formations, players, passing lines, and movement runs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TacticsBoardPage,
});

function TacticsBoardPage() {
  return (
    <>
      <PageHeader title="Tactics board" subtitle="Plan it. Draw it. Save it." back="/formations" />
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <PencilRuler size={15} /> Offline board · 22 players · 9 formations
      </div>
      <TacticsBoard />
    </>
  );
}