"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/explore", label: "Explore" },
  { href: "/decode", label: "Decode" },
  { href: "/climate", label: "Climate" },
  { href: "/confusables", label: "Confusables" },
  { href: "/recall", label: "Recall" },
  { href: "/profile", label: "Profile" },
  { href: "/quiz", label: "Quiz" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/82 backdrop-blur-[12px] -webkit-backdrop-blur-[12px]">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 h-[66px]">
        <Link
          href="/"
          className="flex items-baseline gap-2 font-display text-[23px] font-semibold tracking-[-0.02em] text-ink hover:opacity-90"
        >
          <span>Decant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-wine" aria-hidden></span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-6 overflow-x-auto h-full scrollbar-none">
          {LINKS.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center h-full border-b-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                  active
                    ? "border-wine text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
