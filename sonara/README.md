# SONARA — air studio

A local, free and open-source webcam instrument built with React, Vite, TypeScript, MediaPipe Tasks Vision and Tone.js. Eight-note melodic instruments plus a four-pad drum kit; violin and saxophone use local CC0 recordings. No account or wallet is required to play. No microphone, paid API or hosted inference. An optional Solana Devnet musician drawer is available. Two-player mode uses a self-hosted WebSocket room server.

## Setup and run

Install Node.js 22 LTS or newer (with npm), then open a terminal:

```sh
cd "/Users/assabasova/Documents/ChatGPT/Solana hack/sonara"
npm ci
npm run dev
```

Open the localhost URL printed by Vite (normally http://127.0.0.1:5173). Click **Start camera & audio**, allow webcam permission, and bring your hands into view. Stop the server with Ctrl+C.

The development session used a temporary Node runtime because Node was not on PATH. While it remains available, this also starts the app:

```sh
PATH=/tmp/sonara-node/node-v22.16.0-darwin-arm64/bin:$PATH npm run dev
```

## Play

- Raise an index fingertip above a colored lane’s line, then move down through it. Raise it clearly above the line to re-arm. Stationary fingers do not repeat.
- The preview, landmarks and lane mapping use the same mirrored coordinates.
- Adjust lane width and tap line to fit your comfortable reach. Reset playing space restores defaults and gesture state.
- Press **A S D F**, click/touch a piano key, or focus a key and press Enter/Space. These work with the camera off. Held keyboard keys do not repeat.
- **Stop camera** releases camera tracks and the hand-tracking instance. Camera permission and audio activation only occur after interaction.
- Note events remain in memory: the five latest inputs, total count, tracking FPS and inference duration are shown. Inference duration is not end-to-end latency.

## Local model assets

`public/mediapipe/hand_landmarker.task` and `public/mediapipe/wasm/` are served from this app. No CDN is used at runtime. After installation and asset setup the app runs without external services. To refresh assets after changing the MediaPipe dependency:

```sh
npm run assets
```

This setup command requires internet once, copies WASM from the installed package and downloads Google’s version-1 float16 hand landmarker. Keep the local assets with deployments. See THIRD_PARTY_NOTICES.md for provenance and licenses. Video and landmarks stay local unless you explicitly enable camera sharing in a room. Shared previews include the drawn landmarks and are relayed ephemerally to room members; no recording is implemented. Instrument hit events are shared for remote synthesis; microphones are never requested. No analytics or external fonts are included.

## Checks

```sh
npm test
npm run build
npm run preview
```

Tests exercise all four lane mappings, release/re-arm, held-finger suppression, bounds and tracking gaps. Build performs strict TypeScript checking and generates `dist/` including local tracking assets.

### Manual milestone gate (still required)

Browser UI was checked: clicking each of the four keys produced exactly four distinct note events and activated audio. Real webcam tracking and audible output have **not** been verified in this development session. Before calling the milestone validated:

1. In desktop Chrome/Edge, allow camera and confirm mirrored preview and all hand landmarks align.
2. Make ten separated taps in each lane, check correct notes and one event per tap; hold a finger below the line and confirm no repeats.
3. Lift to re-arm; test two hands, different lighting, tracking loss/reappearance and comfortable lane bounds.
4. Deny permission, retry, stop/restart and verify the camera indicator turns off. Confirm A/S/D/F and mouse controls still work.
5. Check audio after explicit interaction, headset output, mute settings and no duplicated input when holding keys.
6. With assets loaded and the server running, disconnect internet; verify the instrument still works and browser network tools show no external inference requests.

## Troubleshooting

- **npm: command not found:** install Node.js LTS and reopen your terminal. The temporary runtime above is a session convenience, not a permanent installation.
- **Camera denied or unavailable:** allow camera in browser settings, close other camera apps and retry. Keyboard/mouse mode remains available.
- **Camera API unavailable:** use localhost or HTTPS. Remote plain HTTP does not support camera permission.
- **Model/WASM error:** run `npm ci` and `npm run assets`; check local `/mediapipe/` requests in browser developer tools.
- **No sound:** click a piano key, check system/browser volume and audio output. Piano and drums are synthesized; violin recordings load from local /samples/violin/.
- **Slow tracking:** use good lighting, close heavy tabs and keep hands visible. CPU inference runs synchronously; FPS and inference duration reveal performance limits. A worker is a future optimization.
- **Accidental taps:** widen your playing space, move the line and use deliberate lifts. Hand identity uses MediaPipe handedness; overlapping/crossed hands can confuse tracking.

## Structure and scope

`src/lib/gestures.ts` is pure gesture logic, `src/lib/audio.ts` owns synthesis, and `src/App.tsx` owns camera lifecycle and UI. `SONARA.md` preserves the full supplied roadmap. The instrument sandbox now also includes a first cooperative piano-and-drums lesson with room codes, falling notes and server-confirmed scoring. Persistence, wallets and Solana are not implemented. Synthesized audio approximates an instrument rather than an acoustic piano.

MIT project code; see LICENSE and THIRD_PARTY_NOTICES.md. Local use needs no paid service. Public hosting and future mainnet transactions are not guaranteed free.

## Three instruments and pose guides

- **Piano:** four lanes, downward index-finger crossing, lift to re-arm.
- **Drums:** round kick, snare, hi-hat and tom heads in a kit layout. Strike your index fingertip downward through a head’s center, then lift above its rim. Empty space between drums does not trigger a hit. Width and tap-line controls move the kit and its hit geometry together. Click a drum drawing or use A/S/D/F as backup.
- **Violin:** real CC0 solo violin recordings from VSCO 2 CE, played through Tone.Sampler. This does not detect real violin technique. Keep one palm inside the green holding-hand ring. Move your other palm sideways through the colored bow track. Reach maps to G3, D4, A4 and E5; continued movement sustains the tone, stopping or losing either hand releases it. The guide and detection can be mirrored using **Holding hand (on screen)**. Hold no actual stick or instrument; keep both hands visible. A/S/D/F and buttons play short backup notes. Tap-spacing and width/line sliders affect piano/drums, not this fixed violin pose guide.

To browse instruments, hold an open palm still in the top strip for about 0.65 seconds until it says **Ready**, then swipe sideways by about one third of the preview width. Right advances piano → drums → violin; left goes backward. Return your hand to the playing area. A switch cooldown prevents multiple selections. A palm flip or an immediate swipe without a stationary hold does not select. Instrument buttons remain available. No clap gesture is implemented.

Gesture tests cover piano release, slow motion, deliberate selection hold, dropped tracking, drum geometry and held-finger suppression, violin two-hand requirements, bow reach, stopping, tracking loss and mirrored hand choice. Real hand recognition, comfortable pose and sound quality still need manual testing on the target laptop.

## Violin audio quality

The initial sawtooth placeholder has been replaced by local multisampled solo violin recordings (VSCO 2 CE, CC0). Four root recordings are peak normalized to -3 dBFS; D4 uses sample repitching. Playback adds a short attack/release, subtle room reverb, gentle EQ and an output limiter. Adjust Volume to your speakers. Sample loading failures show an error and can be retried through the Violin button; piano and drums load independently.

Bow changes release the previous sample before starting the next, with a short overlap. Gesture note zones have a small hysteresis band and a 220 ms movement grace period to reduce chatter. Samples last roughly 14–18 seconds; these are natural recorded sustains, not infinitely looped tones. Stop/restart your bow to re-articulate a long held note. One velocity layer and four roots are a quality step, not a full professional sample instrument. Real speaker/headphone listening and webcam tuning are still required.

The song-recognition/play-along vision is recorded in `docs/PLAY_ALONG_VISION.md`; recognition, song imports and tutorials are not implemented yet.

## Two-player rooms — First Jam

Run `npm ci` then `npm run dev` on one host laptop. This starts Vite and the WebSocket room service on **the same port** (5173). The server listens on your local network. Do not run a separate server on the second device: both players must open the same host URL.

1. On the host, open http://127.0.0.1:5173, enter your name and choose **Create room**. Clock sampling takes about 1.5 seconds before the room appears.
2. On the other device connected to the same Wi-Fi, open the **Network URL printed by Vite**. During this session it was http://10.93.21.30:5173, but your IP can change. Enter a name and the six-character room code, then choose **Join room**.
3. The creator plays piano; the joining player plays drums. Violin stays available in solo mode. Room roles are locked so swipes do not change the assigned part.
4. Both click **Enable sound & ready**. The creator can choose 60, 80 or 100 BPM; changing tempo clears readiness. When both are ready the creator chooses **Start together**.
5. A shared five-second countdown and audio count-in precede the original lesson. Tap A/S/D/F, the touch pads directly below the falling notes, or use the webcam instrument. Each client plays its local part and a quiet original bass accompaniment.
6. Both see the same finalized band score and per-player Perfect/Good/Miss totals. Ready up again for another take. Room results are in memory and reset when the server restarts.

**First Jam** is an original 32-beat composition/chart distributed with the MIT project. At 80 BPM it runs 24 seconds (32 seconds at 60, 19.2 seconds at 100), plus countdown and finalization. Both roles have 16 notes. Perfect is ±110 ms, Good ±220 ms. Camera latency is not automatically calibrated yet, and these are practice windows rather than precision skill measurements.

### HTTPS and actual devices

A private-network URL over plain HTTP supports room codes, audio and keyboard/touch controls. Browsers require **trusted HTTPS** for webcam access from the second device; localhost on the host laptop is an exception. A code alone does not make your laptop reachable from another network. Wi-Fi client isolation, a firewall or VPN can also prevent access.

For webcam tests across your LAN, serve with a certificate trusted by **both** devices. One approach is mkcert: install its local CA on the host, issue a certificate containing the host LAN IP, then explicitly install/trust that CA on the second device. Keep the CA private key on the host; do not share it. No certificate warning should be bypassed. SONARA can read existing trusted certificates through `SONARA_TLS_CERT` and `SONARA_TLS_KEY` environment variables (see below).

For public tests use a reachable host and a trusted HTTPS reverse proxy with WebSocket upgrade support. Build and run the production server:

```sh
npm run build
npm start
# HTTP server on 0.0.0.0:4173, /room WebSocket endpoint, /health readiness endpoint.
# Set PORT to change the port. Put this behind HTTPS for public use.
```

An example Caddy reverse-proxy configuration is in `docs/Caddyfile.example`. Domain/DNS/HTTPS setup depends on your host. Public hosting is not guaranteed free. `npm run preview` is only a static preview and does not run room services; use `npm start` for production multiplayer.

### Connection handling and limits

Four seats maximum per room; at least two connected ready players are required to start. A dropped connection reserves its seat for 45 seconds and the app retries briefly using a token stored in that tab’s session storage. A take interrupted by disconnection is never called completed; both ready up again after reconnecting. Deliberate Leave removes the player immediately and promotes the remaining player to host. Old/empty rooms expire. Server restarts lose room codes; create a new one.

Only room state and discrete note attempts go over WebSocket. Camera video and landmarks stay on-device unless you explicitly share your composited camera preview with the room. The server assigns start times and validates chart/role/lane/timestamp/event IDs, rate-limits inputs and computes the score. It does not prove webcam authenticity or provide competitive anti-cheat. There is no microphone audio streaming or persistent leaderboard, wallet, NFT or XP award.

Tests include real WebSocket clients joining, full-room rejection, shared start/result state, authoritative scoring and duplicate suppression, interruption and token reconnection. Socket tests require permission to bind a localhost port in restricted environments. Browser tests do not substitute for an actual two-device/network/webcam test.

With existing trusted certificate/key files, start LAN HTTPS like this:

```sh
SONARA_TLS_CERT=/absolute/path/sonara-cert.pem SONARA_TLS_KEY=/absolute/path/sonara-key.pem npm run dev
```

Open `https://<host-LAN-IP>:5173` on both devices; that IP must be included in the certificate. Keep certificates/keys outside version control.

Invite links opened from localhost use a detected LAN address (preferring en0). If your host has multiple interfaces/VPNs, check the address before sharing. Set `SONARA_PUBLIC_URL=https://your-domain.example` on the server to advertise a specific origin behind a proxy. This does not configure hosting or HTTPS by itself.

## Focused interface

The header separates Solo studio from Play together. Room entry shows one create/join form at a time; invite links preselect Join and fill the code. Once connected, the lobby explains the next action, and Start appears only when both musicians are ready. On laptop screens the lesson and camera are side by side; touch pads sit directly below falling notes. Help, camera/audio settings and solo session logs are collapsed by default. Room roles remain fixed. On narrow screens the camera stacks below the touch-first lesson. Switching from solo into room setup stops an active camera so it does not keep running behind the entry form.

## Camera-first stage

The camera is now the main surface in Solo studio and Play together. Room entry and readiness sit beside it on laptops; the camera remains visible while creating/joining. During First Jam, note prompts are rendered directly over the mirrored camera: piano notes arrive at the calibrated lane/tap-line coordinates, and drum notes arrive at their actual drum-head centers. There is no separate falling-note board to watch. Score, time and countdown are on the camera. On narrow displays the camera comes first and room controls follow below. Preview and overlays share the camera’s actual aspect ratio so targets are not cropped away. Webcam-free keyboard/touch play still shows the same overlay lesson with a small camera-start action.

## See and hear your band

Rooms now support up to four performers. Up to three partner tiles appear above the main instrument camera. Piano/drum roles alternate as players join; additional players use the same chart for their assigned part.

Click **Share my camera with band** to start camera tracking and opt into sharing a mirrored preview with landmarks. Stop sharing leaves your local camera running; Stop camera ends tracking and sharing. Leaving/changing rooms resets sharing consent. Previews are 320 pixels wide, JPEG, about 3–4 updates/second. This lightweight preview is not a full-rate Zoom-style video call. The server relays frames only to connected members of the same room, rate-limits them, and does not store frames. Tracking counts are included; raw landmark arrays are not sent. Stale/offline cameras show a placeholder rather than an old frozen image.

Click **Hear my band** to unlock partner instrument sound; Ready also enables it. Each partner's note/pad events are relayed and synthesized locally, including lobby practice. Your own hit is not echoed back. Mute affects partner instruments only. There is no microphone request or voice chat. Playback follows network arrival and is not latency-compensated; cross-device timing and subjective audio still need real device testing.

### Join live band on each computer

In a room, **Join live band · camera + sound** explicitly opts into sharing the composited camera and unlocks partner instrument audio in one click. The camera-start button in a room does the same; solo camera use remains private. Each performer must do this on their own device. A server acknowledgment confirms outgoing previews are reaching the server; remote tiles show recent note names even when muted. **Hear my band** still enables sound without requiring a webcam. Microphones are never requested.

## Doodle jam extras

Hits produce blue ink-ring bursts at their instrument target; drum heads wobble and violin note changes leave a drawn bow swoosh. Partner doodle musicians bounce on incoming notes. Send nice/star/applause reactions from the performer strip; reactions stay within the room and are rate limited. Motion is reduced when the browser requests reduced motion.

**Practice groove** in the stage toolbar toggles an original 72 BPM synthesized bass/percussion backing on your device. It is not broadcast or room-synchronized, does not generate score inputs, and stops automatically when a lesson starts. After a completed First Jam, **Keep your concert poster** downloads an original SVG with player names, instruments and the server-confirmed band score. No camera images are included in the poster.

## Start, choose, play, finish

The app now opens at START → Solo/Multiplayer → an instrument dock → the camera studio. Hover magnifies the dock icons and their neighbors; arrow keys, click and scrolling can select an instrument. No camera is requested during setup. Main menu stops camera/sharing, sustained sounds, practice groove and the current solo take, and leaves the room.

Solo offers free play or Start First Jam. The lesson has a five-second count-in, the original 32-beat chart (32 seconds at the default gentle 60 BPM), timing feedback, a round-over summary, Play again, Free play and poster export. Ending a take returns to practice without claiming completion. Instruments are locked during a solo take.

Multiplayer preserves the chosen instrument when creating/joining. Players can select piano, drums, violin or saxophone in the lobby; changing instrument clears their Ready state. All players must be ready before the host starts. The shared chart is version first-jam-v2, and melodic parts use eight notes. Remote audio loads the actual chosen instruments.

### More expressive controls

- Piano: eight lanes C4 D4 E4 F4 G4 A4 B4 C5. Downward fingertip taps; keyboard A S D F G H J K.
- Drums: kick, snare, hi-hat and tom, A S D F. Strike their drawn centers and lift to re-arm.
- Violin: eight bow-reach zones G3 A3 B3 C4 D4 E4 F4 G4, with the holding hand in its ring. Continuous bow movement produces a blue ribbon trail, stars and note sparks.
- Saxophone: two hand rings, upper at neck height and lower on the body. All ten fingertips and joints are tracked locally. Curl lower thumb to sound/release it to stop; six main fingers lower the pitch in groups, pinkies lower further, upper thumb raises the register. C3 D3 E3 G3 / C4 D4 E4 G4. A S D F G H J K provides backup. This is a beginner air-sax mapping, not authentic acoustic sax fingering or breath detection. Use bare hands; no mouth tracking or microphone.

Open fingertips appear cyan; curled fingertips amber; T/I/M/R/P identify thumb/index/middle/ring/pinky. Finger-state hysteresis and a 110 ms stable sax-note period reduce chatter. Losing a hand or leaving its pose releases the sax. Exact gesture comfort and acoustic quality still require real-camera/headphone testing. Notes are natural finite recorded sustains (roughly 6–9 seconds for sax); release/repress the gate to re-articulate.

Hit feedback now includes expanding double ink rings, colored scattering strokes, floating notes, star accents and a live bow ribbon. Reduced-motion preferences suppress movement.

### Saxophone comfort fix

Both hands can now be anywhere comfortably in frame (one higher than the other); the drawn rings are posture suggestions rather than strict hit gates. The lower-thumb sound gate was removed: holding both visible hands starts the tone after a short stable period. Lower thumb now adds a low key. Move either hand out of view to stop. High hands are no longer filtered out, and identical MediaPipe handedness labels cannot block two-hand detection. Sax mode does not use palm swipes to switch instruments. The on-screen status shows how many hands are detected.

## Solana Devnet musician

Open **Musician · Devnet** in the header to connect a Wallet Standard Solana wallet, mint a Metaplex Core musician, inspect confirmed ownership/traits, and sign a test counter update. Use a browser with your wallet extension enabled and free Devnet test SOL. Each transaction needs your own wallet approval. This is an owner-managed demo; earned XP is not implemented. See [Solana setup and verification](docs/SOLANA.md) for exact steps, RPC configuration, temporary metadata hosting, and limitations.

Completed multiplayer takes now show individual timing results and a **First Band** achievement claim. Play different instruments and hit at least four notes each. The room server signs a wallet-bound receipt, which you can record with a Devnet Memo transaction and download as proof. This is separate from the musician NFT's editable demo counter. Claim before leaving/restarting the room. Preserve the private `.sonara-data` issuer directory across server deployments. See docs/SOLANA.md for trust, privacy and duplicate-record limitations.

## Final demo release

Solo starts at a gentle 60 BPM. Results give practice feedback from measured early/late hits and missed targets, with a suggested 60/80/100 BPM retry. This feedback is rule-based, not generative AI. MediaPipe provides pretrained hand-detection AI. Wallet features fail independently of the studio. Achievement records can be rechecked from Devnet after reload, verifying success, wallet signer and exact receipt bytes rather than trusting the browser cache.

See [demo script and release status](docs/DEMO.md) before presenting. Run `npm test` and `npm run build` for the release checks.
