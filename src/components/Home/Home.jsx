import { useState, useEffect } from 'react';

const STORAGE_KEY = 'taboo_keyboard_player_name';

export default function Home({ onStartGame, onViewLeaderboards }) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPlayerName(saved);
    }
  }, []);

  const handleClearName = () => {
    setPlayerName('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmed = playerName.trim();
    
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    
    if (trimmed.length > 16) {
      setError('Name must be at most 16 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Name can only contain letters, numbers, and underscores');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, trimmed);
    onStartGame(trimmed);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
        Taboo Keyboard
      </h1>
      
      <div className="bg-white/10 rounded-xl p-6 mb-8 max-w-md">
        <h2 className="text-xl font-semibold text-pink-400 mb-4">How to Play</h2>
        <ul className="space-y-2 text-gray-300">
          <li>• Type valid English words before time runs out</li>
          <li>• Avoid using "taboo" (banned) letters shown each round</li>
          <li>• Each round requires more words to pass</li>
          <li>• More letters get banned as rounds progress</li>
          <li>• Compete for most rounds survived!</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <label className="text-lg text-gray-400">Enter Your Name</label>
        <div className="relative">
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError('');
            }}
            placeholder="Your name"
            maxLength={16}
            autoFocus
            className="w-full p-3 pr-10 text-xl border-2 border-gray-700 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
          {playerName && (
            <button
              type="button"
              onClick={handleClearName}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-400 transition-colors text-xl"
              title="Clear saved name"
            >
              ×
            </button>
          )}
        </div>
        
        {error && <span className="text-pink-400 text-sm">{error}</span>}
        
        <button 
          type="submit"
          className="py-3 px-6 text-xl font-bold border-none rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/30 transition-all active:translate-y-0"
        >
          Start Game
        </button>
        
        <button 
          type="button"
          onClick={onViewLeaderboards}
          className="py-3 px-6 text-base font-medium border-2 border-gray-700 rounded-lg bg-transparent text-white cursor-pointer hover:border-pink-500 transition-colors"
        >
          View Leaderboard
        </button>
      </form>
      
      <p className="mt-8 text-gray-500 text-sm">
        Words validated by Dictionary API. No cheating!
      </p>
    </div>
  );
}
