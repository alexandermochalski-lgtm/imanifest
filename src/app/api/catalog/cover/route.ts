import { get } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { isAllowedCatalogCover } from "@/lib/catalog-covers";
import { hasBlobToken, isVercel, readLocalFile } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const pathnameParam = request.nextUrl.searchParams.get("pathname")?.trim();
  if (!pathnameParam) {
    return NextResponse.json({ error: "Missing pathname." }, { status: 400 });
  }

  const pathname = pathnameParam.replace(/^\/+/, "");
  if (!(await isAllowedCatalogCover(pathname))) {
    return NextResponse.json({ error: "Cover not found." }, { status: 404 });
  }

  if (!isVercel()) {
    const filename = pathname.includes("/") ? pathname.split("/").pop()! : pathname;
    try {
      const data = await readLocalFile(filename);
      const lower = filename.toLowerCase();
      const type = lower.endsWith(".png")
        ? "image/png"
        : lower.endsWith(".webp")
          ? "image/webp"
          : lower.endsWith(".gif")
            ? "image/gif"
            : "image/jpeg";
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": type,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    } catch {
      return NextResponse.json({ error: "Cover not found." }, { status: 404 });
    }
  }

  if (!hasBlobToken()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return NextResponse.json({ error: "Cover not found." }, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    const contentType = result.blob.contentType || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not a cover image." }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load cover." },
      { status: 502 },
    );
  }
}
