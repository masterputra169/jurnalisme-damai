import { NextResponse } from "next/server";

// Web Vitals reporting endpoint — sesuai ARCHITECTURE.md §8.
// Cukup append ke log; tidak perlu persistence untuk scope tugas kuliah.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // eslint-disable-next-line no-console -- production logging to Vercel log drain
    console.log(
      JSON.stringify({
        at: new Date().toISOString(),
        kind: "web-vitals",
        ...body,
      }),
    );
  } catch {
    // ignore malformed payload
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST Web Vitals payloads here" });
}