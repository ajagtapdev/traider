import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { ticker, date } = req.query;
    if (!ticker || !date) {
        return res.status(400).json({ error: "Missing ticker or date parameter" });
    }

    try {
        // Send a request to the FastAPI backend
        const response = await fetch(`http://localhost:5000/get_stock_news?ticker=${ticker}&date=${date}`);
        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ error: data.error || "Failed to fetch stock news." });
        }

        // Return the summarized news to the frontend
        return res.status(200).json({ news: data });
    } catch (error) {
        return res.status(500).json({ error: "Error connecting to the backend" });
    }
}
