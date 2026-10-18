/**
 * My public GitHub contribution calendar, read at build time from the same
 * HTML fragment github.com renders on a profile. No token needed. Returns
 * null when GitHub is unreachable or the markup changes, and the section that
 * uses it is left out rather than showing wrong numbers.
 */
export interface ContributionDay {
  date: string;
  count: number;
  /** GitHub's shade, 0 (none) to 4 (most). */
  level: number;
}

export interface Contributions {
  days: ContributionDay[];
  total: number;
}

const TIMEOUT_MS = 10_000;
const cache = new Map<string, Promise<Contributions | null>>();

/** Both language versions of the page ask; fetch once per build. */
export function getContributions(user: string): Promise<Contributions | null> {
  if (!cache.has(user)) cache.set(user, load(user));
  return cache.get(user)!;
}

async function load(user: string): Promise<Contributions | null> {
  try {
    const response = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { 'User-Agent': 'portfolio-build', 'X-Requested-With': 'XMLHttpRequest' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const result = parseContributions(await response.text());
    return result.days.length > 300 ? result : null;
  } catch {
    return null;
  }
}

/** Reads each day's date and shade from its cell, and its count from the cell's tooltip. */
export function parseContributions(html: string): Contributions {
  const counts = new Map<string, number>();
  for (const [, id, label] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const match = /^(\d[\d,]*) contributions?/.exec(label.trim());
    counts.set(id, match ? Number(match[1].replace(/,/g, '')) : 0);
  }

  const days: ContributionDay[] = [];
  for (const [cell] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const date = /\bdata-date="([^"]+)"/.exec(cell)?.[1];
    const id = /\bid="([^"]+)"/.exec(cell)?.[1];
    const level = Number(/\bdata-level="(\d)"/.exec(cell)?.[1] ?? 0);
    if (date) days.push({ date, level, count: (id && counts.get(id)) || 0 });
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  return { days, total: days.reduce((sum, day) => sum + day.count, 0) };
}
