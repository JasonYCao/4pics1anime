export default function Glow({
  children,
  color = "var(--accent)",
  size = "3rem",
  font = "'Bangers', cursive",
  style = {},
}) {
  return (
    <span
      style={{
        fontFamily: font,
        fontSize: size,
        color,
        textShadow: `0 0 10px ${color}80, 0 0 30px ${color}40, 0 0 60px ${color}20`,
        letterSpacing: "0.05em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
