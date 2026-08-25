"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerMedia } from "@/app/actions/catalog";
import { campusMediaHref } from "@/lib/blob-access";

const LESSON_ACCEPT =
  "video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/x-m4a,audio/aac,application/pdf";

type LibraryItem = { id: string; title: string; kind: string; url: string };

function shortLabel(title: string) {
  const cleaned = title.replace(/^[^—–-]+[—–-]\s*/, "").replace(/\.(wav|m4a|mp3|mp4|pdf)$/i, "");
  return cleaned.length > 72 ? `${cleaned.slice(0, 69)}…` : cleaned || title;
}

export function LessonMediaField({
  mode,
  library,
  initialUrl,
  initialMediaId,
  compact = false,
}: {
  mode: "blob" | "local" | "none";
  library: LibraryItem[];
  initialUrl?: string;
  initialMediaId?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [mediaId, setMediaId] = useState(initialMediaId ?? "");
  const [fileName, setFileName] = useState(() => library.find((item) => item.id === initialMediaId)?.title ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(!compact || !initialUrl);

  const preview = campusMediaHref(url) ?? url;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (mode === "none") {
      setError("Connect Vercel Blob before uploading lesson files.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      let uploadedUrl = "";
      let pathname = "";
      let contentType = file.type || "application/octet-stream";
      let size = file.size;
      if (mode === "blob") {
        const { upload } = await import("@vercel/blob/client");
        const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
        const blob = await upload(`imu/media/${safe}`, file, {
          access: "private",
          handleUploadUrl: "/api/admin/upload",
          multipart: true,
          onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
        });
        uploadedUrl = blob.url;
        pathname = blob.pathname;
        contentType = blob.contentType || contentType;
      } else {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/upload-local", { method: "POST", body });
        const json = (await response.json()) as {
          url?: string;
          pathname?: string;
          contentType?: string;
          size?: number;
          error?: string;
        };
        if (!response.ok || !json.url || !json.pathname) throw new Error(json.error || "Upload failed");
        uploadedUrl = json.url;
        pathname = json.pathname;
        contentType = json.contentType || contentType;
        size = json.size || size;
        setProgress(100);
      }
      const asset = await registerMedia({ title: file.name, url: uploadedUrl, pathname, contentType, size });
      setUrl(uploadedUrl);
      setMediaId(asset.id);
      setFileName(file.name);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div className="mt-2">
        <input name="mediaId" type="hidden" value={mediaId} />
        <input name="mediaUrl" type="hidden" value={url} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {url ? (
            <a className="text-gold underline-offset-2 hover:underline" href={preview} rel="noreferrer" target="_blank">
              {shortLabel(fileName || "Attached file")}
            </a>
          ) : (
            <span className="text-muted">No file</span>
          )}
          <button
            className="text-[11px] uppercase tracking-[0.14em] text-muted hover:text-gold"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? "Hide replace" : url ? "Replace file" : "Attach file"}
          </button>
        </div>
        {open ? (
          <div className="mt-3 grid gap-3 rounded-xl border border-[var(--line)] bg-black/20 p-3">
            {mode !== "none" ? (
              <label className="block text-xs text-muted">
                Upload
                <input
                  accept={LESSON_ACCEPT}
                  className="mt-1 block w-full text-sm"
                  disabled={busy}
                  onChange={(event) => void onFile(event.target.files?.[0])}
                  type="file"
                />
              </label>
            ) : null}
            {busy ? <p className="text-sm text-gold">Uploading {progress}%</p> : null}
            {error ? <p className="text-sm text-red-200">{error}</p> : null}
            <label className="block text-xs text-muted">
              Paste URL
              <input
                className="mt-1 w-full px-3 py-2"
                onChange={(event) => {
                  setUrl(event.target.value);
                  setMediaId("");
                  setFileName("");
                }}
                placeholder="https://…"
                value={url}
              />
            </label>
            {library.length ? (
              <label className="block text-xs text-muted">
                Library ({library.length})
                <select
                  className="mt-1 w-full px-3 py-2"
                  onChange={(event) => {
                    const id = event.target.value;
                    const asset = library.find((item) => item.id === id);
                    setMediaId(id);
                    setUrl(asset?.url ?? "");
                    setFileName(asset?.title ?? "");
                  }}
                  value={mediaId}
                >
                  <option value="">None</option>
                  {library.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {shortLabel(asset.title)} ({asset.kind})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-5">
      <input name="mediaId" type="hidden" value={mediaId} />
      <input name="mediaUrl" type="hidden" value={url} />
      <p className="text-xs text-muted">Lesson file</p>
      {url ? (
        <p className="mt-2 text-sm text-gold">
          {shortLabel(fileName || "File ready")} ·{" "}
          <a className="underline" href={preview} rel="noreferrer" target="_blank">
            Open
          </a>
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">No file yet — upload, paste a URL, or pick from the library.</p>
      )}
      {mode === "none" ? (
        <p className="mt-3 text-sm text-muted">Connect Vercel Blob to upload MP4, MP3, or PDF directly.</p>
      ) : (
        <label className="mt-3 block text-sm text-muted">
          Upload MP4, MP3, or PDF
          <input
            accept={LESSON_ACCEPT}
            className="mt-2 block w-full text-sm"
            disabled={busy}
            onChange={(event) => void onFile(event.target.files?.[0])}
            type="file"
          />
        </label>
      )}
      {busy ? <p className="mt-3 text-sm text-gold">Uploading {progress}%</p> : null}
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <label className="mt-4 block text-xs text-muted">
        Or paste media URL
        <input
          className="mt-1 w-full px-3 py-2"
          onChange={(event) => {
            setUrl(event.target.value);
            setMediaId("");
            setFileName("");
          }}
          placeholder="https://…"
          value={url}
        />
      </label>
      <label className="mt-3 block text-xs text-muted">
        Or pick from library
        <select
          className="mt-1 w-full px-3 py-2"
          onChange={(event) => {
            const id = event.target.value;
            const asset = library.find((item) => item.id === id);
            setMediaId(id);
            setUrl(asset?.url ?? "");
            setFileName(asset?.title ?? "");
          }}
          value={mediaId}
        >
          <option value="">None</option>
          {library.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {shortLabel(asset.title)} ({asset.kind})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
