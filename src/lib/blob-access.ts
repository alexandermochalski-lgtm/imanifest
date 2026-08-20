/** Helpers for private Vercel Blob URLs — campus reads go through /api/campus/media. */

export function isBlobStorageUrl(url: string): boolean {
  return /blob\.vercel-storage\.com/i.test(url);
}

export function isPrivateBlobUrl(url: string): boolean {
  return /\.private\.blob\.vercel-storage\.com/i.test(url);
}

export function pathnameFromBlobUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!isBlobStorageUrl(parsed.hostname)) return null;
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

/** Turn a stored private blob URL into an authenticated campus proxy href. */
export function campusMediaHref(rawUrl: string | undefined | null): string | undefined {
  if (!rawUrl) return undefined;
  if (rawUrl.startsWith("/api/media/") || rawUrl.startsWith("/api/campus/media")) return rawUrl;
  if (isPrivateBlobUrl(rawUrl)) {
    const pathname = pathnameFromBlobUrl(rawUrl);
    if (!pathname) return rawUrl;
    return `/api/campus/media?pathname=${encodeURIComponent(pathname)}`;
  }
  return rawUrl;
}
