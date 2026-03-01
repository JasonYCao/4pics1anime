const COLORS = ["var(--accent)", "var(--cyan)", "var(--gold)", "var(--green)"];

export default function ImageCard({ content, hint, revealed, index }) {
  const accent = COLORS[index % 4];
  const isUrl =
    typeof content === "string" &&
    (content.startsWith("http") || content.startsWith("data:") || content.startsWith("/"));

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        aspectRatio: "1",
        background: revealed
          ? "var(--bg-card)"
          : "linear-gradient(135deg, var(--bg), var(--bg-card))",
        border: `2px solid ${revealed ? accent : "var(--border)"}`,
        boxShadow: revealed
          ? `0 0 20px ${accent}30, 0 0 60px ${accent}10, inset 0 0 30px ${accent}08`
          : "none",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: revealed ? "scale(1)" : "scale(0.92)",
        opacity: revealed ? 1 : 0.4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        cursor: "default",
      }}
    >
      {revealed ? (
        <>
          {isUrl ? (
            <img
              src={content}
              alt={hint}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                lineHeight: 1,
                filter: `drop-shadow(0 0 12px ${accent}60)`,
              }}
            >
              {content}
            </span>
          )}
          {hint && !isUrl && (
            <span
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(0.65rem, 1.5vw, 0.9rem)",
                color: "var(--text-muted)",
                marginTop: 8,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {hint}
            </span>
          )}
        </>
      ) : (
        <>
          <span
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "var(--text-muted)",
              opacity: 0.3,
            }}
          >
            ?
          </span>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              opacity: 0.4,
              marginTop: 4,
            }}
          >
            IMG {index + 1}
          </span>
        </>
      )}
      {/* Corner accents */}
      <div
        style={{
          position: "absolute", top: 0, right: 0, width: 24, height: 24,
          borderBottom: `2px solid ${revealed ? accent : "transparent"}`,
          borderLeft: `2px solid ${revealed ? accent : "transparent"}`,
          borderRadius: "0 0 0 8px",
          transition: "all 0.6s ease",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, width: 24, height: 24,
          borderTop: `2px solid ${revealed ? accent : "transparent"}`,
          borderRight: `2px solid ${revealed ? accent : "transparent"}`,
          borderRadius: "0 8px 0 0",
          transition: "all 0.6s ease",
        }}
      />
    </div>
  );
}
