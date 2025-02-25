"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import Papa from "papaparse"

type StockTicker = {
  symbol: string
  name: string
}

interface StockTickerDropdownProps {
  onSelect: (ticker: StockTicker) => void
}

export function StockTickerDropdown({ onSelect }: StockTickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tickers, setTickers] = useState<StockTicker[]>([])
  const [selectedTicker, setSelectedTicker] = useState<StockTicker | null>(null)

  useEffect(() => {
    fetch("/backend/ticker_name.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsedData: StockTicker[] = results.data.map((row: any) => ({
              symbol: row["Ticker"],
              name: row["Company Name"],
            }))
            setTickers(parsedData)
            if (parsedData.length > 0) {
              setSelectedTicker(parsedData[0]) // Default to first ticker
            }
          },
        })
      })
      .catch((error) => console.error("Error loading ticker CSV:", error))
  }, [])

  const filteredTickers = tickers.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        className="flex items-center space-x-2 rounded-md bg-green-50 py-2 px-3 text-gray-700 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#E8D8B2]"
      >
        <span>{selectedTicker ? selectedTicker.symbol : "Select Ticker"}</span>
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
            {filteredTickers.length > 0 ? (
              filteredTickers.map((ticker) => (
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
              ))
            ) : (
              <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
