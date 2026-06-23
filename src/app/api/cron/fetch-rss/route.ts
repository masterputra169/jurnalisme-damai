import { NextResponse } from "next/server";
import { fetchAndImportFeeds } from "@/lib/rss";

// Vercel Cron: dijalankan setiap 10 menit
export async function GET(request: Request) {
  // Protect cron endpoint — hanya boleh dipanggil Vercel Cron atau manual dengan secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Skip if not a Vercel cron call (Vercel sends cron-specific headers)
    const isVercelCron = request.headers.get("x-vercel-cron");
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await fetchAndImportFeeds();
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
