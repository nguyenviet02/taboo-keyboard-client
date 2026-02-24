import { useState, useEffect, useCallback, useRef } from 'react';
import { validateWord } from '../utils/wordValidator';
import { selectBannedLetters, getMinWordsToPass } from '../utils/letterUtils';

export const DEFAULT_ROUND_SECONDS = 25;

export function useGameLogic() {
  const [gameState, setGameState] = useState('idle');
  const [playerName, setPlayerName] = useState('');
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(DEFAULT_ROUND_SECONDS);
  const [bannedLetters, setBannedLetters] = useState([]);
  const [acceptedWords, setAcceptedWords] = useState([]);
  const [allUsedWords, setAllUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [roundsCleared, setRoundsCleared] = useState(0);
  const [roundPassed, setRoundPassed] = useState(null);
  const [roundStats, setRoundStats] = useState(null);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  
  const timerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const previousBannedRef = useRef([]);
  const gameStartTimeRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Game time tracking - starts once when game begins
  useEffect(() => {
    if (gameState === 'playing') {
      if (!gameStartTimeRef.current) {
        gameStartTimeRef.current = Date.now();
      }
      gameTimerRef.current = setInterval(() => {
        if (gameStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          setTotalTimeSeconds(elapsed);
        }
      }, 1000);
    }
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimer();
    } else if (gameState === 'playing' && timer === 0) {
      handleRoundEnd();
    }
  }, [gameState, timer]);

  const handleRoundEnd = useCallback(() => {
    clearTimer();
    const minWords = getMinWordsToPass(round);
    const passed = acceptedWords.length >= minWords;
    setRoundPassed(passed);
    setRoundStats({ wordsSubmitted: acceptedWords.length, minRequired: minWords, passed });
    if (passed) setRoundsCleared(r => r + 1);
    setGameState('roundEnd');
  }, [round, acceptedWords, clearTimer]);

  useEffect(() => {
    if (gameState === 'playing' && acceptedWords.length >= getMinWordsToPass(round)) {
      handleRoundEnd();
    }
  }, [acceptedWords, gameState, round, handleRoundEnd]);

  const startGame = useCallback((name) => {
    setPlayerName(name);
    setRound(1);
    setTimer(DEFAULT_ROUND_SECONDS);
    setAcceptedWords([]);
    setAllUsedWords([]);
    setRoundsCleared(0);
    setCurrentWord('');
    setFeedback(null);
    setRoundPassed(null);
    setRoundStats(null);
    setTotalTimeSeconds(0);
    previousBannedRef.current = [];
    gameStartTimeRef.current = null;
    const banned = selectBannedLetters(1, []);
    setBannedLetters(banned);
    previousBannedRef.current = banned;
    setGameState('playing');
  }, []);

  const nextRound = useCallback(() => {
    const newRound = round + 1;
    setRound(newRound);
    setTimer(DEFAULT_ROUND_SECONDS);
    setAcceptedWords([]);
    setCurrentWord('');
    setFeedback(null);
    setRoundPassed(null);
    setRoundStats(null);
    const banned = selectBannedLetters(newRound, previousBannedRef.current);
    setBannedLetters(banned);
    previousBannedRef.current = banned;
    setGameState('playing');
  }, [round]);

  const gameOver = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setGameState('gameOver');
  }, []);

  const submitWord = useCallback(async () => {
    if (!currentWord.trim() || isValidating || gameState !== 'playing') return;
    const word = currentWord.trim();
    setIsValidating(true);
    setFeedback(null);
    try {
      const result = await validateWord(word, bannedLetters, allUsedWords);
      if (result.valid) {
        const lowerWord = word.toLowerCase();
        setAcceptedWords(words => [...words, lowerWord]);
        setAllUsedWords(words => [...words, lowerWord]);
        setCurrentWord('');
        setFeedback({ type: 'success', message: result.fallbackMessage || `"${word}" accepted!` });
      } else {
        setFeedback({ type: 'error', message: result.reason || 'Invalid word' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Validation error. Try again.' });
    }
    setIsValidating(false);
    setTimeout(() => setFeedback(null), 2000);
  }, [currentWord, isValidating, gameState, bannedLetters, allUsedWords]);

  const resetGame = useCallback(() => {
    clearTimer();
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setGameState('idle');
    setPlayerName('');
    setRound(1);
    setTimer(DEFAULT_ROUND_SECONDS);
    setBannedLetters([]);
    setAcceptedWords([]);
    setAllUsedWords([]);
    setCurrentWord('');
    setFeedback(null);
    setRoundsCleared(0);
    setRoundPassed(null);
    setRoundStats(null);
    setTotalTimeSeconds(0);
    gameStartTimeRef.current = null;
  }, [clearTimer]);

  return {
    gameState, playerName, round, timer, bannedLetters, acceptedWords, allUsedWords,
    currentWord, feedback, isValidating, roundsCleared, roundPassed, roundStats,
    totalTimeSeconds, minWordsToPass: getMinWordsToPass(round),
    startGame, nextRound, gameOver, submitWord, setCurrentWord, resetGame,
  };
}
