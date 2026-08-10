import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

function hasOidcBlobAuth(): boolean {
  return Boolean(
    process.env.BLOB_STORE_ID?.trim() &&
      process.env.VERCEL_OIDC_TOKEN?.trim() &&
      process.env.BLOB_WEBHOOK_PUBLIC_KEY?.trim(),
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!hasOidcBlobAuth()) {
    return NextResponse.json(
      {
        error:
          "Blob OIDC auth incomplete. Set BLOB_STORE_ID, VERCEL_OIDC_TOKEN, and BLOB_WEBHOOK_PUBLIC_KEY in .env.local (vercel env pull), then restart the dev server.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY,
      getSignedToken: async (pathname) => {
        const ok =
          pathname.startsWith("frames/") ||
          (pathname.startsWith("passes/") && pathname.endsWith(".jpg"));
        if (!ok) throw new Error("Invalid upload path");

        const isPass = pathname.startsWith("passes/");
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: ["image/jpeg"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          validUntil: Date.now() + 60 * 60 * 1000,
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes: ["image/jpeg"],
            maximumSizeInBytes: 5 * 1024 * 1024,
            addRandomSuffix: !isPass,
            allowOverwrite: isPass,
          },
        };
      },
      // Localhost does not receive Blob webhooks; Format B finalizes client-side.
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
