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

@app.get("/stock-data")
def get_stock_data(ticker: str, startDate: str, endDate: str):
    try:
        start_date_obj = datetime.strptime(startDate, "%Y-%m-%d")
        end_date_obj = datetime.strptime(endDate, "%Y-%m-%d")

        # Clamp future end dates to "today" so yahoo_fin won't fail
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

        # We want date, open, high, low, close, adjclose, volume in the response
        # But rename 'close' => 'price' for convenience
        stock_data.rename(columns={"close": "price"}, inplace=True)

        # Convert relevant columns to a list of dicts
        # (adjust as needed if you prefer different naming)
        records = stock_data[
            ["date", "open", "high", "low", "price", "adjclose", "volume"]
        ].to_dict(orient="records")

        return records
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return []