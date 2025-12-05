import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    if (!rateLimit(ip, 60, 60000)) { // 60 requests per minute
      return NextResponse.json([], { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get("ticker")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!ticker || !startDate || !endDate) {
      return NextResponse.json([], { status: 400 })
    }

    // Forward all three as query params
    const response = await fetch(
      `http://localhost:8000/stock-data?ticker=${ticker}&startDate=${startDate}&endDate=${endDate}`
    )
    const stockData = await response.json()

    return NextResponse.json(Array.isArray(stockData) ? stockData : [])
  } catch (error) {
    console.error("Error in Next.js route:", error)
    return NextResponse.json([], { status: 500 })
  }
}
