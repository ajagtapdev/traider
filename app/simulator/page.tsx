"use client";

import { useState } from "react";
import { Sidebar, PortfolioMetrics } from "@/components/sidebar";
import Header from "@/components/header";
import TradingSimulator from "@/components/trading-simulator";
import { useGuestUser } from "@/hooks/useGuestUser";

const Simulator = () => {
  const { guestId, userId, isLoaded } = useGuestUser();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDF6E9]">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#fdf6e9] to-[#fdf6e9]">
      <Sidebar metrics={metrics} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <TradingSimulator 
            guestId={guestId!} 
            userId={userId} 
            onMetricsUpdate={setMetrics} 
          />
        </main>
      </div>
    </div>
  );
};



export default Simulator;
