import type { Metadata } from "next";
import Link from "next/link";
import { isAllowedShareImageUrl } from "@/lib/blob-allowlist";

type PageProps = {
  searchParams: Promise<{ img?: string | string[] }>;
};

function pickImg(raw: string | string[] | undefined): string | null {
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return null;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const img = pickImg(params.img);
  const allowed = img && isAllowedShareImageUrl(img) ? img : null;

  const title = "HH Goa 2026 — Framed";
  const description = "Just framed for HH Goa 2026. Make yours with #FrameInGoa.";

  if (!allowed) {
    return {
      title,
      description,
      twitter: { card: "summary_large_image", title, description },
      openGraph: { title, description },
    };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: allowed, width: 1200, height: 1200, type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [allowed],
    },
  };
}

export default async function SharePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const img = pickImg(params.img);
  const allowed = img && isAllowedShareImageUrl(img) ? img : null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
        HH Goa 2026
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">Framed with #FrameInGoa</p>

      <div className="mt-8 aspect-square w-full max-w-[min(100%,520px)] overflow-hidden rounded-2xl bg-[var(--frame-well)] ring-1 ring-[var(--line)]">
        {allowed ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote blob URL
          <img
            src={allowed}
            alt="Shared HH Goa 2026 framed photo"
            className="h-full w-full object-contain"
            width={1200}
            height={1200}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
            This share link is missing a valid image.
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-8 flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-8 text-sm font-semibold text-[var(--accent-fg)]"
      >
        Make yours
      </Link>
    </div>
  );
}
