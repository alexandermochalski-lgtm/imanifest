"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerMedia } from "@/app/actions/catalog";

export function MediaUploader({
  mode,
  accept = "video/mp4,audio/mpeg,audio/mp3,application/pdf,image/jpeg,image/png,image/webp",
}: {
  mode: "blob" | "local" | "none";
  accept?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  if (mode === "none") {
    return (
      <p className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm text-muted">
        Files cannot live on the Vercel server disk. Connect <span className="text-gold">Vercel Blob</span> in the
        project Storage tab, then pull env vars so <code className="text-gold">BLOB_READ_WRITE_TOKEN</code> is set.
      </p>
    );
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      let url = "";
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
        url = blob.url;
        pathname = blob.pathname;
        contentType = blob.contentType || contentType;
      } else {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/upload-local", { method: "POST", body });
        const json = (await response.json()) as { url?: string; pathname?: string; contentType?: string; size?: number; error?: string };
        if (!response.ok || !json.url || !json.pathname) throw new Error(json.error || "Upload failed");
        url = json.url;
        pathname = json.pathname;
        contentType = json.contentType || contentType;
        size = json.size || size;
        setProgress(100);
      }
      await registerMedia({ title: file.name, url, pathname, contentType, size });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-5">
      <label className="block text-sm text-muted">
        Drop MP4, MP3, PDF, or a cover image
        <input
          accept={accept}
          className="mt-3 block w-full text-sm"
          disabled={busy}
          onChange={(event) => void onFile(event.target.files?.[0])}
          type="file"
        />
      </label>
      {busy ? <p className="mt-3 text-sm text-gold">Uploading {progress}%</p> : null}
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Browser sends the file straight to storage. Cap is 500 MB. Lecture-length 4K belongs on a stream CDN later.
      </p>
    </div>
  );
}
