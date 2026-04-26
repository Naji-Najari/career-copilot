import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// Both values must exceed the backend's REQUEST_TIMEOUT_S so its own 504
// surfaces instead of a client-side abort stranding LLM calls mid-run.
export const maxDuration = 310;

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const FETCH_TIMEOUT_MS = 305_000;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const upstream = await fetch(`${BACKEND_URL}/v1/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
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
