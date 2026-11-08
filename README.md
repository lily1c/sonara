# SONARA

**Live game: https://sonara-gby7.onrender.com/**

Hosted on Render Free; an idle service can take about a minute to wake.

A doodle-style webcam music studio with piano, drums, violin, saxophone, multiplayer room codes, and Solana Devnet musician profiles, program-verified achievements, optional collectibles, and saved solo practice rewards.

The application lives in [`sonara/`](sonara/).

```sh
cd sonara
npm ci
npm run dev
```

Use Node.js 22 or newer. For production: `npm run build` then `npm start`. Remote webcam use requires HTTPS.

- [Setup and controls](sonara/README.md)
- [Demo guide and honest release limitations](sonara/docs/DEMO.md)
- [Solana setup and verification](sonara/docs/SOLANA.md)
- [Third-party notices](sonara/THIRD_PARTY_NOTICES.md)
- [MIT license](sonara/LICENSE)

MediaPipe provides local pretrained hand detection. Practice coaching is rule-based. The native achievement program is deployed on Devnet; it verifies signed game results and prevents duplicate XP. Human Phantom approval and optional NFT minting remain separate UI checks. Private signing keys, dependencies, build output, and local preview screenshots are excluded from version control.

## Hosted deployment

Deploy the complete Node + WebSocket app using the root [Render blueprint](render.yaml). See [deployment steps and free-tier limits](sonara/docs/DEPLOY.md). Static-only hosting is insufficient for multiplayer.

- [Deployed achievement program and account format](sonara/docs/PROGRAM.md)

## Solo and band rewards

Solo players earn browser-local practice XP, titles and badges after completed songs with at least four timed hits. Eligible multiplayer takes earn separate program-verified Solana Devnet XP through wallet-approved claims. No paid AI credits are required. See the [current product README](sonara/README.md) for reward rules, controls and release limits.
