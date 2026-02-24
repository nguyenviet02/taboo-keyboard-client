import { useEffect, useRef } from "react";

export default function GameScreen({
  round,
  timer,
  bannedLetters,
  minWordsToPass,
  acceptedWords,
  allUsedWords,
  currentWord,
  feedback,
  isValidating,
  onWordChange,
  onSubmitWord,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !isValidating) {
      inputRef.current.focus();
    }
  }, [isValidating, feedback]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isValidating) {
      e.preventDefault();
      onSubmitWord();
    }
  };

  const timerClass =
    timer <= 5
      ? "bg-red-500/30 animate-pulse"
      : timer <= 10
        ? "bg-yellow-500/30 animate-pulse"
        : "bg-green-500/20";

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl mb-4 md:mb-6">
        <div className="text-center">
          <span className="block text-xs text-gray-500 uppercase tracking-wider">
            Round
          </span>
          <span className="block text-2xl md:text-3xl font-bold">{round}</span>
        </div>

        <div className={`text-center p-2 px-3 md:px-4 rounded-lg ${timerClass}`}>
          <span className="block text-3xl md:text-4xl font-bold font-mono">{timer}</span>
          <span className="block text-xs text-gray-400 uppercase">
            seconds
          </span>
        </div>

        <div className="text-center">
          <span className="block text-xs text-gray-500 uppercase tracking-wider">
            Words
          </span>
          <span className="block text-2xl md:text-3xl font-bold">
            <span
              className={
                acceptedWords.length >= minWordsToPass ? "text-green-400" : ""
              }
            >
              {acceptedWords.length}
            </span>
            <span className="text-gray-500">/{minWordsToPass}</span>
          </span>
        </div>
      </div>

      {/* Banned Letters */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-sm text-pink-400 mb-3 tracking-widest">
          TABOO LETTERS
        </h2>
        <div className="flex justify-center gap-2 flex-wrap">
          {bannedLetters.map((letter) => (
            <span
              key={letter}
              className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl font-bold bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg shadow-lg shadow-pink-500/30"
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="flex gap-2 md:gap-3 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={currentWord}
          onChange={(e) => onWordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a word..."
          disabled={isValidating}
          className="flex-1 p-3 md:p-4 text-lg md:text-xl border-2 border-gray-700 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-60"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <button
          onClick={onSubmitWord}
          disabled={isValidating || !currentWord.trim()}
          className="px-4 md:px-6 text-base md:text-lg font-bold border-none rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white cursor-pointer hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isValidating ? "..." : "Submit"}
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-lg mb-4 text-center font-medium text-sm md:text-base ${
            feedback.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* Current Round Words */}
        <div className="md:col-span-2 flex flex-col overflow-hidden">
          <h3 className="text-sm text-gray-500 mb-2">
            This Round ({acceptedWords.length})
          </h3>
          <div className="flex-1 overflow-y-auto flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg min-h-24 md:min-h-32 content-start">
            {acceptedWords.length === 0 ? (
              <span className="text-gray-600 italic p-2">
                No words yet. Start typing!
              </span>
            ) : (
              acceptedWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                >
                  {word}
                </span>
              ))
            )}
          </div>
        </div>

        {/* All Used Words - Side panel on desktop, bottom on mobile */}
        <div className="flex flex-col bg-white/5 rounded-xl p-3 overflow-hidden">
          <h3 className="text-sm text-gray-400 mb-1 font-semibold">
            All Used ({allUsedWords.length})
          </h3>
          <p className="text-xs text-gray-500 mb-2 hidden md:block">
            Each word can only be used once
          </p>
          <div className="flex-1 overflow-y-auto">
            {allUsedWords.length === 0 ? (
              <span className="text-gray-600 italic text-sm">
                No words yet
              </span>
            ) : (
              <div className="flex flex-wrap md:flex-col gap-1">
                {allUsedWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-700/50 text-gray-300 rounded text-xs md:text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
