"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: Home, label: "Trading Simulator", path: "/" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const portfolioData = null;

  // In a real app, you'd fetch this from your backend / API
  // For now, we'll keep it null to show the "No trades" state unless populated
  // Example fetch:
  // useEffect(() => {
  //   fetch('/api/portfolio')
  //     .then(res => res.json())
  //     .then(data => setPortfolioData(data))
  //     .catch(err => console.error(err));
  // }, []);

  const hasData = portfolioData !== null;

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
                Portfolio Analysis
              </h2>
              
              {!hasData ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No trades executed yet.</p>
                  <p className="text-sm">Start trading to see portfolio analytics.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                   {/* Charts would go here when data is connected */}
                   <div className="p-4 bg-white/50 rounded-lg border border-[#E8D8B2]">
                      <p>Portfolio data loaded...</p>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
