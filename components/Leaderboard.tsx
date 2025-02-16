import React from "react";

const mockData = [
  { rank: 1, name: "Cooper", score: 15.1 },
  { rank: 2, name: "Shlok", score: 14.2 },
  { rank: 3, name: "Bart", score: 10.3 },
  { rank: 4, name: "Paul", score: 10.1 },
  { rank: 5, name: "Evan", score: 9.3 },
];

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-[#fdf6e9] px-6 pb-10 pt-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-[#408830] mb-4">Leaderboard</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-[#509048] text-white">Rank</th>
              <th className="py-2 px-4 bg-[#509048] text-white">Name</th>
              <th className="py-2 px-4 bg-[#509048] text-white">Percent Gain (%)</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((player) => (
              <tr key={player.rank} className="border-b border-[#80b048]">
                <td className="py-2 px-4">{player.rank}</td>
                <td className="py-2 px-4">{player.name}</td>
                <td className="py-2 px-4">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;