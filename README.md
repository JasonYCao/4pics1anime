# 4 Pictures, 1 Anime 🎮

An interactive live gameshow where groups guess anime titles from four visual clues — with optional real-time crowd participation from their phones.

**[Deploy to Vercel →](https://vercel.com/new/clone?repository-url=https://github.com/JasonYCao/4pics1anime)**

## Routes

| Route | Description |
|-------|-------------|
| `/` | Event proposal & landing page |
| `/host` | Host dashboard — controls the game |
| `/play` | Crowd play — scan QR to join from phone |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the proposal page. Navigate to `/host` to run the game, and `/play` for the crowd view.

## Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Vite — just click Deploy
4. Done. Share the `/play` URL (or QR code) with your audience.

## How to Run the Gameshow

1. Open `/host` on the main display — that's your control panel
2. Add groups as they come up to the stage
3. Click "Show QR / Guesses" to display the QR code for crowd participation
4. Reveal images one at a time, start the timer, let them guess
5. Hit "Show Answer", award points, then cycle to the next group or question

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router (/, /host, /play)
├── styles.css            # Global styles & CSS vars
├── components/
│   ├── Glow.jsx          # Neon glow text
│   ├── ImageCard.jsx     # Clue image card
│   └── ScoreRow.jsx      # Scoreboard row
├── data/
│   └── questions.js      # Sample question bank
├── hooks/
│   └── useTimer.js       # Countdown timer hook
├── lib/
│   └── storage.js        # Host ↔ Crowd state sync
└── pages/
    ├── Host.jsx           # Host dashboard
    ├── Play.jsx           # Crowd play view
    ├── Proposal.jsx       # Landing / proposal page
    └── Proposal.css       # Proposal styles
```

## License

MIT
