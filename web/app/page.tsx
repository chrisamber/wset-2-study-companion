import Link from "next/link";
import { CONCEPTS } from "@/data/concepts";
import { VARIETIES } from "@/data/varieties";
import { TERMS } from "@/data/terms";
import { QUESTIONS } from "@/data/questions";
import { ProgressSnapshot } from "@/components/ProgressSnapshot";
import { Card, Button, Chip, ProgressBar } from "@/components/wset-ui";

const FEATURES = [
  { href: "/learn", title: "Learn", desc: "The whole syllabus, one Learning Outcome at a time — with the marks each is worth." },
  { href: "/explore", title: "Explore", desc: "Every grape: style, key regions & GIs. Search, filter, or browse by region." },
  { href: "/decode", title: "Decode labels", desc: "What AOC, DOCG, Prädikat, Crianza & Grand Cru actually mean — and the grape behind a GI." },
  { href: "/climate", title: "Compare climate", desc: "See how cool vs warm growing changes the same grape — the cause WSET keeps testing." },
  { href: "/confusables", title: "Confusables", desc: "The two-way trap trainer: pick between the lookalikes WSET pairs as distractors, see the one tell." },
  { href: "/recall", title: "Recall drill", desc: "Place → grape flashcards across every GI — the LO3+LO4 core that's 62% of the marks." },
  { href: "/profile", title: "Profile", desc: "Style → grape: read a hidden grape's structure & aromas, then name it. The reverse of Explore." },
  { href: "/quiz", title: "Quiz", desc: "100 verified questions: timed exams or practice by LO, with instant feedback." },
];

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-2">
        <div className="eyebrow">Award in Wines · 50 questions · pass 55%</div>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.07] tracking-[-0.025em] sm:text-5xl">
          WSET Level&nbsp;2,
          <br />
          <span className="text-wine">made navigable.</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted text-[15px] leading-relaxed">
          A study companion for the Award in Wines — every grape, region, label term and practice
          question, grounded in the published syllabus. Nothing invented.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/quiz" className="wset-btn wset-btn--primary w-[150px] h-[44px]">
            Start a quiz →
          </Link>
          <Link href="/explore" className="wset-btn wset-btn--ghost h-[44px]">
            Explore the grapes
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip>{VARIETIES.length} grape varieties</Chip>
          <Chip>{TERMS.length} label terms</Chip>
          <Chip>{QUESTIONS.length} quiz questions</Chip>
        </div>
      </section>

      {/* Where the marks are */}
      <Card className="p-5 sm:p-6">
        <div className="eyebrow mb-2">Where the marks are</div>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">Spend your time on grapes &amp; regions</h2>
        <p className="mt-1 text-sm text-muted">
          50 questions, 1 mark each. Grapes &amp; their regions (LO3 + LO4) are{" "}
          <strong className="text-ink">62% of the exam</strong>.
        </p>
        <ul className="mt-6 space-y-3">
          {CONCEPTS.map((c) => {
            const pct = (c.questions / 50) * 100;
            const heavy = c.lo === 3 || c.lo === 4;
            return (
              <li key={c.lo}>
                <Link
                  href="/learn"
                  className="block rounded-lg transition hover:bg-blush/40"
                >
                  <ProgressBar
                    percent={pct}
                    label={`LO${c.lo} · ${c.title}`}
                    caption={`${c.questions} Q`}
                    className={heavy ? "font-semibold [&_.wset-bar__label]:text-wine [&_.wset-bar__label]:font-semibold" : ""}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Feature grid */}
      <section>
        <div className="eyebrow mb-4">Ways to study</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="block"
            >
              <Card interactive className="p-5 h-full">
                <div className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gold">{f.href}</div>
                <h3 className="mt-1.5 font-display text-[18px] font-semibold text-ink group-hover:text-wine">{f.title}</h3>
                <p className="mt-1 text-sm text-muted leading-normal">{f.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <ProgressSnapshot />
    </div>
  );
}
