# from yahoo_fin import stock_info as si
# import pandas as pd

# # Fetch S&P 500 tickers
# sp500_tickers = si.tickers_sp500()

# # Fetch company names from the S&P 500 data table
# sp500_table = si.get_quote_table(sp500_tickers[0])  # Get an example stock data structure

# # Create a list of ticker symbols with company names
# ticker_data = []
# for ticker in sp500_tickers:
#     try:
#         company_info = si.get_quote_table(ticker)
#         company_name = company_info.get("1y Target Est", "Unknown")  # Approximate company name
#         ticker_data.append({"symbol": ticker, "name": company_name})
#     except Exception as e:
#         print(f"Could not retrieve data for {ticker}: {e}")

# # Convert to DataFrame
# df = pd.DataFrame(ticker_data)

# # Save to CSV
# df.to_csv("ticker_name.csv", index=False)

# print("S&P 500 ticker list saved successfully!")