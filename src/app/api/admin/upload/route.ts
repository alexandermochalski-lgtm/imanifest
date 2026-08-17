import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, hasBlobToken } from "@/lib/storage";

export async function POST(request: Request) {
  if (!hasBlobToken()) {
    return NextResponse.json(
      { error: "Connect a Vercel Blob store and set BLOB_READ_WRITE_TOKEN." },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_UPLOAD_TYPES,
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
        allowOverwrite: false,
      }),
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
