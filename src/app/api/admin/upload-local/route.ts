import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isVercel, saveLocalFile } from "@/lib/storage";

export async function POST(request: Request) {
  if (isVercel()) {
    return NextResponse.json({ error: "Local disk is not available on Vercel. Use Blob." }, { status: 400 });
  }
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file." }, { status: 400 });
  }
  const saved = await saveLocalFile(file);
  return NextResponse.json(saved);
}
