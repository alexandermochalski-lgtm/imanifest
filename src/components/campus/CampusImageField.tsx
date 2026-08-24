"use client";

import { useState } from "react";
import { campusMediaHref } from "@/lib/blob-access";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Client upload for forum / desk field photos (private Blob → catalog cover proxy). */
export function CampusImageField({
  name = "imageUrl",
  label = "Photo (optional)",
  hint,
  initialUrl = "",
}: {
  name?: string;
  label?: string;
  hint?: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const preview = campusMediaHref(url) ?? url;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPEG, PNG, WebP, or GIF.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const { upload } = await import("@vercel/blob/client");
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
      const blob = await upload(`imu/campus/${safe}`, file, {
        access: "private",
        handleUploadUrl: "/api/campus/upload",
        multipart: true,
        onUploadProgress: (event) => setProgress(Math.round(event.percentage)),
      });
      setUrl(blob.url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-[var(--line)] p-4">
      <input name={name} type="hidden" value={url} />
      <p className="text-xs text-muted">{label}</p>
      {hint ? <p className="mt-1 text-[11px] text-[var(--muted)]">{hint}</p> : null}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="mt-3 max-h-48 w-full max-w-md rounded-lg object-contain" src={preview} />
      ) : null}
      <label className="mt-3 block text-sm text-muted">
        Upload
        <input
          accept={ACCEPT}
          className="mt-2 block w-full text-sm"
          disabled={busy}
          onChange={(event) => void onFile(event.target.files?.[0])}
          type="file"
        />
      </label>
      {busy ? <p className="mt-2 text-sm text-gold">Uploading {progress}%</p> : null}
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
      {url ? (
        <button
          className="mt-2 text-xs text-[var(--muted)] hover:text-gold"
          type="button"
          onClick={() => setUrl("")}
        >
          Remove photo
        </button>
      ) : null}
    </div>
  );
}
