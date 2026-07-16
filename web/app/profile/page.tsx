"use client";
import { useCallback, useMemo, useState } from "react";
import { VARIETIES } from "@/data/varieties";
import { shuffled } from "@/lib/quiz-engine";
import type { Variety } from "@/lib/types";
import { Card, Button, Chip, ProgressBar, QuizOption, Alert } from "@/components/wset-ui";
import { Scale } from "@/components/Scale";

type Screen = "home" | "run" | "done";

const ROUND = 10; // cards per round

interface CardType {
  target: Variety;
  aromaSample: string[]; // 2–3 aromas drawn from the target's own list
  options: string[]; // 4 grape names: the target + 3 real distractors, shuffled
}

// "—" is the em-dash the data uses for whites' tannin; show it as N/A, never as a value.
const tanninLabel = (t: string) => (t === "—" ? "N/A" : t);

// Build one card: hide the name, sample 2–3 of the grape's own aromas, and draw
// 3 distractor names from OTHER varieties only. Nothing is invented.
function buildCard(target: Variety, pool: Variety[]): CardType {
  const aromaSample = shuffled(target.aromas).slice(0, Math.min(3, target.aromas.length));
  const distractors = shuffled(pool.filter((v) => v.id !== target.id))
    .slice(0, 3)
    .map((v) => v.name);
  const options = shuffled([target.name, ...distractors]);
  return { target, aromaSample, options };
}

function buildDeck(principalOnly: boolean): Variety[] {
  const pool = principalOnly ? VARIETIES.filter((v) => v.tier === "principal") : VARIETIES;
  return shuffled(pool).slice(0, ROUND);
}

export default function ProfilePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [principalOnly, setPrincipalOnly] = useState(false);
  const [deck, setDeck] = useState<Variety[]>([]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [hits, setHits] = useState(0);

  // The full pool that distractor names may be drawn from (mirrors the deck filter).
  const optionPool = useMemo(
    () => (principalOnly ? VARIETIES.filter((v) => v.tier === "principal") : VARIETIES),
    [principalOnly]
  );

  const transition = (update: () => void) =>
    "startViewTransition" in document ? document.startViewTransition(update) : update();

  const changeScreen = (s: Screen) => {
    transition(() => setScreen(s));
  };

  const start = useCallback(() => {
    transition(() => {
      setDeck(buildDeck(principalOnly));
      setI(0);
      setChosen(null);
      setHits(0);
      setScreen("run");
    });
  }, [principalOnly]);

  const target = deck[i];
  const card = useMemo(
    () => (target ? buildCard(target, optionPool) : null),
    [target, optionPool]
  );

  const onPick = useCallback(
    (opt: string) => {
      if (chosen != null || !card) return;
      setChosen(opt);
      if (opt === card.target.name) setHits((h) => h + 1);
    },
    [chosen, card]
  );

  const next = useCallback(() => {
    if (i >= deck.length - 1) {
      transition(() => setScreen("done"));
    } else {
      transition(() => {
        setI((n) => n + 1);
        setChosen(null);
      });
    }
  }, [i, deck.length]);

  // ───────────────────────── HOME ─────────────────────────
  if (screen === "home") {
    const count = (principalOnly ? VARIETIES.filter((v) => v.tier === "principal") : VARIETIES).length;
    return (
      <div className="space-y-6 rise">
        <header>
          <div className="eyebrow mb-2">Style → Grape</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Profile</h1>
          <p className="mt-2 text-muted text-[15px]">
            A grape&apos;s structure and aromas, name hidden — you pick the variety. The reverse of
            Explore, drilling the style-to-grape synthesis at the heart of{" "}
            <strong className="text-wine">LO3 + LO4 (62% of the marks)</strong>.
          </p>
        </header>

        <Card className="p-5">
          <p className="text-sm text-muted leading-relaxed">
            Each card shows body, acidity, tannin, sweetness and a couple of the grape&apos;s own
            aroma notes. Read the profile, then choose from four real grape names.
          </p>
        </Card>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={principalOnly}
            onChange={(e) => setPrincipalOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line text-wine focus:ring-wine"
          />
          <span className="text-ink">Principal only</span>
          <Chip className="ml-1">LO3 · {VARIETIES.filter((v) => v.tier === "principal").length} grapes</Chip>
        </label>

        <Button onClick={start} className="w-full h-[46px]">
          Start ({Math.min(ROUND, count)} cards) →
        </Button>
      </div>
    );
  }

  // ───────────────────────── DONE ─────────────────────────
  if (screen === "done") {
    const pct = deck.length ? Math.round((hits / deck.length) * 100) : 0;
    return (
      <div className="space-y-5 rise">
        <header>
          <div className="eyebrow mb-2">Style → Grape</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Round complete</h1>
          <p className="mt-2 text-muted text-[15px]">
            You named <strong className={pct >= 55 ? "text-good" : "text-bad"}>{hits}</strong> of{" "}
            {deck.length} grapes from their style alone.
          </p>
        </header>

        <Card className="flex flex-wrap items-center gap-4 p-5">
          <div className="font-display text-4xl font-bold text-ink">
            {hits}
            <span className="text-lg text-muted">/{deck.length}</span>
          </div>
          <p className="text-sm text-muted">
            {pct >= 85
              ? "🎉 Distinction territory — you really know these profiles."
              : pct >= 55
              ? "Solid — keep drilling the ones that tripped you up."
              : "Worth another pass — match each style back to its grape in Explore."}
          </p>
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
  if (!target || !card) return null;
  const answered = chosen != null;
  const colourLabel = target.colour === "black" ? "Black grape" : "White grape";
  const tierLabel = target.tier === "principal" ? "Principal" : "Regional";

  return (
    <div className="space-y-5 rise">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="px-3.5 h-[36px]" onClick={() => changeScreen("home")}>
          ← Exit
        </Button>
        <span className="text-sm font-medium text-muted">Name that grape</span>
        <span className="ml-auto text-sm font-semibold tabular-nums text-muted">
          {i + 1} / {deck.length}
        </span>
      </div>

      <ProgressBar percent={Math.round((i / deck.length) * 100)} className="w-full" />

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Chip>{colourLabel}</Chip>
          <Chip>{tierLabel}</Chip>
        </div>

        <div className="eyebrow mt-5 mb-2 block text-center">This grape&apos;s profile</div>

        {/* Structure scales — every value read straight off the Variety record */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Scale label="Body" value={target.body} />
          <Scale label="Acidity" value={target.acidity} />
          <Scale label="Tannin" value={tanninLabel(target.tannin)} />
          <Scale label="Sweetness" value={target.sweetness ?? "N/A"} />
        </div>

        {/* Aroma chips — sampled from the grape's own aromas[] */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {card.aromaSample.map((a) => (
            <Chip key={a}>
              {a}
            </Chip>
          ))}
        </div>

        {/* Options */}
        <div className="mt-6 grid gap-3 text-left">
          {card.options.map((opt, index) => {
            const isCorrect = opt === target.name;
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

        {/* Reveal — full name + summary, both from the Variety record */}
        {answered && (
          <div className="mt-6">
            <Alert tone="note" title={target.name}>
              {target.summary}
            </Alert>
            <Button onClick={next} className="mt-4 w-full h-[44px]">
              {i >= deck.length - 1 ? "Finish" : "Next →"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
