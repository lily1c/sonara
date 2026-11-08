# SONARA demo release

## A two-minute presentation

“SONARA is a webcam band studio. MediaPipe AI turns hand movements into playable instruments, and Solana lets musicians own a character and record signed band achievements.”

1. Press Start, choose Solo and piano. Start the camera yourself; keep your hand well lit. Raise an index finger and tap down through a target. Use A S D F G H J K if tracking is difficult.
2. Switch to drums, violin or saxophone to show each instrument's guide. Sax requires both hands visible; curl fingers to change pitch. Stop camera to release it.
3. For the strongest demo, prepare two browsers/devices on the same public HTTPS game beforehand. Choose Band, create a room, share its code, and join from the other device. Choose different instruments.
4. Both players explicitly join live camera + sound. Confirm you see the partner preview and hear a test note. Both click Ready; the host starts the take. Hit at least four notes each. Keyboard/touch input is valid.
5. Results show timing, individual scores, streaks and practice advice. Qualifying takes offer First Band. In an extension-enabled browser, connect a wallet with free Devnet SOL. Approve the authentication message and Memo transaction yourself. Open Explorer and verify the receipt.
6. Optionally show the musician panel: mint/read a Metaplex Core musician collectible. Describe its editable counter as a signing demo, not earned XP.

## What is shipped

- Four playable instruments; local MediaPipe inference and local recorded/synthesized sounds.
- Start/mode/instrument selection, magnifying doodle dock and camera-centered stage.
- Up to four players, room codes, explicit low-frame-rate preview sharing with landmark overlays, partner instrument events rendered as sound, readiness/countdown and server scoring.
- Solo/band results, poster export, timing-based practice feedback and gentler solo retries.
- Wallet Standard integration, Metaplex Core musician demo, server-signed band receipt and Devnet Memo recording/readback.
- Loading/error fallbacks, reconnect handling and keyboard/touch alternatives.

## Accurate limits

This is a hackathon demo, not a production service. Camera tracking needs human testing on the target hardware. The coding agent has not completed a real wallet-approved mint or achievement transaction. Do not claim mainnet deployment, a custom deployed Anchor program, sponsored fees, extension-free wallet login, AI song recognition, generative coaching, verified human play, or achievement NFTs. On-chain receipts rely on recognizing the server issuer and do not enforce duplicate prevention in a custom program. The independent musician NFT retains owner-controlled traits.

Preview sharing is JPEG frames over WebSockets, not full-rate WebRTC calling; microphones are not used. Rooms and unclaimed results are held in memory. Preserve the private issuer key across restarts, and claim before leaving the room. The public Cloudflare URL and metadata are temporary. Keep Devnet selected; test SOL has no cash value. Nine moderate transitive dependency audit findings remain documented in SOLANA.md.

## Release checks and remaining human check

Automated: gesture detection, multiplayer server validation, two-client timing/scoring, reconnects, signed receipt eligibility/authentication/replay, transaction construction/size, receipt readback validation and coaching. Production build must pass.

Human: use two physical devices to confirm tracking/audio and approve one Devnet mint and claim. A live wallet transaction is not implied by passing offline construction tests. Keep a screenshot/Explorer link of the approved transaction for the presentation. No seed phrases belong in source code, screenshots or submissions.

Next after this demo: persistent deployment and metadata; authenticated persistent progress; a deployed achievement program with authority validation and unique claim accounts; optional funded fee sponsorship. Embedded wallets need provider app registration. These remain separate work rather than features claimed in the submission.

## Reproducible checks

```sh
npm test
npm run build
npm run check:public -- https://your-game.example
npm run verify:proof -- downloaded-proof.json TRUSTED_ISSUER_PUBLIC_KEY
```

The public smoke check opens disposable rooms and checks joining, instrument selection, reactions, note relay and synthetic preview relay. It does not send real camera frames. Proof verification requires a separately trusted issuer public key, not merely the key included in an untrusted receipt. The public key is shown with the downloaded proof in the game; establish the genuine deployment key before verifying third-party proofs. Offline verification does not itself check a chain transaction.

Final validation performed: production TypeScript/Vite build; 32 regression tests; public HTTPS WebSocket smoke check; offline proof verifier positive/negative checks; static deployment private-key exclusion check; browser solo count-in at 60 BPM and results/practice feedback. No camera permission was requested during automated browser checks, and no real wallet transaction was signed.
