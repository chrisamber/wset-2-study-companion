"use client";
import { useCallback, useRef, useState } from "react";
import { cardsForDeck, DECKS, type DeckId, type Card } from "@/lib/flashcards-deck";
import { useFlashcards, deckSummary, buildSession } from "@/lib/flashcards";
import { matchAnswer } from "@/lib/fuzzy";
import { Bar } from "@/components/Bar";

const SESSION_SIZE = 20;
type Screen = "picker" | "run" | "done";

export default function FlashcardsPage() {
  const { store, ready, record, reset } = useFlashcards();
  const [screen, setScreen] = useState<Screen>("picker");
  const [deck, setDeck] = useState<DeckId>("assoc");
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [tally, setTally] = useState({ right: 0, total: 0 });
  const [confirmReset, setConfirmReset] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startDeck = useCallback(
    (d: DeckId) => {
      setDeck(d);
      setQueue(buildSession(cardsForDeck(d), store, SESSION_SIZE));
      setIdx(0);
      setInput("");
      setRevealed(false);
      setTally({ right: 0, total: 0 });
      setScreen("run");
    },
    [store]
  );

  const submit = useCallback(() => {
    if (revealed || !input.trim()) return;
    const card = queue[idx];
    const ok = matchAnswer(input, card.accepted).correct;
    setCorrect(ok);
    setRevealed(true);
    setTally((t) => ({ right: t.right + (ok ? 1 : 0), total: t.total + 1 }));
    record(card.id, ok);
  }, [revealed, input, queue, idx, record]);

  const override = useCallback(() => {
    const card = queue[idx];
    const next = !correct;
    setCorrect(next);
    setTally((t) => ({ ...t, right: t.right + (next ? 1 : -1) }));
    record(card.id, next);
  }, [correct, queue, idx, record]);

  const next = useCallback(() => {
    if (idx + 1 >= queue.length) {
      setScreen("done");
      return;
    }
    setIdx((i) => i + 1);
    setInput("");
    setRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [idx, queue.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (revealed) next();
    else submit();
  };

  // ---------- PICKER ----------
  if (screen === "picker") {
    return (
      <div className="space-y-6">
        <header>
          <p className="kicker">Flashcards</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Drill from memory</h1>
          <p className="mt-1 text-muted">
            Type the answer — recall is stronger than recognition. Misses come back sooner.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {DECKS.map((d) => {
            const s = ready ? deckSummary(cardsForDeck(d.id), store) : null;
            return (
              <button
                key={d.id}
                onClick={() => startDeck(d.id)}
                className="card p-5 text-left transition hover:border-wine"
              >
                <div className="font-display text-lg font-semibold text-ink">{d.label}</div>
                <p className="mt-1 text-sm text-muted">
                  {s ? `${s.mastered}/${s.total} mastered` : `${cardsForDeck(d.id).length} cards`}
                </p>
              </button>
            );
          })}
        </div>

        {ready && (
          <div className="card space-y-3 p-5">
            <p className="kicker">Your progress</p>
            {DECKS.map((d) => {
              const s = deckSummary(cardsForDeck(d.id), store);
              const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
              return <Bar key={d.id} label={d.label} pct={pct} value={`${s.mastered}/${s.total}`} />;
            })}
            {confirmReset ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted">Reset all flashcard progress?</span>
                <button
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                  }}
                  className="font-medium text-wine"
                >
                  Yes, reset
                </button>
                <button onClick={() => setConfirmReset(false)} className="text-muted">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="text-sm text-muted hover:text-wine">
                Reset progress
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- RUN ----------
  if (screen === "run") {
    const card = queue[idx];
    if (!card) {
      return (
        <div className="space-y-4">
          <p className="text-muted">No cards to study in this deck yet.</p>
          <button onClick={() => setScreen("picker")} className="btn-primary">
            Back
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <button onClick={() => setScreen("picker")} className="hover:text-wine">
            ← Decks
          </button>
          <span className="tabular-nums">
            {idx + 1} / {queue.length}
          </span>
        </div>

        <div className="card p-6">
          {card.kicker && <p className="kicker">{card.kicker}</p>}
          <p className="mt-2 font-display text-xl font-semibold text-ink">{card.prompt}</p>

          <input
            ref={inputRef}
            autoFocus
            value={input}
            disabled={revealed}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type your answer…"
            className="mt-4 w-full rounded-lg border border-cream-2 bg-white px-3 py-2 text-ink outline-none focus:border-wine disabled:opacity-60"
          />

          {revealed && (
            <div className="mt-4 space-y-2">
              <p className={`font-medium ${correct ? "text-green-700" : "text-wine"}`}>
                {correct ? "✓ Correct" : "✗ Not quite"} — {card.canonical}
              </p>
              {card.note && <p className="text-sm text-muted">{card.note}</p>}
              <button onClick={override} className="text-sm text-muted underline hover:text-wine">
                {correct ? "Mark wrong" : "I was right"}
              </button>
            </div>
          )}
        </div>

        {revealed ? (
          <button onClick={next} className="btn-primary w-full">
            {idx + 1 >= queue.length ? "Finish" : "Next →"}
          </button>
        ) : (
          <button onClick={submit} disabled={!input.trim()} className="btn-primary w-full disabled:opacity-50">
            Check
          </button>
        )}
      </div>
    );
  }

  // ---------- DONE ----------
  const pct = tally.total ? Math.round((tally.right / tally.total) * 100) : 0;
  return (
    <div className="space-y-5">
      <header>
        <p className="kicker">Session complete</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {tally.right} / {tally.total} correct
        </h1>
        <p className="mt-1 text-muted">{pct}% this round. Missed cards will resurface sooner.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => startDeck(deck)} className="btn-primary">
          Study again
        </button>
        <button onClick={() => setScreen("picker")} className="card p-4 text-center hover:border-wine">
          Back to decks
        </button>
      </div>
    </div>
  );
}
