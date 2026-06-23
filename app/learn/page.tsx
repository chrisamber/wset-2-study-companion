import Link from "next/link";
import { CONCEPTS } from "@/data/concepts";

export const metadata = { title: "Learn — WSET L2" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="kicker">Learn</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Learn the syllabus</h1>
        <p className="mt-1 text-muted">
          Six Learning Outcomes. The badge on each shows how many of the 50 exam marks it carries —
          so you can see where the time is best spent.
        </p>
      </header>

      <div className="space-y-5">
        {CONCEPTS.map((c) => (
          <section key={c.lo} className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">
                LO{c.lo} · {c.title}
              </h2>
              <span
                className={`chip shrink-0 ${c.lo === 3 || c.lo === 4 ? "border-wine/30 bg-blush text-wine" : ""}`}
              >
                {c.questions} marks
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted">{c.blurb}</p>

            <div className="mt-4 space-y-4">
              {c.sections.map((s, i) => (
                <div key={i}>
                  <h3 className="kicker mt-4">{s.heading}</h3>
                  <ul className="mt-1 space-y-1">
                    {s.points.map((p, j) => (
                      <li key={j} className="flex gap-2 text-sm">
                        <span className="mt-0.5 text-wine-light" aria-hidden>•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-wine">
              {(c.lo === 3 || c.lo === 4) && (
                <Link href="/explore" className="underline underline-offset-2">Browse these grapes →</Link>
              )}
              {(c.lo === 3 || c.lo === 4) && (
                <Link href="/climate" className="underline underline-offset-2">Compare by climate →</Link>
              )}
              {c.lo === 5 && (
                <Link href="/decode" className="underline underline-offset-2">See the labelling terms →</Link>
              )}
              <Link href="/quiz" className="underline underline-offset-2">Quiz this LO →</Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
