# SONARA two-minute solo demo

0:00–0:15, slide 1: Introduce a webcam music game anyone can play with hands, keys or touch.

0:15–0:25, slide 2: Explain the complete solo loop: choose a song, finish a take, earn rewards and claim verified XP.

0:25–1:05, live game: Choose First Jam at 80 BPM (24 seconds plus countdown). Land at least four Perfect or Good hits and stay connected until results. Show score, local badges and the personalized poster. The take uses private server scoring.

1:05–1:35, results: Choose Claim with Phantom, sign the wallet-binding message and approve the Devnet transaction. Have free test SOL ready. Use a previously confirmed claim as a clearly labeled fallback if the network is slow.

1:35–1:50, slide 3 and Explorer: Show the unique claim account and wallet-owned musician profile. Explain that the server judges musical timing and the program verifies the issuer, wallet and duplicate-claim rules. Solo claims earn First Solo, while First Band still requires a real band.

1:50–2:00, profile: Refresh verified XP and the unlocked doodle look. Close on approachable music practice and persistent musician progression.

Prepare an extension-enabled browser with Phantom and test SOL before recording. The in-app browser may not expose your wallet extension. Never show recovery phrases or private keys. No paid AI API is required. This is Devnet, not cash rewards. Human gesture/audio and Phantom approvals require your own device check.

# Band demo alternative

“SONARA turns AI hand tracking into a band studio. Solana gives each wallet persistent musician progress and verifies earned claims without allowing duplicate XP.”

1. Start a solo song. Show the instrument-specific hand diagram, camera landmarks, and keyboard/touch alternatives. AI here is pretrained MediaPipe hand detection; practice feedback is rule-based.
   Finish the solo take with four timed hits to show saved browser-local XP, titles and badges. Explain that these are separate from on-chain band XP.
2. Prepare two devices on https://sonara-gby7.onrender.com. Choose different instruments, join by room code, explicitly share camera/sound, ready and start together.
3. Each player lands four timed notes and stays connected until completion. The live First Band checklist explains progress. Pick an original song or the reviewed public-domain arrangements.
4. Results show normalized rankings and personalized, self-contained doodle SVG keepsakes. Explain that the poster is not an NFT or blockchain proof.
5. In an extension-enabled browser with free Devnet SOL, claim with Phantom. Approve the binding message and SONARA program transaction. The program validates the configured issuer and wallet, creates a unique claim account and awards XP. Verify the account/transaction on Explorer.
6. Open Musician · Devnet and refresh the on-chain profile. Show XP, session count, First Band, title and unlocked doodle look. Reconnect the wallet on another device to demonstrate persistence. Optionally show the independent Metaplex Core collectible; its test counter is not earned XP.

The deployed program and public test evidence are documented in PROGRAM.md and chain/release/. Local-validator tests exercise attacks/replays; the live test script uses labeled automated inputs and a dedicated project test wallet. It does not claim to be a human camera performance or the user's Phantom approval.

## Accurate limits

Devnet only. The server judges timing and remains trusted for musical performance; keyboard, touch and automated clients are accepted. The program enforces authorization and uniqueness, not proof of human play. Profiles/claims are program accounts, not achievement NFTs. The program remains upgradeable by its deployment administrator and has not had a formal audit. Sponsored fees and extension-free onboarding are not implemented.

JPEG preview sharing is not full-frame-rate WebRTC calling; microphones are not used. Rooms/unclaimed takes live in memory. On-chain progress persists subject to Devnet resets. Render Free has cold starts. The optional Core NFT uses owner-managed traits. Existing transitive dependency audit findings are documented in SOLANA.md.

## Checks

```sh
npm test
npm run build
npm run check:public -- https://sonara-gby7.onrender.com
cargo test --manifest-path chain/program/Cargo.toml
```

See PROGRAM.md for full compiled-program/local-validator tests and live claim/replay verification. Validate human camera/audio on the actual demo devices and approve a Phantom transaction yourself. Never put wallet recovery phrases, issuer secrets or deployment keypairs in screenshots or submissions.
