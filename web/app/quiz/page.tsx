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
import { QUESTIONS, PAPERS, questionsByPaper, questionsByLOs, questionsByIds, loCounts } from "@/data/questions";
import { useProgress } from "@/lib/progress";
import { Card, Button, Chip, ProgressBar, QuizOption, Alert, Badge } from "@/components/wset-ui";

type Screen = "home" | "exam-setup" | "practice-setup" | "run" | "results";
interface Meta {
  mode: "exam" | "practice";
  scope: string;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// One-line character of each paper, so picking is a choice, not a coin-toss.
const PAPER_BLURBS: Record<number, string> = {
  1: "core recall — grape ↔ region",
  2: "applied scenarios & the why",
  3: "fresh angles, less-drilled grapes",
};

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

  const transition = (update: () => void) =>
    "startViewTransition" in document ? document.startViewTransition(update) : update();

  const changeScreen = (s: Screen) => {
    transition(() => setScreen(s));
  };

  const start = useCallback(
    (questions: ReturnType<typeof questionsByPaper>, m: Meta) => {
      transition(() => {
        setSession(makeSession(questions, { mode: m.mode, scope: m.scope, shuffle }));
        setMeta(m);
        setAnswers({});
        setCur(0);
        setRemaining(m.mode === "exam" ? 60 * 60 : 0);
        setResult(null);
        setScreen("run");
      });
    },
    [shuffle]
  );

  const finish = useCallback(() => {
    if (!session || !meta) return;
    const scored = scoreSession({ ...session, answers });
    transition(() => {
      setResult(scored);
      recordAttempt(scored, meta);
      setScreen("results");
    });
  }, [session, answers, meta, recordAttempt]);

  // keep an always-fresh finish for the timer (assign in an effect, not during render)
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

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
      <div className="space-y-6 rise">
        <header>
          <div className="eyebrow mb-2">Quiz</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Test yourself</h1>
          <p className="mt-2 text-muted text-[15px]">{QUESTIONS.length} independently fact-checked questions across {PAPERS.length} mock papers.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card interactive onClick={() => changeScreen("exam-setup")} className="p-5 text-left">
            <div className="font-display text-lg font-semibold text-ink">Exam mode</div>
            <p className="mt-1 text-sm text-muted">A full 50-question paper with a 60-minute timer. Results at the end — exam-day rehearsal.</p>
          </Card>
          <Card interactive onClick={() => changeScreen("practice-setup")} className="p-5 text-left">
            <div className="font-display text-lg font-semibold text-ink">Practice mode</div>
            <p className="mt-1 text-sm text-muted">Pick a Learning Outcome. Instant feedback and the “why” after each question. Untimed.</p>
          </Card>
        </div>

        <label className="flex items-center gap-2.5 text-sm select-none cursor-pointer">
          <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="h-4 w-4 rounded border-line text-wine focus:ring-wine" />
          <span className="text-ink">Shuffle questions &amp; answer order</span>
        </label>

        {lm.length > 0 && (
          <Button onClick={() => start(questionsByIds(lm), { mode: "practice", scope: "Retry misses" })} className="w-full h-[46px]">
            ↻ Retry your last {lm.length} misses
          </Button>
        )}
      </div>
    );
  }

  // ---------- EXAM SETUP ----------
  if (screen === "exam-setup") {
    return (
      <div className="space-y-5 rise">
        <BackHeader title="Exam mode" subtitle="50 questions · 60 minutes · no feedback until you submit." onBack={() => changeScreen("home")} />
        <div className="grid gap-4 sm:grid-cols-2">
          {PAPERS.map((p) => (
            <Card key={p} interactive onClick={() => start(questionsByPaper(p), { mode: "exam", scope: `Paper ${p}` })} className="p-5 text-left">
              <div className="font-display text-lg font-semibold text-ink">Paper {p}</div>
              <p className="mt-1 text-sm text-muted">{questionsByPaper(p).length} questions{PAPER_BLURBS[p] ? ` · ${PAPER_BLURBS[p]}` : ""}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ---------- PRACTICE SETUP ----------
  if (screen === "practice-setup") {
    return <PracticeSetup onBack={() => changeScreen("home")} onStart={(los, scope) => start(questionsByLOs(los), { mode: "practice", scope })} />;
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
      <div className="space-y-5 rise">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-3.5 h-[36px]" onClick={() => { if (confirm("Quit this quiz? This attempt won’t be saved.")) changeScreen("home"); }}>
            ← Exit
          </Button>
          <span className="text-sm font-medium text-muted">{meta.scope}</span>
          {isExam ? (
            <span className={`ml-auto rounded-lg px-3 py-1 text-sm font-bold tabular-nums ${remaining < 300 ? "bg-bad-bg text-bad" : "bg-blush text-wine"}`}>{fmt(remaining)}</span>
          ) : (
            <span className="ml-auto text-sm font-semibold tabular-nums text-muted">Q {cur + 1} / {total}</span>
          )}
        </div>

        <ProgressBar percent={Math.round((cur / total) * 100)} className="w-full" />

        <Card className="p-5 sm:p-6">
          <div className="eyebrow mb-3">Question {cur + 1}</div>
          <p className="font-display text-xl font-semibold text-ink leading-relaxed">{item.q.stem}</p>
          <div className="mt-6 space-y-3">
            {opts.map((o) => {
              let state: "default" | "selected" | "correct" | "wrong" | "dimmed" = "default";
              if (isExam && chosen === o.letter) state = "selected";
              else if (answered && o.letter === correct) state = "correct";
              else if (answered && o.letter === chosen) state = "wrong";
              else if (answered) state = "dimmed";

              return (
                <QuizOption
                  key={o.letter}
                  letter={o.letter}
                  state={state}
                  disabled={answered}
                  onClick={() => choose(o.letter)}
                >
                  {o.text}
                </QuizOption>
              );
            })}
          </div>

          {answered && (
            <Alert
              tone={chosen === correct ? "success" : "error"}
              title={chosen === correct ? "✓ Correct" : `✗ Not quite — the answer is ${correct.toUpperCase()}`}
              className="mt-6"
            >
              {item.q.explanation}
            </Alert>
          )}
        </Card>

        {/* nav */}
        <div className="flex items-center gap-3">
          {isExam ? (
            <>
              <Button variant="ghost" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} className="w-[90px] h-[44px]">← Prev</Button>
              {cur === total - 1 ? (
                <Button onClick={() => { if (confirm("Submit the exam now?")) finish(); }} className="flex-1 h-[44px]">Submit exam</Button>
              ) : (
                <Button onClick={() => setCur((c) => Math.min(total - 1, c + 1))} className="flex-1 h-[44px]">Next →</Button>
              )}
            </>
          ) : answered ? (
            cur === total - 1 ? (
              <Button onClick={finish} className="flex-1 h-[44px]">See results</Button>
            ) : (
              <Button onClick={() => setCur((c) => c + 1)} className="flex-1 h-[44px]">Next →</Button>
            )
          ) : (
            <span className="text-sm font-medium text-muted pl-1">Pick an answer to continue.</span>
          )}
        </div>

        {isExam && (
          <div className="grid grid-cols-10 gap-1.5 mt-4">
            {session.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                className={`aspect-square rounded-md border text-xs tabular-nums transition ${
                  i === cur
                    ? "border-wine bg-wine text-white font-bold"
                    : answers[i] != null
                    ? "border-wine-light bg-blush text-wine"
                    : "border-line text-muted bg-card hover:border-wine"
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

    const band = result.band ?? "Fail";
    const toneMap: Record<string, "distinction" | "merit" | "pass" | "fail"> = {
      Distinction: "distinction",
      Merit: "merit",
      Pass: "pass",
      Fail: "fail",
    };
    const badgeTone = toneMap[band] ?? "fail";

    return (
      <div className="space-y-6 rise">
        <header>
          <div className="eyebrow mb-2">Quiz Results</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Your Results</h1>
          <p className="mt-1 text-sm text-muted">{meta.scope} · {meta.mode === "exam" ? "Exam" : "Practice"}</p>
        </header>

        <div className="flex flex-col items-center justify-center text-center p-6 bg-cream border border-line rounded-2xl">
          <Badge tone={badgeTone} className="mb-4">
            {band}
          </Badge>
          <h2 className="font-display text-6xl font-bold text-wine tracking-tight">
            {result.correct}
            <span className="text-2xl text-muted font-normal">/{result.total}</span>
          </h2>
          <p className="mt-2 text-lg font-medium text-ink">{pct}% accuracy</p>
        </div>

        <Card className="p-5">
          <div className="eyebrow mb-4">By Learning Outcome</div>
          <div className="space-y-3">
            {Object.keys(result.perLO).map(Number).sort().map((lo) => {
              const p = result.perLO[lo];
              return (
                <ProgressBar
                  key={lo}
                  label={`LO${lo} ${LO_NAMES[lo]}`}
                  percent={Math.round((100 * p.correct) / p.total)}
                  caption={`${p.correct}/${p.total}`}
                />
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="eyebrow mb-4">Review your misses ({missed.length})</div>
          {missed.length === 0 ? (
            <p className="text-sm font-medium text-good">Perfect — nothing missed.</p>
          ) : (
            <div className="space-y-3">
              {missed.map((q) => (
                <details key={q.id} className="group rounded-xl bg-cream-2 p-3.5 text-sm transition-colors hover:bg-cream-2/80">
                  <summary className="cursor-pointer font-semibold text-ink select-none outline-none">
                    <span className="text-wine-light font-bold">LO{q.lo}</span> · {q.stem}
                  </summary>
                  <div className="mt-3 space-y-2 border-t border-line/40 pt-3">
                    <p><span className="font-semibold text-bad">Your answer:</span> {chosenText(q.id) ?? <em className="text-muted font-normal">left blank</em>}</p>
                    <p><span className="font-semibold text-good">Correct answer:</span> {q.options[q.answer]}</p>
                    <p className="text-muted leading-relaxed mt-1 font-normal">{q.explanation}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          {missed.length > 0 && (
            <Button onClick={() => start(questionsByIds(result.missedIds), { mode: "practice", scope: "Retry misses" })} className="flex-1 h-[46px]">
              ↻ Retry my {missed.length} misses
            </Button>
          )}
          <Button variant="ghost" className="flex-1 h-[46px]" onClick={() => changeScreen("home")}>
            Back to quiz home
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function BackHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <header>
      <button onClick={onBack} className="text-sm font-semibold text-muted hover:text-ink transition-colors">← Back</button>
      <div className="eyebrow mt-3 mb-2">Quiz</div>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
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
      <div className="flex gap-4 text-sm font-medium">
        <button onClick={() => setSel([1, 2, 3, 4, 5, 6])} className="text-wine underline underline-offset-4 hover:text-wine-dark transition-colors">Select all</button>
        <button onClick={() => setSel([])} className="text-muted underline underline-offset-4 hover:text-ink transition-colors">Clear</button>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((lo) => (
          <label key={lo} className="wset-card p-4 flex items-center gap-3 select-none cursor-pointer transition-colors hover:bg-cream-2/20">
            <input type="checkbox" checked={sel.includes(lo)} onChange={() => toggle(lo)} className="h-4 w-4 rounded border-line text-wine focus:ring-wine" />
            <span className="font-semibold text-ink">LO{lo}</span>
            <span className="text-muted text-sm">{LO_NAMES[lo]}</span>
            <Chip className="ml-auto">{counts[lo] ?? 0} Q</Chip>
          </label>
        ))}
      </div>
      <Button
        disabled={sel.length === 0}
        onClick={() => onStart(sel.sort(), sel.length === 6 ? "All LOs" : sel.map((l) => `LO${l}`).join(", "))}
        className="w-full h-[46px]"
      >
        {sel.length ? `Start practice (${n} Q)` : "Start practice"}
      </Button>
    </div>
  );
}
