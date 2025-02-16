"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Contexts: React.FC = () => {
    const [news, setNews] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ticker, setTicker] = useState<string>("AAPL");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const cooldownTime = 15 * 1000; // 15 seconds in milliseconds

    const fetchNews = async () => {
        if (loading) return; // Prevent multiple requests at once

        const now = Date.now();
        if (now - lastFetchTime < cooldownTime) {
            setError("Please wait before fetching news again.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/search?ticker=${ticker}&date=${date}`);
            const data = await response.json();

            if (response.ok) {
                setNews(data.news || []);
                setLastFetchTime(now);
            } else {
                setError(data.error || "Failed to load news.");
            }
        } catch {
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white shadow-lg p-4">
            <CardHeader>
                <CardTitle className="text-[#408830]">Market Contexts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="Enter Ticker (e.g., AAPL)"
                        className="w-32"
                    />
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-40"
                    />
                    <Button onClick={fetchNews} disabled={loading}>
                        {loading ? "Fetching..." : "Fetch News"}
                    </Button>
                </div>

                <ScrollArea className="h-[240px] rounded-md border p-3">
                    {loading ? (
                        <p className="text-gray-500">Loading market contexts...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : news.length === 0 ? (
                        <p className="text-gray-500">No news available.</p>
                    ) : (
                        <div className="space-y-3">
                            {news.map((item, index) => (
                                <div key={index} className="bg-[#fdf6e9] p-3 rounded">
                                    <p className="font-medium text-[#408830]">Market Event {index + 1}</p>
                                    <p className="text-sm text-gray-600">{item}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default Contexts;
