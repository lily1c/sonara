# SONARA — your air studio

**[Play the live demo](https://sonara-gby7.onrender.com/) · [Source](https://github.com/lily1c/sonara)**

Play music with your hands, practice a song alone, or form a band with friends. SONARA is a doodle-style browser rhythm game with local AI hand tracking, four instruments, room codes, personalized concert posters and Solana Devnet musician progression. Keyboard and touch work without a webcam. No wallet is required to play.

## Play a complete session

1. Choose **Solo studio** or **Play together**, then piano, drums, violin or saxophone.
2. Enable audio. Optionally start the camera and follow the instrument's hand guide. A/S/D/F and on-screen pads provide backup controls.
3. In solo, choose a song and finish the countdown and take. In a band, share the room code with up to three friends, choose different instruments, ready up and start together.
4. Review Perfect/Good/Miss results and practice coaching. Download a personalized doodle SVG poster.
5. Solo players earn local practice rewards. Eligible band players can claim verified Solana Devnet XP and refresh their wallet-owned musician profile.

Render Free can take about a minute to wake. Camera access requires HTTPS or localhost. Shared room previews are optional, low-rate JPEGs, not full video calls.

## Solo rewards

Finish a full song with **at least four Perfect or Good hits** to earn `10 + floor(performance / 10)` practice XP, up to 20 per qualifying take. Free play, aborted takes and takes with fewer than four timed hits award no XP. Repeated finalization of the same take does not award again.

| Reward | Requirement |
| --- | --- |
| First Notes title and badge | First qualifying take |
| Rhythm Keeper title | 60 practice XP |
| Solo Star title | 120 practice XP |
| High Note badge | 80% performance on a qualifying take |
| Instrument Explorer badge | Qualify on all four instruments |
| Song Collector badge | Qualify on three different songs |

Open **Achievements** anytime, or see the rewards card after a solo take. Progress saves in this browser's local storage. If storage is blocked, progress lasts for the current visit and the UI explains this. Clearing browser data removes it. This is editable local practice progress, separate from verified Solana XP. Solo rewards have no token or cash value and do not mint an NFT.

## How SONARA uses Solana

The deployed native Rust achievement program runs on **Solana Devnet**:

`7R9eJmdmfHU3CRGBESH57CV4yFdy3rG73EkxGv5bPsp6`

[Inspect the program on Explorer](https://explorer.solana.com/address/7R9eJmdmfHU3CRGBESH57CV4yFdy3rG73EkxGv5bPsp6?cluster=devnet).

- **Wallet-owned profile PDA:** tracks verified XP, session count, best performance and First Band status. Titles and doodle looks derive from this account.
- **Signed game results:** the room server scores a completed take and signs a wallet-bound voucher after authenticating wallet control. Qualifying band takes require 2–4 connected players, at least two instruments and four timed hits per player.
- **Program verification:** the claim transaction verifies the configured issuer's Ed25519 signature and wallet signer. A permanent wallet/session claim PDA prevents duplicate XP. Every accepted claim awards 10–20 XP.
- **Visible proof:** players can inspect the confirmed claim/profile on Explorer and download a signed receipt. On-chain claims are program accounts, not achievement NFTs.
- **Optional collectible:** the Musician panel provides a separate Metaplex Core Devnet collectible. Its owner-managed traits are separate from earned program XP.

Use an extension-enabled Solana wallet such as Phantom and free test SOL. The game uses no mainnet funds. Claims expose the wallet, song, instrument and score publicly. Complete claims before leaving the room or starting another take. Vouchers expire after seven days; UI proof-file import is not implemented.

The server remains trusted for musical scoring. The program verifies authorization and uniqueness, not human play or camera authenticity. Solo songs now use a private server-scored session. Complete a song with four timed hits to unlock First Solo and claim 10–20 verified XP with your wallet. First Solo and First Band share the musician profile, while First Band remains exclusive to qualifying multiplayer takes. Solo songs require the room server connection. See [program accounts and verification](docs/PROGRAM.md), [wallet setup](docs/SOLANA.md) and [demo steps](docs/DEMO.md).

## AI, cost and privacy

MediaPipe Tasks Vision runs a pretrained hand-landmark model locally in the browser. Practice coaching is rule-based. The app sends no prompts to OpenAI, Gemini or another hosted generative model and requires **no paid AI credits**. Tone.js synthesizes piano/drums and plays local CC0 violin/saxophone samples.

Camera video and landmarks stay on-device unless a player explicitly shares a composited room preview. Room members receive those ephemeral previews and discrete instrument events. The server does not record video. The app never requests a microphone. Local tracking assets and fonts avoid runtime CDN dependencies.

## Run locally

Use **Node.js 22.x** and npm:

```sh
cd sonara
npm ci
npm run dev
```

Open the URL Vite prints. The same server provides the app and `/room` WebSocket service. Both band players must open the same host URL. Remote webcam access needs trusted HTTPS. Do not bypass certificate warnings.

```sh
npm test
npm run build
npm start
```

Production defaults to port 4173 and supports `PORT`. `npm run preview` is a static preview, without multiplayer. The root `render.yaml` deploys the complete service. See [deployment](docs/DEPLOY.md). If tracking assets need refreshing, run `npm run assets` once with internet access. Public browser RPC configuration is in `.env.example`; never put signing secrets in `VITE_` variables. Server issuer configuration is documented in [Solana setup](docs/SOLANA.md).

## Controls and troubleshooting

Piano/drums use downward fingertip crossings and lift-to-rearm. Violin uses a holding hand and sideways bow motion. Saxophone has its own pose guide. Hold an open palm still in the top selection strip, then swipe to change instruments during free play. Instrument selection stays locked during active takes.

If the camera fails, use keyboard/touch and check HTTPS, browser permissions and other camera apps. If sound is silent, interact with a key, check volume and retry. If rooms fail, confirm both devices use the same reachable host and that the proxy supports WebSockets. A code alone cannot expose a private laptop to the internet.

## Release limits and validation

This is a playable hackathon release. Rooms and unclaimed results live in server memory and reset on restart. Solo rewards belong to a browser, with no account sync or competitive anti-cheat. Confirmed Devnet profiles persist subject to Devnet resets. The program remains upgradeable and has no formal mainnet audit. Sponsored fees, extension-free wallets, microphone streaming, automatic song recognition and a persistent leaderboard are not implemented.

Automated checks cover gesture/scoring logic, reward eligibility, receipts, program wire formats, deployment rules and real WebSocket room flows. Full room tests require permission to bind localhost. Human camera/audio behavior, two-device play and wallet approvals still require a manual check on the demo devices. Existing dependency audit findings are documented in SOLANA.md.

[Demo guide](docs/DEMO.md) · [Song provenance](docs/SONGS.md) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [MIT license](LICENSE)
