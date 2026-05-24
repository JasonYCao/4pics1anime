// Lenient answer grading.
//
// Rule: tokenize the answer and keep words longer than 3 letters. If ANY of
// those long answer-words appears as a substring anywhere in the normalized
// guess (punctuation stripped, case-folded, spaces removed), accept it.
//
// Examples:
//   "Demon Slayer"  matches  "demon"           ✓ ("demon" appears)
//   "Death Note"    matches  "deathnote"       ✓ ("death" appears)
//   "Naruto"        matches  "I love naruto!"  ✓
//   "Re:Zero"       matches  "rezero"          ✓ ("zero" appears)
//   "One Piece"     matches  "one piece"       ✓ ("piece" appears)
//   "Naruto"        matches  "shippuden"       ✗ (no answer-word present)
//
// For answers whose tokens are ALL 3 letters or shorter, fall back to a
// strict normalized-equality check (rare; "ARIA" passes because 4 > 3).

function tokens(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function isAnswerCorrect(guess, answer) {
  if (!guess || !answer) return false;
  const answerLong = tokens(answer).filter((w) => w.length > 3);
  if (answerLong.length === 0) {
    return tokens(guess).join("") === tokens(answer).join("");
  }
  const guessFlat = tokens(guess).join("");
  return answerLong.some((w) => guessFlat.includes(w));
}
