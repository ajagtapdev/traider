from fastapi import FastAPI, HTTPException
from yahoo_fin.stock_info import get_data
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Dict

# Load environment variables from .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CX = "c293cecd2186844b3"  # Ensure this CSE is configured to search news sites!

# NVIDIA API Setup
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)

app = FastAPI()

# CORS middleware settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to store the last request timestamp and response per ticker
news_cache: Dict[str, Dict] = {}

COOLDOWN_PERIOD = timedelta(seconds=15)  # 15-second cooldown

@app.get("/stock-data")
def get_stock_data(ticker: str, startDate: str, endDate: str):
    try:
        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d")
        end_date_obj = datetime.strptime(endDate, "%Y-%m-%d")

        # Clamp future end dates to "today" to prevent Yahoo Finance API errors
        today = datetime.today()
        if end_date_obj > today:
            end_date_obj = today

        stock_data = get_data(
            ticker,
            start_date=start_date_obj,
            end_date=end_date_obj,
            index_as_date=False  # DataFrame will have a 'date' column
        )
        if stock_data is None or stock_data.empty:
            return []

        # Rename 'close' => 'price' for clarity
        stock_data.rename(columns={"close": "price"}, inplace=True)

        # Convert relevant columns to a list of dictionaries
        records = stock_data[
            ["date", "open", "high", "low", "price", "adjclose", "volume"]
        ].to_dict(orient="records")

        return records
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return []

def get_stock_news(ticker, date):
    """
    Fetches news articles related to a stock ticker on a specific date.
    """
    query = f"{ticker} stock news"
    url = "https://www.googleapis.com/customsearch/v1"
    
    formatted_date = date.replace("-", "")
    
    params = {
        "q": query,
        "cx": CX,
        "key": GOOGLE_API_KEY,
        "num": 5,
        "sort": f"date:r:{formatted_date}:{formatted_date}"
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if "error" in data:
        print("Google API Error:", data["error"])
        return []
    
    return [item.get("snippet", "") for item in data.get("items", [])]

def summarize_news_with_nvidia(news_list):
    """Uses NVIDIA model to summarize stock news into bullet points focused on external conditions."""
    combined_text = " ".join(news_list)
    
    prompt = (
        "Summarize the following stock news into 2-4 concise bullet points. "
        "Focus solely on external conditions, events, and market sentiments that could have influenced the company during this time period. "
        "Ensure all points are relevant to the stock's context, but do not include any direct numerical data or mention that the stock price went up or down. "
        "Avoid making any direct predictions about the stock's performance. "
        "Return only the bullet points and nothing else. "
        f"News: {combined_text}"
    )
    
    completion = client.chat.completions.create(
        model="meta/llama-3.3-70b-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=300
    )
    summary_text = completion.choices[0].message.content
    return [line.strip() for line in summary_text.split("\n") if line.strip()]

class StockNewsRequest(BaseModel):
    ticker: str
    date: str

@app.get("/search", response_model=List[str])
async def get_stock_news_route(ticker: str, date: str):
    """
    Endpoint to fetch stock news based on ticker and date, and return summarized points.
    Uses a 15-second cooldown per ticker to prevent excessive API calls.
    """
    now = datetime.now()
    
    # Check cooldown for the ticker
    if ticker in news_cache:
        last_request_time = news_cache[ticker]["timestamp"]
        if now - last_request_time < COOLDOWN_PERIOD:
            print(f"Returning cached news for {ticker} (cooldown active)")
            return news_cache[ticker]["response"]

    news_results = get_stock_news(ticker, date)
    if not news_results:
        return ["No news articles found"]

    bullet_points = summarize_news_with_nvidia(news_results)

    # Cache the result with a timestamp
    news_cache[ticker] = {
        "timestamp": now,
        "response": bullet_points
    }



    return bullet_points
