import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!rateLimit(ip, 20, 60000)) { // 20 requests per minute
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get("ticker");
    const date = searchParams.get("date");

    if (!ticker || !date) {
      return NextResponse.json({ error: "Missing ticker or date" }, { status: 400 });
    }

    // Fetch news from FastAPI backend
    const response = await fetch(`http://localhost:8000/search?ticker=${ticker}&date=${date}`);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || "Failed to fetch stock news" }, { status: response.status });
    }

    const newsData = await response.json();
    return NextResponse.json({ news: Array.isArray(newsData) ? newsData : [] });
  } catch (error) {
    console.error("Error fetching stock news:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
