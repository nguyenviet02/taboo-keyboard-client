import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, execute };
}

export function useScoreSubmission() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitScore = useCallback(async (playerName, roundsCleared, totalTimeSeconds) => {
    setSubmitting(true);
    setError(null);

    try {
      await api.submitRoundsScore({
        playerName,
        roundsSurvived: roundsCleared,
        totalTimeSeconds,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    error,
    submitScore,
  };
}
