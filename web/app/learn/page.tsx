import Link from "next/link";
import { CONCEPTS } from "@/data/concepts";
import { Card, Chip } from "@/components/wset-ui";

export const metadata = { title: "Learn — WSET L2" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 rise">
      <header>
        <div className="eyebrow mb-2">Learn</div>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Learn the syllabus</h1>
        <p className="mt-2 text-muted text-[15px]">
          Six Learning Outcomes. The badge on each shows how many of the 50 exam marks it carries —
          so you can see where the time is best spent.
        </p>
      </header>

      <div className="space-y-6">
        {CONCEPTS.map((c) => (
          <Card
            key={c.lo}
            className={`relative overflow-hidden p-5 sm:p-6 ${c.lo === 3 || c.lo === 4 ? "border-wine/25" : ""}`}
          >
            {(c.lo === 3 || c.lo === 4) && (
              <span className="absolute left-0 top-0 h-full w-1 bg-wine" aria-hidden />
            )}
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">
                LO{c.lo} · {c.title}
              </h2>
              <Chip className={c.lo === 3 || c.lo === 4 ? "border-wine/30 bg-blush text-wine" : ""}>
                {c.questions} marks
              </Chip>
            </div>
            <p className="mt-2 text-sm text-muted leading-relaxed">{c.blurb}</p>

            <div className="mt-4 space-y-4">
              {c.sections.map((s, i) => (
                <div key={i}>
                  <div className="eyebrow mt-4 mb-2">{s.heading}</div>
                  <ul className="mt-1 space-y-2">
                    {s.points.map((p, j) => (
                      <li key={j} className="flex gap-2 text-sm text-ink leading-relaxed">
                        <span className="mt-0.5 text-wine-light" aria-hidden>•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-wine">
              {(c.lo === 3 || c.lo === 4) && (
                <Link href="/explore" className="hover:underline underline-offset-4 decoration-wine-light">Browse these grapes →</Link>
              )}
              {(c.lo === 3 || c.lo === 4) && (
                <Link href="/climate" className="hover:underline underline-offset-4 decoration-wine-light">Compare by climate →</Link>
              )}
              {c.lo === 5 && (
                <Link href="/decode" className="hover:underline underline-offset-4 decoration-wine-light">See the labelling terms →</Link>
              )}
              <Link href="/quiz" className="hover:underline underline-offset-4 decoration-wine-light">Quiz this LO →</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
