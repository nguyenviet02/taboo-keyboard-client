import WORDLIST from "./wordlist";

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// In-memory cache for current session
const sessionCache = new Map();

// LRU cache in sessionStorage (max 500 words)
const LRU_KEY = "taboo_word_cache";
const MAX_LRU_SIZE = 500;

function getLRUCache() {
  try {
    const data = sessionStorage.getItem(LRU_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLRUCache(cache) {
  try {
    const entries = Object.entries(cache);
    if (entries.length > MAX_LRU_SIZE) {
      // Remove oldest entries
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toKeep = sorted.slice(-MAX_LRU_SIZE);
      const newCache = {};
      toKeep.forEach(([key, value]) => {
        newCache[key] = value;
      });
      sessionStorage.setItem(LRU_KEY, JSON.stringify(newCache));
    } else {
      sessionStorage.setItem(LRU_KEY, JSON.stringify(cache));
    }
  } catch {
    // sessionStorage might be full or disabled
  }
}

function getCachedWord(word) {
  const lower = word.toLowerCase();

  // Check session cache first
  if (sessionCache.has(lower)) {
    return sessionCache.get(lower);
  }

  // Check LRU cache
  const lru = getLRUCache();
  if (lru[lower]) {
    // Update timestamp
    lru[lower].timestamp = Date.now();
    setLRUCache(lru);
    sessionCache.set(lower, lru[lower].valid);
    return lru[lower].valid;
  }

  return null;
}

function setCachedWord(word, valid) {
  const lower = word.toLowerCase();

  // Update session cache
  sessionCache.set(lower, valid);

  // Update LRU cache
  const lru = getLRUCache();
  lru[lower] = { valid, timestamp: Date.now() };
  setLRUCache(lru);
}

/**
 * Check if a word exists in the fallback wordlist
 */
function isInFallbackList(word) {
  const lower = word.toLowerCase();
  return WORDLIST.includes(lower);
}

/**
 * Validate a word using Dictionary API
 * Returns: { valid: boolean, reason: string, fromCache: boolean }
 */
export async function validateWithAPI(word) {
  const lower = word.toLowerCase();

  const inFallback = isInFallbackList(lower);
  if (inFallback) {
    return {
      valid: true,
      reason: "",
      fromCache: false,
      fallback: true,
      fallbackMessage: "",
    };
  }

  // Check cache
  const cached = getCachedWord(lower);
  if (cached !== null) {
    return {
      valid: cached,
      reason: cached ? "" : "Not a valid English word",
      fromCache: true,
    };
  }

  try {
    const response = await fetch(`${API_URL}${lower}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setCachedWord(lower, true);
        return { valid: true, reason: "", fromCache: false };
      }
    }

    return {
      valid: false,
      reason: "Not a valid English word",
      fromCache: false,
    };
  } catch (error) {
    return {
      valid: false,
      reason: "Not found in word list (API unavailable)",
      fromCache: false,
      fallback: true,
    };
  }
}

/**
 * Quick validation checks before API call
 * Returns: { valid: boolean, reason: string } or null if passes quick checks
 */
function quickValidate(word, bannedLetters, acceptedWords) {
  const lower = word.toLowerCase();

  // Check format: only letters A-Z
  if (!/^[a-zA-Z]+$/.test(word)) {
    return {
      valid: false,
      reason: "Only letters A-Z allowed (no spaces or special characters)",
    };
  }

  // Check length
  if (word.length < 2) {
    return { valid: false, reason: "Word must be at least 2 letters" };
  }

  // Check for banned letters
  const upperWord = word.toUpperCase();
  for (const letter of bannedLetters) {
    if (upperWord.includes(letter)) {
      return { valid: false, reason: `Contains banned letter "${letter}"` };
    }
  }

  // Check for duplicates
  if (acceptedWords.includes(lower)) {
    return { valid: false, reason: "Word already submitted" };
  }

  return null; // Passes quick checks
}

/**
 * Full word validation pipeline
 * Returns: { valid: boolean, reason: string, checking?: boolean }
 */
export async function validateWord(word, bannedLetters, acceptedWords) {
  // Quick validation first
  const quickResult = quickValidate(word, bannedLetters, acceptedWords);
  if (quickResult) {
    return quickResult;
  }

  // API validation
  const apiResult = await validateWithAPI(word);

  return {
    valid: apiResult.valid,
    reason: apiResult.reason,
    fromCache: apiResult.fromCache,
    fallback: apiResult.fallback,
    fallbackMessage: apiResult.fallbackMessage,
  };
}

/**
 * Synchronous pre-check (for immediate UI feedback)
 */
export function preValidateWord(word, bannedLetters, acceptedWords) {
  return quickValidate(word, bannedLetters, acceptedWords);
}
