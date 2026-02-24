const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

/**
 * Submit a score to the leaderboard
 */
export async function submitRoundsScore(data) {
  return fetchAPI('/leaderboard/rounds', {
    method: 'POST',
    body: JSON.stringify({
      playerName: data.playerName,
      roundsSurvived: data.roundsSurvived,
      bestWords: data.bestWords,
    }),
  });
}

/**
 * Get the leaderboard (Top 50)
 */
export async function getRoundsLeaderboard() {
  return fetchAPI('/leaderboard/rounds');
}
