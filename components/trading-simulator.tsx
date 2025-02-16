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
  Legend,
  ChartEvent,
  ActiveElement,
} from "chart.js"
import {
  Calendar,
  DollarSign,
  FastForward,
  TrendingUp,
  TrendingDown,
  Save,
} from "lucide-react"
import { StockTickerDropdown } from "./stock-ticker-dropdown"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type Trade = {
  date: string
  ticker: string
  quantity: number
  price: number
  action: "buy" | "sell"
}

export function TradingSimulator() {
  const [ticker, setTicker] = useState("AAPL")
  const [startDate, setStartDate] = useState(new Date("2000-01-01"))
  const [currentDate, setCurrentDate] = useState(new Date("2000-01-01"))
  const [timeframe, setTimeframe] = useState(1) // Represents timeframe in months
  const [startingCapital, setStartingCapital] = useState(10000)
  const [capital, setCapital] = useState(startingCapital)
  const [stockData, setStockData] = useState<{ date: string; price: string }[]>([])
  const [hoveredData, setHoveredData] = useState<{ date: string; price: string } | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradeQuantity, setTradeQuantity] = useState(0)
  const [portfolioValue, setPortfolioValue] = useState(0)

  // Reset currentDate whenever startDate or timeframe changes.
  useEffect(() => {
    setCurrentDate(startDate)
  }, [startDate, timeframe])

  // Fetch real stock data from the backend using the current simulation window.
  useEffect(() => {
    const fetchRealStockData = async () => {
      // Compute window start: currentDate minus (timeframe * 30 days)
      const windowStart = new Date(currentDate.getTime() - timeframe * 30 * 24 * 60 * 60 * 1000)
      const windowStartStr = windowStart.toISOString().split("T")[0]
      const currentDateStr = currentDate.toISOString().split("T")[0]

      console.log("Fetching data for ticker:", ticker)
      console.log("Window start:", windowStartStr, "Current Date:", currentDateStr)

      try {
        const response = await fetch(
          `/api/stock-data?ticker=${ticker}&startDate=${windowStartStr}&endDate=${currentDateStr}`
        )
        const data = await response.json()
        console.log("Raw data from API:", data)

        // Filter data so that it only includes dates up to the simulation's currentDate.
        const filteredData = data.filter((d: { date: string; price: string }) => {
          // Adjust this comparison if the date format is not exactly "YYYY-MM-DD"
          return d.date <= currentDateStr
        })
        console.log("Filtered data (<= currentDate):", filteredData)
        setStockData(filteredData)
      } catch (error) {
        console.error("Error fetching real stock data:", error)
      }
    }

    if (ticker && currentDate) {
      fetchRealStockData()
    }
  }, [ticker, currentDate, timeframe])

  const chartData = {
    labels: stockData.map((d) => d.date),
    datasets: [
      {
        label: ticker,
        data: stockData.map((d) => Number.parseFloat(d.price)),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${ticker} Stock Price`,
        color: "#1F2937",
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
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements && elements.length) {
        const dataIndex = elements[0].index
        setHoveredData(stockData[dataIndex])
      } else {
        setHoveredData(null)
      }
    },
  }

  const handleTrade = (action: "buy" | "sell") => {
    const currentPrice =
      Number(
        stockData.find(
          (d) => d.date === currentDate.toISOString().split("T")[0]
        )?.price || 0
      )
    const tradeValue = currentPrice * tradeQuantity

    if (action === "buy" && tradeValue > capital) {
      alert("Insufficient funds for this trade.")
      return
    }

    if (action === "sell" && tradeQuantity > calculateHoldings()) {
      alert("Insufficient stocks to sell.")
      return
    }

    const newTrade: Trade = {
      date: currentDate.toISOString().split("T")[0],
      ticker,
      quantity: tradeQuantity,
      price: currentPrice,
      action,
    }

    setTrades([...trades, newTrade])
    setCapital(action === "buy" ? capital - tradeValue : capital + tradeValue)
    setTradeQuantity(0)
    updatePortfolioValue()
  }

  const calculateHoldings = () => {
    return trades.reduce((acc, trade) => {
      return trade.action === "buy" ? acc + trade.quantity : acc - trade.quantity
    }, 0)
  }

  const updatePortfolioValue = () => {
    const currentPrice =
      Number(
        stockData.find(
          (d) => d.date === currentDate.toISOString().split("T")[0]
        )?.price || 0
      )
    const stockValue = calculateHoldings() * currentPrice
    setPortfolioValue(capital + stockValue)
  }

  const fastForward = (days: number) => {
    const newDate = new Date(
      currentDate.getTime() + days * 24 * 60 * 60 * 1000
    )
    // Calculate the simulation end date based on the original start date and timeframe (in months)
    const simulationEndDate = new Date(
      startDate.getTime() + timeframe * 30 * 24 * 60 * 60 * 1000
    )
    if (newDate <= simulationEndDate) {
      setCurrentDate(newDate)
      updatePortfolioValue()
    } else {
      alert("Cannot fast forward beyond the simulation end date.")
    }
  }

  const saveSimulation = () => {
    console.log("Saving simulation:", {
      startDate,
      endDate: currentDate,
      startingCapital,
      finalCapital: capital,
      trades,
      portfolioValue,
    })

    // Reset the simulator
    setStartDate(new Date("2000-01-01"))
    setCurrentDate(new Date())
    setCapital(startingCapital)
    setTrades([])
    setPortfolioValue(0)
    alert("Simulation saved and reset!")
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Trading Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full rounded-md bg-white/50 py-2 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Capital</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="number"
              value={startingCapital}
              onChange={(e) => setStartingCapital(Number(e.target.value))}
              className="w-full rounded-md bg-white/50 py-2 pl-10 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Simulation Duration</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="w-full rounded-md bg-white/50 py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Ticker</label>
          <StockTickerDropdown onSelect={(selectedTicker) => setTicker(selectedTicker.symbol)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="w-full rounded-md bg-white/50 py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="relative mb-4">
        <Line data={chartData} options={options} />
        {hoveredData && (
          <div className="absolute top-0 right-0 bg-white text-gray-800 p-2 rounded shadow-md">
            <p className="text-sm">Date: {hoveredData.date}</p>
            <p className="text-sm font-semibold">Price: ${hoveredData.price}</p>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => fastForward(1)}
          className="px-4 py-2 bg-[#E8D8B2] text-gray-800 rounded-md hover:bg-[#E0D0A0] focus:outline-none focus:ring-2 focus:ring-[#E8D8B2] focus:ring-offset-2"
        >
          <FastForward size={20} className="inline-block mr-2" />
          Next Day
        </button>
        <button
          onClick={() => fastForward(7)}
          className="px-4 py-2 bg-[#E8D8B2] text-gray-800 rounded-md hover:bg-[#E0D0A0] focus:outline-none focus:ring-2 focus:ring-[#E8D8B2] focus:ring-offset-2"
        >
          <FastForward size={20} className="inline-block mr-2" />
          Next Week
        </button>
        <span className="text-gray-700">Current Date: {currentDate.toISOString().split("T")[0]}</span>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="number"
          value={tradeQuantity}
          onChange={(e) => setTradeQuantity(Number(e.target.value))}
          placeholder="Quantity"
          className="w-1/3 rounded-md bg-white/50 py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
        />
        <button
          onClick={() => handleTrade("buy")}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <TrendingUp size={20} className="inline-block mr-2" />
          Buy
        </button>
        <button
          onClick={() => handleTrade("sell")}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <TrendingDown size={20} className="inline-block mr-2" />
          Sell
        </button>
        <span className="text-gray-700">Available Capital: ${capital.toFixed(2)}</span>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={saveSimulation}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Save size={20} className="inline-block mr-2" />
          Save Simulation
        </button>
        <span className="text-gray-700">Portfolio Value: ${portfolioValue.toFixed(2)}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Trade History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8D8B2]">
            <thead className="bg-[#F8F4E3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ticker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E8D8B2]">
              {trades.map((trade, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trade.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trade.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trade.ticker}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trade.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${trade.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

