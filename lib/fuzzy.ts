// Forgiving answer matching for typed-recall flashcards. Pure — no React, no DOM.

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // drop spaces, slashes, hyphens, apostrophes
}

export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // Optimal String Alignment (Damerau-Levenshtein with adjacent transpositions)
  // so common letter-swap typos (e.g. "reisling" → "riesling") count as one edit.
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

function aliases(accepted: string[]): string[] {
  const out = new Set<string>();
  for (const a of accepted) {
    for (const part of a.split("/")) {
      const n = normalize(part);
      if (n) out.add(n);
    }
  }
  return [...out];
}

export function matchAnswer(
  input: string,
  accepted: string[]
): { correct: boolean; matched: string | null } {
  const got = normalize(input);
  if (!got) return { correct: false, matched: null };
  for (const alias of aliases(accepted)) {
    const tol = got.length >= 4 ? Math.max(1, Math.floor(alias.length / 6)) : 0;
    if (editDistance(got, alias) <= tol) return { correct: true, matched: alias };
    // accept a generous prefix of a longer compound name (e.g. "sauvignon" → "sauvignonblanc")
    if (alias.startsWith(got) && got.length >= Math.ceil(alias.length * 0.6)) {
      return { correct: true, matched: alias };
    }
  }
  return { correct: false, matched: null };
}
