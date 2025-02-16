import React, { useState } from "react";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-[#fdf6e9] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#408830] text-center mb-6">
        Financial Calculator
      </h1>

      {/* Responsive Row of Calculators */}
      <div className="flex justify-center gap-6 w-full max-w-6xl overflow-x-auto">
        <ROI_Calculator />
        <CAGR_Calculator />
        <ProfitLoss_Calculator />
      </div>
    </div>
  );
};

// ROI Calculator Component
const ROI_Calculator = () => {
  const [initial, setInitial] = useState("");
  const [final, setFinal] = useState("");
  const [roi, setROI] = useState<number | null>(null);

  const calculateROI = () => {
    if (!initial || !final) return;
    const roiValue = ((parseFloat(final) - parseFloat(initial)) / parseFloat(initial)) * 100;
    setROI(roiValue);
  };

  return (
    <div className="w-full md:w-1/3 bg-[#408830] text-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-center mb-4">Return on Investment (ROI)</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Initial Investment ($)</label>
          <input 
            type="number"
            value={initial} 
            onChange={(e) => setInitial(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Final Value ($)</label>
          <input 
            type="number"
            value={final} 
            onChange={(e) => setFinal(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <button 
          onClick={calculateROI} 
          className="w-full bg-white text-[#408830] py-2 rounded-md hover:bg-gray-200 transition"
        >
          Calculate ROI
        </button>
        {roi !== null && (
          <p className="text-center text-lg font-semibold">
            ROI: {roi.toFixed(2)}%
          </p>
        )}
      </div>
    </div>
  );
};

// CAGR Calculator Component
const CAGR_Calculator = () => {
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [years, setYears] = useState("");
  const [cagr, setCAGR] = useState<number | null>(null);

  const calculateCAGR = () => {
    if (!startValue || !endValue || !years) return;
    const cagrValue = ((parseFloat(endValue) / parseFloat(startValue)) ** (1 / parseFloat(years)) - 1) * 100;
    setCAGR(cagrValue);
  };

  return (
    <div className="w-full md:w-1/3 bg-[#509048] text-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-center mb-4">CAGR Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Initial Value ($)</label>
          <input 
            type="number"
            value={startValue} 
            onChange={(e) => setStartValue(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Final Value ($)</label>
          <input 
            type="number"
            value={endValue} 
            onChange={(e) => setEndValue(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Years</label>
          <input 
            type="number"
            value={years} 
            onChange={(e) => setYears(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <button 
          onClick={calculateCAGR} 
          className="w-full bg-white text-[#509048] py-2 rounded-md hover:bg-gray-200 transition"
        >
          Calculate CAGR
        </button>
        {cagr !== null && (
          <p className="text-center text-lg font-semibold">
            CAGR: {cagr.toFixed(2)}%
          </p>
        )}
      </div>
    </div>
  );
};

// Profit/Loss Calculator Component
const ProfitLoss_Calculator = () => {
  const [cost, setCost] = useState("");
  const [sell, setSell] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateProfitLoss = () => {
    if (!cost || !sell) return;
    const profitLoss = parseFloat(sell) - parseFloat(cost);
    setResult(profitLoss);
  };

  return (
    <div className="w-full md:w-1/3 bg-[#80b048] text-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-center mb-4">Profit / Loss Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Cost Price ($)</label>
          <input 
            type="number"
            value={cost} 
            onChange={(e) => setCost(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Selling Price ($)</label>
          <input 
            type="number"
            value={sell} 
            onChange={(e) => setSell(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
          />
        </div>
        <button 
          onClick={calculateProfitLoss} 
          className="w-full bg-white text-[#80b048] py-2 rounded-md hover:bg-gray-200 transition"
        >
          Calculate
        </button>
        {result !== null && (
          <p className="text-center text-lg font-semibold">
            {result >= 0 ? "Profit: " : "Loss: "}
            <span className="text-white">
              ${Math.abs(result).toFixed(2)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Calculator;