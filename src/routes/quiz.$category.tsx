import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, Sparkles, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { getQuestionsByCategory } from "@/data/quiz";
import type { QuizQuestion } from "@/types";
import { getDB } from "@/database/db";
import { motivationMessage } from "@/utils";
import { markStreak } from "@/hooks/useProgress";

const VALID = ["basics", "formation", "attacking", "defending", "transition", "mixed"];

export const Route = createFileRoute("/quiz/$category")({
  loader: ({ params }) => {
    if (!VALID.includes(params.category)) throw notFound();
    return { category: params.category };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.category} quiz` : "Quiz" }],
  }),
  component: QuizSession,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizSession() {
  const { category } = Route.useLoaderData();
  const navigate = useNavigate();

  const questions = useMemo<QuizQuestion[]>(
    () => shuffle(getQuestionsByCategory(category)).slice(0, 10),
    [category],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const q = questions[i];
  const isLast = i === questions.length - 1;

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correct) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
  };

  const next = async () => {
    if (!isLast) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    // finish
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    const db = getDB();
    if (db) {
      await db.quiz_results.add({
        category,
        score,
        correct,
        wrong,
        total,
        timeSeconds: elapsed,
        date: Date.now(),
      });
    }
    await markStreak();
    setFinished(true);
  };

  if (!q) return null;

  if (finished) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    return (
      <>
        <PageHeader title="Result" back="/quiz" />
        <div className="fade-in flex flex-col items-center pt-4 text-center">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-soft)]">
            <p className="text-3xl font-black">{pct}%</p>
          </div>
          <p className="mt-4 text-lg font-bold">{motivationMessage(pct)}</p>

          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            <div className="card-soft p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Correct</p>
              <p className="text-xl font-black text-success">{correct}</p>
            </div>
            <div className="card-soft p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Wrong</p>
              <p className="text-xl font-black text-destructive">{wrong}</p>
            </div>
            <div className="card-soft p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Time</p>
              <p className="text-xl font-black">{elapsed}s</p>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3">
            <button
              onClick={() => {
                setI(0); setPicked(null); setCorrect(0); setWrong(0); setFinished(false);
                startedAt.current = Date.now(); setElapsed(0);
              }}
              className="btn-primary flex items-center justify-center gap-2 py-3.5"
            >
              <RotateCcw size={18} /> Try again
            </button>
            <button onClick={() => navigate({ to: "/quiz" })} className="btn-outline py-3.5">
              Back to categories
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Question ${i + 1} / ${questions.length}`} back="/quiz" />

      <div className="mb-5">
        <ProgressBar value={((i + (picked !== null ? 1 : 0)) / questions.length) * 100} label="Quiz progress" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>⏱ {elapsed}s</span>
          <span>✓ {correct} · ✗ {wrong}</span>
        </div>
      </div>

      <div key={q.id} className="card-soft fade-in p-5">
        <p className="mb-4 text-[17px] font-bold leading-snug">{q.question}</p>
        <div className="space-y-2">
          {q.answers.map((a, idx) => {
            const isCorrect = picked !== null && idx === q.correct;
            const isWrong = picked === idx && idx !== q.correct;
            return (
              <button
                key={idx}
                disabled={picked !== null}
                onClick={() => pick(idx)}
                className={
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.98] " +
                  (isCorrect
                    ? "border-success bg-success/10 text-success"
                    : isWrong
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : picked !== null
                    ? "border-border opacity-60"
                    : "border-border bg-card hover:border-primary/50")
                }
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{a}</span>
                {isCorrect && <CheckCircle2 size={18} />}
                {isWrong && <XCircle size={18} />}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="fade-in mt-4 rounded-xl bg-muted p-3 text-sm">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <Sparkles size={14} /> Explanation
            </div>
            {q.explanation}
          </div>
        )}
      </div>

      <button
        disabled={picked === null}
        onClick={next}
        className="btn-primary mt-5 w-full py-3.5"
      >
        {isLast ? "Finish" : "Next question"}
      </button>
    </>
  );
}
