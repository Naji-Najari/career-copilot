import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { detail: "Expected multipart/form-data." },
      { status: 415 },
    );
  }

  // Stream the raw body upstream, preserving the multipart boundary.
  const upstream = await fetch(`${BACKEND_URL}/v1/extract-pdf`, {
    method: "POST",
    headers: { "content-type": contentType },
    body: request.body,
    // Required when forwarding a ReadableStream in Node fetch.
    // @ts-expect-error -- `duplex` is valid on Node 18+ fetch but missing from DOM types.
    duplex: "half",
    cache: "no-store",
  });

  const payload = await upstream.text();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
