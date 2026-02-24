import { useState } from 'react';

export default function GameOver({
  playerName,
  roundsCleared,
  bestWordsInAnyRound,
  onSubmitScore,
  onPlayAgain,
  onViewLeaderboards,
  submitting,
  error,
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
        Game Over
      </h1>
      
      <div className="flex gap-6 mb-8 flex-wrap justify-center">
        <div className="bg-white/10 rounded-xl p-6 text-center min-w-36">
          <span className="block text-sm text-gray-500 mb-2">Rounds Cleared</span>
          <span className="block text-4xl font-bold text-pink-400">{roundsCleared}</span>
        </div>
        
        <div className="bg-white/10 rounded-xl p-6 text-center min-w-36">
          <span className="block text-sm text-gray-500 mb-2">Best Words</span>
          <span className="block text-4xl font-bold text-pink-400">{bestWordsInAnyRound}</span>
        </div>
      </div>

      <div className="mb-8 text-lg text-gray-400">
        Player: <strong className="text-white">{playerName}</strong>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onSubmitScore}
          disabled={submitting}
          className="w-full py-4 text-lg font-bold border-none rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Score'}
        </button>
        
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        
        <button 
          onClick={onPlayAgain}
          className="w-full py-4 text-lg font-bold border-none rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30 transition-all"
        >
          Play Again
        </button>
        
        <button 
          onClick={onViewLeaderboards}
          className="w-full py-3 text-base font-medium border-2 border-gray-700 rounded-lg bg-transparent text-white cursor-pointer hover:border-pink-500 transition-colors"
        >
          View Leaderboards
        </button>
      </div>
    </div>
  );
}
