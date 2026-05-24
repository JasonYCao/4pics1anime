import { useEffect, useState } from "react";
import { loadGameState } from "../lib/storage";
import Glow from "../components/Glow";
import ImageCard from "../components/ImageCard";

// Audience view. Designed for a projector at ~1920x1080 (or any 16:9). No
// scrolling — everything fits one viewport. Host runs /host in their own
// window; open /show in a second window and drag it to the external screen.
// Same machine = shared localStorage = real-time sync, no backend needed.

const TIER_LABEL = { 1: "TIER 1 · 1 PT", 2: "TIER 2 · 2 PTS", 3: "TIER 3 · 3 PTS" };

export default function Show() {
  const [state, setState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const gs = await loadGameState();
      if (!cancelled) setState(gs);
    };
    tick();
    const iv = setInterval(tick, 400);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const {
    qIndex = 0,
    revealed = [false, false, false, false],
    phase = "lobby",
    answer = null,
    images = [],
    hints = [],
    tier,
    totalQuestions = 0,
    groups = [],
    currentGroupName,
    hasQuestion = false,
    timerRunning = false,
    timerTime = 0,
    timerDuration = 30,
  } = state || {};

  const sortedGroups = [...groups].sort((a, b) => b.score - a.score);

  return (
    <div style={pageRoot}>
      {/* ─── Left: Scoreboard ─── */}
      <aside style={scoreboardAside}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: 8 }}>
          SCOREBOARD
        </div>
        <Glow size="1.6rem" color="var(--cyan)">STANDINGS</Glow>
        <div style={scoreList}>
          {sortedGroups.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 24 }}>
              Waiting for host to add teams…
            </div>
          ) : (
            sortedGroups.map((g, i) => (
              <ScoreEntry
                key={g.name}
                group={g}
                rank={i + 1}
                isCurrent={g.name === currentGroupName}
              />
            ))
          )}
        </div>

        <div style={scoreboardFooter}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.18em" }}>
            ROUND PROGRESS
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "var(--text)", marginTop: 4 }}>
            {totalQuestions > 0 ? `${qIndex + 1} / ${totalQuestions}` : "—"}
          </div>
        </div>
      </aside>

      {/* ─── Right: Main display ─── */}
      <main style={mainStage}>
        {/* Header */}
        <header style={header}>
          <Glow size="clamp(2rem, 3.6vw, 3.4rem)" color="var(--accent)">4 PICTURES, 1 ANIME</Glow>
          <div style={{ fontFamily: "'Space Mono', monospace", color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.18em", marginTop: 6 }}>
            {hasQuestion ? (
              <>
                QUESTION {qIndex + 1}
                {totalQuestions > 0 && <> OF {totalQuestions}</>}
                {tier && (
                  <span style={{ color: "var(--cyan)", marginLeft: 18 }}>· {TIER_LABEL[tier]}</span>
                )}
                {phase === "playing" && (
                  <span style={{ color: "var(--green)", marginLeft: 18 }}>● LIVE</span>
                )}
              </>
            ) : (
              <>WAITING FOR HOST</>
            )}
          </div>
        </header>

        {/* Timer bar */}
        <div style={{ height: 4, marginTop: 12, marginBottom: 18, background: "var(--border)", borderRadius: 2, overflow: "hidden", opacity: timerRunning ? 1 : 0.15 }}>
          <div
            style={{
              height: "100%",
              width: `${timerRunning ? (timerTime / Math.max(timerDuration, 1)) * 100 : 100}%`,
              background: timerRunning && timerTime <= 5
                ? "var(--accent)"
                : "linear-gradient(90deg, var(--cyan), var(--green))",
              transition: "width 1s linear",
              boxShadow: timerRunning ? `0 0 12px ${timerTime <= 5 ? "var(--accent-glow)" : "var(--cyan-glow)"}` : "none",
            }}
          />
        </div>

        {/* 4-pic grid */}
        <section style={picsWrap}>
          {hasQuestion ? (
            <div style={picsGrid}>
              {[0, 1, 2, 3].map((i) => (
                <ImageCard
                  key={`${qIndex}-${i}`}
                  content={images[i]}
                  hint={hints[i]}
                  revealed={revealed[i]}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div style={emptyState}>
              <div style={{ fontSize: "4rem", lineHeight: 1, marginBottom: 16 }}>🎬</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "1.3rem", color: "var(--text)" }}>
                The next round is loading…
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 8, letterSpacing: "0.12em" }}>
                STAND BY
              </div>
            </div>
          )}
        </section>

        {/* Timer numeric (when ticking) */}
        {timerRunning && (
          <div style={{ textAlign: "center", marginTop: 14, fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: timerTime <= 5 ? "var(--accent)" : "var(--gold)", textShadow: `0 0 18px ${timerTime <= 5 ? "var(--accent-glow)" : "rgba(255,194,68,0.4)"}`, animation: timerTime <= 5 ? "pulse 0.5s infinite alternate" : "none" }}>
            {timerTime}s
          </div>
        )}
      </main>

      {/* ─── Fullscreen answer overlay ─── */}
      {answer && <AnswerOverlay answer={answer} tier={tier} />}
    </div>
  );
}

function ScoreEntry({ group, rank, isCurrent }) {
  const isLeader = rank === 1 && group.score > 0;
  const accent = isLeader ? "var(--gold)" : isCurrent ? "var(--cyan)" : "var(--text)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: 12,
        background: isCurrent ? "rgba(0,212,255,0.08)" : "var(--bg-card)",
        border: `1px solid ${isCurrent ? "rgba(0,212,255,0.45)" : "var(--border)"}`,
        boxShadow: isLeader ? "0 0 18px rgba(255,194,68,0.18)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, flex: 1 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", color: "var(--text-muted)", width: 22, flexShrink: 0 }}>
          #{rank}
        </span>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {group.name}
        </span>
      </div>
      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: "1.4rem", color: accent, marginLeft: 12 }}>
        {group.score}
      </span>
    </div>
  );
}

function AnswerOverlay({ answer, tier }) {
  return (
    <div style={answerOverlay}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", color: "var(--green)", letterSpacing: "0.4em", marginBottom: 32 }}>
        T H E&nbsp;&nbsp;A N S W E R
      </div>
      <Glow size="clamp(3.5rem, 10vw, 8rem)" color="var(--green)">{answer}</Glow>
      {tier && (
        <div style={{ marginTop: 36, fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.32em", color: "var(--gold)" }}>
          {TIER_LABEL[tier]}
        </div>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────

const pageRoot = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "'Rajdhani', sans-serif",
};

const scoreboardAside = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "clamp(280px, 22vw, 360px)",
  padding: "32px 24px",
  borderRight: "1px solid var(--border)",
  background: "var(--bg-panel)",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

const scoreList = {
  marginTop: 18,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: 1,
  overflowY: "auto",
  minHeight: 0,
};

const scoreboardFooter = {
  paddingTop: 14,
  marginTop: 12,
  borderTop: "1px solid var(--border)",
};

const mainStage = {
  marginLeft: "clamp(280px, 22vw, 360px)",
  flex: 1,
  padding: "28px 40px 24px",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  boxSizing: "border-box",
};

const header = { textAlign: "center" };

const picsWrap = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 0,
};

const picsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "clamp(14px, 1.6vw, 22px)",
  width: "min(72vh, 100%)",
  maxWidth: 820,
  aspectRatio: "1",
};

const emptyState = {
  textAlign: "center",
  padding: 40,
  border: "1px dashed var(--border)",
  borderRadius: 18,
};

const answerOverlay = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(7, 8, 15, 0.93)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: 40,
  animation: "fadeIn 0.5s ease-out",
};
