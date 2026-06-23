import Link from "next/link";
import { CONCEPTS } from "@/data/concepts";
import { VARIETIES } from "@/data/varieties";
import { TERMS } from "@/data/terms";
import { QUESTIONS } from "@/data/questions";
import { ProgressSnapshot } from "@/components/ProgressSnapshot";

const FEATURES = [
  { href: "/learn", emoji: "📖", title: "Learn", desc: "The whole syllabus, one Learning Outcome at a time — with the marks each is worth." },
  { href: "/explore", emoji: "🍇", title: "Explore", desc: "Every grape: style, key regions & GIs. Search, filter, or browse by region." },
  { href: "/decode", emoji: "🏷️", title: "Decode labels", desc: "What AOC, DOCG, Prädikat, Crianza & Grand Cru actually mean — and the grape behind a GI." },
  { href: "/climate", emoji: "🌡️", title: "Compare climate", desc: "See how cool vs warm growing changes the same grape — the cause WSET keeps testing." },
  { href: "/quiz", emoji: "📝", title: "Quiz", desc: "100 verified questions: timed exams or practice by LO, with instant feedback." },
];

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-2">
        <p className="kicker">Award in Wines · Exam July 2026 · pass 55%</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.07] tracking-[-0.015em] sm:text-5xl">
          WSET Level&nbsp;2,
          <br />
          <em className="not-italic font-medium text-ink">made navigable.</em>
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          A study companion for the Award in Wines — every grape, region, label term and practice
          question, grounded in your verified syllabus notes. Nothing invented.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/quiz" className="btn-primary">Start a quiz →</Link>
          <Link href="/explore" className="btn-ghost">Explore the grapes</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="chip">{VARIETIES.length} grape varieties</span>
          <span className="chip">{TERMS.length} label terms</span>
          <span className="chip">{QUESTIONS.length} quiz questions</span>
        </div>
      </section>

      {/* Where the marks are */}
      <section className="card p-5 sm:p-6">
        <p className="kicker">Where the marks are</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">Spend your time on grapes &amp; regions</h2>
        <p className="mt-1 text-sm text-muted">
          50 questions, 1 mark each. Grapes &amp; their regions (LO3 + LO4) are{" "}
          <strong className="text-ink">62% of the exam</strong>.
        </p>
        <ul className="mt-4 space-y-1.5">
          {CONCEPTS.map((c) => {
            const pct = (c.questions / 50) * 100;
            const heavy = c.lo === 3 || c.lo === 4;
            return (
              <li key={c.lo}>
                <Link
                  href="/learn"
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-blush"
                >
                  <span className={`w-40 shrink-0 ${heavy ? "font-semibold text-wine" : "text-ink"}`}>
                    LO{c.lo} · {c.title}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-2">
                    <span
                      className="bar-fill block h-full rounded-full"
                      style={{ width: `${pct}%`, background: heavy ? "var(--color-wine)" : "var(--color-wine-light)" }}
                    />
                  </span>
                  <span className="w-12 shrink-0 text-right tabular-nums text-muted">{c.questions} Q</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Feature grid */}
      <section>
        <p className="kicker mb-3">Five ways to study</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="card group p-5 transition hover:border-wine"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>{f.emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink group-hover:text-wine">{f.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{f.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProgressSnapshot />
    </div>
  );
}
