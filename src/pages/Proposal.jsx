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
            <div className="tech-row"><div className="tech-label">Latency</div><div className="tech-value">&lt;200ms round-trip for answer submission. Leaderboard updates pushed in real-time.</div></div>
          </div>

          <div className="card-grid" style={{ marginTop: 24 }}>
            <Card emoji="🏆" title="Live Leaderboard" desc="Top 10 on the big screen between rounds. Full rankings on each phone." />
            <Card emoji="📊" title="Polls & Breaks" desc="Quick audience polls between rounds to keep the energy flowing." />
            <Card emoji="📸" title="Share Moments" desc="Branded score screens for social media screenshots and bragging rights." />
          </div>
        </section>

        <div className="divider" />

        {/* ═══ PRODUCTION ═══ */}
        <section>
          <div className="section-label">04 — Stage & Production</div>
          <h2 className="section-title">What we need on the day</h2>
          <p className="section-body">
            The setup is straightforward. A screen to show images, a sound system, buzzers for the stage
            contestants, and internet for the crowd play system.
          </p>

          <div className="card-grid">
            <Card emoji="🖥️" title="Display" desc="LED screen or projector (16:9, 1080p min) for images, answers, and the crowd leaderboard." />
            <Card emoji="🔊" title="Audio" desc="Wireless mics for host + contestants. Sound system for anime OST clips and SFX." />
            <Card emoji="🔴" title="Buzzers" desc="Physical or wireless buzzer system for on-stage contestants to lock in their answer." />
            <Card emoji="🌐" title="Connectivity" desc="Hardwired ethernet for admin systems. Attendees use venue Wi-Fi or mobile data." />
          </div>

          <div className="tech-grid" style={{ marginTop: 24 }}>
            <div className="tech-row"><div className="tech-label">Host / MC</div><div className="tech-value">Drives the energy, explains rules, interacts with contestants and crowd.</div></div>
            <div className="tech-row"><div className="tech-label">Tech Op</div><div className="tech-value">Runs the admin dashboard — advances rounds, manages timers, monitors the web app.</div></div>
            <div className="tech-row"><div className="tech-label">AV Tech</div><div className="tech-value">Manages display, audio, and lighting cues throughout the show.</div></div>
            <div className="tech-row"><div className="tech-label">Stage Assists</div><div className="tech-value">Manage group flow on/off stage, distribute prizes, handle crowd logistics.</div></div>
          </div>
        </section>

        <div className="divider" />

        {/* ═══ SCALE ═══ */}
        <section>
          <div className="section-label">05 — Scalability</div>
          <h2 className="section-title">It works at any size</h2>
          <p className="section-body">
            Same game, same format — just dial the production up or down. The web app auto-scales so
            crowd participation works regardless of venue size.
          </p>

          <div className="scale-grid">
            <div className="scale-card">
              <div className="scale-size">S</div>
              <div className="scale-label">30–100 people</div>
              <div className="scale-desc">Club, bar, or community meetup. Single screen. Intimate and loud.</div>
            </div>
            <div className="scale-card">
              <div className="scale-size">M</div>
              <div className="scale-label">100–500 people</div>
              <div className="scale-desc">Convention panel room. Dual screens recommended. Classic con energy.</div>
            </div>
            <div className="scale-card">
              <div className="scale-size">L</div>
              <div className="scale-label">500–5,000+</div>
              <div className="scale-desc">Main stage. Full production — LED wall, pro AV, dedicated Wi-Fi AP.</div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ═══ SPONSORS ═══ */}
        <section>
          <div className="section-label">06 — Sponsors & Prizes</div>
          <h2 className="section-title">Natural integration, not interruption</h2>
          <p className="section-body">
            The format has clean sponsor integration points that feel organic — title sponsorship on all
            screens, round branding, prize sponsorship, and branded social media screenshot frames that
            attendees share themselves.
          </p>

          <div className="highlight-box">
            <div className="hl-title">Prize Structure</div>
            <strong>Stage winners</strong> get the grand prize package — figures, manga, streaming subs,
            whatever sponsors provide. <strong>Top 3 crowd players</strong> get called to the stage for
            recognition and prizes. A <strong>random draw</strong> from all crowd participants keeps
            everyone engaged until the very end.
          </div>
        </section>

        <div className="divider" />

        {/* ═══ TIMELINE ═══ */}
        <section>
          <div className="section-label">07 — Timeline</div>
          <h2 className="section-title">8 weeks to showtime</h2>

          <div className="flow">
            <FlowItem num="8w" color="var(--accent)" title="Concept Approval" desc="Green-light the event, lock the date." />
            <FlowItem num="6w" color="var(--cyan)" title="Question Bank + Web App Dev" desc="Curate 60–80 questions across difficulty tiers. Build and load-test the crowd play system." />
            <FlowItem num="4w" color="var(--gold)" title="Sponsor Confirmation" desc="Lock in sponsors, finalize prize packages." />
            <FlowItem num="1w" color="var(--green)" title="Dry Run" desc="Full tech rehearsal with mock audience. Iron out timing and transitions." />
            <FlowItem icon="🎬" color="var(--accent)" title="Event Day" desc="Let's go." />
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
        <p style={{ marginTop: 8 }}>Confidential Draft</p>
      </footer>
    </div>
  );
}
