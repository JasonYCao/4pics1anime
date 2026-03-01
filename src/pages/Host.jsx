import { useState, useEffect } from "react";
import { SAMPLE_QUESTIONS } from "../data/questions";
import { saveGameState, loadCrowdGuesses, clearCrowdGuesses } from "../lib/storage";
import { useTimer } from "../hooks/useTimer";
import Glow from "../components/Glow";
import ImageCard from "../components/ImageCard";
import ScoreRow from "../components/ScoreRow";

const TIMER_DURATION = 30;

const EMOJI_PALETTE = [
  "🍜","🦊","📜","🌀","⚔️","👹","🌙","🗡️","🏴‍☠️","🍖","🧢","🌊",
  "🔮","🐉","🥋","💥","📓","🍎","💀","👁️","🏐","🦅","👟","🏫",
  "🧪","🤖","👨‍👦","⚙️","👊","🦸","🦲","💯","🌸","💎","🚲","⛩️",
  "🎻","⭐","🎹","😢","🧊","👑","🐺","🌲","🃏","💪","🐜","🏔️",
  "❓","🎭","🎯","🔥","💧","⚡","🌈","🎪","🎮","🏆","📸","📊",
  "🦇","🧙","🚀","🌕","🐱","🐕","🦋","🌺","🎵","🎶","💫","✨",
];

// ── Inline style helpers ──
const panelSection = {
  display: "flex", flexDirection: "column", gap: 6,
  padding: "12px 0", borderBottom: "1px solid var(--border)",
};
const labelStyle = {
  fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em",
};
const inputStyle = {
  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
  padding: "8px 12px", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif",
  fontSize: "0.9rem", outline: "none",
};
const btn = (color, small = false) => ({
  background: `${color}18`, border: `1px solid ${color}50`, borderRadius: 8,
  padding: small ? "6px 12px" : "10px 18px", color,
  fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
  fontSize: small ? "0.75rem" : "0.9rem", cursor: "pointer",
  transition: "all 0.15s ease", letterSpacing: "0.03em",
});
const tinyBtn = (color) => ({
  background: "none", border: `1px solid ${color}40`, borderRadius: 4,
  padding: "2px 6px", color, fontSize: "0.65rem", cursor: "pointer",
  fontFamily: "'Space Mono'",
});

export default function Host() {
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState([false, false, false, false]);
  const [groups, setGroups] = useState([{ name: "Team 1", score: 0 }]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [phase, setPhase] = useState("lobby");
  const [showAnswer, setShowAnswer] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [crowdGuesses, setCrowdGuesses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showCrowdPanel, setShowCrowdPanel] = useState(false);
  const timer = useTimer(TIMER_DURATION, () => {});

  const q = questions[qIndex];
  const playUrl = typeof window !== "undefined"
    ? `${window.location.origin}/play`
    : "/play";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=07080f&color=00d4ff&data=${encodeURIComponent(playUrl)}`;

  // Sync game state for crowd players
  useEffect(() => {
    if (phase === "playing") {
      saveGameState({
        qIndex, revealed, phase,
        answer: showAnswer ? q?.answer : null,
        images: q?.images,
        hints: q?.hints,
      });
    }
  }, [qIndex, revealed, phase, showAnswer]);

  // Poll crowd guesses
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(async () => {
      const g = await loadCrowdGuesses(qIndex);
      setCrowdGuesses(g);
    }, 2000);
    return () => clearInterval(iv);
  }, [phase, qIndex]);

  const revealNext = () => {
    const idx = revealed.findIndex((r) => !r);
    if (idx !== -1) { const n = [...revealed]; n[idx] = true; setRevealed(n); }
  };

  const revealAll = () => setRevealed([true, true, true, true]);

  const awardPoints = (groupIdx, pts) => {
    setGroups((prev) => prev.map((g, i) => (i === groupIdx ? { ...g, score: g.score + pts } : g)));
  };

  const goToQuestion = (delta) => {
    const next = qIndex + delta;
    if (next >= 0 && next < questions.length) {
      setQIndex(next);
      setRevealed([false, false, false, false]);
      setShowAnswer(false);
      timer.reset(TIMER_DURATION);
      setCrowdGuesses([]);
    }
  };

  const addGroup = () => {
    if (newGroupName.trim()) {
      setGroups([...groups, { name: newGroupName.trim(), score: 0 }]);
      setNewGroupName("");
    }
  };

  const removeGroup = (idx) => {
    setGroups(groups.filter((_, i) => i !== idx));
    if (currentGroup >= groups.length - 1) setCurrentGroup(Math.max(0, groups.length - 2));
  };

  // ── Emoji picker state ──
  const [emojiTarget, setEmojiTarget] = useState(null); // { qi, ii } or null

  const handleImageUpload = (qi, ii, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const nq = [...questions];
      nq[qi] = { ...nq[qi], images: [...nq[qi].images] };
      nq[qi].images[ii] = e.target.result;
      setQuestions(nq);
    };
    reader.readAsDataURL(file);
  };

  const pickEmoji = (emoji) => {
    if (!emojiTarget) return;
    const { qi, ii } = emojiTarget;
    const nq = [...questions];
    nq[qi] = { ...nq[qi], images: [...nq[qi].images] };
    nq[qi].images[ii] = emoji;
    setQuestions(nq);
    setEmojiTarget(null);
  };

  // ── Question Editor ──
  if (editMode) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Glow size="1.8rem">Question Editor</Glow>
            <button onClick={() => setEditMode(false)} style={btn("var(--cyan)")}>← Back to Game</button>
          </div>

          {/* Emoji Picker Overlay */}
          {emojiTarget && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
            }} onClick={() => setEmojiTarget(null)}>
              <div onClick={(e) => e.stopPropagation()} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
                padding: 24, maxWidth: 400, width: "90%",
              }}>
                <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 12, fontSize: "0.9rem" }}>
                  Pick an Emoji — Q{emojiTarget.qi + 1} Image {emojiTarget.ii + 1}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                  {EMOJI_PALETTE.map((em) => (
                    <button key={em} onClick={() => pickEmoji(em)} style={{
                      background: "none", border: "1px solid transparent", borderRadius: 8,
                      fontSize: "1.5rem", padding: 6, cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.target.style.background = "var(--border)"; e.target.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.borderColor = "transparent"; }}>
                      {em}
                    </button>
                  ))}
                </div>
                <button onClick={() => setEmojiTarget(null)} style={{ ...btn("var(--text-muted)", true), marginTop: 12, width: "100%" }}>Cancel</button>
              </div>
            </div>
          )}

          {questions.map((qq, qi) => (
            <div key={qi} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>Q{qi + 1}</span>
                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
              </div>

              {/* Image inputs with upload + emoji buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                {qq.images.map((img, ii) => {
                  const isUrl = typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"));
                  return (
                    <div key={ii} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "'Space Mono'" }}>
                        Image {ii + 1}
                      </div>
                      {/* Preview */}
                      {isUrl ? (
                        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 4 }}>
                          <img src={img} alt={`Q${qi + 1} img ${ii + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div style={{ width: "100%", height: 48, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: 4 }}>
                          {img || "❓"}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 4 }}>
                        <input value={isUrl ? "" : img} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], images: [...nq[qi].images] }; nq[qi].images[ii] = e.target.value; setQuestions(nq); }}
                          style={{ ...inputStyle, flex: 1, padding: "6px 8px", fontSize: "0.8rem" }} placeholder={isUrl ? "Image uploaded" : "Emoji or URL"} />
                        <button onClick={() => setEmojiTarget({ qi, ii })} style={{ ...tinyBtn("var(--gold)"), fontSize: "1rem", padding: "4px 8px" }} title="Pick emoji">😀</button>
                        <label style={{ ...tinyBtn("var(--cyan)"), fontSize: "0.65rem", padding: "4px 8px", display: "flex", alignItems: "center", cursor: "pointer" }} title="Upload image">
                          📁
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(qi, ii, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hints */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                {(qq.hints || ["", "", "", ""]).map((h, hi) => (
                  <input key={hi} value={h} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], hints: [...(nq[qi].hints || ["", "", "", ""])] }; nq[qi].hints[hi] = e.target.value; setQuestions(nq); }}
                    style={{ ...inputStyle, fontSize: "0.75rem" }} placeholder={`Hint ${hi + 1}`} />
                ))}
              </div>
              <input value={qq.answer} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], answer: e.target.value }; setQuestions(nq); }}
                style={{ ...inputStyle, borderColor: "rgba(61,220,132,0.25)", width: "100%" }} placeholder="Answer" />
            </div>
          ))}
          <button onClick={() => setQuestions([...questions, { images: ["❓", "❓", "❓", "❓"], hints: ["", "", "", ""], answer: "" }])}
            style={{ ...btn("var(--green)"), width: "100%", marginTop: 8 }}>+ Add Question</button>
        </div>
      </div>
    );
  }

  // ── Main Host View ──
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Rajdhani', sans-serif", display: "flex" }}>
      {/* ─── LEFT PANEL ─── */}
      <div style={{ width: 300, minWidth: 300, background: "var(--bg-panel)", borderRight: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        <Glow size="1.3rem" color="var(--cyan)">HOST CONTROLS</Glow>

        {/* Phase */}
        <div style={panelSection}>
          <label style={labelStyle}>Phase</label>
          {phase === "lobby" ? (
            <button onClick={() => { setPhase("playing"); timer.reset(TIMER_DURATION); clearCrowdGuesses(); }} style={btn("var(--green)")}>▶ Start Game</button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPhase("lobby")} style={btn("var(--accent)", true)}>Reset</button>
              <span style={{ fontFamily: "'Space Mono'", color: "var(--green)", alignSelf: "center", fontSize: "0.8rem" }}>● LIVE</span>
            </div>
          )}
        </div>

        {/* Question nav */}
        <div style={panelSection}>
          <label style={labelStyle}>Question {qIndex + 1} / {questions.length}</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => goToQuestion(-1)} disabled={qIndex === 0} style={btn("var(--text-muted)", true)}>◀ Prev</button>
            <button onClick={() => goToQuestion(1)} disabled={qIndex >= questions.length - 1} style={btn("var(--text-muted)", true)}>Next ▶</button>
          </div>
          <button onClick={() => setEditMode(true)} style={{ ...btn("var(--gold)", true), marginTop: 6, fontSize: "0.7rem" }}>✏️ Edit Questions</button>
        </div>

        {/* Reveal */}
        <div style={panelSection}>
          <label style={labelStyle}>Reveal Images</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((i) => (
              <button key={i} onClick={() => { const n = [...revealed]; n[i] = !n[i]; setRevealed(n); }}
                style={{ ...btn(revealed[i] ? "var(--cyan)" : "var(--text-muted)", true), flex: "1 0 40%", fontSize: "0.75rem" }}>
                {revealed[i] ? `✓ IMG ${i + 1}` : `IMG ${i + 1}`}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={revealNext} style={btn("var(--cyan)", true)}>Reveal Next</button>
            <button onClick={revealAll} style={btn("var(--accent)", true)}>Reveal All</button>
          </div>
        </div>

        {/* Timer */}
        <div style={panelSection}>
          <label style={labelStyle}>Timer: <span style={{ color: timer.time <= 5 ? "var(--accent)" : "var(--gold)", fontFamily: "'Space Mono'" }}>{timer.time}s</span></label>
          <div style={{ display: "flex", gap: 6 }}>
            {!timer.running
              ? <button onClick={timer.start} style={btn("var(--green)", true)}>▶ Start</button>
              : <button onClick={timer.pause} style={btn("var(--gold)", true)}>⏸ Pause</button>
            }
            <button onClick={() => timer.reset(TIMER_DURATION)} style={btn("var(--text-muted)", true)}>↺ Reset</button>
          </div>
        </div>

        {/* Answer */}
        <div style={panelSection}>
          <label style={labelStyle}>Answer</label>
          <button onClick={() => setShowAnswer(!showAnswer)} style={btn(showAnswer ? "var(--green)" : "var(--accent)")}>
            {showAnswer ? `✓ ${q?.answer}` : "Show Answer"}
          </button>
        </div>

        {/* Groups */}
        <div style={panelSection}>
          <label style={labelStyle}>Groups (Current: {groups[currentGroup]?.name})</label>
          {groups.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span onClick={() => setCurrentGroup(i)} style={{ flex: 1, color: i === currentGroup ? "var(--cyan)" : "var(--text)", fontWeight: i === currentGroup ? 700 : 400, fontSize: "0.85rem", cursor: "pointer" }}>
                {i === currentGroup ? "▸ " : ""}{g.name} ({g.score}pts)
              </span>
              <button onClick={() => awardPoints(i, 100)} style={tinyBtn("var(--green)")}>+100</button>
              <button onClick={() => awardPoints(i, -100)} style={tinyBtn("var(--accent)")}>-100</button>
              <button onClick={() => removeGroup(i)} style={tinyBtn("var(--text-muted)")}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGroup()}
              placeholder="Group name" style={{ ...inputStyle, flex: 1, padding: "6px 10px" }} />
            <button onClick={addGroup} style={btn("var(--cyan)", true)}>Add</button>
          </div>
          <button onClick={() => setCurrentGroup((currentGroup + 1) % groups.length)} style={{ ...btn("var(--gold)", true), marginTop: 6 }}>Next Group ▶</button>
        </div>

        {/* Crowd */}
        <div style={panelSection}>
          <label style={labelStyle}>Crowd Play</label>
          <button onClick={() => setShowCrowdPanel(!showCrowdPanel)} style={btn("var(--cyan)", true)}>
            {showCrowdPanel ? "Hide QR / Guesses" : `Show QR / Guesses (${crowdGuesses.length})`}
          </button>
        </div>
      </div>

      {/* ─── MAIN DISPLAY ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 32, overflow: "auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Glow size="clamp(1.8rem, 4vw, 3rem)" color="var(--accent)">4 PICTURES, 1 ANIME</Glow>
          <div style={{ fontFamily: "'Space Mono', monospace", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 4 }}>
            QUESTION {qIndex + 1} OF {questions.length}
            {phase === "playing" && <span style={{ color: "var(--green)", marginLeft: 12 }}>● LIVE</span>}
          </div>
        </div>

        {/* Timer Bar */}
        {timer.running && (
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(timer.time / TIMER_DURATION) * 100}%`,
              background: timer.time <= 5 ? "var(--accent)" : "linear-gradient(90deg, var(--cyan), var(--green))",
              borderRadius: 2,
              transition: "width 1s linear",
              boxShadow: `0 0 12px ${timer.time <= 5 ? "var(--accent-glow)" : "var(--cyan-glow)"}`,
            }} />
          </div>
        )}

        {/* 4 Images Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(12px, 2vw, 24px)", maxWidth: 700, margin: "0 auto", width: "100%" }}>
          {q?.images.map((img, i) => (
            <ImageCard key={`${qIndex}-${i}`} content={img} hint={q.hints?.[i]} revealed={revealed[i]} index={i} />
          ))}
        </div>

        {/* Timer Display */}
        {timer.running && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "3rem", fontWeight: 700,
              color: timer.time <= 5 ? "var(--accent)" : "var(--gold)",
              textShadow: `0 0 20px ${timer.time <= 5 ? "var(--accent-glow)" : "rgba(255,194,68,0.35)"}`,
              animation: timer.time <= 5 ? "pulse 0.5s infinite alternate" : "none",
            }}>{timer.time}</span>
          </div>
        )}

        {/* Answer Reveal */}
        {showAnswer && (
          <div style={{ textAlign: "center", marginTop: 24, padding: 20, background: "rgba(61,220,132,0.06)", border: "2px solid rgba(61,220,132,0.25)", borderRadius: 16 }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.8rem", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.15em" }}>The Answer Is</span>
            <div><Glow size="2.5rem" color="var(--green)">{q?.answer}</Glow></div>
          </div>
        )}

        {/* Current Group */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Now Playing</span>
          <div style={{ fontFamily: "'Bangers', cursive", fontSize: "1.6rem", color: "var(--cyan)", textShadow: "0 0 10px rgba(0,212,255,0.25)" }}>
            {groups[currentGroup]?.name || "No groups yet"}
          </div>
        </div>

        {/* Scoreboard */}
        <div style={{ maxWidth: 500, margin: "24px auto 0", width: "100%" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Scoreboard</span>
          {[...groups].sort((a, b) => b.score - a.score).map((g, i) => (
            <ScoreRow key={g.name} group={g} isActive={g.name === groups[currentGroup]?.name} rank={i + 1} />
          ))}
        </div>

        {/* Crowd QR & Guesses Panel */}
        {showCrowdPanel && (
          <div style={{ maxWidth: 600, margin: "32px auto 0", width: "100%", padding: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Scan to Join</div>
                <img src={qrUrl} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 8, border: "2px solid rgba(0,212,255,0.2)" }} />
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "var(--cyan)", marginTop: 8, wordBreak: "break-all", maxWidth: 200 }}>{playUrl}</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Crowd Guesses ({crowdGuesses.length})</div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {crowdGuesses.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No guesses yet...</div>}
                  {crowdGuesses.map((g, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--cyan)" }}>{g.name}</span>
                      <span style={{ color: g.guess?.toLowerCase() === q?.answer?.toLowerCase() ? "var(--green)" : "var(--text)" }}>{g.guess}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
