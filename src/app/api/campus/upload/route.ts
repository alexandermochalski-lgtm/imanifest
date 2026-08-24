import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isCampusUnlocked } from "@/lib/membership";
import { getSession } from "@/lib/session";
import { getState } from "@/lib/state";
import { hasBlobToken } from "@/lib/storage";

const CAMPUS_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/** Authenticated campus members can upload field photos (forum, desk notes). */
export async function POST(request: Request) {
  if (!hasBlobToken()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }
  const state = await getState();
  const unlocked = await isCampusUnlocked(session.role, state, session.userId, session.email);
  if (!unlocked) {
    return NextResponse.json({ error: "Campus membership required." }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: CAMPUS_IMAGE_TYPES,
        maximumSizeInBytes: MAX_IMAGE_BYTES,
        addRandomSuffix: true,
        allowOverwrite: false,
      }),
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
