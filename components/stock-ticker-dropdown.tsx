"use client"

import { useState } from "react"
import { Search } from "lucide-react"

type StockTicker = {
  symbol: string
  name: string
}

interface StockTickerDropdownProps {
  onSelect: (ticker: StockTicker) => void
}

// Pseudo data for stock tickers
const stockTickers = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "FB", name: "Facebook, Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
]

export function StockTickerDropdown({ onSelect }: StockTickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicker, setSelectedTicker] = useState(stockTickers[0])

  const filteredTickers = stockTickers.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticker.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = (ticker: StockTicker) => {
    setSelectedTicker(ticker)
    setIsOpen(false)
    setSearchTerm("")
    onSelect(ticker)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md bg-white/50 py-2 px-3 text-gray-700 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
      >
        <span>{selectedTicker.symbol}</span>
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#E8D8B2] focus:outline-none focus:ring-1 focus:ring-[#E8D8B2]"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-auto py-1 text-base">
            {filteredTickers.map((ticker) => (
              <li
                key={ticker.symbol}
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-[#E8D8B2]/50"
                onClick={() => handleSelect(ticker)}
              >
                <div className="flex items-center">
                  <span className="font-normal block truncate">{ticker.symbol}</span>
                  <span className="ml-2 truncate text-gray-500">{ticker.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

