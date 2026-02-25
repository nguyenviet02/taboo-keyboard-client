import { useState, useEffect } from "react";

export default function Leaderboard({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  const fetchLeaderboard = async (pageNum) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:7001/api";
      const res = await fetch(`${apiUrl}/leaderboard/rounds?page=${pageNum}`);

      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const json = await res.json();
      setData(json.scores || []);
      setPage(json.pagination?.page || pageNum);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchLeaderboard(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchLeaderboard(page + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">
                Loading...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg">
                No scores yet. Be the first!
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-2 text-center text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
                      Rank
                    </th>
                    <th className="py-3 px-2 text-center text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
                      Player
                    </th>
                    <th className="py-3 px-2 text-center text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
                      Rounds
                    </th>
                    <th className="py-3 px-2 text-center text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, idx) => (
                    <tr
                      key={idx}
                      className={entry.rank <= 3 ? "bg-pink-500/10" : ""}
                    >
                      <td className="py-2 px-2 font-bold text-center text-white">
                        {entry.rank === 1
                          ? "🥇"
                          : entry.rank === 2
                            ? "🥈"
                            : entry.rank === 3
                              ? "🥉"
                              : entry.rank}
                      </td>
                      <td className="py-2 px-2 font-medium text-center text-white">
                        {entry.name}
                      </td>
                      <td className="py-2 px-2 font-bold text-pink-400 text-center">
                        {entry.roundsSurvived}
                      </td>
                      <td className="py-2 px-2 text-gray-300 text-center">
                        {entry.totalTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
