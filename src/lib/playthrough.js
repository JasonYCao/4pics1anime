// Generates a 10-round playthrough from BUNDLED_QUESTIONS using the
// composition: 5 Tier 1 + 3 Tier 2 + 2 Tier 3. Tracks "used" question
// IDs in localStorage so subsequent playthroughs don't repeat questions
// until the well runs dry.
//
// With 30 Tier 1 / 15 Tier 2 / 15 Tier 3 in the catalog, Tier 2 is the
// bottleneck at 15 ÷ 3 = 5 complete unique playthroughs.

import {
  BUNDLED_QUESTIONS,
  PLAYTHROUGH_COMPOSITION,
} from "../data/questions";

const USED_KEY = "fourpics:usedQuestionIds";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function loadUsedIds() {
  try {
    const raw = localStorage.getItem(USED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveUsedIds(set) {
  try {
    localStorage.setItem(USED_KEY, JSON.stringify([...set]));
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function resetUsedIds() {
  try {
    localStorage.removeItem(USED_KEY);
  } catch {
    // ignore
  }
}

function countsByTier(predicate = () => true) {
  const c = { 1: 0, 2: 0, 3: 0 };
  for (const q of BUNDLED_QUESTIONS) if (predicate(q)) c[q.tier]++;
  return c;
}

export function getCatalogCounts() {
  return countsByTier();
}

export function getRemainingByTier() {
  const used = loadUsedIds();
  return countsByTier((q) => !used.has(q.id));
}

export function getMaxPlaythroughs() {
  const counts = getCatalogCounts();
  return Math.min(
    ...Object.entries(PLAYTHROUGH_COMPOSITION).map(
      ([tier, need]) => Math.floor((counts[tier] || 0) / need)
    )
  );
}

export function getPlaythroughsRemaining() {
  const counts = getRemainingByTier();
  return Math.min(
    ...Object.entries(PLAYTHROUGH_COMPOSITION).map(
      ([tier, need]) => Math.floor((counts[tier] || 0) / need)
    )
  );
}

// Picks questions for a fresh playthrough. Orders: all Tier 1 first
// (easiest scoring), then Tier 2, then Tier 3 (highest stakes last).
// Within each tier, the order is randomized.
//
// Returns the array of 10 question objects.
export function generatePlaythrough() {
  const used = loadUsedIds();
  const picks = [];

  for (const tier of [1, 2, 3]) {
    const need = PLAYTHROUGH_COMPOSITION[tier];
    const pool = BUNDLED_QUESTIONS.filter(
      (q) => q.tier === tier && !used.has(q.id)
    );
    if (pool.length < need) {
      throw new Error(
        `Not enough unused Tier ${tier} questions: need ${need}, have ${pool.length}. Reset used questions to start over.`
      );
    }
    picks.push(...shuffle(pool).slice(0, need));
  }
  return picks;
}

// Mark a set of questions (or IDs) as used so they aren't picked again.
export function markUsed(questionsOrIds) {
  const used = loadUsedIds();
  for (const item of questionsOrIds) {
    const id = typeof item === "object" ? item.id : item;
    if (id != null) used.add(id);
  }
  saveUsedIds(used);
}
