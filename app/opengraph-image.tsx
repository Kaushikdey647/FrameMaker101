import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function logoDataUrl(): Promise<string> {
  const svg = await readFile(
    join(process.cwd(), "public/assets/title-transparent.svg"),
  );
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const logo = await logoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #083821 0%, #0B4D2C 55%, #0a3d24 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#F5C518",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#FF2D8A",
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={420} height={368} alt="" />
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              color: "#F7F1E6",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            PFP frame · Builder ID
          </div>
          <div
            style={{
              color: "#F5C518",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {SITE.hashtag}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
