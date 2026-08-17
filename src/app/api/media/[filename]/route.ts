import { NextResponse } from "next/server";
import { isVercel, readLocalFile } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  if (isVercel()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { filename } = await params;
  try {
    const data = await readLocalFile(filename);
    const lower = filename.toLowerCase();
    const type = lower.endsWith(".mp4")
      ? "video/mp4"
      : lower.endsWith(".mp3")
        ? "audio/mpeg"
        : lower.endsWith(".pdf")
          ? "application/pdf"
          : "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Missing file" }, { status: 404 });
  }
}
