/**
 * Build time GitHub lookups. A failed request returns null, so a build never
 * breaks on the network; the page then leaves the date out.
 */
const cache = new Map<string, Promise<string | null>>();

/** The date (YYYY-MM-DD) of the latest push to a repo, from its github.com URL. */
export function lastPush(repoUrl: string): Promise<string | null> {
  const slug = new URL(repoUrl).pathname.replace(/^\/|\/$/g, '');
  if (!cache.has(slug)) {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    cache.set(
      slug,
      fetch(`https://api.github.com/repos/${slug}`, { headers, signal: AbortSignal.timeout(8000) })
        .then((response) => (response.ok ? response.json() : null))
        .then((repo) => (repo?.pushed_at ? String(repo.pushed_at).slice(0, 10) : null))
        .catch(() => null),
    );
  }
  return cache.get(slug)!;
}
