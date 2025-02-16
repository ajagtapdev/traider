import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
import FastAPI
from pydantic import BaseModel
from typing import List


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

def get_stock_news(ticker, date):
    """
    Fetches news articles related to a stock ticker on a specific date.
    
    Note: The date is now used in the sort parameter (formatted as YYYYMMDD) 
    to try to filter the results. Make sure your CSE supports sorting by date.
    """
    query = f"{ticker} stock news"
    url = "https://www.googleapis.com/customsearch/v1"
    
    # Format the date as YYYYMMDD (e.g., "20240601")
    formatted_date = date.replace("-", "")
    
    params = {
        "q": query,
        "cx": CX,
        "key": GOOGLE_API_KEY,
        "num": 5,
        # Using the sort parameter to restrict results to the specific day.
        # (Your CSE must have sorting enabled for this to work.)
        "sort": f"date:r:{formatted_date}:{formatted_date}"
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Check if an error occurred.
    if "error" in data:
        print("Google API Error:", data["error"])
        return []
    
    # Extract snippets from the returned items.
    news_snippets = [item.get("snippet", "") for item in data.get("items", [])]
    return news_snippets

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
    # Remove any empty strings from the split
    return [line.strip() for line in summary_text.split("\n") if line.strip()]

app = FastAPI()

class StockNewsRequest(BaseModel):
    ticker: str
    date: str

@app.get("/get_stock_news", response_model=List[str])
async def get_stock_news_route(ticker: str, date: str):
    """
    Endpoint to fetch stock news based on ticker and date, and return summarized points.
    """
    news_results = get_stock_news(ticker, date)
    if not news_results:
        return ["No news articles found"]

    bullet_points = summarize_news_with_nvidia(news_results)
    return bullet_points