
import React from "react";
/*

type Trade = {
  date: string         // 'YYYY-MM-DD'
  ticker: string
  quantity: number
  price: number
  action: "buy" | "sell"
}

*/


const TradeHistoryTable = ({ trades }) => { 
  return (
    <table className="min-w-full divide-y divide-green-200">
    <thead className="bg-green-50">
      <tr>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Date
      </th>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Action
      </th>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Ticker
      </th>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Quantity
      </th>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Price
      </th>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        Trade Value
      </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-green-200">
      {trades.map((t, idx) => {
      const tv = t.quantity * t.price
      return (
        <tr key={idx}>
        <td className="px-4 py-2 text-sm text-gray-700">{t.date}</td>
        <td className="px-4 py-2 text-sm text-gray-700">{t.action}</td>
        <td className="px-4 py-2 text-sm text-gray-700">{t.ticker}</td>
        <td className="px-4 py-2 text-sm text-gray-700">{t.quantity}</td>
        <td className="px-4 py-2 text-sm text-gray-700">${t.price.toFixed(2)}</td>
        <td className="px-4 py-2 text-sm text-gray-700">${tv.toFixed(2)}</td>
        </tr>
      )
      })}
    </tbody>
    </table>
  );
};

export default TradeHistoryTable;