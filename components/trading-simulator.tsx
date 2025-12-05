/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table"
import { ChevronRight, FastForward, Calendar } from "lucide-react"
import { StockTickerDropdown } from "./stock-ticker-dropdown"
import Contexts from "./Contexts"
import { supabase } from "@/lib/supabaseClient"
import { PortfolioMetrics } from "./sidebar"

/** Mapping of time-window label => # of days to fetch in the chart. */
const TIME_WINDOW_OPTIONS = {
  "1w": 7,
  "2w": 14,
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
  "5y": 1825,
}

type StockRow = {
  date: string
  open: number
  high: number
  low: number
  price: number    // from 'close'
  adjclose: number
  volume: number
}

type Trade = {
  date: string     // "YYYY-MM-DD"
  ticker: string
  quantity: number
  price: number
  action: "buy" | "sell"
}

/** Utility: add days to a Date. */
function addDays(base: Date, offset: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + offset)
  return d
}

/** Utility: format Date => "YYYY-MM-DD". */
function fmt(d: Date) {
  return d.toISOString().split("T")[0]
}

export default function TradingSimulator({ guestId, userId, onMetricsUpdate }: { 
  guestId: string, 
  userId: string | null,
  onMetricsUpdate?: (metrics: PortfolioMetrics) => void 
}) {
  // --------------------------------------
  // 1) Setup Simulation Modal
  // --------------------------------------
  const [showSetup, setShowSetup] = useState(true)
  // Default to a recent start date to ensure data availability
  const [tempStartDate, setTempStartDate] = useState("2023-01-01") 
  const [tempDuration, setTempDuration] = useState(6)
  const [tempCapital, setTempCapital] = useState(10000)
  const [errorMsg, setErrorMsg] = useState("")

  const handleStartSimulation = () => {
    const userStart = new Date(tempStartDate)
    const simEnd = addDays(userStart, tempDuration * 30)
    const today = new Date()
    if (simEnd > today) {
      // It's actually fine to simulate up to today or slightly past if we just stop fetching data
      // But let's warn if it's way in the future. 
      // For now, let's allow it but clamp data fetching.
      // setErrorMsg("End date exceeds today's date. Please choose a shorter duration or earlier start.")
      // return
    }
    // Set real sim state
    setStartDate(userStart)
    setSimulationDurationMonths(tempDuration)
    setStartingCapital(tempCapital)
    setShowSetup(false)
    setCurrentDate(userStart)
    setTrades([])
  }

  // --------------------------------------
  // 2) Core Sim State
  // --------------------------------------
  const [startDate, setStartDate] = useState(new Date("2023-01-01"))
  const [simulationDurationMonths, setSimulationDurationMonths] = useState(6)
  const [startingCapital, setStartingCapital] = useState(10000)

  const [currentDate, setCurrentDate] = useState(startDate)
  const [trades, setTrades] = useState<Trade[]>([])

  // Stock data & portfolio lines
  const [stockData, setStockData] = useState<StockRow[]>([])
  const [portfolioHistory, setPortfolioHistory] = useState<{ date: string; value: number }[]>([])

  // Chart UI states
  const [chartTicker, setChartTicker] = useState("AAPL")
  const [timeWindow, setTimeWindow] = useState<keyof typeof TIME_WINDOW_OPTIONS>("1m")
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Place Trade
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy")
  const [tradeQuantity, setTradeQuantity] = useState(1)
  // The trade date is always the current date, in "YYYY-MM-DD"
  const tradeDate = fmt(currentDate)

  // Load existing trades from Supabase
  const [hasLoadedTrades, setHasLoadedTrades] = useState(false);

  // C++ Metrics Calculation Effect
  useEffect(() => {
    if (!onMetricsUpdate || portfolioHistory.length < 5) return

    const timer = setTimeout(() => {
      const equityCurve = portfolioHistory.map(p => p.value)
      
      fetch('http://localhost:8000/calculate-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equity_curve: equityCurve })
      })
      .then(res => res.json())
      .then(data => {
        if (data.sharpe_ratio !== undefined) {
          onMetricsUpdate(data)
        }
      })
      .catch(err => console.error("Metrics calc failed", err))
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
  }, [portfolioHistory, onMetricsUpdate])

  useEffect(() => {
    if (!userId || hasLoadedTrades) return;

    const fetchTrades = async () => {
        const { data, error } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false }); // Convex logic was .order("desc") which means latest first? 

        // Convex logic: 
        // return await ctx.db.query("trade")...order("desc").collect();
        // and in client: existingTrades.map(...).reverse()
        // If we order by date desc, latest trade is first. 
        // The map().reverse() suggests the state `trades` expects chronological order (oldest first)?
        // Let's assume we want chronological order for simulation replay.
        
        if (error) {
            console.error("Error fetching trades:", error);
            return;
        }

        if (data && data.length > 0) {
             const mappedTrades: Trade[] = data.map(t => ({
                date: t.date,
                ticker: t.ticker,
                quantity: t.quantity,
                price: t.price,
                action: t.action as "buy" | "sell"
             }));
             
             // If Convex returned desc (newest first) and we reversed it, we got oldest first.
             // If we select from Supabase desc, we get newest first. So we should reverse it too.
             // Or just select asc.
             
             // Let's stick to previous logic: data is desc, so reverse it.
             setTrades(mappedTrades.reverse());
             setHasLoadedTrades(true);
             setShowSetup(false);
        }
    }
    fetchTrades();
  }, [userId, hasLoadedTrades]);


  // If user changes the sim config, reset the current date/trades
  useEffect(() => {
    setCurrentDate(startDate)
    setTrades([])
  }, [startDate, simulationDurationMonths, startingCapital])

  // --------------------------------------
  // 3) Fetch Stock Data for Chart Ticker
  // --------------------------------------
  useEffect(() => {
    if (showSetup) return // not started yet

    // We want to fetch enough data to cover the current view window
    // PLUS enough history to support portfolio calculations if we were doing them properly back to start.
    // For simplicity, let's fetch from (CurrentDate - TimeWindow) to CurrentDate.
    // BUT, for the "Portfolio Value" chart which tracks history from StartDate, we really need data from StartDate.
    
    // Strategy: Fetch data from StartDate to CurrentDate (or slightly future if needed for buffer)
    // This allows both charts to work.
    
    const daysWindow = TIME_WINDOW_OPTIONS[timeWindow]
    // Start fetching from the beginning of the simulation OR the window start, whichever is earlier.
    // Actually, simply fetching from StartDate to CurrentDate is safest for consistency.
    // If the window is huge (5y) and start date is recent, we need to go back 5y.
    
    const fetchStart = startDate < addDays(currentDate, -daysWindow) ? startDate : addDays(currentDate, -daysWindow)
    
    // Ensure we don't go into the future for the fetch end date relative to real wall clock, 
    // although our API handles "future" by clamping to today.
    // However, our backend API takes startDate and endDate string.
    
    const startStr = fmt(fetchStart)
    const endStr = fmt(currentDate)

    async function fetchData() {
      try {
        console.log(`Fetching stock data for ${chartTicker} from ${startStr} to ${endStr}`)
        const res = await fetch(`/api/stock-data?ticker=${chartTicker}&startDate=${startStr}&endDate=${endStr}`)
        
        if (!res.ok) {
             console.error("Stock data fetch failed:", res.status, res.statusText)
             return
        }
        
        const raw = await res.json()
        if (!Array.isArray(raw)) {
            console.error("Stock data is not an array:", raw)
            setStockData([])
            return
        }

        const parsed: StockRow[] = raw.map((r: any) => ({
          date: r.date.split("T")[0], // Ensure YYYY-MM-DD
          open: +r.open,
          high: +r.high,
          low: +r.low,
          price: +r.price,
          adjclose: +r.adjclose,
          volume: +r.volume,
        }))
        
        // Sort by date ascending just in case
        parsed.sort((a, b) => a.date.localeCompare(b.date))
        
        setStockData(parsed)
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setStockData([])
      }
    }
    fetchData()
  }, [chartTicker, currentDate, timeWindow, showSetup, startDate])

  // -------------------------------------------
  // 4) Rebuild the daily portfolio from start->current
  //    whenever "currentDate" or "trades" changes
  // -------------------------------------------

  useEffect(() => {
    if (stockData.length > 0) {
        buildPortfolioHistory()
    }
  }, [currentDate, trades, stockData])

  /**
   * Return the "last known price" for chartTicker on a given date string
   * using the fetched stockData. If none found, returns the last available price before that date, or 0.
   */
  function getPriceForDate(dateStr: string) {
    // We can optimize this by using the sorted nature of stockData
    // Find the row with date <= dateStr
    // Since stockData is sorted ascending:
    let bestPrice = 0
    for (let i = 0; i < stockData.length; i++) {
        if (stockData[i].date > dateStr) break;
        bestPrice = stockData[i].price
    }
    return bestPrice
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
    
    // Instead of iterating every calendar day, let's iterate over the available stock data points
    // This is much faster and ensures we have prices.
    // However, we must also include days where trades happened if they aren't in stock data (unlikely for market days).
    
    // Filter stockData to be within Simulation Start and Current Date
    const relevantData = stockData.filter(d => d.date >= fmt(startDate) && d.date <= fmt(currentDate))
    
    if (relevantData.length === 0) {
        // Fallback: just show start and end if no data
        history.push({ date: fmt(startDate), value: startingCapital })
        if (startDate < currentDate) {
             history.push({ date: fmt(currentDate), value: startingCapital })
        }
        setPortfolioHistory(history)
        return
    }

    for (const row of relevantData) {
        const ds = row.date
        const { shares, leftoverCash } = computePositionAndCapital(ds)
        const price = row.price
        const dailyValue = leftoverCash + (shares * price)
        history.push({ date: ds, value: dailyValue })
    }
    
    setPortfolioHistory(history)
  }

  // --------------------------------------
  // 5) Time Travel
  // --------------------------------------
  function fastForward(days: number) {
    const newDt = addDays(currentDate, days)
    const simEnd = addDays(startDate, simulationDurationMonths * 30)
    // Allow going up to simEnd
    if (newDt <= simEnd) {
      setCurrentDate(newDt)
    } else {
      // If adding days exceeds, just clamp to end? Or warn.
      // Let's clamp to simEnd for better UX
      setCurrentDate(simEnd)
    }
  }

  // --------------------------------------
  // 6) Place Trade
  // --------------------------------------
  function handlePlaceTrade() {
    const cPrice = getPriceForDate(tradeDate)
    if (cPrice <= 0) {
      alert("No valid price data for this date.")
      return
    }
    const cost = cPrice * tradeQuantity
    if (tradeAction === "buy") {
      // ensure not exceeding capital
      let netSpent = 0
      for (const t of trades) {
        if (t.ticker === chartTicker) {
          const c = t.price * t.quantity
          netSpent += t.action === "buy" ? c : -c
        }
      }
      if (netSpent + cost > startingCapital) {
        alert("Insufficient capital to buy.")
        return
      }
    } else {
      // selling => ensure we have enough shares
      let shares = 0
      for (const t of trades) {
        if (t.ticker === chartTicker && t.date <= tradeDate) {
          if (t.action === "buy") shares += t.quantity
          else shares -= t.quantity
        }
      }
      if (tradeQuantity > shares) {
        alert("Not enough shares to sell.")
        return
      }
    }
    // Add trade
    const newTrade: Trade = {
      date: tradeDate,
      ticker: chartTicker,
      quantity: tradeQuantity,
      price: cPrice,
      action: tradeAction
    }

    setTrades([...trades, newTrade])
    
    // Persist to backend
    if (userId) {
        supabase.from('trades').insert({
            user_id: userId,
            date: newTrade.date,
            action: newTrade.action,
            ticker: newTrade.ticker,
            quantity: newTrade.quantity,
            price: newTrade.price,
            tv: cPrice * tradeQuantity
        }).then(({ error }) => {
            if (error) console.error("Failed to save trade:", error);
        });
    } else {
        console.error("No userId found, cannot save trade");
    }

    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 2000)
  }

  // --------------------------------------
  // 7) Recharts Tooltips
  // --------------------------------------
  // Portfolio tooltip
  const portfolioTooltipContent = (data: any) => {
    if (!data.active || !data.payload?.length) return null
    const row = data.payload[0].payload
    return (
      <div className="bg-white border border-green-200 p-2 rounded shadow">
        <p className="font-bold text-green-800 mb-1">Date: {row.date}</p>
        <p className="text-sm text-green-600">
          Value: ${row.value.toFixed(2)}
        </p>
      </div>
    )
  }

  // Stock tooltip: open, high, low, close, volume
  const stockTooltipContent = (data: any) => {
    if (!data.active || !data.payload?.length) return null
    const row = data.payload[0].payload
    return (
      <div className="bg-white border border-green-200 p-2 rounded shadow">
        <p className="font-bold text-green-800 mb-1">Date: {row.date}</p>
        <p className="text-sm text-green-600">Open: {row.open.toFixed(2)}</p>
        <p className="text-sm text-green-600">High: {row.high.toFixed(2)}</p>
        <p className="text-sm text-green-600">Low: {row.low.toFixed(2)}</p>
        <p className="text-sm text-green-600">Close: {row.price.toFixed(2)}</p>
        <p className="text-sm text-green-600">
          Volume: {row.volume.toLocaleString()}
        </p>
      </div>
    )
  }

  // --------------------------------------
  // 8) Inline Chatbot State & Functions
  // --------------------------------------
  type Message = { role: "user" | "assistant"; content: string }
  const [chatInput, setChatInput] = useState("")
  const [chatLog, setChatLog] = useState<Message[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastAnalyzedTradeRef = useRef<string>("")

  const sendPrompt = async (prompt: string) => {
    const userMessage: Message = { role: "user", content: prompt }
    setChatLog((prev) => [...prev, userMessage])
    setChatLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      })
      if (!response.ok) {
        console.error("Error:", response.statusText)
        setChatLoading(false)
        return
      }
      const reader = response.body?.getReader()
      if (!reader) {
        console.error("No reader available.")
        setChatLoading(false)
        return
      }
      const decoder = new TextDecoder()
      let assistantMessage = ""
      // Append an empty assistant message to be updated in real time
      setChatLog((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const events = chunk.split("\n\n")
        for (const event of events) {
          if (event.startsWith("data: ")) {
            const dataStr = event.replace("data: ", "").trim()
            if (dataStr === "[DONE]") break
            try {
              const parsed = JSON.parse(dataStr)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                assistantMessage += delta
                setChatLog((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage }
                  return updated
                })
                chatContainerRef.current?.scrollTo({
                  top: chatContainerRef.current.scrollHeight,
                  behavior: "smooth",
                })
              }
            } catch (error) {
              console.error("Error parsing SSE data:", error)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setChatLoading(false)
    }
  }

  const handleSend = async () => {
    if (!chatInput.trim()) return
    await sendPrompt(chatInput.trim())
    setChatInput("")
  }

  // Automatically analyze a new trade if one is provided
  const newTrade = trades.length ? trades[trades.length - 1] : undefined
  useEffect(() => {
    if (newTrade && newTrade.date !== lastAnalyzedTradeRef.current) {
      const tradeValue = newTrade.price * newTrade.quantity
      const prompt = `Analyze the following trade: ${newTrade.action} ${newTrade.quantity} shares of ${newTrade.ticker} at $${newTrade.price.toFixed(
        2
      )} per share (total value $${tradeValue.toFixed(2)}). Provide a positive or neutral outlook.`
      sendPrompt(prompt)
      lastAnalyzedTradeRef.current = newTrade.date
    }
  }, [newTrade])

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div className="min-h-screen bg-[#fdf6e9] px-6 pb-10 pt-10">
      <motion.h1
        className="text-4xl font-bold text-[#408830] mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Trading Simulator
      </motion.h1>

      {/* Setup Modal */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="bg-[#fdf6e9] text-black rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              Setup Simulation
            </DialogTitle>
          </DialogHeader>
          {errorMsg && <p className="text-red-700 mb-2">{errorMsg}</p>}
          <div className="grid gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                className="bg-white text-black"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Duration (months)</Label>
              <Input
                type="number"
                min={1}
                max={12}
                className="bg-white text-black"
                value={tempDuration}
                onChange={(e) => setTempDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Starting Capital</Label>
              <Input
                type="number"
                className="bg-white text-black"
                value={tempCapital}
                onChange={(e) => setTempCapital(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleStartSimulation}
              className="bg-[#408830] hover:bg-[#509048] text-white"
            >
              Start Simulation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Row 1: Portfolio Overview & Simulation Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Overview */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#408830]">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Starting Capital</p>
                <p className="text-2xl font-bold text-[#509048]">
                  ${startingCapital.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Cash</p>
                <p className="text-2xl font-bold text-[#509048]">
                  ${computePositionAndCapital(fmt(currentDate)).leftoverCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Period */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#408830]">Simulation Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-lg font-bold">{fmt(startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-lg font-bold">
                  {fmt(addDays(startDate, simulationDurationMonths * 30))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-bold">{simulationDurationMonths} mo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Time Controls */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                className="bg-[#80b048] hover:bg-[#509048]"
                onClick={() => fastForward(1)}
              >
                <ChevronRight className="mr-1 h-4 w-4" />
                Next Day
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                className="bg-[#509048] hover:bg-[#408830]"
                onClick={() => fastForward(7)}
              >
                <FastForward className="mr-1 h-4 w-4" />
                Next Week
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                className="bg-[#408830] hover:bg-[#509048]"
                onClick={() => fastForward(30)}
              >
                <Calendar className="mr-1 h-4 w-4" />
                Next Month
              </Button>
            </motion.div>
            <p className="ml-auto text-gray-500">
              Current Date: <span className="font-bold">{fmt(currentDate)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 1) Portfolio Value Chart */}
      <div className="w-full bg-white rounded-md shadow-sm mb-6 p-4">
        <h3 className="text-[#408830] font-semibold mb-2">Portfolio Value</h3>
        <ResponsiveContainer width="90%" height={350}>
          <LineChart data={portfolioHistory} margin={{ left: 50, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => String(val)}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(val: number) => `$${Math.round(val)}`}
              label={{
                value: "Portfolio Value",
                angle: -90,
                position: "insideLeft",
                offset: -20,
                style: { textAnchor: "middle" },
              }}
              tick={{ dx: 10, dy: 5 }}
            />
            <Tooltip content={portfolioTooltipContent} />
            <Line type="monotone" dataKey="value" stroke="#509048" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2) Stock Price Chart */}
      <div className="w-full bg-white rounded-md shadow-sm mb-6 p-4">
        <h3 className="text-[#408830] font-semibold mb-2">Stock Price</h3>
        <div className="flex flex-wrap mb-4 gap-4">
          <div className="w-full md:w-2/5">
            <Label>Chart Ticker</Label>
            <StockTickerDropdown onSelect={(t) => setChartTicker(t.symbol)} />
          </div>
          <div className="w-full md:w-2/5">
            <Label>Chart Time Window</Label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as keyof typeof TIME_WINDOW_OPTIONS)}
              className="w-full rounded-md bg-green-50 py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
            >
              {Object.keys(TIME_WINDOW_OPTIONS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => val.split("T")[0]}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -5,
                style: { textAnchor: "middle" },
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              label={{
                value: "Price",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip content={stockTooltipContent} />
            <Line type="monotone" dataKey="price" stroke="#408830" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trade Data + Chat UI Side by Side */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="flex-1">
          {/* Place Trade + Trading Coach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Place Trade */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#408830]">Place Trade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Ticker read only */}
                  <div>
                    <Label>Stock Ticker</Label>
                    <Input readOnly value={chartTicker} className="bg-[#fdf6e9]" />
                    <p className="text-sm text-gray-600 mt-1">
                      Current Price: ${getPriceForDate(fmt(currentDate)).toFixed(2)}
                    </p>
                  </div>

                  {/* Date read only */}
                  <div>
                    <Label>Trade Date</Label>
                    <Input readOnly value={fmt(currentDate)} className="bg-[#fdf6e9]" />
                  </div>

                  {/* Buy / Sell */}
                  <div>
                    <Label>Action</Label>
                    <RadioGroup
                      className="flex items-center space-x-4"
                      defaultValue={tradeAction}
                      onValueChange={(val) => setTradeAction(val as "buy" | "sell")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="buy" id="radioBuy" />
                        <Label htmlFor="radioBuy">Buy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sell" id="radioSell" />
                        <Label htmlFor="radioSell">Sell</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Quantity + total value */}
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={tradeQuantity === 0 ? "" : tradeQuantity}
                      onChange={(e) => setTradeQuantity(Number(e.target.value) || 0)}
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      Total Value: ${(getPriceForDate(fmt(currentDate)) * tradeQuantity).toFixed(2)}
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handlePlaceTrade}
                      className="w-full bg-[#408830] hover:bg-[#509048] text-white"
                    >
                      Place Trade ($
                      {(getPriceForDate(fmt(currentDate)) * tradeQuantity).toFixed(2)}
                      )
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Coach */}
            <Contexts />
          </div>

          {/* Trade History */}
          <Card className="bg-white shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-[#408830]">Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Trade Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t, idx) => {
                    const tv = t.price * t.quantity
                    return (
                      <TableRow key={idx}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.action}</TableCell>
                        <TableCell>{t.ticker}</TableCell>
                        <TableCell>{t.quantity}</TableCell>
                        <TableCell>${t.price.toFixed(2)}</TableCell>
                        <TableCell>${tv.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Inline Chat UI */}
        <div className="w-full md:w-1/3">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#408830]">AI  Financial Analyst</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={chatContainerRef}
                className="chat-container p-4 bg-white shadow-lg rounded"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role} my-2`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="chat-input flex gap-2 mt-4">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={chatLoading}
                  className="bg-[#408830] text-white px-4 py-2 rounded"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed right-4 bottom-4 animate-slideInUp">
          <div className="bg-green-600 text-white py-2 px-4 rounded shadow-lg">
            Trade was successfully placed!
          </div>
        </div>
      )}
    </div>
  )
}
