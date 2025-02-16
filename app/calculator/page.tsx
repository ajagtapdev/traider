"use client";

import { Sidebar } from "@/components/sidebar";
import Header from "@/components/header";
import Calculator from "@/components/Calculator";

const CalculatorPage = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#fdf6e9] to-[#fdf6e9]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
            <Calculator />
            </main>
        </div>
        </div>
    );
};

export default CalculatorPage;