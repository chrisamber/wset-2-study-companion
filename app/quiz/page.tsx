"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  makeSession,
  displayOptions,
  correctDisplayLetter,
  scoreSession,
  type Session,
  type Result,
} from "@/lib/quiz-engine";
import type { Letter } from "@/lib/types";
import { LO_NAMES } from "@/lib/types";
import { PAPERS, questionsByPaper, questionsByLOs, questionsByIds, loCounts } from "@/data/questions";
import { useProgress } from "@/lib/progress";
import { Bar } from "@/components/Bar";

type Screen = "home" | "exam-setup" | "practice-setup" | "run" | "results";
interface Meta {
  mode: "exam" | "practice";
  scope: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function QuizPage() {
  const { progress, ready, setShuffle, recordAttempt } = useProgress();
  const [screen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState<Record<number, Letter>>({});
  const [cur, setCur] = useState(0);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const shuffle = ready ? progress.shuffle : true;

  const start = useCallback(
    (questions: ReturnType<typeof questionsByPaper>, m: Meta) => {
      setSession(makeSession(questions, { mode: m.mode, scope: m.scope, shuffle }));
      setMeta(m);
      setAnswers({});
      setCur(0);
      setRemaining(m.mode === "exam" ? 60 * 60 : 0);
      setResult(null);
      setScreen("run");
    },
    [shuffle]
  );

  const finish = useCallback(() => {
    if (!session || !meta) return;
    const scored = scoreSession({ ...session, answers });
    setResult(scored);
    recordAttempt(scored, meta);
    setScreen("results");
  }, [session, answers, meta, recordAttempt]);

  // keep an always-fresh finish for the timer
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (screen !== "run" || meta?.mode !== "exam") return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [screen, meta]);

  useEffect(() => {
    if (screen === "run" && meta?.mode === "exam" && remaining === 0) finishRef.current();
  }, [remaining, screen, meta]);

  // ---------- HOME ----------
  if (screen === "home") {
    const lm = progress.lastMissed;
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">Quiz</h1>
          <p className="mt-1 text-muted">100 independently fact-checked questions from two mock papers.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setScreen("exam-setup")} className="card p-5 text-left transition hover:-translate-y-0.5 hover:border-wine">
            <div className="font-display text-lg font-semibold">📝 Exam mode</div>
            <p className="mt-1 text-sm text-muted">A full 50-question paper with a 60-minute timer. Results at the end — exam-day rehearsal.</p>
          </button>
          <button onClick={() => setScreen("practice-setup")} className="card p-5 text-left transition hover:-translate-y-0.5 hover:border-wine">
            <div className="font-display text-lg font-semibold">🎯 Practice mode</div>
            <p className="mt-1 text-sm text-muted">Pick a Learning Outcome. Instant feedback and the “why” after each question. Untimed.</p>
          </button>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="h-4 w-4 accent-[var(--color-wine)]" />
          Shuffle questions &amp; answer order
        </label>

        {lm.length > 0 && (
          <button onClick={() => start(questionsByIds(lm), { mode: "practice", scope: "Retry misses" })} className="btn-primary w-full">
            ↻ Retry your last {lm.length} misses
          </button>
        )}
      </div>
    );
  }

  // ---------- EXAM SETUP ----------
  if (screen === "exam-setup") {
    return (
      <div className="space-y-5">
        <BackHeader title="Exam mode" subtitle="50 questions · 60 minutes · no feedback until you submit." onBack={() => setScreen("home")} />
        <div className="grid gap-3 sm:grid-cols-2">
          {PAPERS.map((p) => (
            <button key={p} onClick={() => start(questionsByPaper(p), { mode: "exam", scope: `Paper ${p}` })} className="card p-5 text-left transition hover:-translate-y-0.5 hover:border-wine">
              <div className="font-display text-lg font-semibold text-wine">Paper {p}</div>
              <p className="mt-1 text-sm text-muted">{questionsByPaper(p).length} questions</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- PRACTICE SETUP ----------
  if (screen === "practice-setup") {
    return <PracticeSetup onBack={() => setScreen("home")} onStart={(los, scope) => start(questionsByLOs(los), { mode: "practice", scope })} />;
  }

  // ---------- RUN ----------
  if (screen === "run" && session && meta) {
    const item = session.items[cur];
    const opts = displayOptions(item);
    const total = session.items.length;
    const chosen = answers[cur];
    const isExam = meta.mode === "exam";
    const answered = !isExam && chosen != null;
    const correct = correctDisplayLetter(item);

    const choose = (l: Letter) => {
      if (!isExam && answers[cur] != null) return;
      setAnswers((a) => ({ ...a, [cur]: l }));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (confirm("Quit this quiz? This attempt won’t be saved.")) setScreen("home"); }} className="text-sm text-muted hover:text-wine">← Quit</button>
          <span className="text-sm text-muted">{meta.scope}</span>
          {isExam ? (
            <span className={`ml-auto rounded-lg px-3 py-1 text-sm font-bold tabular-nums ${remaining < 300 ? "bg-bad-bg text-bad" : "bg-blush text-wine"}`}>{fmt(remaining)}</span>
          ) : (
            <span className="ml-auto text-sm tabular-nums text-muted">Q {cur + 1} / {total}</span>
          )}
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-cream-2">
          <span className="bar-fill block h-full rounded-full bg-wine" style={{ width: `${(cur / total) * 100}%` }} />
        </div>

        <div className="card p-5">
          <p className="font-display text-lg font-semibold">{item.q.stem}</p>
          <div className="mt-4 space-y-2.5">
            {opts.map((o) => {
              let cls = "border-line bg-cream hover:border-wine";
              if (isExam && chosen === o.letter) cls = "border-wine bg-blush";
              else if (answered && o.letter === correct) cls = "border-good bg-good-bg";
              else if (answered && o.letter === chosen) cls = "border-bad bg-bad-bg";
              else if (answered) cls = "border-line bg-cream opacity-60";
              return (
                <button key={o.letter} onClick={() => choose(o.letter)} disabled={answered} className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${cls}`}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-xs font-bold uppercase text-wine">{o.letter}</span>
                  <span>{o.text}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-4 rounded-xl p-3.5 text-sm ${chosen === correct ? "bg-good-bg text-good" : "bg-bad-bg text-bad"}`}>
              <p className="font-semibold">{chosen === correct ? "✓ Correct" : `✗ Not quite — the answer is ${correct.toUpperCase()}`}</p>
              <p className="mt-1 font-normal text-ink">{item.q.explanation}</p>
            </div>
          )}
        </div>

        {/* nav */}
        <div className="flex items-center gap-3">
          {isExam ? (
            <>
              <button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} className="btn-ghost disabled:opacity-40">← Prev</button>
              {cur === total - 1 ? (
                <button onClick={() => { if (confirm("Submit the exam now?")) finish(); }} className="btn-primary flex-1">Submit exam</button>
              ) : (
                <button onClick={() => setCur((c) => Math.min(total - 1, c + 1))} className="btn-primary flex-1">Next →</button>
              )}
            </>
          ) : answered ? (
            cur === total - 1 ? (
              <button onClick={finish} className="btn-primary flex-1">See results</button>
            ) : (
              <button onClick={() => setCur((c) => c + 1)} className="btn-primary flex-1">Next →</button>
            )
          ) : (
            <span className="text-sm text-muted">Pick an answer to continue.</span>
          )}
        </div>

        {isExam && (
          <div className="grid grid-cols-10 gap-1.5">
            {session.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                className={`aspect-square rounded-md border text-xs tabular-nums ${
                  i === cur ? "border-wine font-bold text-wine" : answers[i] != null ? "border-wine-light bg-blush text-wine" : "border-line text-muted"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- RESULTS ----------
  if (screen === "results" && session && meta && result) {
    const pct = Math.round((100 * result.correct) / result.total);
    const chosenText = (id: string) => {
      const i = session.items.findIndex((it) => it.q.id === id);
      const ch = answers[i];
      if (ch == null) return null;
      return displayOptions(session.items[i]).find((o) => o.letter === ch)?.text ?? null;
    };
    const missed = result.missedIds
      .map((id) => session.items.find((it) => it.q.id === id)?.q)
      .filter((q): q is NonNullable<typeof q> => !!q);

    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-3xl font-semibold">Results</h1>
          <p className="mt-1 text-muted">{meta.scope} · {meta.mode}</p>
        </header>

        <div className="card flex flex-wrap items-center gap-4 p-5">
          <div className="font-display text-4xl font-bold text-wine">
            {result.correct}
            <span className="text-lg text-muted">/{result.total}</span>
          </div>
          <div className="text-xl font-bold text-muted">{pct}%</div>
          {result.band && (
            <span
              className="ml-auto rounded-full px-3.5 py-1 text-sm font-bold text-white"
              style={{ background: result.band === "Distinction" ? "var(--color-gold)" : result.band === "Merit" ? "var(--color-good)" : result.band === "Pass" ? "var(--color-wine)" : "var(--color-bad)" }}
            >
              {result.band}
            </span>
          )}
        </div>

        <section className="card p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">By Learning Outcome</h2>
          <div className="space-y-2">
            {Object.keys(result.perLO).map(Number).sort().map((lo) => {
              const p = result.perLO[lo];
              return <Bar key={lo} label={`LO${lo} ${LO_NAMES[lo]}`} pct={Math.round((100 * p.correct) / p.total)} value={`${p.correct}/${p.total}`} />;
            })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-2 font-display text-lg font-semibold">Review your misses ({missed.length})</h2>
          {missed.length === 0 ? (
            <p className="text-sm font-medium text-good">🎉 Perfect — nothing missed!</p>
          ) : (
            <div className="space-y-2">
              {missed.map((q) => (
                <details key={q.id} className="rounded-xl bg-cream-2 p-3 text-sm">
                  <summary className="cursor-pointer font-medium"><span className="text-wine">LO{q.lo}</span> · {q.stem}</summary>
                  <p className="mt-2"><span className="font-semibold text-bad">Your answer:</span> {chosenText(q.id) ?? <em>left blank</em>}</p>
                  <p className="mt-1"><span className="font-semibold text-good">Correct:</span> {q.options[q.answer]}</p>
                  <p className="mt-1 text-muted">{q.explanation}</p>
                </details>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          {missed.length > 0 && (
            <button onClick={() => start(questionsByIds(result.missedIds), { mode: "practice", scope: "Retry misses" })} className="btn-primary flex-1">
              ↻ Retry my {missed.length} misses
            </button>
          )}
          <button onClick={() => setScreen("home")} className="btn-ghost">Back to quiz home</button>
        </div>
      </div>
    );
  }

  return null;
}

function BackHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <header>
      <button onClick={onBack} className="text-sm text-muted hover:text-wine">← Home</button>
      <h1 className="mt-1 font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
    </header>
  );
}

function PracticeSetup({ onBack, onStart }: { onBack: () => void; onStart: (los: number[], scope: string) => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const counts = loCounts();
  const toggle = (lo: number) => setSel((s) => (s.includes(lo) ? s.filter((x) => x !== lo) : [...s, lo]));
  const n = sel.reduce((a, lo) => a + (counts[lo] ?? 0), 0);

  return (
    <div className="space-y-5">
      <BackHeader title="Practice mode" subtitle="Choose what to drill — instant feedback after each answer." onBack={onBack} />
      <div className="flex gap-3 text-sm">
        <button onClick={() => setSel([1, 2, 3, 4, 5, 6])} className="text-wine underline underline-offset-2">Select all</button>
        <button onClick={() => setSel([])} className="text-muted underline underline-offset-2">Clear</button>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((lo) => (
          <label key={lo} className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
            <input type="checkbox" checked={sel.includes(lo)} onChange={() => toggle(lo)} className="h-4 w-4 accent-[var(--color-wine)]" />
            <span className="font-semibold">LO{lo}</span>
            <span className="text-muted">{LO_NAMES[lo]}</span>
            <span className="ml-auto chip">{counts[lo] ?? 0} Q</span>
          </label>
        ))}
      </div>
      <button
        disabled={sel.length === 0}
        onClick={() => onStart(sel.sort(), sel.length === 6 ? "All LOs" : sel.map((l) => `LO${l}`).join(", "))}
        className="btn-primary w-full"
      >
        {sel.length ? `Start practice (${n} Q)` : "Start practice"}
      </button>
    </div>
  );
}
