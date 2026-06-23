"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/explore", label: "Explore" },
  { href: "/decode", label: "Decode" },
  { href: "/climate", label: "Climate" },
  { href: "/quiz", label: "Quiz" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3">
        <Link
          href="/"
          className="mr-3 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.01em] text-wine"
        >
          <span aria-hidden>🍷</span>
          <span className="hidden sm:inline">WSET L2</span>
        </Link>
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto">
          {LINKS.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-wine text-white" : "text-muted hover:bg-blush hover:text-ink"
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
