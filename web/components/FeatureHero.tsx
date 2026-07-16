import Image from "next/image";
import type { ReactNode } from "react";

interface FeatureHeroProps {
  eyebrow: string;
  title: ReactNode;
  image: string;
  alt: string;
  children: ReactNode;
}

export function FeatureHero({ eyebrow, title, image, alt, children }: FeatureHeroProps) {
  return (
    <header className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-7">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1>
        <div className="mt-2 text-[15px] leading-relaxed text-muted">{children}</div>
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line shadow-[0_16px_36px_-20px_rgba(28,26,27,0.45)] sm:aspect-[3/2] md:aspect-square">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 767px) calc(100vw - 2rem), 240px"
          className="object-cover object-[center_70%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wine-dark/20 via-transparent to-transparent" aria-hidden />
      </div>
    </header>
  );
}
