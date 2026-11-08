# SONARA — Solana Hackathon Development Specification

**Status:** Proposed MVP; implementation not yet started; **100% free/open-source development requirement**  
**Updated:** 2026-11-07  
**Platform:** Laptop-first browser experience (desktop Chrome/Edge initially)  
**Project name:** SONARA

## 1. One-sentence pitch

**Play music together using only your webcams.** SONARA is a cooperative multiplayer rhythm game where hand gestures control imaginary instruments, players learn songs with falling-note challenges, and their wallet-owned Solana NFT musician evolves as they progress.

### What makes it different?

- No physical piano, guitar, drums, MIDI controller, or special gaming device required.
- Camera-based *air instruments* with audio feedback and guided rhythm gameplay.
- Two real players play complementary parts of the **same song** in a synchronized online room.
- Beginner-friendly, short lessons and increasing difficulty (Duolingo-style progression).
- A persistent **Solana musician NFT** with selected achievements and progression, instead of minting a new token after each song.

**Important distinction:** Computer vision measures gesture position/timing, not real musical proficiency on an actual instrument. The game teaches rhythm, coordination, timing, and song patterns; do not market it as an equivalent to learning acoustic instrument technique.

## 2. Hard requirement: free and open-source (FOSS)

**All core application code, dependencies, model inference, database, networking, and game assets must be usable without a paid subscription, trial, API credits, or proprietary hosted service.** Prefer permissively licensed open-source dependencies; document all licenses. Publish our own code under MIT or Apache-2.0 after checking compatible third-party terms. Do not copy code from inspirational repositories without confirming their licenses.

**Zero-cost scope:** Development, local hosting, two-player testing on a LAN or machines you control, music playback, webcam hand tracking, local persistence, and Solana **Devnet** NFT testing can be completed without paying for APIs or cloud services. Internet-based multiplayer accessible to anyone requires a publicly reachable server; self-hosting on an existing machine may avoid a hosting bill but needs reliable connectivity, appropriate network configuration, and HTTPS/WSS for remote browser camera access. Never describe public hosting as guaranteed permanently free. **Solana mainnet always has transaction/rent costs; zero-cost NFT demonstrations use Devnet.**

### Approved zero-cost, source-available choices

| Component | FOSS selection | How we keep it free |
|---|---|---|
| Web app | React + Vite + TypeScript + Tailwind CSS | Build and serve locally or self-host; no platform subscription |
| Hand recognition | MediaPipe Tasks Vision Hand Landmarker (Apache-2.0) | Download model/WASM assets once; serve from our own app; inference locally in browser; assess telemetry/privacy behavior |
| Game rendering | HTML Canvas 2D | Browser-native, no game engine license |
| Audio | Tone.js + Web Audio API | Synthesized tones/drum sounds; no paid sample packs |
| Multiplayer | Self-hosted Colyseus (MIT) / WebSockets | Run Node server ourselves; **do not use Colyseus Cloud** |
| Storage | SQLite locally using `better-sqlite3`; optional self-hosted PostgreSQL later | No required Supabase/hosted database account |
| Blockchain | Open-source Solana web3 tools + Metaplex Core SDK | Devnet with test SOL; check exact dependency/program licenses before use |
| Assets | Our own CC0 artwork/music and code-generated waveforms | No paid songs, plugins, soundfonts, sprites or marketplace assets |
| Tests | Vitest + Playwright | Run locally or in free/self-hosted CI |

### Prohibited as required infrastructure

- Paid LLM, computer-vision, audio-transcription, speech-synthesis, or music-generation APIs.
- Hosted backend/database tiers with billing requirements, credit cards, expiring trials, or usage-dependent fees.
- Proprietary game SDKs or closed-source asset/model packs that are necessary for MVP functionality.
- Paid music libraries, paid MIDI arrangements, noncommercial-only samples for a project intended for public use.
- Mandatory crypto purchases or paid mainnet transactions for users of the hackathon demo.

### Practical cost/operations caveat

The code may be fully FOSS while **hardware, electricity, Internet service, DNS/domain names, network hosting, and real Solana mainnet transactions** can cost money. For a no-bill MVP, use a laptop as your server, localhost/LAN testing, and Solana Devnet. Test public remote multiplayer only after choosing a no-cost deployment approach with explicit limits; a tunnel service is convenient but may not itself be open source or permanent, so it cannot be a required runtime dependency. Secure HTTPS is required for remote browser webcam APIs (localhost is a secure-context exception). Wallet options must also be reviewed for license/availability; provide a guest mode without wallet connection.

## 3. Product decisions already agreed

- Main concept is **multiplayer virtual band**, not the earlier athlete digital twin concept.
- Play on a PC/laptop with an integrated or USB webcam; phone support is optional and deferred.
- No real instruments are needed. Do **not** require a microphone for the MVP.
- First two roles: **piano and drums**. Guitar may be a later selectable virtual instrument.
- Falling-note visual gameplay, short beginner songs, room-based multiplayer, and one evolving NFT per musician.
- Implement the fun interactive game first; add the blockchain flow only after a locally playable loop works.
- Use Solana **Devnet** for development and demonstrations.

## 4. MVP: a demo that can actually be finished

A successful judge demo:

1. Open a hosted game in two laptop browsers.
2. Player A creates a room and shares a link or short room code.
3. Player B joins and chooses the complementary instrument.
4. Both grant webcam permission, see the tracked hands, and calibrate their gesture zones.
5. A countdown starts the **same 20–30 second original song** on both clients.
6. Falling notes approach a hit line. Player A triggers piano notes and Player B triggers drum hits by moving/tapping fingers or hands in virtual zones.
7. Both clients play their own audio locally. Scores, streaks, and a band-completion meter update together.
8. The server finalizes the score and displays results, including each player's timing accuracy.
9. A player connects a Solana wallet, mints a **Devnet musician NFT** once, and claims a recorded achievement or XP update. Another browser can independently read the updated on-chain attributes.

**Must-have:** an accessible backup mouse/keyboard control mode for judges whose webcam permissions, lighting, or tracking fail. It uses the same note chart and score logic and is marked as a separate input mode.

**Not in MVP:** 3D photorealistic avatars, rendering instrument-quality technique, full music catalogs, real-time audio/video chat, external instrument microphones, token rewards with monetary value, NFT marketplace, on-chain note-by-note scoring, portable characters automatically supported by third-party games, mobile-native app, anti-cheat guarantees.

## 5. Recommended architecture

```text
Browser client A (Piano)                 Browser client B (Drums)
  getUserMedia()                           getUserMedia()
  MediaPipe Hand Landmarker                MediaPipe Hand Landmarker
  Gesture detector + calibration           Gesture detector + calibration
  Falling-note renderer                    Falling-note renderer
  Tone.js / Web Audio (local)              Tone.js / Web Audio (local)
  Wallet connection (optional)             Wallet connection (optional)
        |                                          |
        +------- WebSocket / Colyseus room -------+
                           |
                Authoritative game server
                - room/matchmaking state
                - shared chart and start time
                - input event validation
                - timing windows and score
                - finalized session results
                           |
                   SQLite (self-hosted)
                - profiles, sessions, scores
                - non-sensitive results
                           |
                 NFT progression service
                - authorizes XP update
                - Metaplex Core attributes
                           |
                      Solana Devnet
```

### Suggested stack

| Area | Choice | Why |
|---|---|---|
| UI | Vite + React + TypeScript + Tailwind | One web app; deployable, familiar tooling |
| Webcam | `navigator.mediaDevices.getUserMedia` | Browser camera access after user consent; HTTPS or localhost required |
| Hand tracking | MediaPipe Tasks Vision `HandLandmarker` | Tracks hand landmarks in-browser; likely no paid AI API required |
| Camera visualization | HTML canvas overlay | Draw landmarks, instrument zones, feedback |
| Game renderer | Canvas 2D (first), optionally PixiJS later | Simple falling notes and lanes |
| Audio | Tone.js / Web Audio | Local instrument sounds and scheduling |
| Multiplayer | Colyseus + WebSockets | Rooms, server-owned state and messages |
| Data storage | SQLite (`better-sqlite3`) | Store sessions, chart versions, and player profiles on our self-hosted server |
| Blockchain | Solana Devnet, Metaplex Core, Umi | Wallet-owned musician NFT and on-chain attributes |
| Hosting | Local Vite development server + self-hosted Node/Colyseus | No paid hosting needed for localhost/LAN tests; public deployment needs independently secured hosting |
| Tests | Vitest for scoring/gesture logic; Playwright for UI | Determinism, regression protection |

**OpenCV is not mandatory for the browser MVP.** MediaPipe provides the landmark tracking and a canvas can visualize it. Add OpenCV.js only if later image processing genuinely needs it. No generative AI or paid vision API is necessary for MVP.

## 6. Webcam-to-note input design

### 5.1 Camera pipeline

1. Request webcam permission only after a user action.
2. Show a mirrored preview for intuitive interaction.
3. Run MediaPipe `HandLandmarker` in video mode to extract landmarks with frame timestamps.
4. For each visible hand, track index fingertip, wrist, and/or palm location.
5. Smooth jitter (e.g., exponential moving average), maintain visibility/confidence checks, and avoid duplicate triggers with a **re-arm/cooldown** mechanism.
6. Map **normalized camera coordinates** into virtual instrument zones after calibration.
7. Generate a discrete `noteHit` attempt with instrument, lane, local timestamp, input mode, and event ID.
8. Render immediate local feedback, while server finalizes score.

### 5.2 Gesture mapping for first demo

| Instrument | Gesture | MVP behavior |
|---|---|---|
| Piano | Move index fingertip into one of 4 large lanes; perform downward crossing/tap motion | Trigger a note in lane 1–4 |
| Drums | Hand/fingertip strikes one of 3 large pads with downward velocity and release | Trigger kick, snare, or hi-hat |
| Mouse/keyboard backup | Click pads or press mapped keys | Equivalent input event, tagged `keyboard` or `mouse` |

**Avoid using mere fingertip presence in a region as a note hit:** without movement-edge detection and re-arming, holding a hand still will repeatedly trigger. Use down-crossing threshold + brief dwell/release or pinch state changes, and test which gesture is most robust.

### 5.3 Calibration and usability

- Display a guide: position torso/hands in frame, with decent light and no crowded background.
- Ask player to move fingertip to left and right reference targets to set comfortable interaction bounds.
- Show a hand-detected indicator, FPS/tracking quality, and current instrument zones.
- Mirror **visuals** consistently but score logical lanes independent of left/right camera flip.
- Allow users to adjust camera, choose dominant hand, retry calibration, and switch input mode.
- Never block gameplay solely because one player has a camera issue if they can choose keyboard mode.

### 5.4 Metrics

For each expected note, store:

- `targetTimeMs`, `lane`, `instrument`, `noteId`, `chartVersion`
- Actual event: `eventTimeMs`, `lane`, `inputMode`, `eventId`
- `timingErrorMs = eventTimeMs - targetTimeMs` (after clock calibration)
- `judgement`: Perfect / Good / Miss, determined using tunable windows
- Combo, note accuracy, completion and contribution to band score

**Initial tuneable judgement windows (not established scientific thresholds):** Perfect within ±80 ms; Good within ±160 ms; otherwise Miss. Camera latency should be measured and compensated per client; visually test with real laptops and adjust. Do not imply webcam timestamps offer sub-frame accuracy.

## 7. Songs, timing, and local audio

### Chart format

Use an **original, explicitly licensed** melody and simple backing track for the demo. Avoid bundling copyrighted commercial arrangements or soundfonts without a license.

```json
{
  "songId": "first-jam",
  "version": 1,
  "title": "First Jam (Original)",
  "bpm": 100,
  "durationMs": 28800,
  "countInBeats": 4,
  "tracks": {
    "piano": [
      { "id": "p1", "beat": 0, "lane": 0, "pitch": "C4" },
      { "id": "p2", "beat": 1, "lane": 1, "pitch": "E4" }
    ],
    "drums": [
      { "id": "d1", "beat": 0, "lane": 0, "sound": "kick" },
      { "id": "d2", "beat": 1, "lane": 1, "sound": "snare" }
    ]
  }
}
```

Compute note timestamps deterministically from beats and BPM, e.g. `timeMs = beat * 60000 / bpm`; account for the count-in/start offset separately. This is an *illustrative chart shape*, not a finished 30-second composition.

- Use the AudioContext/Tone.js clock to schedule sound locally.
- Unlock audio after a user gesture (browser autoplay rules).
- Share a room start timestamp and a chart ID/hash; do not stream audio between players.
- Provide a countdown and optional headphones recommendation.
- For later song sourcing, review [Mutopia](https://www.mutopiaproject.org/), checking the **individual score/arrangement and sound-sample licenses**.

## 8. Multiplayer synchronization and fairness

**Authoritative server:** Each Colyseus room has 2 players max for MVP, instrument assignments, readiness state, chart version, match state, scores, and a finalized result.

Suggested messages:

```text
client -> server: joinRoom, selectInstrument, ready,
                  calibrationInfo, hitAttempt, leaveRoom
server -> client: roomState, countdown(startAtServerMs),
                  hitJudgement, scoreUpdate, matchEnded
```

Suggested event payload:

```json
{
  "type": "hitAttempt",
  "eventId": "unique-id-per-attempt",
  "chartVersion": 1,
  "instrument": "piano",
  "lane": 2,
  "clientEventTimeMs": 123456.7,
  "inputMode": "webcam"
}
```

- Calibrate client/server clock offset using several round-trip pings; measure uncertainty.
- The server defines a future start time that leaves enough time for both clients to schedule the song locally.
- Convert client event timestamps to an estimated server timeline; enforce reasonable jitter bounds.
- Deduplicate attempts with event IDs and rate limits; prevent one note from scoring multiple times.
- Server checks expected chart/lane/timing; **never trust a client-submitted score**.
- Handle reconnects, high latency, a player leaving mid-song, and an unfinished match.
- For MVP, use tolerances and disclose cheating limitations; fully proving that a person moved their hands is not possible with a normal webcam alone.

**Design choice:** local audio/visual feedback may be immediate; official leaderboard and NFT XP use the server-confirmed result. Avoid putting on-chain transactions in real-time gameplay.

## 9. Solana NFT design

### Why use it?

A musician NFT is a wallet-owned, portable identity/collectible representing achievements. Solana provides a public record of ownership and authorized updates; the game still needs its backend and client logic. Cross-game usage is **not automatic**; another game would need to intentionally integrate this NFT/character format.

### Standard

- Use **Metaplex Core** for one NFT asset per musician.
- Store `name`, metadata `uri`, ownership, and update authority according to the Core asset model.
- Use the Core **Attributes plugin** for a small set of frequently read progression fields, all encoded as strings.
- NFT artwork and descriptive JSON can live off-chain on an appropriate storage provider.
- The update authority must be managed carefully (server-side signer/delegate or appropriate wallet-managed scheme); do not ship a privileged private key to the browser.

**Key caveat:** the Attributes plugin update supplies a **complete replacement list**, not a partial patch. Read/merge the existing attributes, serialize all desired keys, and submit the full list. The plugin is authority-managed; the owner alone cannot arbitrarily rewrite the stats.

### Example metadata JSON (off-chain)

```json
{
  "name": "SONARA Musician #001",
  "description": "An evolving musician character for SONARA",
  "image": "https://example.com/placeholder-avatar.png",
  "attributes": [
    { "trait_type": "Instrument", "value": "Piano" },
    { "trait_type": "Level", "value": 2 }
  ]
}
```

`example.com` is a placeholder, not actual hosted art. Never store video frames, face images, personally identifying data, or detailed biometric hand traces on-chain.

### Example on-chain Attributes plugin

```json
[
  { "key": "schema_version", "value": "1" },
  { "key": "musician_level", "value": "2" },
  { "key": "total_xp", "value": "150" },
  { "key": "primary_instrument", "value": "piano" },
  { "key": "songs_completed", "value": "3" },
  { "key": "best_combo", "value": "24" }
]
```

### NFT lifecycle

1. Player connects a Devnet-compatible wallet and signs an ownership/authentication challenge.
2. User opts to mint musician NFT once; artwork/metadata URI exists before minting.
3. Save the Core asset address and associate it with the authenticated wallet.
4. After a **server-finalized** completed song, award off-chain session XP (idempotent per session).
5. Queue an authenticated, authorized on-chain attribute update; handle transaction confirmation and retry.
6. UI shows the NFT, transaction signature, network, and latest confirmed fields. Do not say on-chain success until confirmed.

**Security and product decisions:** Decide whether NFT transfers are permitted, and what happens to the game account and progress if a user transfers their NFT. For the MVP, choose either non-transferable/appropriately restricted character ownership or explicitly make NFT ownership authoritative when accessing progression. Do not let the old account keep controlling a transferred asset.

### On-chain vs. off-chain

| On-chain | Off-chain |
|---|---|
| NFT asset address and owner | Webcam feed, hand landmarks (prefer no persistence) |
| NFT name and metadata URI | Per-note inputs, latency, detailed practice logs |
| Compact confirmed progression attributes | User profile, session details, leaderboard |
| Optional hash/reference to achievement record | Game engine, chart source, audio files |

Use Devnet test tokens during development; production minting and updates incur network/storage costs. Never promise free mainnet issuance.

## 10. Database and API sketch

Suggested tables:

```text
players(id, wallet_address?, nickname, created_at)
characters(id, player_id, core_asset_address?, level, xp, primary_instrument)
rooms(id, status, song_id, song_version, started_at, ended_at)
room_players(room_id, player_id, instrument, input_mode)
songs(id, version, bpm, chart_json, license, chart_hash)
sessions(id, room_id, player_id, score, perfect, good, miss, max_combo, xp_awarded, finalized_at)
chain_updates(id, session_id, asset_address, desired_attributes_json, tx_signature?, status)
```

Suggested endpoints (REST plus Colyseus):

```text
GET    /api/songs
GET    /api/profile/:wallet
POST   /api/auth/challenge
POST   /api/auth/verify
POST   /api/character/mint    (authenticated)
POST   /api/character/sync    (authenticated; idempotent)
GET    /api/sessions/:id
GET    /api/health
```

A user-controlled wallet signature is proof of wallet possession, not necessarily of real-world identity. Use rate limiting and server-side authorization. Prefer server-only management of service keys and secrets.

## 11. Suggested repository layout

```text
sonara/
  apps/
    web/
      src/
      components/
        CameraPreview.tsx
        CalibrationOverlay.tsx
        PianoInstrument.tsx
        DrumInstrument.tsx
        FallingNotes.tsx
        BandRoom.tsx
        NFTMusicianCard.tsx
      lib/
        camera/
        gestures/
        audio/
        solana/
    server/
      src/
        rooms/BandRoom.ts
        scoring/
        auth/
        chain/
  packages/
    shared/
      src/song-schema.ts
      src/game-events.ts
      src/scoring.ts
  assets/
    songs/first-jam.json
    sounds/README-licenses.md
  docs/
    ARCHITECTURE.md
    TEST-PLAN.md
  .env.example
  README.md
```

Keep `scoring.ts`, chart schemas, and event types pure and shared between client/server where useful. Server logic remains authoritative.

## 12. Implementation phases / issue checklist

### P0 — Project bootstrapping

- [ ] Initialize monorepo or simple workspace; Vite React TS frontend and self-hosted Colyseus server.
- [ ] Add formatting/linting and environment sample; do not commit private keys.
- [ ] Implement homepage, create/join room mock, and instrument choice.
- [ ] Add one original song chart and audio placeholder with documented license.

**Done when:** Both apps run locally and frontend can reach persistent game server.

### P1 — Single-player instrument proof-of-concept

- [ ] Browser camera permission, preview, and MediaPipe hand landmarks.
- [ ] Draw fingertip and interaction zones over a mirrored preview.
- [ ] Implement stable tap/down-crossing and release logic with cooldown.
- [ ] Implement piano (4 lanes), drums (3 pads), and keyboard fallback.
- [ ] Trigger local audio and show immediate hit feedback.
- [ ] Add basic calibration and camera failure states.

**Done when:** One person can reliably trigger distinct notes/pads without rapid false repeats.

### P2 — Rhythm game loop

- [ ] Parse beat-based charts; draw falling notes and a hit line.
- [ ] Add audio unlock, countdown, scheduled local playback.
- [ ] Implement Pure TS judgement function, combo and score.
- [ ] Measure end-to-end gesture latency; tune timing windows.
- [ ] Add 20–30 sec original demo song and result screen.

**Done when:** One player can complete a full song with meaningful and repeatable scoring.

### P3 — Cooperative multiplayer

- [ ] Create Colyseus rooms (max 2), ready states, instrument assignments, invite code.
- [ ] Implement clock offset measurement and scheduled room start.
- [ ] Send attempted hits; score on server; stream score updates back.
- [ ] Show both players' progress, combined band meter, and final summary.
- [ ] Test disconnects, reconnects, duplicated events, and latency.

**Done when:** Two laptops complete the same song together and see matching official results.

### P4 — Solana integration

- [ ] Connect Devnet wallet; message-signature authentication.
- [ ] Create Metaplex Core musician NFT with off-chain artwork/metadata.
- [ ] Add compact Attributes plugin for level, XP, songs completed, combo.
- [ ] Award XP once per server-finalized session (idempotent).
- [ ] Update full on-chain attribute list with authorized server signer.
- [ ] Read asset state back from Solana; display verified transaction link.
- [ ] Handle failed/queued transactions; no duplicate XP or misleading success labels.

**Done when:** Player completes song and sees NFT level/XP update independently verifiable on Devnet.

### P5 — Judge-ready polish

- [ ] First-run tutorial with lighting/calibration tips.
- [ ] Accessibility input switch and clear webcam privacy notice.
- [ ] Friendly character art and stage UI (2D is enough).
- [ ] Demo seed users/test wallets and restartable sample session.
- [ ] Record fallback demo video and prepare a short live walkthrough.
- [ ] Verify real two-machine test, HTTPS permissions, audio unlock and server uptime.

## 13. Acceptance criteria and testing

- **Controls:** each virtual lane/pad can trigger independently; stationary hand does not auto-repeat indefinitely.
- **Timing:** score calculation is deterministic in automated tests for exactly-on-window, just-outside-window, duplicate event and miss cases.
- **Multiplayer:** 2 machines in different networks can join, start, score and finish with consistent final results.
- **Robustness:** denied camera permission, missing camera, low tracking confidence, room disconnect and wallet rejection have usable fallbacks.
- **Security:** server rejects wrong chart/lane, duplicate event IDs, events outside plausible time bounds, unauthenticated NFT mutations.
- **Solana:** a single connected user mints only one character within the configured identity policy; updates are confirmed and reread before claiming success.
- **Privacy:** video stays in the browser for local inference; no uploads or recording without explicit opt-in.

## 14. Major risks and mitigations

| Risk | Mitigation |
|---|---|
| Webcam gesture false positives | Calibrate, smooth, detect crossing + release; have keyboard fallback |
| High inference delay / low FPS | Reduce input resolution, sample at sustainable rate, use worker if feasible |
| Cross-player timing drift | Server start time, offset estimation, local audio clocks, relaxed scoring windows |
| Browser autoplay restrictions | User click/tap to unlock audio before countdown |
| Different lighting/camera setups | Visible tracking status and easy recalibration |
| Cheating / spoofed gestures | Server-side input validation; no claims of real-world skill certification |
| NFT transfer vs linked game account | Define ownership and account-linking policy before production |
| On-chain cost or failed transactions | Devnet first, small attributes, batched updates, retries/idempotency |
| Dependency license restrictions | Review licenses before copying code/assets; document third-party attribution |
| MVP scope creep | No 3D avatars, no real instrument detection, no marketplace or voice chat |

## 15. Open-source and documentation references

**Technical documentation (reviewed for initial design):**

- [Google MediaPipe Hand Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
- [Tone.js](https://github.com/Tonejs/Tone.js)
- [Colyseus Rooms](https://docs.colyseus.io/room)
- [Colyseus State Synchronization](https://docs.colyseus.io/state)
- [Metaplex Core Attributes Plugin](https://www.metaplex.com/docs/smart-contracts/core/plugins/attribute)
- [Metaplex Core Plugin Updates](https://www.metaplex.com/docs/smart-contracts/core/plugins/update-plugins)
- [Solana Documentation](https://solana.com/docs)

**Inspiration / repositories to evaluate, not assumed usable as dependencies:**

- [AirKeys](https://github.com/solomonake/airkeys) — webcam falling-notes piano reference
- [Air Instruments Pro](https://github.com/Vaygunbruh/air_intrument_uselessproj) — gesture-controlled virtual instrument inspiration
- [Midi Gestures](https://github.com/Otto-maton/Midi-Gestures) — gesture-to-MIDI approach
- [Mutopia Project](https://www.mutopiaproject.org/) — licensing varies by musical work/arrangement

Review maintenance status, actual implementation and license of each project before incorporation. Do not assume these repos are production-ready.

## 16. First development session — exact priorities

1. Create Vite React TypeScript app and add MediaPipe Tasks Vision.
2. Implement webcam permission and a live mirrored camera element.
3. Overlay 4 large piano lanes and display live index fingertip positions.
4. Detect intentional downward crossing into a lane and play a Tone.js piano note (with re-arm logic).
5. Log each hit event and visualize tracking FPS/latency.
6. Test on the target laptop's built-in webcam, in different lighting conditions.

**First milestone:** A webcam-controlled, four-key virtual piano that plays discrete notes consistently. This validates the hardest input interaction before multiplayer or NFTs.

---

## 17. Short hackathon pitch

> SONARA turns any webcam into a musical instrument. Friends can join a shared stage, follow falling notes, and perform together without owning a piano or drums. Every completed song earns progression for a musician character they own as a Solana NFT. It's a beginner-friendly, multiplayer rhythm game where your hands are the controller and your character grows with your practice.


## Free/open-source acceptance gates (mandatory before demo)

- [ ] `npm install` / `pnpm install` works without any paid key, account, or proprietary SDK.
- [ ] All inference runs on-device; no video/frame upload and no remote AI endpoint is required.
- [ ] All models, sound assets, fonts, samples, code and music have recorded licenses in `THIRD_PARTY_NOTICES.md` or `assets/sounds/README-licenses.md`.
- [ ] Frontend and multiplayer server run with local commands; SQLite initializes without cloud credentials.
- [ ] Two clients can play together on the same LAN with no paid infrastructure.
- [ ] A player can join and play without wallet or crypto funds; NFT mint/update works separately on Devnet using free test SOL, subject to faucet limits.
- [ ] The app still functions (except remote multiplayer/Devnet operations) if third-party online services become unavailable, once dependencies are installed and assets cached.
- [ ] No app subscription, paid model API, Colyseus Cloud, Supabase hosted plan, Vercel dependency, or paid music content is needed.
- [ ] `README.md` explains that public hosting and mainnet transactions are **not guaranteed free**.

### Free-first local startup sketch (commands to refine during implementation)

```bash
# On your laptop, after setting up the monorepo:
pnpm install
pnpm dev             # web client + self-hosted game server, as defined in package scripts
# Configure the client to connect to local WebSocket server.
# Test NFT minting/updating only on Solana Devnet.
```

These are target developer-experience commands, not claims that a working repository already exists.


## 18. Codex kickoff instructions (first implementation pass)

Open the folder containing this `SONARA.md` in Codex, and give Codex the following request:

> Read `SONARA.md` fully. Implement **only Phase 1 / the first milestone**: a free/open-source, laptop-first Vite + React + TypeScript app with webcam permission, local MediaPipe hand tracking, a mirrored preview, four on-screen piano lanes, intentional fingertip-tap detection with cooldown/re-arm, and audio generated with Tone.js. No paid APIs, no hosting dependency, no Solana integration, and no multiplayer yet. Use actual locally served WASM/model assets. Add a README with exact setup/run instructions and a brief troubleshooting section. Run typecheck/build and fix errors. Preserve a clean modular architecture so later phases can add rhythm scoring, multiplayer and Solana. Do not claim camera tracking works unless it has actually been tested in a browser; identify remaining manual tests.

**First run on the laptop:** Install Node.js (LTS) and optionally pnpm, create/open an empty `sonara` folder, put `SONARA.md` inside it, open that folder in Codex, and submit the request above. To test in the browser, run the install/dev commands Codex documents and allow camera access on `localhost`. Review commands and code changes before running anything that you do not recognize.

**Do not skip the milestone gate:** First prove clean repeated taps of four virtual keys without accidental retriggering; only then move to falling notes, a second instrument, online multiplayer and NFT updates.
