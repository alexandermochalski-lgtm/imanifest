import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { CatalogOverlay, MediaKind } from "@/lib/types";

const OVERLAY_PATH = "imu/catalog-overlay.json";
const COOKIE = "imu_catalog";
const LOCAL_DIR = path.join(process.cwd(), ".data");
const LOCAL_OVERLAY = path.join(LOCAL_DIR, "catalog-overlay.json");
const LOCAL_UPLOADS = path.join(LOCAL_DIR, "uploads");

export function emptyOverlay(): CatalogOverlay {
  return { courses: [], books: [], bundles: [], media: [], members: {} };
}

export function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function isVercel() {
  return process.env.VERCEL === "1";
}

export function storageMode(): "blob" | "local" | "none" {
  if (hasBlobToken()) return "blob";
  if (!isVercel()) return "local";
  return "none";
}

async function withTimeout<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function readOverlay(): Promise<CatalogOverlay> {
  const mode = storageMode();
  if (mode === "blob") {
    return withTimeout(
      (async () => {
        try {
          const { get } = await import("@vercel/blob");
          const result = await get(OVERLAY_PATH, { access: "private", abortSignal: AbortSignal.timeout(8000) });
          if (!result || result.statusCode !== 200 || !result.stream) return emptyOverlay();
          const text = await new Response(result.stream).text();
          return { ...emptyOverlay(), ...(JSON.parse(text) as CatalogOverlay) };
        } catch {
          return emptyOverlay();
        }
      })(),
      9000,
      emptyOverlay(),
    );
  }
  if (mode === "local") {
    try {
      const text = await readFile(LOCAL_OVERLAY, "utf8");
      return { ...emptyOverlay(), ...(JSON.parse(text) as CatalogOverlay) };
    } catch {
      return emptyOverlay();
    }
  }
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return emptyOverlay();
  try {
    return { ...emptyOverlay(), ...(JSON.parse(raw) as CatalogOverlay) };
  } catch {
    return emptyOverlay();
  }
}

export async function writeOverlay(overlay: CatalogOverlay) {
  const payload = JSON.stringify(overlay);
  const mode = storageMode();
  if (mode === "blob") {
    const { put } = await import("@vercel/blob");
    await put(OVERLAY_PATH, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
      contentType: "application/json",
    });
    return;
  }
  if (mode === "local") {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(LOCAL_OVERLAY, payload, "utf8");
    return;
  }
  if (payload.length > 3500) {
    throw new Error("Catalog is too large for a cookie. Connect Vercel Blob under Storage.");
  }
  (await cookies()).set(COOKIE, payload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function mutateOverlay(mutator: (overlay: CatalogOverlay) => CatalogOverlay) {
  const next = mutator(await readOverlay());
  await writeOverlay(next);
  return next;
}

export function kindFromContentType(type: string, name: string): MediaKind {
  if (type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)$/i.test(name)) return "audio";
  if (type === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
  if (type.startsWith("image/")) return "image";
  return "other";
}

export async function saveLocalFile(file: File) {
  await mkdir(LOCAL_UPLOADS, { recursive: true });
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  const filename = `${Date.now()}-${safe}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_UPLOADS, filename), buffer);
  return {
    pathname: `local/${filename}`,
    url: `/api/media/${filename}`,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function readLocalFile(filename: string) {
  const safe = path.basename(filename);
  return readFile(path.join(LOCAL_UPLOADS, safe));
}

export const ALLOWED_UPLOAD_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
