import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Moon, Monitor, Check, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useTheme, type Theme, type FontSize } from "@/hooks/useTheme";
import { getDB } from "@/database/db";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Basic Football Tactics Edu" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const doReset = async () => {
    setResetting(true);
    const db = getDB();
    if (db) {
      await Promise.all([
        db.lessons_progress.clear(),
        db.quiz_results.clear(),
        db.formation_bookmarks.clear(),
        db.dictionary_bookmarks.clear(),
        db.streaks.clear(),
      ]);
    }
    setResetting(false);
    setShowConfirm(false);
  };

  return (
    <>
      <PageHeader title="Settings" back="/" />

      <section className="mb-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Theme</h2>
        <div className="card-soft divide-y divide-border">
          {(
            [
              { v: "light", label: "Light", icon: Sun },
              { v: "dark", label: "Dark", icon: Moon },
              { v: "system", label: "System", icon: Monitor },
            ] as const
          ).map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setTheme(v as Theme)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm"
            >
              <Icon size={20} className="text-muted-foreground" />
              <span className="flex-1 font-semibold">{label}</span>
              {theme === v && <Check size={18} className="text-primary" />}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Font size</h2>
        <div className="card-soft divide-y divide-border">
          {(["small", "medium", "large"] as FontSize[]).map((f) => (
            <button
              key={f}
              onClick={() => setFontSize(f)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm capitalize"
            >
              <span className={"flex-1 font-semibold " + (f === "small" ? "text-xs" : f === "large" ? "text-lg" : "text-base")}>{f}</span>
              {fontSize === f && <Check size={18} className="text-primary" />}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</h2>
        <div className="card-soft p-4 text-sm">
          <p className="font-semibold">English</p>
          <p className="text-xs text-muted-foreground">More languages coming in future versions.</p>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h2>
        <div className="card-soft p-4 text-sm space-y-1">
          <p className="font-bold">Basic Football Tactics Edu</p>
          <p className="text-xs text-muted-foreground">Learn Football Tactics Step by Step.</p>
          <p className="text-xs text-muted-foreground">100% offline · No account required · v1.0</p>
        </div>
      </section>

      <section>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-xl border-2 border-destructive/30 bg-destructive/5 py-3.5 text-sm font-bold text-destructive active:scale-[0.98] transition-transform"
        >
          Reset all progress
        </button>
      </section>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fade-in w-full max-w-md rounded-2xl bg-card p-5 shadow-xl"
          >
            <div className="mb-3 flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              <h3 className="font-bold">Reset all progress?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This will delete every completed lesson, quiz result, bookmark, and streak. Settings are kept.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="btn-outline flex-1 py-3">Cancel</button>
              <button
                onClick={doReset}
                disabled={resetting}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-bold text-destructive-foreground active:scale-[0.97]"
              >
                {resetting ? "Resetting…" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
