/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { StockTickerDropdown } from "./stock-ticker-dropdown"
import { Calendar, DollarSign, FastForward } from "lucide-react"
import TradeHistoryTable from "./table"

// Register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

/** Number of days to look back for the stock price chart. */
const TIME_WINDOW_OPTIONS = {
  "1w": 7,
  "2w": 14,
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
  "5y": 1825,
}

/** Full daily record from server. */
type StockRow = {
  date: string
  open: number
  high: number
  low: number
  price: number      // (renamed from 'close')
  adjclose: number
  volume: number
}

type Trade = {
  date: string         // 'YYYY-MM-DD'
  ticker: string
  quantity: number
  price: number
  action: "buy" | "sell"
}

/**
 * Utility: add days to a Date
 */
function addDays(base: Date, offset: number) {
  const d = new Date(base.getTime())
  d.setDate(d.getDate() + offset)
  return d
}

/**
 * Utility: format Date => 'YYYY-MM-DD'
 */
function fmt(date: Date) {
  return date.toISOString().split("T")[0]
}



/**
 * The main Trading Simulator component
 */
export function TradingSimulator() {
  // -------------------------------------------
  // 1) Top-level state: heading, sim config
  // -------------------------------------------
  const [startDate, setStartDate] = useState(new Date("2000-01-01"))
  const [simulationDurationMonths, setSimulationDurationMonths] = useState(6)
  const [startingCapital, setStartingCapital] = useState(10000)

  // Current sim date & cash
  const [currentDate, setCurrentDate] = useState(startDate)
  const [capital, setCapital] = useState(startingCapital)

  // The ticker for the stock price chart
  const [chartTicker, setChartTicker] = useState("AAPL")

  // The “time window” for the stock chart
  const [timeWindowKey, setTimeWindowKey] =
    useState<keyof typeof TIME_WINDOW_OPTIONS>("1m")

  // Fetched daily data from backend
  const [stockData, setStockData] = useState<StockRow[]>([])

  // All user trades
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    console.log("Trades updated:", trades)
  }, [trades])

  // The daily portfolio history (from start date to current date)
  const [portfolioHistory, setPortfolioHistory] = useState<
    { date: string; value: number }[]
  >([])

  // Provide a “toast” when a trade is placed
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // -------------------------------------------
  // 2) Place Trade panel: uses chartTicker
  // -------------------------------------------
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy")
  const [tradeQuantity, setTradeQuantity] = useState(1)
  // By default, trade date is the currentDate
  const [tradeDate, setTradeDate] = useState<string>(fmt(startDate))

  // Whenever config changes, reset the simulator
  useEffect(() => {
    setCurrentDate(startDate)
    setCapital(startingCapital)
    setTrades([])
  }, [startDate, simulationDurationMonths, startingCapital])

  // If currentDate changes, sync the "place trade" date
  useEffect(() => {
    setTradeDate(fmt(currentDate))
  }, [currentDate])

  // -------------------------------------------
  // 3) Fetch stock data for the CHART ticker
  // -------------------------------------------
  const timeWindowDays = TIME_WINDOW_OPTIONS[timeWindowKey]
  useEffect(() => {
    const fetchData = async () => {
      const windowStart = addDays(currentDate, -timeWindowDays)
      const startStr = fmt(windowStart)
      const endStr = fmt(currentDate)

      try {
        const res = await fetch(
          `/api/stock-data?ticker=${chartTicker}&startDate=${startStr}&endDate=${endStr}`
        )
        const data = await res.json()
        const parsed: StockRow[] = data.map((row: StockRow) => ({
          date: row.date,
          open: +row.open,
          high: +row.high,
          low: +row.low,
          price: +row.price,
          adjclose: +row.adjclose,
          volume: +row.volume,
        }))
        // Filter out anything after current date
        const filtered = parsed.filter((r) => r.date <= endStr)
        setStockData(filtered)
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setStockData([])
      }
    }
    fetchData()
  }, [chartTicker, currentDate, timeWindowDays])

  // -------------------------------------------
  // 4) Rebuild the daily portfolio from start->current
  //    whenever "currentDate" or "trades" changes
  // -------------------------------------------
  useEffect(() => {
    buildPortfolioHistory()
  }, [currentDate, trades, stockData])

  /**
   * Return the "last known price" for chartTicker on a given date string
   * using the fetched stockData. If none found, returns 0.
   */
  function getPriceForDate(dateStr: string) {
    // Filter for rows <= that date
    const relevant = stockData.filter((row) => row.date <= dateStr)
    if (!relevant.length) return 0
    return relevant[relevant.length - 1].price
  }

  /**
   * For all trades on/before `dateStr`, compute how many shares we own
   * and how much net capital is left from the startingCapital.
   */
  function computePositionAndCapital(dateStr: string) {
    let shares = 0
    let netSpent = 0
    // Sum up all trades that occurred on or before dateStr
    for (const t of trades) {
      if (t.date <= dateStr && t.ticker === chartTicker) {
        const cost = t.price * t.quantity
        if (t.action === "buy") {
          shares += t.quantity
          netSpent += cost
        } else {
          shares -= t.quantity
          netSpent -= cost
        }
      }
    }
    const leftoverCash = startingCapital - netSpent
    return { shares, leftoverCash }
  }

  /**
   * Build a daily portfolio array from the startDate up to currentDate,
   * using the stock's daily price & trades that happened on each day.
   */
  function buildPortfolioHistory() {
    const history: { date: string; value: number }[] = []
    let d = new Date(startDate.getTime())

    // Loop day by day up to currentDate
    while (d <= currentDate) {
      const ds = fmt(d) // 'YYYY-MM-DD'
      const { shares, leftoverCash } = computePositionAndCapital(ds)
      const price = getPriceForDate(ds)
      const dailyValue = leftoverCash + shares * price
      history.push({ date: ds, value: dailyValue })

      d = addDays(d, 1)
    }
    setPortfolioHistory(history)
  }

  // -------------------------------------------
  // 5) Chart Data & Options
  // -------------------------------------------
  // A) Stock Price chart
  const stockPriceData = {
    labels: stockData.map((r) => r.date),
    datasets: [
      {
        label: `${chartTicker} Price`,
        data: stockData.map((r) => r.price),
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.1,
      },
    ],
  }
  // Custom tooltip => open/high/low/price/adjclose/volume
  const stockChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataIndex: number }) => {
            const idx = ctx.dataIndex
            const row = stockData[idx]
            if (!row) return ""
            return [
              `Date: ${row.date}`,
              `Open: ${row.open.toFixed(2)}`,
              `High: ${row.high.toFixed(2)}`,
              `Low:  ${row.low.toFixed(2)}`,
              `Close: ${row.price.toFixed(2)}`,
              `Adj Close: ${row.adjclose.toFixed(2)}`,
              `Volume: ${row.volume}`,
            ]
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#4B5563" },
        grid: { color: "#E5E7EB" },
      },
      x: {
        ticks: { color: "#4B5563" },
        grid: { color: "#E5E7EB" },
      },
    },
  }

  // B) Portfolio line chart from portfolioHistory
  const portfolioData = {
    labels: portfolioHistory.map((p) => p.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolioHistory.map((p) => p.value),
        borderColor: "rgb(34,197,94)",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.1,
      },
    ],
  }
  // Only date + value in the tooltip
  const portfolioOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: { dataIndex: number }) => {
            const idx = ctx.dataIndex
            const row = portfolioHistory[idx]
            if (!row) return ""
            return [`Date: ${row.date}`, `Value: $${row.value.toFixed(2)}`]
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#4B5563" },
        grid: { color: "#E5E7EB" },
      },
      x: {
        ticks: { color: "#4B5563" },
        grid: { color: "#E5E7EB" },
      },
    },
  }

  // -------------------------------------------
  // 6) Time Travel & Trades
  // -------------------------------------------
  const fastForward = (days: number) => {
    // Move currentDate forward, but not beyond (startDate + simulationDurationMonths)
    const newDt = addDays(currentDate, days)
    const simEnd = addDays(startDate, simulationDurationMonths * 30)
    if (newDt <= simEnd) {
      setCurrentDate(newDt)
    } else {
      alert("Cannot exceed simulation end date.")
    }
  }

  function placeTrade() {
    // figure out the price
    const price = getPriceForTradeDate(tradeDate)
    if (price <= 0) {
      alert("No valid price data for that date/ticker.")
      return
    }
    const cost = price * tradeQuantity

    if (tradeAction === "buy") {
      // check available
      // But note: we keep capital in the “global” state, but it's actually ephemeral 
      // since we reconstruct from trades. You can keep the immediate capital check:
      const currentPosition = computePositionAndCapital(fmt(currentDate))
      // effectively `currentPosition.leftoverCash` is how much they'd have *today*, 
      // but user might be placing a trade in the future. For brevity, let's allow it 
      // as long as “the sum of all buy trades isn't more than startingCapital overall.”
      // or we can do a simpler approach:
      const overallUsed = trades
        .filter((t) => t.action === "buy")
        .reduce((s, t) => s + t.price * t.quantity, 0)
      const overallSells = trades
        .filter((t) => t.action === "sell")
        .reduce((s, t) => s + t.price * t.quantity, 0)
      const netSpent = overallUsed - overallSells
      if (netSpent + cost > startingCapital) {
        alert("Insufficient capital to buy.")
        return
      }
    } else {
      // selling => ensure we own enough shares up to that date
      const { shares } = computePositionAndCapital(tradeDate)
      if (shares < tradeQuantity) {
        alert("Not enough shares to sell on that date.")
        return
      }
    }

    const newTrade: Trade = {
      date: tradeDate,
      ticker: chartTicker, // read-only from chart
      quantity: tradeQuantity,
      price,
      action: tradeAction,
    }
    setTrades((prev) => [...prev, newTrade])

    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 2000)
  }

  function getPriceForTradeDate(ds: string) {
    // same logic: last known price <= ds from stockData
    const relevant = stockData.filter((r) => r.date <= ds)
    if (!relevant.length) return 0
    return relevant[relevant.length - 1].price
  }

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <div className="p-4 space-y-6">

      {/* Heading & Start Simulation Button */}
      <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Trading Simulator</h1>
      <button className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700">
        Start Simulation
      </button>
      </div>

      {/* 1) Quick stats row */}
      <div className="flex items-center justify-between bg-green-50 rounded-md p-4">
      <div className="font-medium text-gray-700">
        Starting Capital: ${startingCapital.toFixed(2)}
      </div>
      <div className="font-medium text-gray-700">
        Current Cash (today): $
        {
        // compute net leftover as of currentDate
        computePositionAndCapital(fmt(currentDate)).leftoverCash.toFixed(2)
        }
      </div>
      </div>

      {/* 2) Sim Config row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="date"
          value={fmt(startDate)}
          onChange={(e) => {
          const d = new Date(e.target.value)
          setStartDate(d)
          }}
          className="w-full rounded-md bg-white py-2 pl-10 pr-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        </div>
      </div>
      {/* Starting Capital */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Capital</label>
        <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="number"
          value={startingCapital}
          onChange={(e) => setStartingCapital(Number(e.target.value))}
          className="w-full rounded-md bg-white py-2 pl-10 pr-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        </div>
      </div>
      {/* Simulation Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Simulation Duration (Months)</label>
        <select
        value={simulationDurationMonths}
        onChange={(e) => setSimulationDurationMonths(Number(e.target.value))}
        className="w-full rounded-md bg-white py-2 px-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200"
        >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
        </select>
      </div>
      </div>

      {/* 3) Chart Ticker + Time Window */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chart Ticker</label>
        <StockTickerDropdown onSelect={(t) => setChartTicker(t.symbol)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chart Time Window</label>
        <select
        value={timeWindowKey}
        onChange={(e) => setTimeWindowKey(e.target.value as keyof typeof TIME_WINDOW_OPTIONS)}
        className="w-full rounded-md bg-white py-2 px-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200"
        >
        {Object.keys(TIME_WINDOW_OPTIONS).map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
        </select>
      </div>
      </div>

      {/* 4) Stock Price Chart */}
      <div className="bg-white rounded-md p-4">
      <Line data={stockPriceData} options={stockChartOptions} />
      </div>

      {/* 5) Portfolio Value Chart */}
      <div className="bg-white rounded-md p-4">
      <Line data={portfolioData} options={portfolioOptions} />
      </div>

      {/* 6) Fast Forward row */}
      <div className="flex items-center space-x-4">
      <button
        onClick={() => fastForward(1)}
        className="px-4 py-2 bg-green-100 text-gray-800 rounded-md 
             hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        <FastForward size={20} className="inline-block mr-2" />
        Next Day
      </button>
      <button
        onClick={() => fastForward(7)}
        className="px-4 py-2 bg-green-100 text-gray-800 rounded-md 
             hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        <FastForward size={20} className="inline-block mr-2" />
        Next Week
      </button>
      <button
        onClick={() => fastForward(30)}
        className="px-4 py-2 bg-green-100 text-gray-800 rounded-md 
             hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        <FastForward size={20} className="inline-block mr-2" />
        Next Month
      </button>
      <span className="text-gray-700 font-medium">
        Current Date: {fmt(currentDate)}
      </span>
      </div>

      {/* 7) Place Trade + "Traiding coAIch" side by side */}
      <div className="flex flex-col md:flex-row md:space-x-6">
      {/* Place Trade box */}
      <div className="bg-white rounded-md p-4 shadow-sm flex flex-col max-w-sm mb-4 md:mb-0">
        <h3 className="text-lg font-semibold mb-4">Place Trade</h3>

        {/* Ticker: read-only from chartTicker */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Ticker</label>
        <input
        readOnly
        value={chartTicker}
        className="rounded-md bg-green-50 py-2 px-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200 mb-2"
        />

        {/* Current Price for tradeDate */}
        {(() => {
        const p = getPriceForTradeDate(tradeDate)
        return (
          <p className="text-sm text-gray-600 mb-2">
          Current Price: {p > 0 ? `$${p.toFixed(2)}` : "N/A"}
          </p>
        )
        })()}

        {/* Trade Date */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Trade Date</label>
        <input
        type="date"
        value={tradeDate}
        onChange={(e) => setTradeDate(e.target.value)}
        className="rounded-md bg-green-50 py-2 px-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200 mb-2"
        />

        {/* Buy/Sell radio */}
        <div className="flex items-center space-x-4 mb-2">
        <label className="flex items-center text-sm text-gray-800">
          <input
          type="radio"
          name="tradeType"
          value="buy"
          checked={tradeAction === "buy"}
          onChange={() => setTradeAction("buy")}
          className="mr-1"
          />
          Buy
        </label>
        <label className="flex items-center text-sm text-gray-800">
          <input
          type="radio"
          name="tradeType"
          value="sell"
          checked={tradeAction === "sell"}
          onChange={() => setTradeAction("sell")}
          className="mr-1"
          />
          Sell
        </label>
        </div>

        {/* Quantity */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
        type="number"
        value={tradeQuantity}
        onChange={(e) => setTradeQuantity(Number(e.target.value))}
        className="rounded-md bg-green-50 py-2 px-4 text-gray-800 
               focus:outline-none focus:ring-2 focus:ring-green-200 mb-2"
        />

        {/* "Total Value" + Place Trade btn */}
        {(() => {
        const p = getPriceForTradeDate(tradeDate)
        const tv = p * tradeQuantity
        return (
          <>
          <p className="text-sm text-gray-800 font-medium mb-2">
            Total Value: ${tv.toFixed(2)}
          </p>
          <button
            onClick={placeTrade}
            className="w-full bg-green-500 text-white font-semibold py-2 
                 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 
                 focus:ring-green-400"
          >
            Place Trade (${tv.toFixed(2)})
          </button>
          </>
        )
        })()}
      </div>
      </div>

      {/* Success toast */}
      {showSuccessToast && (
      <div className="fixed right-4 bottom-4 animate-slideInUp">
        <div className="bg-green-500 text-white py-2 px-4 rounded shadow-lg">
        Trade was successfully placed!
        </div>
      </div>
      )}

      {/* 8) Trade History Table */}
      <div className="bg-white rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Trade History</h3>
      <div className="overflow-x-auto">
       <TradeHistoryTable trades={trades} />
      </div>
      </div>
    </div>
  )
}
