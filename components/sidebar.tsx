"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Trophy, Calculator, Menu, X } from "lucide-react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";
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
// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const menuItems = [
  { icon: Home, label: "Trading Simulator", path: "/" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  { icon: Calculator, label: "Finance Calculator", path: "/calculator" },
];

// Pseudo data for portfolio visualizations
const portfolioData = {
  initialInvestment: 10000,
  currentValue: 2000,
  stocks: [
    { name: "AAPL", value: 2000 },
    { name: "GOOGL", value: 1500 },
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
};

// interface tradeRecord {
//   initialInvestment: number;
//   finalValue: number;
//   valueOverTime: { date: string; value: number }[];
// }



export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const initialInvestment = portfolioData.initialInvestment;
  const currentValue = portfolioData.currentValue;
  const percentIncrease =
    ((currentValue - initialInvestment) / initialInvestment) * 100;

  const barChartData = {
    labels: ["Initial Investment", "Current Value"], // Now each bar has its own label
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: [initialInvestment, currentValue], // Two separate bars
        backgroundColor: [
          "rgba(148, 151, 153, 0.6)", // Blue for Initial Investment
          percentIncrease >= 0
            ? "rgba(34, 197, 94, 0.6)" // Green if positive growth
            : "rgba(239, 68, 68, 0.6)", // Red if negative growth
        ],
        borderColor: [
          "rgba(148, 151, 153, 0.6)", // Blue for Initial Investment
          percentIncrease >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: portfolioData.stocks.map((stock) => stock.name),
    datasets: [
      {
        data: portfolioData.stocks.map((stock) => stock.value),
        backgroundColor: [
          "rgba(16, 138, 53, 0.6)",
          "rgba(30, 201, 135, 0.6)",
          "rgba(103, 230, 83, 0.6)",
          "rgba(0, 255, 4, 0.39)",
        ],
        borderColor: [
          "rgba(16, 138, 53, 0.6)",
          "rgba(30, 201, 135, 0.6)",
          "rgba(103, 230, 83, 0.6)",
          "rgba(0, 255, 4, 0.39)",
        ],
        borderWidth: 1,
      },
    ],
  };

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

  // const past = useQuery(api.past.get);
  // const trade  = useQuery(api.trade.getTrades, { userId: "1" });

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: isOpen ? "50%" : 80 }}
      transition={{ duration: 0.3 }}
      className="relative flex h-full flex-col bg-[#F8F4E3]/50 backdrop-blur-sm border-r border-[#E8D8B2]"
    >
      <div className="flex h-16 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800"></h1>
      </div>
      <div className="flex items-center justify-center relative h-16">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed top-4 z-10 rounded-full bg-[#E8D8B2] p-1 text-gray-800 shadow-lg transition-transform duration-300 ${
            isOpen ? "left-[calc(50%+25vw-3rem)]" : "left-[calc(100%-3.35rem)]"
          }`}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item, index) => (
          <motion.a
            key={index}
            href="#"
            className="flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-white/50 text-gray-700 hover:text-gray-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(item.path)}
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
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Portfolio
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                <h3 className="mb-20 text-lg font-semibold text-gray-800">
                  Portfolio Performance
                </h3>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    Portfolio Distribution
                  </h3>
                  <Pie data={pieChartData} options={{ responsive: true }} />
                </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    Portfolio Value Over Time
                  </h3>
                  <Line data={lineChartData} options={{ responsive: true }} />
                </div>
                <div className="rounded-lg border border-[#E8D8B2] bg-white/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Past Trade Records</h3>
                    <details className="mb-4"></details>
                    {portfolioData.valueOverTime.map((record, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="text-md font-semibold text-gray-700">Trade {index + 1}</h4>
                      <p className="text-sm text-gray-600">
                        Performance:{" "}
                        {(((record.value - portfolioData.initialInvestment) / portfolioData.initialInvestment) * 100).toFixed(2)}%
                      </p>
                      <div className="mt-2 h-24">
                        <Line
                        data={{
                          labels: portfolioData.valueOverTime.map((data) => data.date),
                          datasets: [
                          {
                            label: "Value",
                            data: portfolioData.valueOverTime.map((data) => data.value),
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
  );
}
