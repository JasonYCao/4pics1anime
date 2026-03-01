# 4 Pictures, 1 Anime 🎮

An interactive live gameshow where groups guess anime titles from four visual clues — with optional real-time crowd participation from their phones.

## What's In Here

| File | Description |
|------|-------------|
| `4pics1anime.jsx` | The main gameshow app (React). Host dashboard + crowd play view. |
| `4pics1anime_proposal.html` | A polished event proposal page with full breakdown of the format. |

## Gameshow App

### Host View (`#host`)
- Reveal images one at a time for dramatic effect
- Countdown timer with animated progress bar
- Add/remove groups, award/deduct points, cycle through turns
- Built-in question editor (supports emoji or image URLs)
- Show/hide answers, view crowd guesses

### Crowd View (`#play`)
- Attendees scan a QR code — no app download required
- Enter a display name, see revealed images, submit guesses
- Completely optional — zero friction

### How to Use
1. Deploy the `.jsx` as a React component (or drop it into any React project)
2. Open the app on your main display — that's the host screen
3. Show the QR code for audience participation
4. Add groups as they come up, reveal images, run the timer, award points

## Proposal Page

Open `4pics1anime_proposal.html` in any browser to see the full event proposal with:
- Event concept & format breakdown
- Show flow timeline
- Crowd engagement tech specs
- Stage & production requirements
- Scalability guide (30 to 5,000+ attendees)
- Sponsorship opportunities
- 8-week planning timeline

## License

MIT
