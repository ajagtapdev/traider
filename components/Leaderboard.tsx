import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const mockData = [
  { rank: 1, name: "Cooper", score: 15.1 },
  { rank: 2, name: "Shlok", score: 14.2 },
  { rank: 3, name: "Bart", score: 10.3 },
  { rank: 4, name: "Paul", score: 10.1 },
  { rank: 5, name: "Evan", score: 9.3 },
];

const podiumColors = ["#80b048", "#509048", "#408830"]; // Gold, Silver, Bronze

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-[#fdf6e9] flex flex-col items-center justify-center p-6 space-y-10">
      
      {/* Podium for Top 3 */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-[#408830] mb-4">Podium</h2>
        <div className="flex justify-center items-end space-x-6 mt-4">
          {mockData.slice(0, 3).map((player, index) => (
            <div key={player.rank} className="flex flex-col items-center">
              <div
                className="w-20 rounded-md text-white font-bold flex items-center justify-center"
                style={{
                  height: `${100 - index * 20}px`, // Varying heights for podium
                  backgroundColor: podiumColors[index],
                }}
              >
                {player.name}
              </div>
              <p className="mt-2 text-lg font-semibold">{player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 transform transition-all hover:scale-[1.02]">
        <h2 className="text-2xl font-bold text-[#408830] text-center mb-6">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#509048] text-white">
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Percent Gain (%)</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((player) => (
                <tr 
                  key={player.rank} 
                  className="border-b border-[#80b048] hover:bg-[#f3f9ec] transition-all duration-300"
                >
                  <td className="py-3 px-5 font-semibold">{player.rank}</td>
                  <td className="py-3 px-5">{player.name}</td>
                  <td className="py-3 px-5">{player.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#408830] text-center mb-4"> Score Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 20]} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="score" fill="#509048" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Leaderboard;