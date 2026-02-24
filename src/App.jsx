import { useState, useEffect, useCallback } from 'react';
import Home from './components/Home/Home';
import GameScreen from './components/GameScreen/GameScreen';
import GameOver from './components/GameOver/GameOver';
import Leaderboard from './components/Leaderboard/Leaderboard';
import { useGameLogic } from './hooks/useGameLogic';
import { useScoreSubmission } from './hooks/useApi';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'game' | 'gameOver' | 'leaderboard'
  
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
    bestWordsInAnyRound,
    roundPassed,
    roundStats,
    minWordsToPass,
    bannedCount,
    startGame,
    nextRound,
    gameOver,
    submitWord,
    setCurrentWord,
    resetGame,
  } = useGameLogic();

  const { submitting, error: submitError, submitScore } = useScoreSubmission();

  // Handle round end transitions
  useEffect(() => {
    if (gameState === 'roundEnd') {
      if (roundPassed) {
        // Short delay before next round
        const timer = setTimeout(() => {
          nextRound();
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Game over
        const timer = setTimeout(() => {
          gameOver();
          setView('gameOver');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, roundPassed, nextRound, gameOver]);

  const handleStartGame = useCallback((name) => {
    startGame(name);
    setView('game');
  }, [startGame]);

  const handleSubmitScore = useCallback(async () => {
    await submitScore(playerName, roundsCleared, bestWordsInAnyRound);
  }, [submitScore, playerName, roundsCleared, bestWordsInAnyRound]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setView('home');
  }, [resetGame]);

  const handleViewLeaderboards = useCallback(() => {
    setView('leaderboard');
  }, []);

  const handleBackToHome = useCallback(() => {
    resetGame();
    setView('home');
  }, [resetGame]);

  // Show round end overlay
  const showRoundEnd = gameState === 'roundEnd';

  return (
    <div className="min-h-screen bg-slate-900">
      {view === 'home' && (
        <Home onStartGame={handleStartGame} onViewLeaderboards={handleViewLeaderboards} />
      )}
      
      {view === 'game' && (
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
              <div className={`text-center p-8 rounded-2xl ${roundPassed ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                <h2 className={`text-4xl font-bold mb-4 ${roundPassed ? 'text-green-400' : 'text-red-400'}`}>
                  {roundPassed ? 'ROUND PASSED!' : 'ROUND FAILED'}
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
      
      {view === 'gameOver' && (
        <GameOver
          playerName={playerName}
          roundsCleared={roundsCleared}
          bestWordsInAnyRound={bestWordsInAnyRound}
          onSubmitScore={handleSubmitScore}
          onPlayAgain={handlePlayAgain}
          onViewLeaderboards={handleViewLeaderboards}
          submitting={submitting}
          error={submitError}
        />
      )}
      
      {view === 'leaderboard' && (
        <Leaderboard onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;
