import { useState, useEffect } from 'react';

export default function GameOver({
  playerName,
  roundsCleared,
  totalTimeSeconds,
  rank,
  qualifies,
  onPlayAgain,
  onViewLeaderboards,
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const passedRound1 = roundsCleared > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-700 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
          Game Over
        </h1>
        
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <span className="block text-sm text-gray-500 mb-1">Rounds</span>
            <span className="block text-4xl font-bold text-pink-400">{roundsCleared}</span>
          </div>
          
          <div className="text-center">
            <span className="block text-sm text-gray-500 mb-1">Time</span>
            <span className="block text-4xl font-bold text-pink-400">{formatTime(totalTimeSeconds)}</span>
          </div>
        </div>

        <div className="mb-6 text-lg text-gray-400">
          Player: <strong className="text-white">{playerName}</strong>
        </div>

        {!passedRound1 ? (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
            <div className="text-xl font-bold text-gray-400 mb-1">
              No Rank
            </div>
            <div className="text-sm text-gray-500">
              Pass round 1 to get on the leaderboard!
            </div>
          </div>
        ) : qualifies ? (
          <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
            <div className="text-2xl font-bold text-green-400 mb-1">
              Rank #{rank}
            </div>
            <div className="text-sm text-gray-400">
              Your score has been saved!
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
            <div className="text-xl font-bold text-gray-400 mb-1">
              Rank 50+
            </div>
            <div className="text-sm text-gray-500">
              Keep trying to reach the top 50!
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button 
            onClick={onPlayAgain}
            className="w-full py-3 text-lg font-bold border-none rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
          >
            Play Again
          </button>
          
          <button 
            onClick={onViewLeaderboards}
            className="w-full py-3 text-base font-medium border-2 border-gray-700 rounded-lg bg-transparent text-white cursor-pointer hover:border-pink-500 transition-colors"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
