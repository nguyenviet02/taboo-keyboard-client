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
    minWordsToPass,
    startGame,
    nextRound,
    gameOver,
    submitWord,
    setCurrentWord,
    resetGame,
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

          // Only calculate rank and save if player passed at least round 1
          if (roundsCleared > 0) {
            try {
              const result = await api.getRank(roundsCleared, totalTimeSeconds);
              setRankInfo(result);

              // Auto-submit if qualifies (rank <= 50)
              if (result.qualifies) {
                await api.submitRoundsScore({
                  playerName,
                  roundsSurvived: roundsCleared,
                  totalTimeSeconds,
                });
              }
            } catch (err) {
              console.error("Failed to get rank:", err);
              setRankInfo({ rank: 50, qualifies: false });
            }
          } else {
            // Player didn't pass round 1, no rank, no save
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
        </>
      )}

      {view === "gameOver" && rankInfo && (
        <GameOver
          playerName={playerName}
          roundsCleared={roundsCleared}
          totalTimeSeconds={totalTimeSeconds}
          rank={rankInfo.rank}
          qualifies={rankInfo.qualifies}
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
