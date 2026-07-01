"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  PRINCIPAL_WHITES,
  REGIONAL_WHITES,
  PRINCIPAL_REDS,
  REGIONAL_REDS,
  type Grape,
} from "@/data/grapes";
import { QUESTIONS } from "@/data/questions";

const LETTERS = ["A", "B", "C", "D"];
const BREAKDOWN = [
  { n: 19, label: "Grapes", color: "#9B3B53", pct: 38 },
  { n: 12, label: "Regions", color: "#C87D42", pct: 24 },
  { n: 6, label: "Sparkle", color: "#BFA24E", pct: 12 },
  { n: 13, label: "Other", color: "#CCC7BF", pct: 26 },
];

function GrapeCard({ name, dot, regions, notes, body, acidity, tannin, aromas, pairings, tier }: Grape & { tier: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-white border border-[#ECE9E3] rounded-xl px-4 py-3.5 mb-2 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_12px_rgba(28,25,23,0.06)] cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
          style={{ background: dot }}
        />
        <span className="text-sm font-semibold">{name}</span>
        <span className="ml-auto text-[10px] text-[#8C837A] opacity-40">{open ? "▲" : "▼"}</span>
      </div>
      <p className="text-[11px] text-[#8C837A] pl-5 mb-0.5">{regions}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-5 mt-1">
        <span className="text-[10px] text-[#8C837A] opacity-70">Body: {body}</span>
        <span className="text-[10px] text-[#8C837A] opacity-70">Acidity: {acidity}</span>
        {tannin && <span className="text-[10px] text-[#8C837A] opacity-70">Tannin: {tannin}</span>}
      </div>

      {open && (
        <div className="pl-5 mt-2.5 space-y-1.5 animate-[fadeSlide_0.2s_ease]">
          <p className="text-[11px] text-[#6B5E54] leading-relaxed">
            <span className="font-semibold text-[#8C837A]">Aromas:</span> {aromas}
          </p>
          <p className="text-[11px] text-[#6B5E54] leading-relaxed">{notes}</p>
          <p className="text-[11px] text-[#8C837A] opacity-60 leading-relaxed">
            <span className="font-semibold">Pairs with:</span> {pairings}
          </p>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#8C837A] opacity-60 mt-5 mb-2.5 first:mt-0">
      {children}
    </p>
  );
}

function StudyPanel() {
  return (
    <>
      <SectionLabel>white · principal (LO3 — 19 marks)</SectionLabel>
      {PRINCIPAL_WHITES.map((g) => (
        <GrapeCard key={g.name} {...g} />
      ))}

      <SectionLabel>white · regional (LO4 — 12 marks)</SectionLabel>
      {REGIONAL_WHITES.map((g) => (
        <GrapeCard key={g.name} {...g} />
      ))}

      <SectionLabel>red · principal (LO3 — 19 marks)</SectionLabel>
      {PRINCIPAL_REDS.map((g) => (
        <GrapeCard key={g.name} {...g} />
      ))}

      <SectionLabel>red · regional (LO4 — 12 marks)</SectionLabel>
      {REGIONAL_REDS.map((g) => (
        <GrapeCard key={g.name} {...g} />
      ))}
    </>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizPanel() {
  const [questions, setQuestions] = useState(() => shuffle(QUESTIONS));
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[qi];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.c) setScore((s) => s + 1);
  }

  function next() {
    if (qi < total - 1) {
      setQi((n) => n + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setQuestions(shuffle(QUESTIONS));
    setQi(0);
    setScore(0);
    setSelected(null);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    let grade = "Keep studying — you'll get there.";
    if (pct >= 85) grade = "Distinction — incredible!";
    else if (pct >= 70) grade = "Merit — well done!";
    else if (pct >= 55) grade = "Pass — nice work!";

    return (
      <div className="text-center py-10">
        <div className="font-['Instrument_Serif'] text-5xl text-[#9B3B53] mb-1.5">
          {score} / {total}
        </div>
        <p className="text-sm text-[#8C837A] mb-5">
          {pct}% — {grade}
        </p>
        <button
          onClick={restart}
          className="border border-[#9B3B53] text-[#9B3B53] px-5 py-2 rounded-full text-xs font-semibold hover:bg-[rgba(155,59,83,0.05)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-[3px] bg-[#ECE9E3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#9B3B53] rounded-full transition-all duration-400"
            style={{ width: `${(qi / total) * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-[#8C837A] font-medium whitespace-nowrap">
          {qi + 1} / {total}
        </span>
      </div>

      <h2 className="font-['Instrument_Serif'] text-xl leading-snug mb-5">
        {q.q}
      </h2>

      <div className="flex flex-col gap-1.5 mb-4">
        {q.o.map((opt, i) => {
          let cls =
            "bg-white border border-[#ECE9E3] rounded-[10px] px-3.5 py-3 text-[13px] text-left flex items-center gap-2.5 transition-all duration-200";
          let letterCls =
            "text-[11px] font-bold text-[#8C837A] w-6 h-6 flex items-center justify-center rounded-full bg-[#F5F0EB] shrink-0 transition-all duration-200";

          if (selected !== null) {
            if (i === selected && i === q.c) {
              cls += " !border-[#4A7D5E] !bg-[rgba(74,125,94,0.05)]";
              letterCls += " !bg-[#4A7D5E] !text-white";
            } else if (i === selected) {
              cls += " !border-[#C44B4B] !bg-[rgba(196,75,75,0.04)]";
              letterCls += " !bg-[#C44B4B] !text-white";
            } else if (i === q.c) {
              cls += " !border-[rgba(74,125,94,0.25)]";
            } else {
              cls += " opacity-30";
            }
            cls += " cursor-default";
          } else {
            cls +=
              " cursor-pointer hover:border-[rgba(155,59,83,0.25)] hover:shadow-[0_1px_4px_rgba(155,59,83,0.06)]";
          }

          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className={letterCls}>{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <div className="bg-[#F5F0EB] border border-[#ECE9E3] rounded-[10px] px-4 py-3 text-xs text-[#8C837A] leading-relaxed mb-4 animate-[fadeSlide_0.3s_ease]">
            {q.e}
          </div>
          <button
            onClick={next}
            className="bg-[#9B3B53] text-white px-5 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
          >
            {qi < total - 1 ? "Next →" : "See Results"}
          </button>
        </>
      )}
    </>
  );
}

function SommelierPanel() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();

  return (
    <>
      <div className="mb-5">
        <h2 className="font-['Instrument_Serif'] text-xl leading-snug mb-1.5">
          Ask the Sommelier
        </h2>
        <p className="text-[13px] text-[#8C837A]">
          Ask about any of the 21 grapes above — answers are grounded in the notes on this page.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-[10px] px-3.5 py-3 text-[13px] leading-relaxed ${
              message.role === "user"
                ? "self-end bg-[#9B3B53] text-white"
                : "self-start bg-[#F5F0EB] border border-[#ECE9E3] text-[#1C1917]"
            }`}
          >
            {message.parts.map((part, i) =>
              part.type === "text" ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}

        {status === "submitted" && (
          <div className="text-[11px] text-[#8C837A] pl-1">Thinking…</div>
        )}

        {error && (
          <div className="bg-[rgba(196,75,75,0.06)] border border-[rgba(196,75,75,0.25)] text-[#C44B4B] rounded-[10px] px-3.5 py-3 text-[12px]">
            Something went wrong — try again in a moment.
          </div>
        )}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What's the difference between Syrah and Shiraz?"
          className="flex-1 bg-white border border-[#ECE9E3] rounded-full px-4 py-2.5 text-[13px] focus:outline-none focus:border-[rgba(155,59,83,0.4)]"
        />
        <button
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
          className="bg-[#9B3B53] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </>
  );
}

export default function Home() {
  const [tab, setTab] = useState<"study" | "quiz" | "ask">("study");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAF7] border-b border-[#ECE9E3]">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-3.5">
          <div className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#8C837A]">
            <span className="text-[#9B3B53]">◆</span> WSET 2
          </div>
          <div className="flex items-center gap-1">
            {(["study", "quiz", "ask"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[11px] font-semibold tracking-[1px] uppercase rounded-full transition-colors ${
                  tab === t
                    ? "bg-[#9B3B53] text-white"
                    : "text-[#8C837A] hover:text-[#1C1917] hover:bg-[#ECE9E3]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero + Breakdown */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-8 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Instrument_Serif'] text-3xl sm:text-[36px] leading-[1.1] tracking-tight mb-1.5">
              Fifty questions. Sixty minutes.
              <br />
              <em className="text-[#9B3B53]">You&apos;ve got this.</em>
            </h1>
            <p className="text-[13px] text-[#8C837A]">
              WSET Level 2 Award in Wines — 21 grapes · {QUESTIONS.length} practice questions
            </p>
          </div>
          <p className="text-[10px] text-[#8C837A] opacity-50 whitespace-nowrap">
            Pass ≥ 55% · Merit ≥ 70% · Distinction ≥ 85%
          </p>
        </div>

        <div className="flex h-2 rounded gap-0.5 overflow-hidden">
          {BREAKDOWN.map((b) => (
            <div
              key={b.label}
              className="rounded-sm"
              style={{ width: `${b.pct}%`, background: b.color }}
            />
          ))}
        </div>
        <div className="flex gap-0.5 mt-2">
          {BREAKDOWN.map((b) => (
            <div
              key={b.label}
              className="flex flex-col items-center"
              style={{ width: `${b.pct}%` }}
            >
              <span className="font-['Instrument_Serif'] text-base leading-none">
                {b.n}
              </span>
              <span className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#8C837A]">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 border-t border-[#ECE9E3]">
        <div className="max-w-3xl mx-auto px-6 py-5">
          {tab === "study" ? <StudyPanel /> : tab === "quiz" ? <QuizPanel /> : <SommelierPanel />}
        </div>
      </div>
    </div>
  );
}
