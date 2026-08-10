import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ok =
          pathname.startsWith("frames/") ||
          (pathname.startsWith("passes/") && pathname.endsWith(".jpg"));
        if (!ok) throw new Error("Invalid upload path");

        // Exact serial path for passes — no random suffix so /id/[serial] can resolve.
        const isPass = pathname.startsWith("passes/");
        return {
          allowedContentTypes: ["image/jpeg"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: !isPass,
          allowOverwrite: isPass,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
