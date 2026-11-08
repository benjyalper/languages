# Languages 🗣️

Learn **3 everyday words a day** in **Russian 🇷🇺, Spanish 🇪🇸 and Chinese 🇨🇳**: the same 3 words in all three languages, written (Cyrillic + romanization, Spanish, Chinese characters + pinyin) and spoken aloud.

- **Today**: 3 word cards. Tap 🔊 to hear each language (▶ All plays all three). Tap **V** on every word to finish the day.
- **Learned**: everything you've learned, grouped by day, with audio and search.
- **Medals & prizes**: streak medals (3, 7, 14, 30, 60, 100 days), word-count trophies, fun badges (Early Bird, Night Owl, Weekend Hero, Comeback Kid), and themes you unlock as prizes.
- Praise after every word, plus confetti and a celebration when you finish the day.

One new lesson unlocks per calendar day. 50 lessons (150 words) are included; after that it starts a review round.

## How it works
- Static front end in `public/` plus a tiny zero-dependency Node server (`server.js`).
- Audio uses the browser's built-in speech synthesis (Web Speech API), so there are no audio files or API keys. Chrome, Edge and Safari have Russian/Spanish/Chinese voices on most devices.
- Progress is saved in your browser (localStorage), per device.

## Run locally
```bash
npm start   # http://localhost:3000
```

## Deploy on Railway
1. railway.com → **New Project → Deploy from GitHub repo** → pick `benjyalper/languages`.
2. Railway detects Node and runs `npm start` (see `railway.json`); it sets `PORT` automatically.
3. **Settings → Networking → Generate Domain** to get a public URL.
