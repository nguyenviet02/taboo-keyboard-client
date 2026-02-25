const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7001/api";

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

export async function submitRoundsScore(data) {
  return fetchAPI("/leaderboard/rounds", {
    method: "POST",
    body: JSON.stringify({
      playerName: data.playerName,
      roundsSurvived: data.roundsSurvived,
      bestWords: data.bestWords || 0,
      totalTimeSeconds: data.totalTimeSeconds,
    }),
  });
}

export async function getRoundsLeaderboard(page = 1) {
  return fetchAPI(`/leaderboard/rounds?page=${page}`);
}

export async function getRank(roundsSurvived, totalTimeSeconds, playerName) {
  const params = new URLSearchParams({
    roundsSurvived,
    totalTimeSeconds,
  });
  if (playerName) {
    params.append("playerName", playerName);
  }
  return fetchAPI(`/leaderboard/rank?${params}`);
}
