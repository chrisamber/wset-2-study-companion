"use client";
import { useCallback, useMemo, useState } from "react";
import { regionIndex, VARIETIES, type RegionEntry } from "@/data/varieties";
import { GI_TO_GRAPE } from "@/data/terms";
import { shuffled } from "@/lib/quiz-engine";
import { useProgress } from "@/lib/progress";
import { Card, Button, Chip, ProgressBar, QuizOption } from "@/components/wset-ui";

type Mode = "mcq" | "reveal";
type Screen = "home" | "run" | "done";

const keyOf = (e: RegionEntry) => `${e.gi}|${e.country}`;

// Marquee notes for the curated GI_TO_GRAPE names (e.g. "Sancerre / Pouilly-Fumé").
// Match a RegionEntry.gi against the slash-separated names in GI_TO_GRAPE.
const noteFor = (gi: string): string | undefined => {
  for (const g of GI_TO_GRAPE) {
    const names = g.gi.split("/").map((s) => s.trim());
    if (names.some((n) => n === gi)) return g.note;
  }
  return undefined;
};

interface CardType {
  entry: RegionEntry;
  options: string[]; // MCQ option grape names (one or more correct + distractors), shuffled
  correct: Set<string>; // the grape display names grown in this GI
}

// Build a 4-option MCQ for an entry: every grape in the GI is correct; fill the
// rest with real Variety names NOT grown there. Distractors are never invented.
function buildCard(entry: RegionEntry): CardType {
  const correctNames = entry.varieties.map((v) => v.name);
  const correct = new Set(correctNames);
  const pool = VARIETIES.map((v) => v.name).filter((n) => !correct.has(n));
  const distractors = shuffled(pool).slice(0, Math.max(0, 4 - Math.min(correctNames.length, 4)));
  // Cap correct options shown so the card never exceeds a sensible width, but
  // keep at least all correct answers when a GI has many grapes.
  const options = shuffled([...correctNames, ...distractors]);
  return { entry, options, correct };
}

function buildDeck(missesFirst: boolean, misses: string[]): RegionEntry[] {
  const all = shuffled(regionIndex());
  if (!missesFirst) return all;
  const missSet = new Set(misses);
  const front = all.filter((e) => missSet.has(keyOf(e)));
  const rest = all.filter((e) => !missSet.has(keyOf(e)));
  return [...front, ...rest];
}

export default function RecallPage() {
  const { progress, ready, setRecallMisses } = useProgress();
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<Mode>("mcq");
  const [missesFirst, setMissesFirst] = useState(true);
  const [deck, setDeck] = useState<RegionEntry[]>([]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  // GI keys self-marked wrong this session (built up; persisted on finish).
  const [sessionMisses, setSessionMisses] = useState<Set<string>>(new Set());
  const [hits, setHits] = useState(0);

  const total = regionIndex().length;
  const storedMisses = useMemo(() => (ready ? progress.recallMisses : []), [ready, progress.recallMisses]);

  const transition = (cb: () => void) => {
    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(cb);
    } else {
      cb();
    }
  };

  const changeScreen = (s: Screen) => {
    transition(() => setScreen(s));
  };

  const start = useCallback(() => {
    transition(() => {
      setDeck(buildDeck(missesFirst, storedMisses));
      setI(0);
      setRevealed(false);
      setChosen(null);
      setSessionMisses(new Set());
      setHits(0);
      setScreen("run");
    });
  }, [missesFirst, storedMisses]);

  const entry = deck[i];
  const card = useMemo(() => (entry ? buildCard(entry) : null), [entry]);

  const mark = useCallback(
    (got: boolean) => {
      if (!entry) return;
      const k = keyOf(entry);
      setSessionMisses((prev) => {
        const next = new Set(prev);
        if (got) next.delete(k);
        else next.add(k);
        return next;
      });
      if (got) setHits((h) => h + 1);
      const last = i >= deck.length - 1;
      if (last) {
        // Persist the final miss pile so it re-serves first next visit.
        const finalMisses = new Set(sessionMisses);
        if (got) finalMisses.delete(k);
        else finalMisses.add(k);
        setRecallMisses([...finalMisses]);
        transition(() => setScreen("done"));
      } else {
        transition(() => {
          setI((n) => n + 1);
          setRevealed(false);
          setChosen(null);
        });
      }
    },
    [entry, i, deck.length, sessionMisses, setRecallMisses]
  );

  const onPick = useCallback(
    (opt: string) => {
      if (chosen != null || !card) return;
      setChosen(opt);
    },
    [chosen, card]
  );

  // ───────────────────────── HOME ─────────────────────────
  if (screen === "home") {
    const missCount = storedMisses.length;
    return (
      <div className="space-y-6 rise">
        <header>
          <div className="eyebrow mb-2">Place → Grape</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Recall drill</h1>
          <p className="mt-2 text-muted text-[15px]">
            The single most-tested association on the paper: a place comes up, you name the grape.
            All {total} GIs in your pack — the core of{" "}
            <strong className="text-wine">LO3 + LO4 (62% of the marks)</strong>.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            interactive
            onClick={() => setMode("mcq")}
            className={`p-5 text-left transition-all ${mode === "mcq" ? "border-wine bg-blush/20" : ""}`}
          >
            <div className="font-display text-lg font-semibold text-ink">🎯 Multiple choice</div>
            <p className="mt-1 text-sm text-muted">Tap the grape grown there. Instant right/wrong feedback.</p>
          </Card>
          <Card
            interactive
            onClick={() => setMode("reveal")}
            className={`p-5 text-left transition-all ${mode === "reveal" ? "border-wine bg-blush/20" : ""}`}
          >
            <div className="font-display text-lg font-semibold text-ink">🃏 Flip to reveal</div>
            <p className="mt-1 text-sm text-muted">Say it in your head, flip, then grade yourself honestly.</p>
          </Card>
        </div>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={missesFirst}
            onChange={(e) => setMissesFirst(e.target.checked)}
            className="h-4 w-4 rounded border-line text-wine focus:ring-wine"
          />
          <span className="text-ink">Misses first</span>
          {missCount > 0 && <Chip className="ml-1">{missCount} from last pass</Chip>}
        </label>

        <Button onClick={start} className="w-full h-[46px]">
          Start drill ({total} cards) →
        </Button>
      </div>
    );
  }

  // ───────────────────────── DONE ─────────────────────────
  if (screen === "done") {
    const missed = sessionMisses.size;
    return (
      <div className="space-y-5 rise">
        <header>
          <div className="eyebrow mb-2">Place → Grape</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Reviewed all {deck.length}</h1>
          <p className="mt-2 text-muted text-[15px]">
            You got <strong className="text-good">{hits}</strong> and flagged{" "}
            <strong className={missed ? "text-bad" : "text-good"}>{missed}</strong> to revisit.
          </p>
        </header>

        <Card className="flex flex-wrap items-center gap-4 p-5">
          <div className="font-display text-4xl font-bold text-ink">
            {hits}
            <span className="text-lg text-muted">/{deck.length}</span>
          </div>
          {missed > 0 ? (
            <p className="text-sm text-muted">Your {missed} misses are saved — they’ll come up first next time.</p>
          ) : (
            <p className="text-sm font-medium text-good">🎉 Clean sweep — nothing flagged!</p>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={start} className="flex-1 h-[46px]">
            ↻ Go again
          </Button>
          <Button variant="ghost" onClick={() => changeScreen("home")} className="flex-1 h-[46px]">
            Back to setup
          </Button>
        </div>
      </div>
    );
  }

  // ───────────────────────── RUN ─────────────────────────
  if (!entry || !card) return null;
  const note = noteFor(entry.gi);
  const answered = chosen != null;

  return (
    <div className="space-y-5 rise">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="px-3.5 h-[36px]" onClick={() => changeScreen("home")}>
          ← Exit
        </Button>
        <span className="text-sm font-medium text-muted">{mode === "mcq" ? "Multiple choice" : "Flip to reveal"}</span>
        <span className="ml-auto text-sm font-semibold tabular-nums text-muted">
          {i + 1} / {deck.length}
        </span>
      </div>

      <ProgressBar percent={Math.round((i / deck.length) * 100)} className="w-full" />

      <Card className="p-6 text-center">
        <div className="eyebrow mb-2">Which grape grows in</div>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">{entry.gi}</h2>
        <p className="mt-1 text-sm text-muted">{entry.country}</p>

        {/* ---------- MCQ mode ---------- */}
        {mode === "mcq" && (
          <>
            <div className="mt-6 grid gap-3 text-left">
              {card.options.map((opt, index) => {
                const isCorrect = card.correct.has(opt);
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                let state: "default" | "selected" | "correct" | "wrong" | "dimmed" = "default";
                if (answered && isCorrect) state = "correct";
                else if (answered && opt === chosen) state = "wrong";
                else if (answered) state = "dimmed";

                return (
                  <QuizOption
                    key={opt}
                    letter={letter}
                    state={state}
                    disabled={answered}
                    onClick={() => onPick(opt)}
                  >
                    {opt}
                  </QuizOption>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 text-left">
                {card.correct.size > 1 && (
                  <p className="text-sm text-muted font-medium mb-2">
                    {entry.gi} grows {card.correct.size} of these — all correct answers are highlighted in green.
                  </p>
                )}
                {note && <p className="text-sm text-muted italic leading-relaxed">{note}</p>}
                <div className="mt-6">
                  <Button onClick={() => mark(card.correct.has(chosen))} className="w-full h-[44px]">
                    {i >= deck.length - 1 ? "Finish" : "Next →"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ---------- Reveal mode ---------- */}
        {mode === "reveal" && (
          <>
            {!revealed ? (
              <div className="mt-8">
                <Button onClick={() => setRevealed(true)} className="h-[46px] px-6">
                  Reveal grape{entry.varieties.length > 1 ? "s" : ""}
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-2">
                  {entry.varieties.map((v) => (
                    <span
                      key={v.id}
                      className="rounded-xl border border-good bg-good-bg px-4 py-2 text-sm font-semibold text-ink"
                    >
                      {v.name}
                    </span>
                  ))}
                </div>
                {note && <p className="mt-4 text-sm text-muted italic leading-relaxed">{note}</p>}
                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" onClick={() => mark(false)} className="flex-1 h-[44px]">
                    ✗ Missed it
                  </Button>
                  <Button onClick={() => mark(true)} className="flex-1 h-[44px]">
                    ✓ Got it
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
