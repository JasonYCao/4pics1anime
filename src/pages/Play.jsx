import { useState, useEffect } from "react";
import { loadGameState, saveCrowdGuess } from "../lib/storage";
import Glow from "../components/Glow";
import ImageCard from "../components/ImageCard";

const inputStyle = {
  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
  padding: "8px 12px", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif",
  fontSize: "0.9rem", outline: "none",
};
const btn = (color) => ({
  background: `${color}18`, border: `1px solid ${color}50`, borderRadius: 8,
  padding: "10px 18px", color, fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
  transition: "all 0.15s ease", letterSpacing: "0.03em",
});

export default function Play() {
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [lastQ, setLastQ] = useState(-1);

  // Poll game state from host
  useEffect(() => {
    const poll = async () => {
      const gs = await loadGameState();
      if (gs) {
        setGameState(gs);
        if (gs.qIndex !== lastQ) {
          setSubmitted(false);
          setGuess("");
          setLastQ(gs.qIndex);
        }
      }
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [lastQ]);

  const handleSubmit = async () => {
    if (!guess.trim() || !gameState) return;
    await saveCrowdGuess(playerName, guess.trim(), gameState.qIndex);
    setSubmitted(true);
  };

  // ── Join Screen ──
  if (!joined) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <Glow size="2rem" color="var(--accent)">4 PICS 1 ANIME</Glow>
          <p style={{ fontFamily: "'Rajdhani', sans-serif", color: "var(--text-muted)", margin: "12px 0 24px", fontSize: "1rem" }}>
            Enter your name to join the crowd!
          </p>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && playerName.trim() && setJoined(true)}
            placeholder="Your display name"
            autoFocus
            style={{ ...inputStyle, fontSize: "1.1rem", padding: "12px 16px", width: "100%", boxSizing: "border-box", textAlign: "center", marginBottom: 16 }}
          />
          <button
            onClick={() => playerName.trim() && setJoined(true)}
            disabled={!playerName.trim()}
            style={{ ...btn("var(--cyan)"), width: "100%", padding: "14px", fontSize: "1.1rem", opacity: playerName.trim() ? 1 : 0.4 }}
          >
            JOIN GAME
          </button>
        </div>
      </div>
    );
  }

  // ── Game View ──
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Glow size="1.4rem" color="var(--accent)">4 PICS 1 ANIME</Glow>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--cyan)", marginTop: 4 }}>Playing as: {playerName}</div>
      </div>

      {!gameState || gameState.phase === "lobby" ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⏳</div>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Waiting for the host to start...</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Keep your eyes on the big screen!</p>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 12 }}>
            QUESTION {(gameState.qIndex ?? 0) + 1}
          </div>

          {/* 4 Images */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 340, width: "100%", marginBottom: 20 }}>
            {(gameState.images || []).map((img, i) => (
              <ImageCard key={`${gameState.qIndex}-${i}`} content={img} hint={gameState.hints?.[i]} revealed={gameState.revealed?.[i] || false} index={i} />
            ))}
          </div>

          {/* Answer Revealed */}
          {gameState.answer ? (
            <div style={{ textAlign: "center", padding: 20, background: "rgba(61,220,132,0.06)", border: "2px solid rgba(61,220,132,0.2)", borderRadius: 16, width: "100%", maxWidth: 340 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Answer</div>
              <Glow size="1.8rem" color="var(--green)">{gameState.answer}</Glow>
              {submitted && (
                <div style={{ fontSize: "0.85rem", color: guess.toLowerCase() === gameState.answer.toLowerCase() ? "var(--green)" : "var(--accent)", marginTop: 8 }}>
                  {guess.toLowerCase() === gameState.answer.toLowerCase() ? "🎉 You got it!" : `You guessed: ${guess}`}
                </div>
              )}
            </div>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: 20, background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 16, width: "100%", maxWidth: 340 }}>
              <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>✓</div>
              <div style={{ color: "var(--cyan)", fontWeight: 700 }}>Guess submitted!</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>Your answer: {guess}</div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 340 }}>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Which anime is it?"
                autoFocus
                style={{ ...inputStyle, fontSize: "1.1rem", padding: "14px 16px", width: "100%", boxSizing: "border-box", textAlign: "center", marginBottom: 12 }}
              />
              <button
                onClick={handleSubmit}
                disabled={!guess.trim()}
                style={{ ...btn("var(--accent)"), width: "100%", padding: "14px", fontSize: "1.1rem", opacity: guess.trim() ? 1 : 0.4 }}
              >
                SUBMIT GUESS
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
