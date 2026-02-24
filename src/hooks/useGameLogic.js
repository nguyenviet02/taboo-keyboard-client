import { useState, useEffect, useCallback, useRef } from 'react';
import { validateWord } from '../utils/wordValidator';
import { selectBannedLetters, getMinWordsToPass, getBannedCount } from '../utils/letterUtils';

export const DEFAULT_ROUND_SECONDS = 25;

export function useGameLogic() {
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'roundEnd' | 'gameOver'
  const [playerName, setPlayerName] = useState('');
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(DEFAULT_ROUND_SECONDS);
  const [bannedLetters, setBannedLetters] = useState([]);
  const [acceptedWords, setAcceptedWords] = useState([]); // Current round words
  const [allUsedWords, setAllUsedWords] = useState([]); // All words used in entire game
  const [currentWord, setCurrentWord] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [isValidating, setIsValidating] = useState(false);
  const [roundsCleared, setRoundsCleared] = useState(0);
  const [bestWordsInAnyRound, setBestWordsInAnyRound] = useState(0);
  const [roundPassed, setRoundPassed] = useState(null); // true | false | null
  const [roundStats, setRoundStats] = useState(null); // For game over screen
  
  const timerRef = useRef(null);
  const submitTimeRef = useRef(null);
  const previousBannedRef = useRef([]);

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(t => t - 1);
      }, 1000);
      
      return () => {
        clearTimer();
      };
    } else if (gameState === 'playing' && timer === 0) {
      handleRoundEnd();
    }
  }, [gameState, timer, clearTimer]);

  // Handle round end
  const handleRoundEnd = useCallback(() => {
    clearTimer();
    const minWords = getMinWordsToPass(round);
    const passed = acceptedWords.length >= minWords;
    
    setRoundPassed(passed);
    setRoundStats({
      wordsSubmitted: acceptedWords.length,
      minRequired: minWords,
      passed
    });
    
    if (passed) {
      setRoundsCleared(r => r + 1);
      setBestWordsInAnyRound(best => Math.max(best, acceptedWords.length));
    }
    
    setGameState('roundEnd');
  }, [round, acceptedWords, clearTimer]);

  // Auto-pass when enough words are submitted
  useEffect(() => {
    if (gameState === 'playing' && acceptedWords.length >= getMinWordsToPass(round)) {
      // Round passed! Show popup and auto-advance
      handleRoundEnd();
    }
  }, [acceptedWords, gameState, round, handleRoundEnd]);

  // Start a new game
  const startGame = useCallback((name) => {
    setPlayerName(name);
    setRound(1);
    setTimer(DEFAULT_ROUND_SECONDS);
    setAcceptedWords([]);
    setAllUsedWords([]); // Reset all used words on new game
    setRoundsCleared(0);
    setBestWordsInAnyRound(0);
    setCurrentWord('');
    setFeedback(null);
    setRoundPassed(null);
    setRoundStats(null);
    previousBannedRef.current = [];
    
    const banned = selectBannedLetters(1, []);
    setBannedLetters(banned);
    previousBannedRef.current = banned;
    
    setGameState('playing');
  }, []);

  // Start next round
  const nextRound = useCallback(() => {
    const newRound = round + 1;
    setRound(newRound);
    setTimer(DEFAULT_ROUND_SECONDS);
    setAcceptedWords([]); // Reset round words, but keep allUsedWords
    setCurrentWord('');
    setFeedback(null);
    setRoundPassed(null);
    setRoundStats(null);
    
    const banned = selectBannedLetters(newRound, previousBannedRef.current);
    setBannedLetters(banned);
    previousBannedRef.current = banned;
    
    setGameState('playing');
  }, [round]);

  // Handle game over
  const gameOver = useCallback(() => {
    setGameState('gameOver');
  }, []);

  // Submit current word - check against allUsedWords instead of just acceptedWords
  const submitWord = useCallback(async () => {
    if (!currentWord.trim() || isValidating || gameState !== 'playing') return;
    
    const word = currentWord.trim();
    submitTimeRef.current = Date.now();
    
    setIsValidating(true);
    setFeedback(null);
    
    try {
      const result = await validateWord(word, bannedLetters, allUsedWords);
      
      if (result.valid) {
        const lowerWord = word.toLowerCase();
        setAcceptedWords(words => [...words, lowerWord]);
        setAllUsedWords(words => [...words, lowerWord]);
        setCurrentWord('');
        setFeedback({ 
          type: 'success', 
          message: result.fallbackMessage || `"${word}" accepted!` 
        });
      } else {
        setFeedback({ type: 'error', message: result.reason || 'Invalid word' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Validation error. Try again.' });
    }
    
    setIsValidating(false);
    
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  }, [currentWord, isValidating, gameState, bannedLetters, allUsedWords]);

  // Reset game
  const resetGame = useCallback(() => {
    clearTimer();
    setGameState('idle');
    setPlayerName('');
    setRound(1);
    setTimer(DEFAULT_ROUND_SECONDS);
    setBannedLetters([]);
    setAcceptedWords([]);
    setAllUsedWords([]); // Reset all used words
    setCurrentWord('');
    setFeedback(null);
    setRoundsCleared(0);
    setBestWordsInAnyRound(0);
    setRoundPassed(null);
    setRoundStats(null);
  }, [clearTimer]);

  return {
    // State
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
    
    // Computed
    minWordsToPass: getMinWordsToPass(round),
    bannedCount: getBannedCount(round),
    
    // Actions
    startGame,
    nextRound,
    gameOver,
    submitWord,
    setCurrentWord,
    resetGame,
  };
}
