"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerMedia } from "@/app/actions/catalog";
import { campusMediaHref } from "@/lib/blob-access";

const COVER_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type LibraryItem = { id: string; title: string };

function shortLabel(title: string) {
  const cleaned = title.replace(/^[^—–-]+[—–-]\s*/, "");
  return cleaned.length > 64 ? `${cleaned.slice(0, 61)}…` : cleaned || title;
}

export function CourseCoverField({
  mode,
  initialUrl,
  label = "Cover image",
  refreshOnUpload = false,
  inputName = "coverUrl",
  library = [],
}: {
  mode: "blob" | "local" | "none";
  initialUrl?: string;
  label?: string;
  /** Avoid refreshing when this field sits inside a text form — it wipes unsaved edits. */
  refreshOnUpload?: boolean;
  inputName?: string;
  library?: LibraryItem[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const preview = campusMediaHref(url) ?? url;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPEG, PNG, WebP, or GIF cover.");
      return;
    }
    if (mode === "none") {
      setError("Connect Vercel Blob before uploading covers.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      let uploadedUrl = "";
      let pathname = "";
      let contentType = file.type || "image/jpeg";
      let size = file.size;
      if (mode === "blob") {
        const { upload } = await import("@vercel/blob/client");
        const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
        const blob = await upload(`imu/covers/${safe}`, file, {
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
      await registerMedia({ title: file.name, url: uploadedUrl, pathname, contentType, size });
      setUrl(uploadedUrl);
      if (refreshOnUpload) router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-5">
      <input name={inputName} type="hidden" value={url} />
      <p className="text-xs text-muted">{label}</p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="Cover preview" className="mt-3 h-36 w-full max-w-xs rounded-xl object-cover" src={preview} />
      ) : (
        <p className="mt-2 text-sm text-muted">No cover yet.</p>
      )}
      {mode === "none" ? (
        <p className="mt-3 text-sm text-muted">Connect Vercel Blob to upload covers, or paste a URL below.</p>
      ) : (
        <label className="mt-3 block text-sm text-muted">
          Upload image
          <input
            accept={COVER_ACCEPT}
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
        Or paste URL
        <input
          className="mt-1 w-full px-3 py-2"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
          value={url}
        />
      </label>
      {library.length ? (
        <label className="mt-3 block text-xs text-muted">
          Or pick from library
          <select className="mt-1 w-full px-3 py-2" defaultValue="" name="coverMediaId">
            <option value="">Keep upload / URL above</option>
            {library.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {shortLabel(asset.title)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
