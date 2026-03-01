import { useState, useEffect, useRef, useCallback } from "react";

// ─── Sample Question Bank ───
const SAMPLE_QUESTIONS = [
  { images: ["🍜", "🦊", "📜", "🌀"], hints: ["Ramen bowl", "Nine-tailed fox", "Ancient scroll", "Spiral symbol"], answer: "Naruto" },
  { images: ["⚔️", "👹", "🌙", "🗡️"], hints: ["Swordfight", "Demon mask", "Crescent moon", "Black blade"], answer: "Demon Slayer" },
  { images: ["🏴‍☠️", "🍖", "🧢", "🌊"], hints: ["Pirate flag", "Meat on bone", "Straw hat", "Ocean waves"], answer: "One Piece" },
  { images: ["🔮", "🐉", "🥋", "💥"], hints: ["Dragon Ball", "Shenron", "Gi uniform", "Energy blast"], answer: "Dragon Ball Z" },
  { images: ["📓", "🍎", "💀", "👁️"], hints: ["Black notebook", "Red apple", "Shinigami", "Glowing eye"], answer: "Death Note" },
  { images: ["🏐", "🦅", "👟", "🏫"], hints: ["Volleyball", "Crow/Karasuno", "Quick attack", "High school gym"], answer: "Haikyu!!" },
  { images: ["🧪", "🤖", "👨‍👦", "⚙️"], hints: ["Alchemy circle", "Suit of armor", "Two brothers", "Automail gear"], answer: "Fullmetal Alchemist" },
  { images: ["👊", "🦸", "🦲", "💯"], hints: ["Single punch", "Hero cape", "Bald head", "100 pushups"], answer: "One Punch Man" },
  { images: ["🌸", "💎", "🚲", "⛩️"], hints: ["Cherry blossoms", "Pink gem", "Bicycle ride", "Shrine gate"], answer: "Your Name" },
  { images: ["🎻", "⭐", "🎹", "😢"], hints: ["Violin strings", "Starry night", "Piano keys", "Tears falling"], answer: "Your Lie in April" },
  { images: ["🧊", "👑", "🐺", "🌲"], hints: ["Ice magic", "Crown", "Dire wolf", "Forest"], answer: "Frieren" },
  { images: ["🃏", "💪", "🐜", "🏔️"], hints: ["Playing card", "Power fist", "Ant creature", "Mountain peak"], answer: "Hunter x Hunter" },
];

// ─── Crowd Storage Helpers ───
const GAME_KEY = "4p1a-game-state";
const CROWD_KEY = "4p1a-crowd";

async function saveGameState(state) {
  try { await window.storage.set(GAME_KEY, JSON.stringify(state), true); } catch {}
}
async function loadGameState() {
  try { const r = await window.storage.get(GAME_KEY, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function saveCrowdGuess(name, guess, qIndex) {
  const key = `${CROWD_KEY}:${qIndex}:${name}:${Date.now()}`;
  try { await window.storage.set(key, JSON.stringify({ name, guess, time: Date.now(), qIndex }), true); } catch {}
}
async function loadCrowdGuesses(qIndex) {
  try {
    const r = await window.storage.list(`${CROWD_KEY}:${qIndex}:`, true);
    if (!r?.keys?.length) return [];
    const guesses = [];
    for (const k of r.keys.slice(0, 50)) {
      try { const g = await window.storage.get(k, true); if (g) guesses.push(JSON.parse(g.value)); } catch {}
    }
    return guesses;
  } catch { return []; }
}

// ─── Fonts ───
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Bangers&family=Rajdhani:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector(`link[href="${fontLink.href}"]`)) document.head.appendChild(fontLink);

// ─── CSS Vars ───
const C = {
  bg: "#0a0a1a", bgCard: "#12122a", bgPanel: "#0d0d22",
  neonPink: "#ff2d78", neonCyan: "#00f0ff", neonYellow: "#ffe156",
  neonGreen: "#39ff14", white: "#eeeef6", muted: "#6a6a8a",
  border: "#1e1e3a", correct: "#39ff14", wrong: "#ff2d78",
};

// ─── Timer Hook ───
function useTimer(initial, onEnd) {
  const [time, setTime] = useState(initial);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running && time > 0) {
      ref.current = setTimeout(() => setTime(t => t - 1), 1000);
    } else if (running && time === 0) {
      setRunning(false);
      onEnd?.();
    }
    return () => clearTimeout(ref.current);
  }, [running, time]);
  return { time, running, start: () => setRunning(true), pause: () => setRunning(false), reset: (t) => { setRunning(false); setTime(t ?? initial); } };
}

// ─── Glow Text Component ───
function Glow({ children, color = C.neonPink, size = "3rem", font = "'Bangers', cursive", style = {} }) {
  return <span style={{ fontFamily: font, fontSize: size, color, textShadow: `0 0 10px ${color}80, 0 0 30px ${color}40, 0 0 60px ${color}20`, letterSpacing: "0.05em", ...style }}>{children}</span>;
}

// ─── Image Card ───
function ImageCard({ content, hint, revealed, index, phase }) {
  const colors = [C.neonPink, C.neonCyan, C.neonYellow, C.neonGreen];
  const accentColor = colors[index % 4];
  const isUrl = typeof content === "string" && (content.startsWith("http") || content.startsWith("data:") || content.startsWith("/"));

  return (
    <div style={{
      position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "1",
      background: revealed ? C.bgCard : `linear-gradient(135deg, ${C.bg}, ${C.bgCard})`,
      border: `2px solid ${revealed ? accentColor : C.border}`,
      boxShadow: revealed ? `0 0 20px ${accentColor}30, 0 0 60px ${accentColor}10, inset 0 0 30px ${accentColor}08` : "none",
      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      transform: revealed ? "scale(1)" : "scale(0.92)",
      opacity: revealed ? 1 : 0.4,
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "default",
    }}>
      {revealed ? (
        <>
          {isUrl ? (
            <img src={content} alt={hint} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          ) : (
            <span style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1, filter: `drop-shadow(0 0 12px ${accentColor}60)` }}>{content}</span>
          )}
          {hint && !isUrl && (
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(0.65rem, 1.5vw, 0.9rem)", color: C.muted, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{hint}</span>
          )}
        </>
      ) : (
        <>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: "clamp(2rem, 5vw, 4rem)", color: C.muted, opacity: 0.3 }}>?</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.muted, opacity: 0.4, marginTop: 4 }}>IMG {index + 1}</span>
        </>
      )}
      {/* Corner accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, borderBottom: `2px solid ${revealed ? accentColor : "transparent"}`, borderLeft: `2px solid ${revealed ? accentColor : "transparent"}`, borderRadius: "0 0 0 8px", transition: "all 0.6s ease" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 24, height: 24, borderTop: `2px solid ${revealed ? accentColor : "transparent"}`, borderRight: `2px solid ${revealed ? accentColor : "transparent"}`, borderRadius: "0 8px 0 0", transition: "all 0.6s ease" }} />
    </div>
  );
}

// ─── Scoreboard Row ───
function ScoreRow({ group, isActive, rank }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 10,
      background: isActive ? `linear-gradient(90deg, ${C.neonCyan}12, transparent)` : "transparent",
      border: `1px solid ${isActive ? C.neonCyan + "40" : C.border}`,
      transition: "all 0.3s ease", marginBottom: 6,
    }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: C.muted, width: 24 }}>#{rank}</span>
      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isActive ? C.neonCyan : C.white, flex: 1 }}>{group.name}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: "1.2rem", color: C.neonYellow, textShadow: `0 0 8px ${C.neonYellow}40` }}>{group.score}</span>
    </div>
  );
}

// ═══════════════════════════════════════════
//  HOST VIEW
// ═══════════════════════════════════════════
function HostView() {
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState([false, false, false, false]);
  const [groups, setGroups] = useState([{ name: "Team 1", score: 0 }]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [phase, setPhase] = useState("lobby"); // lobby, playing, answer
  const [showAnswer, setShowAnswer] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [crowdGuesses, setCrowdGuesses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showCrowdPanel, setShowCrowdPanel] = useState(false);
  const timerDuration = 30;
  const timer = useTimer(timerDuration, () => {});

  const q = questions[qIndex];

  // Sync game state for crowd
  useEffect(() => {
    if (phase === "playing") {
      saveGameState({ qIndex, revealed, phase, answer: showAnswer ? q?.answer : null, images: q?.images, hints: q?.hints });
    }
  }, [qIndex, revealed, phase, showAnswer]);

  // Poll crowd guesses
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(async () => {
      const g = await loadCrowdGuesses(qIndex);
      setCrowdGuesses(g);
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, qIndex]);

  const revealNext = () => {
    const idx = revealed.findIndex(r => !r);
    if (idx !== -1) {
      const next = [...revealed];
      next[idx] = true;
      setRevealed(next);
    }
  };

  const revealAll = () => setRevealed([true, true, true, true]);

  const awardPoints = (groupIdx, pts) => {
    setGroups(prev => prev.map((g, i) => i === groupIdx ? { ...g, score: g.score + pts } : g));
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
      setRevealed([false, false, false, false]);
      setShowAnswer(false);
      setPhase("playing");
      timer.reset(timerDuration);
      setCrowdGuesses([]);
    }
  };

  const prevQuestion = () => {
    if (qIndex > 0) {
      setQIndex(qIndex - 1);
      setRevealed([false, false, false, false]);
      setShowAnswer(false);
      timer.reset(timerDuration);
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

  const nextGroup = () => setCurrentGroup((currentGroup + 1) % groups.length);

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#play` : "#play";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=0a0a1a&color=00f0ff&data=${encodeURIComponent(joinUrl)}`;

  // ─── Question Editor ───
  if (editMode) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Rajdhani', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Glow size="1.8rem">Question Editor</Glow>
            <button onClick={() => setEditMode(false)} style={btnStyle(C.neonCyan)}>← Back to Game</button>
          </div>
          {questions.map((qq, qi) => (
            <div key={qi} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: C.neonPink, fontWeight: 700 }}>Q{qi + 1}</span>
                <button onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} style={{ background: "none", border: "none", color: C.wrong, cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                {qq.images.map((img, ii) => (
                  <input key={ii} value={img} onChange={e => {
                    const nq = [...questions]; nq[qi] = { ...nq[qi], images: [...nq[qi].images] }; nq[qi].images[ii] = e.target.value; setQuestions(nq);
                  }} style={inputStyle} placeholder={`Image ${ii + 1} (emoji or URL)`} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                {(qq.hints || ["","","",""]).map((h, hi) => (
                  <input key={hi} value={h} onChange={e => {
                    const nq = [...questions]; nq[qi] = { ...nq[qi], hints: [...(nq[qi].hints || ["","","",""])] }; nq[qi].hints[hi] = e.target.value; setQuestions(nq);
                  }} style={{ ...inputStyle, fontSize: "0.75rem" }} placeholder={`Hint ${hi + 1}`} />
                ))}
              </div>
              <input value={qq.answer} onChange={e => {
                const nq = [...questions]; nq[qi] = { ...nq[qi], answer: e.target.value }; setQuestions(nq);
              }} style={{ ...inputStyle, borderColor: C.neonGreen + "40" }} placeholder="Answer" />
            </div>
          ))}
          <button onClick={() => setQuestions([...questions, { images: ["❓","❓","❓","❓"], hints: ["","","",""], answer: "" }])} style={{ ...btnStyle(C.neonGreen), width: "100%", marginTop: 8 }}>+ Add Question</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Rajdhani', sans-serif", display: "flex" }}>
      {/* ─── LEFT PANEL ─── */}
      <div style={{ width: 300, minWidth: 300, background: C.bgPanel, borderRight: `1px solid ${C.border}`, padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        <Glow size="1.3rem" color={C.neonCyan}>HOST CONTROLS</Glow>

        {/* Game state */}
        <div style={panelSection}>
          <label style={labelStyle}>Phase</label>
          {phase === "lobby" ? (
            <button onClick={() => { setPhase("playing"); timer.reset(timerDuration); }} style={btnStyle(C.neonGreen)}>▶ Start Game</button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPhase("lobby")} style={btnStyle(C.neonPink, true)}>Reset</button>
              <span style={{ fontFamily: "'Space Mono'", color: C.neonGreen, alignSelf: "center", fontSize: "0.8rem" }}>● LIVE</span>
            </div>
          )}
        </div>

        {/* Question nav */}
        <div style={panelSection}>
          <label style={labelStyle}>Question {qIndex + 1} / {questions.length}</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={prevQuestion} disabled={qIndex === 0} style={btnStyle(C.muted, true)}>◀ Prev</button>
            <button onClick={nextQuestion} disabled={qIndex >= questions.length - 1} style={btnStyle(C.muted, true)}>Next ▶</button>
          </div>
          <button onClick={() => setEditMode(true)} style={{ ...btnStyle(C.neonYellow, true), marginTop: 6, fontSize: "0.7rem" }}>✏️ Edit Questions</button>
        </div>

        {/* Reveal controls */}
        <div style={panelSection}>
          <label style={labelStyle}>Reveal Images</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[0,1,2,3].map(i => (
              <button key={i} onClick={() => { const n = [...revealed]; n[i] = !n[i]; setRevealed(n); }}
                style={{ ...btnStyle(revealed[i] ? C.neonCyan : C.muted, true), flex: "1 0 40%", fontSize: "0.75rem" }}>
                {revealed[i] ? `✓ IMG ${i+1}` : `IMG ${i+1}`}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={revealNext} style={btnStyle(C.neonCyan, true)}>Reveal Next</button>
            <button onClick={revealAll} style={btnStyle(C.neonPink, true)}>Reveal All</button>
          </div>
        </div>

        {/* Timer */}
        <div style={panelSection}>
          <label style={labelStyle}>Timer: <span style={{ color: timer.time <= 5 ? C.neonPink : C.neonYellow, fontFamily: "'Space Mono'" }}>{timer.time}s</span></label>
          <div style={{ display: "flex", gap: 6 }}>
            {!timer.running ? <button onClick={timer.start} style={btnStyle(C.neonGreen, true)}>▶ Start</button> : <button onClick={timer.pause} style={btnStyle(C.neonYellow, true)}>⏸ Pause</button>}
            <button onClick={() => timer.reset(timerDuration)} style={btnStyle(C.muted, true)}>↺ Reset</button>
          </div>
        </div>

        {/* Answer */}
        <div style={panelSection}>
          <label style={labelStyle}>Answer</label>
          <button onClick={() => setShowAnswer(!showAnswer)} style={btnStyle(showAnswer ? C.neonGreen : C.neonPink)}>
            {showAnswer ? `✓ ${q?.answer}` : "Show Answer"}
          </button>
        </div>

        {/* Groups */}
        <div style={panelSection}>
          <label style={labelStyle}>Groups (Current: {groups[currentGroup]?.name})</label>
          {groups.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ flex: 1, color: i === currentGroup ? C.neonCyan : C.white, fontWeight: i === currentGroup ? 700 : 400, fontSize: "0.85rem", cursor: "pointer" }} onClick={() => setCurrentGroup(i)}>
                {i === currentGroup ? "▸ " : ""}{g.name} ({g.score}pts)
              </span>
              <button onClick={() => awardPoints(i, 100)} style={tinybtn(C.neonGreen)}>+100</button>
              <button onClick={() => awardPoints(i, -100)} style={tinybtn(C.neonPink)}>-100</button>
              <button onClick={() => removeGroup(i)} style={tinybtn(C.muted)}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === "Enter" && addGroup()} placeholder="Group name" style={{ ...inputStyle, flex: 1, padding: "6px 10px" }} />
            <button onClick={addGroup} style={btnStyle(C.neonCyan, true)}>Add</button>
          </div>
          <button onClick={nextGroup} style={{ ...btnStyle(C.neonYellow, true), marginTop: 6 }}>Next Group ▶</button>
        </div>

        {/* Crowd */}
        <div style={panelSection}>
          <label style={labelStyle}>Crowd Play</label>
          <button onClick={() => setShowCrowdPanel(!showCrowdPanel)} style={btnStyle(C.neonCyan, true)}>
            {showCrowdPanel ? "Hide QR / Guesses" : `Show QR / Guesses (${crowdGuesses.length})`}
          </button>
        </div>
      </div>

      {/* ─── MAIN DISPLAY ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 32, overflow: "auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Glow size="clamp(1.8rem, 4vw, 3rem)" color={C.neonPink}>4 PICTURES, 1 ANIME</Glow>
          <div style={{ fontFamily: "'Space Mono', monospace", color: C.muted, fontSize: "0.75rem", marginTop: 4 }}>
            QUESTION {qIndex + 1} OF {questions.length}
            {phase === "playing" && <span style={{ color: C.neonGreen, marginLeft: 12 }}>● LIVE</span>}
          </div>
        </div>

        {/* Timer Bar */}
        {timer.running && (
          <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(timer.time / timerDuration) * 100}%`, background: timer.time <= 5 ? C.neonPink : `linear-gradient(90deg, ${C.neonCyan}, ${C.neonGreen})`, borderRadius: 2, transition: "width 1s linear", boxShadow: `0 0 12px ${timer.time <= 5 ? C.neonPink : C.neonCyan}60` }} />
          </div>
        )}

        {/* 4 Images Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(12px, 2vw, 24px)", maxWidth: 700, margin: "0 auto", width: "100%" }}>
          {q?.images.map((img, i) => (
            <ImageCard key={`${qIndex}-${i}`} content={img} hint={q.hints?.[i]} revealed={revealed[i]} index={i} phase={phase} />
          ))}
        </div>

        {/* Timer Display */}
        {timer.running && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "3rem", fontWeight: 700, color: timer.time <= 5 ? C.neonPink : C.neonYellow, textShadow: `0 0 20px ${timer.time <= 5 ? C.neonPink : C.neonYellow}60`, animation: timer.time <= 5 ? "pulse 0.5s infinite alternate" : "none" }}>{timer.time}</span>
          </div>
        )}

        {/* Answer Reveal */}
        {showAnswer && (
          <div style={{ textAlign: "center", marginTop: 24, padding: 20, background: `linear-gradient(135deg, ${C.neonGreen}10, ${C.neonCyan}10)`, border: `2px solid ${C.neonGreen}40`, borderRadius: 16 }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "0.8rem", color: C.neonGreen, textTransform: "uppercase", letterSpacing: "0.15em" }}>The Answer Is</span>
            <div><Glow size="2.5rem" color={C.neonGreen}>{q?.answer}</Glow></div>
          </div>
        )}

        {/* Current Group */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", color: C.muted, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Now Playing</span>
          <div style={{ fontFamily: "'Bangers', cursive", fontSize: "1.6rem", color: C.neonCyan, textShadow: `0 0 10px ${C.neonCyan}40` }}>
            {groups[currentGroup]?.name || "No groups yet"}
          </div>
        </div>

        {/* Scoreboard */}
        <div style={{ maxWidth: 500, margin: "24px auto 0", width: "100%" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em" }}>Scoreboard</span>
          {[...groups].sort((a, b) => b.score - a.score).map((g, i) => (
            <ScoreRow key={g.name} group={g} isActive={g.name === groups[currentGroup]?.name} rank={i + 1} />
          ))}
        </div>

        {/* Crowd QR & Guesses Panel */}
        {showCrowdPanel && (
          <div style={{ maxWidth: 600, margin: "32px auto 0", width: "100%", padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>Scan to Join</div>
                <img src={qrUrl} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 8, border: `2px solid ${C.neonCyan}30` }} />
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: C.neonCyan, marginTop: 8, wordBreak: "break-all", maxWidth: 200 }}>{joinUrl}</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>Crowd Guesses ({crowdGuesses.length})</div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {crowdGuesses.length === 0 && <div style={{ color: C.muted, fontSize: "0.8rem" }}>No guesses yet...</div>}
                  {crowdGuesses.map((g, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}`, fontSize: "0.8rem" }}>
                      <span style={{ color: C.neonCyan }}>{g.name}</span>
                      <span style={{ color: g.guess?.toLowerCase() === q?.answer?.toLowerCase() ? C.neonGreen : C.white }}>{g.guess}</span>
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

// ═══════════════════════════════════════════
//  CROWD / PLAYER VIEW
// ═══════════════════════════════════════════
function CrowdView() {
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [lastQ, setLastQ] = useState(-1);

  // Poll game state
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

  if (!joined) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <Glow size="2rem" color={C.neonPink}>4 PICS 1 ANIME</Glow>
          <p style={{ fontFamily: "'Rajdhani', sans-serif", color: C.muted, margin: "12px 0 24px", fontSize: "1rem" }}>Enter your name to join the crowd!</p>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === "Enter" && playerName.trim() && setJoined(true)}
            placeholder="Your display name" style={{ ...inputStyle, fontSize: "1.1rem", padding: "12px 16px", width: "100%", boxSizing: "border-box", textAlign: "center", marginBottom: 16 }} autoFocus />
          <button onClick={() => playerName.trim() && setJoined(true)} disabled={!playerName.trim()}
            style={{ ...btnStyle(C.neonCyan), width: "100%", padding: "14px", fontSize: "1.1rem", opacity: playerName.trim() ? 1 : 0.4 }}>JOIN GAME</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Rajdhani', sans-serif", padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Glow size="1.4rem" color={C.neonPink}>4 PICS 1 ANIME</Glow>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.neonCyan, marginTop: 4 }}>Playing as: {playerName}</div>
      </div>

      {!gameState || gameState.phase === "lobby" ? (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⏳</div>
          <p style={{ color: C.muted, fontSize: "1.1rem" }}>Waiting for the host to start...</p>
          <p style={{ color: C.muted, fontSize: "0.8rem" }}>Keep your eyes on the big screen!</p>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: C.muted, marginBottom: 12 }}>QUESTION {(gameState.qIndex ?? 0) + 1}</div>

          {/* 4 Images */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 340, width: "100%", marginBottom: 20 }}>
            {(gameState.images || []).map((img, i) => (
              <ImageCard key={`${gameState.qIndex}-${i}`} content={img} hint={gameState.hints?.[i]} revealed={gameState.revealed?.[i] || false} index={i} />
            ))}
          </div>

          {/* Answer Revealed by Host */}
          {gameState.answer ? (
            <div style={{ textAlign: "center", padding: 20, background: `${C.neonGreen}10`, border: `2px solid ${C.neonGreen}30`, borderRadius: 16, width: "100%", maxWidth: 340 }}>
              <div style={{ fontSize: "0.8rem", color: C.neonGreen, textTransform: "uppercase", letterSpacing: "0.1em" }}>Answer</div>
              <Glow size="1.8rem" color={C.neonGreen}>{gameState.answer}</Glow>
              {submitted && <div style={{ fontSize: "0.85rem", color: guess.toLowerCase() === gameState.answer.toLowerCase() ? C.neonGreen : C.neonPink, marginTop: 8 }}>
                {guess.toLowerCase() === gameState.answer.toLowerCase() ? "🎉 You got it!" : `You guessed: ${guess}`}
              </div>}
            </div>
          ) : submitted ? (
            <div style={{ textAlign: "center", padding: 20, background: `${C.neonCyan}10`, border: `1px solid ${C.neonCyan}30`, borderRadius: 16, width: "100%", maxWidth: 340 }}>
              <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>✓</div>
              <div style={{ color: C.neonCyan, fontWeight: 700 }}>Guess submitted!</div>
              <div style={{ color: C.muted, fontSize: "0.85rem", marginTop: 4 }}>Your answer: {guess}</div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 340 }}>
              <input value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Which anime is it?" style={{ ...inputStyle, fontSize: "1.1rem", padding: "14px 16px", width: "100%", boxSizing: "border-box", textAlign: "center", marginBottom: 12 }} autoFocus />
              <button onClick={handleSubmit} disabled={!guess.trim()}
                style={{ ...btnStyle(C.neonPink), width: "100%", padding: "14px", fontSize: "1.1rem", opacity: guess.trim() ? 1 : 0.4 }}>SUBMIT GUESS</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════
const panelSection = { display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderBottom: `1px solid ${C.border}` };
const labelStyle = { fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" };
const inputStyle = {
  background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px",
  color: C.white, fontFamily: "'Rajdhani', sans-serif", fontSize: "0.9rem", outline: "none",
};
const btnStyle = (color, small = false) => ({
  background: `${color}18`, border: `1px solid ${color}50`, borderRadius: 8,
  padding: small ? "6px 12px" : "10px 18px", color, fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 700, fontSize: small ? "0.75rem" : "0.9rem", cursor: "pointer",
  transition: "all 0.15s ease", letterSpacing: "0.03em",
});
const tinybtn = (color) => ({
  background: "none", border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 6px",
  color, fontSize: "0.65rem", cursor: "pointer", fontFamily: "'Space Mono'",
});

// ═══════════════════════════════════════════
//  ROUTER
// ═══════════════════════════════════════════
export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#host");

  useEffect(() => {
    const handler = () => setRoute(window.location.hash || "#host");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Add global animation keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse { from { opacity: 1; } to { opacity: 0.5; } }
      * { box-sizing: border-box; }
      body { margin: 0; background: ${C.bg}; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: ${C.bg}; }
      ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      input::placeholder { color: ${C.muted}; }
      button:hover { filter: brightness(1.2); }
      button:active { transform: scale(0.97); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (route === "#play") return <CrowdView />;
  return <HostView />;
}
