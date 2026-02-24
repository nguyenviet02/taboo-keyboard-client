import { useState, useEffect } from 'react';

export default function Leaderboard({ onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/leaderboard/rounds`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const json = await res.json();
      setData(json.scores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
        Leaderboard
      </h1>

      <div className="bg-white/5 rounded-xl p-4 min-h-80 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">No scores yet. Be the first!</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">Rank</th>
                <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">Player</th>
                <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">Rounds</th>
                <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">Best Words</th>
                <th className="py-3 px-4 text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, idx) => (
                <tr key={idx} className={idx < 3 ? 'bg-pink-500/10' : ''}>
                  <td className="py-3 px-4 font-bold w-16">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : entry.rank}
                  </td>
                  <td className="py-3 px-4 font-medium">{entry.name}</td>
                  <td className="py-3 px-4 font-bold text-pink-400">{entry.roundsSurvived}</td>
                  <td className="py-3 px-4">{entry.bestWords}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={onBack}
          className="py-3 px-6 text-base font-medium border-2 border-gray-700 rounded-lg bg-transparent text-white cursor-pointer hover:border-pink-500 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
