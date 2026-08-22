import { pathnameFromBlobUrl } from "@/lib/blob-access";
import { guides as seedGuides } from "@/lib/catalog";
import { readOverlay } from "@/lib/storage";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

let cached: { at: number; pathnames: Set<string> } | null = null;
const CACHE_MS = 60_000;

function addCoverPath(pathnames: Set<string>, url?: string | null) {
  if (!url) return;
  if (url.startsWith("/api/media/")) {
    pathnames.add(url.replace(/^\//, ""));
    return;
  }
  const pathname = pathnameFromBlobUrl(url);
  if (pathname) pathnames.add(pathname);
}

/** Pathnames that may be served as public catalog cover art (marketing + browse). */
export async function getCatalogCoverPathnames(): Promise<Set<string>> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.pathnames;

  const pathnames = new Set<string>();
  const overlay = await readOverlay();

  for (const course of overlay.courses) addCoverPath(pathnames, course.coverUrl);
  for (const book of overlay.books) addCoverPath(pathnames, book.coverUrl);
  for (const guide of overlay.guides ?? []) addCoverPath(pathnames, guide.coverUrl);
  for (const guide of seedGuides) addCoverPath(pathnames, guide.coverUrl);

  cached = { at: Date.now(), pathnames };
  return pathnames;
}

export function isCatalogCoverPathname(pathname: string): boolean {
  const normalized = pathname.replace(/^\/+/, "");
  if (!IMAGE_EXT.test(normalized)) return false;
  if (normalized.startsWith("imu/covers/")) return true;
  return false;
}

export async function isAllowedCatalogCover(pathname: string): Promise<boolean> {
  const normalized = pathname.replace(/^\/+/, "");
  if (!IMAGE_EXT.test(normalized)) return false;
  if (normalized.startsWith("imu/covers/")) return true;
  const allowed = await getCatalogCoverPathnames();
  return allowed.has(normalized);
}
