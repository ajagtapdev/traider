"use client"

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react"

const stats = [
  { title: "Revenue", value: "$45,231", change: 12.5, icon: DollarSign },
  { title: "New Users", value: "1,205", change: -2.3, icon: Users },
  { title: "Sales", value: "3,124", change: 8.1, icon: ShoppingCart },
  { title: "Traffic", value: "56,281", change: 15.3, icon: TrendingUp },
]

export function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h2 className="mb-6 text-3xl font-bold">Dashboard Overview</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-white/10 p-6 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-semibold">{stat.value}</h3>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <stat.icon size={24} />
              </div>
            </div>
            <div className={`mt-4 flex items-center ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stat.change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="ml-1 text-sm">{Math.abs(stat.change)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 rounded-xl bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
        {/* Add a list or table of recent activities here */}
      </div>
    </main>
  )
}

