import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 35;

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const FETCH_TIMEOUT_MS = 30_000;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { detail: "Expected multipart/form-data." },
      { status: 415 },
    );
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const upstream = await fetch(`${BACKEND_URL}/v1/extract-pdf`, {
      method: "POST",
      headers: { "content-type": contentType },
      body: request.body,
      // @ts-expect-error -- `duplex` is required for streaming a ReadableStream
      // body in Node 18+ fetch but is missing from the DOM TS lib.
      duplex: "half",
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await upstream.text();
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { detail: { error: "Backend did not respond in time." } },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { detail: { error: "Failed to reach backend." } },
      { status: 502 },
    );
  } finally {
    clearTimeout(t);
  }
}
