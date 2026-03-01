import { Link } from "react-router-dom";
import "./Proposal.css";

function FlowItem({ num, color, title, time, desc, icon }) {
  return (
    <div className="flow-item">
      <div className="flow-dot" style={{ background: `${color}20`, color }}>
        {icon || num}
      </div>
      <div className="flow-content">
        <div className="flow-title">{title}</div>
        {time && <div className="flow-time">{time}</div>}
        <div className="flow-desc">{desc}</div>
      </div>
    </div>
  );
}

function Card({ emoji, title, desc }) {
  return (
    <div className="p-card">
      <span className="p-card-emoji">{emoji}</span>
      <div className="p-card-title">{title}</div>
      <div className="p-card-desc">{desc}</div>
    </div>
  );
}

export default function Proposal() {
  return (
    <div className="proposal">
      {/* ═══ HERO ═══ */}
      <header className="hero">
        <img
          src="https://www.animenorth.com/images/logo2x.png"
          alt="Anime North Logo"
          className="hero-logo anim-up"
        />
        <div className="hero-eyebrow anim-up d1">Event Proposal 2026</div>
        <h1 className="hero-title anim-up d2">
          4 Pictures,<br />
          <span className="accent">1 Anime</span>
        </h1>
        <p className="hero-subtitle anim-up d3">
          An interactive live gameshow where the crowd plays along from their phones.
          No apps. No downloads. Just scan &amp; guess.
        </p>
        <div className="hero-meta anim-up d4">
          <span>Live Gameshow</span>
          <span>Crowd Participation</span>
          <span>60–90 min</span>
        </div>
        <div className="hero-actions anim-up d5">
          <Link to="/host" className="hero-btn primary">Launch Host View →</Link>
          <Link to="/play" className="hero-btn secondary">Try Crowd View</Link>
        </div>
      </header>

      <div className="content">
        <div className="divider" />

        {/* ═══ CONCEPT ═══ */}
        <section>
          <div className="section-label">01 — The Concept</div>
          <h2 className="section-title">Think "4 Pics 1 Word" — but anime.</h2>
          <p className="section-body">
            Four images go up on the big screen. Each one is a clue pointing to a single anime title.
            Groups come up to the stage one at a time, and they've got a ticking clock to figure it out.
            Meanwhile, <strong>the entire audience can play along from their phones</strong> by scanning a
            QR code — no app download needed, just a browser.
          </p>
          <p className="section-body">
            It's visual, it's competitive, it's loud, and it works whether someone's seen 10 anime or 1,000.
          </p>

          <div className="card-grid">
            <Card emoji="👀" title="Visually Driven" desc="Perfect for big screens and projectors. The images do the talking — no trivia reading required." />
            <Card emoji="📱" title="Crowd Play (Optional)" desc="Attendees scan a QR code to submit guesses from their seats. Totally optional — zero friction." />
            <Card emoji="📈" title="Scales Up Easily" desc="Works for 30 people in a panel room or 3,000+ on a main stage. Same format, same energy." />
            <Card emoji="🎭" title="Meme-Worthy Moments" desc="Tricky image combos create hilarious reactions. Natural social media content." />
          </div>
        </section>

        <div className="divider" />

        {/* ═══ FORMAT ═══ */}
        <section>
          <div className="section-label">02 — Show Format</div>
          <h2 className="section-title">How the show flows</h2>
          <p className="section-body">
            Groups come up <strong>one at a time</strong>. The host reveals images, controls the timer,
            and awards points. Between groups, the crowd leaderboard can go up, polls can run, and the
            energy stays high. The whole thing runs about 60–90 minutes.
          </p>

          <div className="flow">
            <FlowItem num="01" color="var(--accent)" title="Opening" time="~10 minutes" desc="Host intro, rules walkthrough, QR code goes up on the big screen for anyone who wants to play along." />
            <FlowItem num="02" color="var(--cyan)" title="Round 1 — Easy" time="~15–20 minutes" desc="Iconic, well-known anime. Great warm-up. Think Naruto, Dragon Ball, Attack on Titan." />
            <FlowItem num="03" color="var(--gold)" title="Round 2 — Medium" time="~15–20 minutes" desc="Trickier picks and more creative image angles. This is where people start second-guessing." />
            <FlowItem num="04" color="var(--green)" title="Round 3 — Hard" time="~15–20 minutes" desc="Obscure titles, subtle visual cues, red herrings. Separates the real ones from the casuals." />
            <FlowItem icon="⚡" color="var(--accent)" title="Finale — Lightning Round" time="~10–15 minutes" desc="Rapid-fire questions. Top crowd players announced. Grand winner crowned. Prizes go out." />
          </div>
        </section>

        <div className="divider" />

        {/* ═══ CROWD TECH ═══ */}
        <section>
          <div className="section-label">03 — Crowd Engagement</div>
          <h2 className="section-title">Phones become controllers</h2>
          <p className="section-body">
            The crowd participation is <strong>completely optional</strong> — anyone in the audience can scan a QR
            code displayed on the main screen and join a lightweight web app right in their browser. They see the
            same images, type their guess, and get scored on speed and accuracy.
          </p>

          <div className="highlight-box">
            <div className="hl-title">How It Works for Attendees</div>
            Scan the QR code → enter a display name → see the images on your phone → type your anime guess →
            submit before time runs out → check the leaderboard. That's it. No account, no download, no friction.
          </div>

          <div className="tech-grid">
            <div className="tech-row"><div className="tech-label">Frontend</div><div className="tech-value">Responsive web app. Works on any phone browser — iOS Safari, Android Chrome, desktop.</div></div>
            <div className="tech-row"><div className="tech-label">Real-time</div><div className="tech-value">WebSocket connection for instant answer submission and live leaderboard updates.</div></div>
            <div className="tech-row"><div className="tech-label">Hosting</div><div className="tech-value">Cloud-hosted with auto-scaling. Handles hundreds to thousands of simultaneous players.</div></div>
            <div className="tech-row"><div className="tech-label">Admin</div><div className="tech-value">Host dashboard to advance rounds, reveal answers, trigger timers, and manage the question bank.</div></div>
            <div className="tech-row"><div className="tech-label">Latency</div><div className="tech-value">&lt;Leaderboard updates pushed in real-time.</div></div>
          </div>

          <div className="card-grid" style={{ marginTop: 24 }}>
            <Card emoji="🏆" title="Live Leaderboard" desc="Top 10 on the big screen between rounds. Full rankings on each phone." />
            <Card emoji="📊" title="Polls & Breaks" desc="Quick audience polls between rounds to keep the energy flowing." />
            <Card emoji="📸" title="Share Moments" desc="Branded score screens for social media screenshots and bragging rights." />
          </div>
        </section>
     </div>

      {/* ═══ CTA ═══ */}
      <div className="divider" />
      <section className="cta-section">
        <div className="cta-title">Let's make this happen.</div>
        <p className="cta-sub">Ready to turn anime trivia into an experience?</p>
        <div className="hero-actions">
          <Link to="/host" className="hero-btn primary">Launch Host View →</Link>
          <Link to="/play" className="hero-btn secondary">Try Crowd View</Link>
        </div>
      </section>

      <footer>
        <p>4 Pictures, 1 Anime — Event Proposal v1.0 — Prepared for Anime North 2026</p>
        <p style={{ marginTop: 8 }}>Jason Cao</p>
      </footer>
    </div>
  );
}
