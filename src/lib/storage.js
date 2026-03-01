/**
 * Lightweight key-value storage for syncing game state between
 * the host and crowd players. Uses localStorage as a fallback
 * when running locally (no persistent storage API available).
 */

const GAME_KEY = "4p1a-game-state";
const CROWD_KEY = "4p1a-crowd";

// ── Game State (Host → Crowd) ──

export async function saveGameState(state) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

export async function loadGameState() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Crowd Guesses (Crowd → Host) ──

export async function saveCrowdGuess(name, guess, qIndex) {
  try {
    const existing = JSON.parse(localStorage.getItem(CROWD_KEY) || "[]");
    existing.push({ name, guess, time: Date.now(), qIndex });
    localStorage.setItem(CROWD_KEY, JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

export async function loadCrowdGuesses(qIndex) {
  try {
    const all = JSON.parse(localStorage.getItem(CROWD_KEY) || "[]");
    return all.filter((g) => g.qIndex === qIndex);
  } catch {
    return [];
  }
}

export function clearCrowdGuesses() {
  try {
    localStorage.removeItem(CROWD_KEY);
  } catch {
    // silently fail
  }
}
