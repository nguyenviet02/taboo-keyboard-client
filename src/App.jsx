import { useState, useEffect, useCallback } from "react";
import Home from "./components/Home/Home";
import GameScreen from "./components/GameScreen/GameScreen";
import GameOver from "./components/GameOver/GameOver";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import { useGameLogic } from "./hooks/useGameLogic";
import * as api from "./services/api";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [view, setView] = useState("home");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [rankInfo, setRankInfo] = useState(null);

  const {
    gameState,
    playerName,
    round,
    timer,
    bannedLetters,
    acceptedWords,
    allUsedWords,
    currentWord,
    feedback,
    isValidating,
    roundsCleared,
    roundPassed,
    roundStats,
    totalTimeSeconds,
    cheatingDetected,
    minWordsToPass,
    startGame,
    nextRound,
    gameOver,
    submitWord,
    setCurrentWord,
    resetGame,
    recordKeystroke,
  } = useGameLogic();

  // Handle round end transitions
  useEffect(() => {
    if (gameState === "roundEnd") {
      if (roundPassed) {
        const t = setTimeout(() => {
          nextRound();
        }, 1500);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(async () => {
          gameOver();

          if (roundsCleared > 0 && !cheatingDetected) {
            try {
              const result = await api.getRank(roundsCleared, totalTimeSeconds, playerName);

              if (result.qualifies) {
                const submitResult = await api.submitRoundsScore({
                  playerName,
                  roundsSurvived: roundsCleared,
                  totalTimeSeconds,
                });
                result.updated = submitResult.updated;
                result.message = submitResult.message;
              }

              setRankInfo(result);
            } catch (err) {
              console.error("Failed to get rank:", err);
              setRankInfo({ rank: 50, qualifies: false });
            }
          } else {
            setRankInfo({ rank: 0, qualifies: false });
          }

          setView("gameOver");
        }, 1500);
        return () => clearTimeout(t);
      }
    }
  }, [
    gameState,
    roundPassed,
    nextRound,
    gameOver,
    roundsCleared,
    totalTimeSeconds,
    playerName,
    cheatingDetected,
  ]);

  const handleStartGame = useCallback(
    (name) => {
      setRankInfo(null);
      startGame(name);
      setView("game");
    },
    [startGame],
  );

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setView("home");
  }, [resetGame]);

  const handleOpenLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
  }, []);

  const showRoundEnd = gameState === "roundEnd";

  return (
    <div className="min-h-screen bg-slate-900">
      {view === "home" && (
        <Home
          onStartGame={handleStartGame}
          onViewLeaderboards={handleOpenLeaderboard}
        />
      )}

      {view === "game" && (
        <>
          <GameScreen
            round={round}
            timer={timer}
            bannedLetters={bannedLetters}
            minWordsToPass={minWordsToPass}
            acceptedWords={acceptedWords}
            allUsedWords={allUsedWords}
            currentWord={currentWord}
            feedback={feedback}
            isValidating={isValidating}
            onWordChange={setCurrentWord}
            onSubmitWord={submitWord}
            onKeystroke={recordKeystroke}
          />

          {showRoundEnd && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
              <div
                className={`text-center p-8 rounded-2xl ${roundPassed ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"}`}
              >
                <h2
                  className={`text-4xl font-bold mb-4 ${roundPassed ? "text-green-400" : "text-red-400"}`}
                >
                  {roundPassed ? "ROUND PASSED!" : "ROUND FAILED"}
                </h2>
                {roundStats && (
                  <p className="text-xl text-gray-300">
                    {roundStats.wordsSubmitted}/{roundStats.minRequired} words
                  </p>
                )}
              </div>
            </div>
          )}

          {cheatingDetected && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[60]">
              <div className="text-center p-8 rounded-2xl bg-red-900/40 border-2 border-red-500 max-w-md mx-4">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-400 mb-3">
                  Session Ended
                </h2>
                <p className="text-gray-300 mb-6">
                  Unusual activity was detected. Your session has been
                  terminated and your score will not be submitted.
                </p>
                <button
                  onClick={handlePlayAgain}
                  className="px-6 py-3 text-lg font-bold rounded-lg bg-linear-to-r from-pink-500 to-rose-400 text-white cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                  Restart Game
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {view === "gameOver" && rankInfo && (
        <GameOver
          playerName={playerName}
          roundsCleared={roundsCleared}
          totalTimeSeconds={totalTimeSeconds}
          rank={rankInfo.rank}
          qualifies={rankInfo.qualifies}
          updated={rankInfo.updated}
          message={rankInfo.message}
          onPlayAgain={handlePlayAgain}
          onViewLeaderboards={handleOpenLeaderboard}
        />
      )}

      {showLeaderboard && <Leaderboard onClose={handleCloseLeaderboard} />}
      <Analytics />
    </div>
  );
}

export default App;
