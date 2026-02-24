// Utility functions for letter selection and game rules

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Get the number of banned letters for a given round
 * Formula: 2 + floor((round-1)/5)
 */
export function getBannedCount(round) {
  return 2 + Math.floor((round - 1) / 5);
}

/**
 * Get minimum words required to pass a round
 * Formula: 3 + floor((round-1)/5)
 */
export function getMinWordsToPass(round) {
  return 3 + Math.floor((round - 1) / 5);
}

/**
 * Select banned letters for a round with fairness rules
 * - Never ban all vowels (ensure at least 2 vowels remain)
 * - Try to avoid same letters as previous round (soft constraint)
 */
export function selectBannedLetters(round, previousBanned = []) {
  const count = getBannedCount(round);
  const availableLetters = [...ALL_LETTERS];
  const banned = [];
  
  // Calculate minimum vowels that must remain available
  const minVowelsRemaining = 2;
  
  while (banned.length < count && availableLetters.length > 0) {
    // Check how many vowels are currently available
    const availableVowels = availableLetters.filter(l => VOWELS.includes(l));
    const currentVowelsRemaining = availableVowels.length;
    
    // If we're about to hit the minimum, only select consonants
    let candidatePool;
    if (currentVowelsRemaining <= minVowelsRemaining) {
      candidatePool = availableLetters.filter(l => !VOWELS.includes(l));
    } else {
      candidatePool = availableLetters;
    }
    
    if (candidatePool.length === 0) {
      break; // No more valid candidates
    }
    
    // Prefer letters not in previous banned set
    const notPreviousBanned = candidatePool.filter(l => !previousBanned.includes(l));
    const pool = notPreviousBanned.length > 0 ? notPreviousBanned : candidatePool;
    
    // Select random letter from pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    
    banned.push(selected);
    
    // Remove from available
    const idx = availableLetters.indexOf(selected);
    if (idx > -1) {
      availableLetters.splice(idx, 1);
    }
  }
  
  return banned;
}

/**
 * Check if a word contains any banned letters (case-insensitive)
 */
export function containsBannedLetter(word, bannedLetters) {
  const upperWord = word.toUpperCase();
  return bannedLetters.some(letter => upperWord.includes(letter));
}

/**
 * Format banned letters for display
 */
export function formatBannedLetters(letters) {
  return letters.sort().join(' ');
}
