"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, User, Menu, X } from "lucide-react"
import { Bar, Pie, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

const menuItems = [
  { icon: Home, label: "Trading Simulator" },
  { icon: User, label: "Profile" },
]

// Pseudo data for portfolio visualizations
const portfolioData = {
  initialInvestment: 10000,
  currentValue: 12500,
  stocks: [
    { name: "AAPL", value: 5000 },
    { name: "GOOGL", value: 3000 },
    { name: "AMZN", value: 2500 },
    { name: "MSFT", value: 2000 },
  ],
  valueOverTime: [
    { date: "2023-01-01", value: 10000 },
    { date: "2023-02-01", value: 10500 },
    { date: "2023-03-01", value: 11200 },
    { date: "2023-04-01", value: 11800 },
    { date: "2023-05-01", value: 12500 },
  ],
}

// Pseudo data for past trade records
const pastTradeRecords = [
  {
    id: 1,
    initialInvestment: 8000,
    finalValue: 9200,
    stocks: [
      { name: "TSLA", value: 4000 },
      { name: "NVDA", value: 3200 },
      { name: "AMD", value: 2000 },
    ],
    valueOverTime: [
      { date: "2022-09-01", value: 8000 },
      { date: "2022-10-01", value: 8300 },
      { date: "2022-11-01", value: 8800 },
      { date: "2022-12-01", value: 9200 },
    ],
  },
  // Add more past trade records as needed
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const percentIncrease =
    ((portfolioData.currentValue - portfolioData.initialInvestment) / portfolioData.initialInvestment) * 100

  const barChartData = {
    labels: ["Portfolio Performance"],
    datasets: [
      {
        label: "Percentage Increase",
        data: [percentIncrease],
        backgroundColor: percentIncrease >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)",
        borderColor: percentIncrease >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
        borderWidth: 1,
      },
    ],
  }

  const pieChartData = {
    labels: portfolioData.stocks.map((stock) => stock.name),
    datasets: [
      {
        data: portfolioData.stocks.map((stock) => stock.value),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const lineChartData = {
    labels: portfolioData.valueOverTime.map((data) => data.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolioData.valueOverTime.map((data) => data.value),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  }

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: isOpen ? "50%" : 80 }}
      transition={{ duration: 0.3 }}
      className="relative flex h-full flex-col bg-[#F8F4E3]/50 backdrop-blur-sm border-r border-[#E8D8B2]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-4 z-10 rounded-full bg-[#E8D8B2] p-1 text-gray-800 shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Logo</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item, index) => (
          <motion.a
            key={index}
            href="#"
            className="flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-white/50 text-gray-700 hover:text-gray-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon size={24} />
            {isOpen && <span>{item.label}</span>}
          </motion.a>
        ))}
      </nav>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto bg-[#F8F4E3]/90 backdrop-blur-sm"
          >
            <div className="p-6">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Portfolio Performance</h3>
                  <Bar data={barChartData} options={{ indexAxis: "y", responsive: true }} />
                </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Portfolio Distribution</h3>
                  <Pie data={pieChartData} options={{ responsive: true }} />
                </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Portfolio Value Over Time</h3>
                  <Line data={lineChartData} options={{ responsive: true }} />
                </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Past Trade Records</h3>
                  {pastTradeRecords.map((record, index) => (
                    <div key={record.id} className="mb-4">
                      <h4 className="text-md font-semibold text-gray-700">Trade {index + 1}</h4>
                      <p className="text-sm text-gray-600">
                        Performance:{" "}
                        {(((record.finalValue - record.initialInvestment) / record.initialInvestment) * 100).toFixed(2)}
                        %
                      </p>
                      <div className="mt-2 h-24">
                        <Line
                          data={{
                            labels: record.valueOverTime.map((data) => data.date),
                            datasets: [
                              {
                                label: "Value",
                                data: record.valueOverTime.map((data) => data.value),
                                borderColor: "rgb(34, 197, 94)",
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                tension: 0.1,
                                fill: true,
                              },
                            ],
                          }}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

