import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { pickBuilderTitle } from "@/lib/builder-titles";
import { passJsonPath, type PassRecord } from "@/lib/pass";
import { mintSerial } from "@/lib/serial";

type Body = {
  name?: string;
  role?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  if (name.length < 2 || name.length > 48) {
    return NextResponse.json({ error: "Name must be 2–48 characters" }, { status: 400 });
  }
  if (role.length < 1 || role.length > 48) {
    return NextResponse.json({ error: "Stack / role is required" }, { status: 400 });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const serial = mintSerial();
    const title = pickBuilderTitle(name, serial);
    const record: PassRecord = {
      serial,
      name,
      role,
      title,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await put(passJsonPath(serial), JSON.stringify(record), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: false,
      });
      return NextResponse.json({ serial, title });
    } catch {
      // Collision or race — mint again
    }
  }

  return NextResponse.json({ error: "Could not reserve a unique serial" }, { status: 500 });
}
