import type { Metadata } from "next";
import Link from "next/link";
import { loadPass } from "@/lib/load-pass";
import { normalizeSerial } from "@/lib/serial";

type PageProps = {
  params: Promise<{ serial: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serial: raw } = await params;
  const serial = normalizeSerial(raw);
  const pass = await loadPass(serial);
  const title = pass
    ? `${pass.record.name} · ${serial} · HH Goa 2026`
    : `Builder ID ${serial}`;
  const description = pass
    ? `${pass.record.title} — ${pass.record.role}. #FrameInGoa`
    : "HH Goa 2026 Builder ID";

  if (!pass) {
    return {
      title,
      description,
      twitter: { card: "summary_large_image", title, description },
    };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: pass.imageUrl, width: 1080, height: 1350, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pass.imageUrl],
    },
  };
}

export default async function IdPage({ params }: PageProps) {
  const { serial: raw } = await params;
  const serial = normalizeSerial(raw);
  const pass = await loadPass(serial);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[var(--green)] px-5 py-10 text-[var(--cream)]">
      <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--yellow)]">
        HH GOA 2026
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--magenta)]">
        Builder ID
      </p>

      {pass ? (
        <>
          <div className="mt-8 w-full max-w-[min(100%,380px)] overflow-hidden rounded-[1.35rem] bg-[var(--cream)] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pass.imageUrl}
              alt={`${pass.record.name} Builder ID`}
              className="aspect-[1080/1350] w-full object-contain"
              width={1080}
              height={1350}
            />
          </div>
          <p className="mt-4 font-mono text-sm font-bold tracking-wider text-[var(--yellow)]">
            {pass.record.serial}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-on-green)]">
            {pass.record.name} · {pass.record.title}
          </p>
          <a
            href={pass.imageUrl}
            download={`${pass.record.serial}.jpg`}
            className="mt-6 flex h-12 items-center justify-center rounded-full bg-[var(--yellow)] px-8 text-sm font-bold text-[var(--black)]"
          >
            Download
          </a>
        </>
      ) : (
        <div className="mt-16 max-w-sm text-center">
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--yellow)]">
            ID not found
          </p>
          <p className="mt-2 text-sm text-[var(--muted-on-green)]">
            Check the serial and try again. IDs look like HH-GOA-XXXXX.
          </p>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 text-sm font-semibold text-[var(--yellow)] underline-offset-2 hover:underline"
      >
        Make yours
      </Link>
    </div>
  );
}
