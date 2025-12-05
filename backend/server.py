from fastapi import FastAPI, HTTPException
from yahoo_fin.stock_info import get_data
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys

# Try to import the C++ extension
try:
    import traider_cpp
    CPP_AVAILABLE = True
    print("C++ extension loaded successfully")
except ImportError as e:
    CPP_AVAILABLE = False
    print(f"Warning: C++ extension not available: {e}")

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

# --- C++ Integration Endpoints ---

class TechnicalIndicatorsRequest(BaseModel):
    ticker: str
    period: int = 20

@app.post("/technical-indicators")
def get_technical_indicators(request: TechnicalIndicatorsRequest):
    """
    Calculate technical indicators using the high-performance C++ engine.
    """
    if not CPP_AVAILABLE:
        raise HTTPException(status_code=501, detail="C++ extension not available")
    
    try:
        # Fetch data for enough history (e.g. 2 years to be safe for EMAs etc)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        stock_data = get_data(
            request.ticker,
            start_date=start_date,
            end_date=end_date,
            index_as_date=False
        )
        
        if stock_data is None or stock_data.empty:
            raise HTTPException(status_code=404, detail="Stock data not found")

        # Prepare data for C++
        prices = stock_data['close'].tolist()
        volumes = stock_data['volume'].tolist()
        dates = stock_data['date'].astype(str).tolist()

        # Calculate indicators using C++
        # We'll calculate a standard suite
        sma_val = traider_cpp.indicators.sma(prices, request.period)
        ema_val = traider_cpp.indicators.ema(prices, request.period)
        rsi_val = traider_cpp.indicators.rsi(prices, 14)
        vwap_val = traider_cpp.indicators.vwap(prices, volumes)
        
        # Bollinger Bands (default 20, 2.0)
        bb = traider_cpp.indicators.bollinger_bands(prices, 20, 2.0)
        
        # Combine results
        # We return the last N points to keep payload size reasonable, or all if requested
        # Let's return the last 100 points aligned with dates
        
        limit = 100
        if len(prices) > limit:
            result_slice = slice(-limit, None)
        else:
            result_slice = slice(None)

        response_data = []
        for i in range(len(prices))[result_slice]:
            response_data.append({
                "date": dates[i],
                "price": prices[i],
                "sma": sma_val[i],
                "ema": ema_val[i],
                "rsi": rsi_val[i],
                "vwap": vwap_val[i],
                "bb_upper": bb[0][i],
                "bb_lower": bb[1][i]
            })
            
        return response_data

    except Exception as e:
        print(f"Error in technical-indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class PortfolioMetricsRequest(BaseModel):
    equity_curve: List[float]
    risk_free_rate: float = 0.02

@app.post("/calculate-metrics")
def calculate_metrics(request: PortfolioMetricsRequest):
    """
    Calculate portfolio metrics (Sharpe, Sortino, Drawdown) using C++ engine.
    """
    if not CPP_AVAILABLE:
        raise HTTPException(status_code=501, detail="C++ extension not available")
    
    try:
        # Check if calculate_metrics exists (in case of old DLL loaded)
        if not hasattr(traider_cpp.backtesting, "calculate_metrics"):
             # Fallback or error? Let's error to prompt restart
             raise HTTPException(status_code=503, detail="C++ extension outdated. Please restart server to load new bindings.")

        metrics = traider_cpp.backtesting.calculate_metrics(request.equity_curve, request.risk_free_rate)
        
        return {
            "total_return": metrics.total_return,
            "sharpe_ratio": metrics.sharpe_ratio,
            "sortino_ratio": metrics.sortino_ratio,
            "max_drawdown": metrics.max_drawdown,
            "volatility": metrics.volatility
        }
    except Exception as e:
        print(f"Error in calculate-metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TradeAnalysisRequest(BaseModel):
    ticker: str
    buy_date: str
    sell_date: str
    initial_investment: float

@app.post("/analyze-trade")
def analyze_trade(request: TradeAnalysisRequest):
    """
    Analyze a specific trade using C++ BacktestEngine.
    Compares the user's trade against a buy-and-hold strategy for the same period.
    """
    if not CPP_AVAILABLE:
        raise HTTPException(status_code=501, detail="C++ extension not available")

    try:
        # 1. Fetch Historical Data
        start_date = datetime.strptime(request.buy_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.sell_date, "%Y-%m-%d")
        
        # Add buffer for indicators if needed, but for simple trade analysis, exact range is key
        # We need daily data
        stock_data = get_data(
            request.ticker,
            start_date=start_date,
            end_date=end_date + timedelta(days=1), # Include sell date
            index_as_date=False
        )

        if stock_data is None or stock_data.empty:
            raise HTTPException(status_code=404, detail="Stock data not found for the given period")

        prices = stock_data['close'].tolist()
        dates = stock_data['date'].astype(str).tolist()

        # 2. Setup C++ Backtest Engine
        # We simulate the user's trade: Buy at start, Sell at end.
        # We can use the BacktestEngine to run this simulation to get metrics.
        
        # Strategy Signal: Buy on day 0, Sell on last day
        # 1 = Buy, -1 = Sell, 0 = Hold
        signals = [0] * len(prices)
        signals[0] = 1 # Buy all
        if len(signals) > 1:
            signals[-1] = -1 # Sell all
        
        bt_engine = traider_cpp.backtesting.BacktestEngine(request.initial_investment)
        result = bt_engine.run_simple(request.ticker, prices, signals)

        # 3. Construct Response
        metrics = result.metrics
        equity_curve = result.equity_curve
        
        # Calculate raw profit/loss for clarity
        final_value = equity_curve[-1]
        profit = final_value - request.initial_investment
        pct_return = (profit / request.initial_investment) * 100

        return {
            "ticker": request.ticker,
            "period": f"{request.buy_date} to {request.sell_date}",
            "initial_investment": request.initial_investment,
            "final_value": final_value,
            "profit": profit,
            "percent_return": pct_return,
            "max_drawdown": metrics.max_drawdown,
            "sharpe_ratio": metrics.sharpe_ratio, # Annualized
            "total_return_metric": metrics.total_return, # From C++
            "equity_curve": [
                {"date": d, "value": v} 
                for d, v in zip(dates, equity_curve)
            ]
        }

    except Exception as e:
        print(f"Error analyzing trade: {e}")
        raise HTTPException(status_code=500, detail=str(e))
