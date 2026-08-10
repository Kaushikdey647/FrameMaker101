import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { passJsonPath, type PassRecord } from "@/lib/pass";
import { isValidSerial, normalizeSerial } from "@/lib/serial";

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured" }, { status: 503 });
  }

  let body: {
    serial?: string;
    name?: string;
    role?: string;
    title?: string;
    imageUrl?: string;
    createdAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const serial = normalizeSerial(body.serial ?? "");
  if (!isValidSerial(serial)) {
    return NextResponse.json({ error: "Invalid serial" }, { status: 400 });
  }
  if (!body.imageUrl?.startsWith("https://")) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }

  const record: PassRecord = {
    serial,
    name: (body.name ?? "Builder").trim().slice(0, 48),
    role: (body.role ?? "Builder").trim().slice(0, 48),
    title: (body.title ?? "Builder").trim().slice(0, 64),
    status: "ready",
    createdAt: body.createdAt || new Date().toISOString(),
    imageUrl: body.imageUrl,
  };

  await put(passJsonPath(serial), JSON.stringify(record), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return NextResponse.json({ ok: true, serial, imageUrl: record.imageUrl });
}
