import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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
