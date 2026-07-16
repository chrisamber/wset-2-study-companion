import Link from "next/link";
import Image from "next/image";
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
  { href: "/quiz", title: "Quiz", desc: `${QUESTIONS.length} verified questions: timed exams or practice by LO, with instant feedback.` },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="grid items-center gap-8 pt-2 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <div className="rise">
          <div className="eyebrow">Award in Wines · 50 questions · pass 55%</div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]">
            WSET Level&nbsp;2,
            <br />
            <span className="text-wine">made navigable.</span>
          </h1>
          <p className="mt-5 max-w-xl text-muted text-[15px] leading-relaxed">
            A study companion for the Award in Wines — every grape, region, label term and practice
            question, grounded in the published syllabus. Nothing invented.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/quiz" className="wset-btn wset-btn--primary h-[46px] px-6">
              Start a quiz →
            </Link>
            <Link href="/explore" className="wset-btn wset-btn--ghost h-[46px] px-5">
              Explore the grapes
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Chip>{VARIETIES.length} grape varieties</Chip>
            <Chip>{TERMS.length} label terms</Chip>
            <Chip>{QUESTIONS.length} quiz questions</Chip>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line shadow-[0_20px_50px_-20px_rgba(28,26,27,0.35)] sm:aspect-[5/6]">
            <Image
              src="/hero-wine.png"
              alt="A glass of red wine beside a Bordeaux bottle in soft window light"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-dark/25 via-transparent to-transparent" aria-hidden />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-line bg-card px-4 py-3 shadow-[0_8px_24px_-12px_rgba(28,26,27,0.4)] sm:block">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-gold">Structure</div>
            <div className="mt-0.5 font-display text-sm font-semibold text-ink">Acidity · Tannin · Body</div>
          </div>
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
          {FEATURES.map((f, i) => (
            <Link
              key={f.href}
              href={f.href}
              className="group block"
            >
              <Card interactive className="relative h-full overflow-hidden p-5">
                <span className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-wine transition-transform duration-200 ease-out group-hover:scale-y-100" aria-hidden />
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gold">{f.href}</div>
                  <span className="font-mono text-[0.625rem] tabular-nums text-line transition-colors group-hover:text-wine">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-1.5 flex items-center gap-1.5 font-display text-[18px] font-semibold text-ink transition-colors group-hover:text-wine">
                  {f.title}
                  <span className="translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>→</span>
                </h3>
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
