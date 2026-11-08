# SONARA

A doodle-style webcam music studio with piano, drums, violin, saxophone, multiplayer room codes, and optional Solana Devnet collectibles and performance receipts.

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

MediaPipe provides local pretrained hand detection. Practice coaching is rule-based. Wallet-approved Devnet minting/claiming still requires human end-to-end verification. Private signing keys, dependencies, build output, and local preview screenshots are excluded from version control.

## Hosted deployment

Deploy the complete Node + WebSocket app using the root [Render blueprint](render.yaml). See [deployment steps and free-tier limits](sonara/docs/DEPLOY.md). Static-only hosting is insufficient for multiplayer.
