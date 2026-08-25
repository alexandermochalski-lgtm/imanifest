"use client";

import { useState } from "react";
import { campusMediaHref } from "@/lib/blob-access";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Compact image upload for avatar / banner / post media. */
export function ProfileImageUpload({
  name,
  label,
  initialUrl = "",
  aspect = "square",
}: {
  name: string;
  label: string;
  initialUrl?: string;
  aspect?: "square" | "banner";
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
      const blob = await upload(`imu/campus/profile/${safe}`, file, {
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
    <div className="space-y-2">
      <input name={name} type="hidden" value={url} />
      <p className="text-xs text-muted">{label}</p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={
            aspect === "banner"
              ? "h-28 w-full rounded-lg object-cover"
              : "h-20 w-20 rounded-full object-cover"
          }
          src={preview}
        />
      ) : (
        <div
          className={
            aspect === "banner"
              ? "flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-xs text-muted"
              : "flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-[var(--line)] text-xs text-muted"
          }
        >
          No image
        </div>
      )}
      <label className="block text-sm text-muted">
        Upload
        <input
          accept={ACCEPT}
          className="mt-1 block w-full text-sm"
          disabled={busy}
          onChange={(event) => void onFile(event.target.files?.[0])}
          type="file"
        />
      </label>
      {busy ? <p className="text-sm text-gold">Uploading {progress}%</p> : null}
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
      {url ? (
        <button className="text-xs text-[var(--muted)] hover:text-gold" type="button" onClick={() => setUrl("")}>
          Remove
        </button>
      ) : null}
    </div>
  );
}
