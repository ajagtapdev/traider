"use client";

import { Sidebar } from "@/components/sidebar";
import Header from "@/components/header";
import { TradingSimulator } from "@/components/trading-simulator";
// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";

const Simulator = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#F8F4E3] to-[#E8E1C8]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <TradingSimulator />
        </main>
      </div>
    </div>
  );
};

export default Simulator;
