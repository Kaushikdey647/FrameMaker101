import { head } from "@vercel/blob";
import { passJpgPath, passJsonPath, type PassRecord } from "@/lib/pass";
import { isValidSerial, normalizeSerial } from "@/lib/serial";

export async function loadPass(serialRaw: string): Promise<{
  record: PassRecord;
  imageUrl: string;
} | null> {
  const serial = normalizeSerial(serialRaw);
  if (!isValidSerial(serial)) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const [jsonMeta, jpgMeta] = await Promise.all([
      head(passJsonPath(serial)),
      head(passJpgPath(serial)),
    ]);

    const res = await fetch(jsonMeta.url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const record = (await res.json()) as PassRecord;
    if (record.status !== "ready" && !jpgMeta.url) return null;

    return {
      record: { ...record, serial, imageUrl: record.imageUrl ?? jpgMeta.url },
      imageUrl: jpgMeta.url,
    };
  } catch {
    return null;
  }
}
