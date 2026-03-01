export default function ScoreRow({ group, isActive, rank }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderRadius: 10,
        background: isActive
          ? "linear-gradient(90deg, rgba(0,212,255,0.07), transparent)"
          : "transparent",
        border: `1px solid ${isActive ? "rgba(0,212,255,0.25)" : "var(--border)"}`,
        transition: "all 0.3s ease",
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          width: 24,
        }}
      >
        #{rank}
      </span>
      <span
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: isActive ? "var(--cyan)" : "var(--text)",
          flex: 1,
        }}
      >
        {group.name}
      </span>
      <span
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "var(--gold)",
          textShadow: "0 0 8px rgba(255,194,68,0.25)",
        }}
      >
        {group.score}
      </span>
    </div>
  );
}
