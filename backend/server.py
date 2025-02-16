from fastapi import FastAPI
from yahoo_fin.stock_info import get_data
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mapping of timeframes to yahoo_fin API
TIMEFRAME_MAP = {
    "1d": 1,
    "5d": 5,
    "1mo": 30,
    "6mo": 180,
    "1y": 365,
    "5y": 1825,
}

@app.get("/stock-data")
def get_stock_data(ticker: str, startDate: str, endDate: str):
    """
    Fetch daily historical data from 'startDate' up to 'endDate' for the given ticker.
    """
    try:
        # Parse incoming string dates (YYYY-MM-DD)
        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d")
        end_date_obj = datetime.strptime(endDate, "%Y-%m-%d")

        # If user picks an end date in the future, clamp to "today" 
        # so that yahoo_fin doesn't fail or return partial data
        today = datetime.today()
        if end_date_obj > today:
            end_date_obj = today

        stock_data = get_data(
            ticker,
            start_date=start_date_obj,
            end_date=end_date_obj,
            index_as_date=False  # so that the DataFrame has a 'date' column
        )

        if stock_data is None or stock_data.empty:
            return []  # Return an empty list if there's no data

        # "stock_data" should contain columns => ['date', 'open', 'high', 'low', 'close', 'adjclose', 'volume']
        # Rename 'close' to 'price' so it matches the front-end code
        stock_data.rename(columns={"close": "price"}, inplace=True)

        # Convert to a list of dicts
        records = stock_data[["date", "price"]].to_dict(orient="records")
        return records

    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return []

