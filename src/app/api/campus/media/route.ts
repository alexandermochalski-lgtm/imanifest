import { get } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { isPrivateBlobUrl, pathnameFromBlobUrl } from "@/lib/blob-access";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import { hasBlobToken } from "@/lib/storage";

export async function GET(request: NextRequest) {
  if (!hasBlobToken()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in to access campus media." }, { status: 401 });
  }

  const state = await getState();
  const unlocked = await isCampusUnlocked(session.role, state, session.userId, session.email);
  if (!unlocked) {
    return NextResponse.json({ error: "Active campus membership required." }, { status: 403 });
  }

  const pathnameParam = request.nextUrl.searchParams.get("pathname")?.trim();
  const urlParam = request.nextUrl.searchParams.get("url")?.trim();
  const pathname =
    pathnameParam ||
    (urlParam && isPrivateBlobUrl(urlParam) ? pathnameFromBlobUrl(urlParam) : null);

  if (!pathname) {
    return NextResponse.json({ error: "Missing or invalid blob pathname." }, { status: 400 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    const contentType = result.blob.contentType || "application/octet-stream";
    const disposition = result.blob.contentDisposition || "inline";

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load media." },
      { status: 502 },
    );
  }
}
