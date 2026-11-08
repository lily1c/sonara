# SONARA achievement program — Devnet

Program: `7R9eJmdmfHU3CRGBESH57CV4yFdy3rG73EkxGv5bPsp6`

[Devnet Explorer](https://explorer.solana.com/address/7R9eJmdmfHU3CRGBESH57CV4yFdy3rG73EkxGv5bPsp6?cluster=devnet)

This is a native Rust Solana program, not an Anchor scaffold or Memo-only integration. Deployment identities, binary hash, configuration transaction and program deployment transaction are in `chain/release/deployment.json`. The deployed binary was checked against the locally tested SBF artifact before initialization.

## Accounts and authority

- Config PDA: `["config"]`. Stores the authorized game-server Ed25519 public key. Only the compiled administrator can initialize/rotate it.
- Profile PDA: `["profile", wallet]`. Stores wallet, XP, verified session count, best performance and First Band flag. Its wallet signs creation and claims. The program owns the account; neither the wallet nor the server can directly edit its bytes.
- Claim PDA: `["claim", wallet, SHA256(session UUID)]`. Stores the earned session/song result. There is no close or reset instruction. A second claim for that wallet/session fails before XP is changed.

A claim transaction includes the native Ed25519 verification instruction immediately before SONARA's claim instruction. SONARA requires one canonical, self-contained signature layout and the configured issuer. It also checks wallet signer, program/wallet/session/song binding, profile/claim/config PDA addresses and owners, expiry, hit/band/role bounds, and account schemas. CPI calls are rejected to keep signature instruction introspection unambiguous. Prefunded empty system PDAs are safely allocated instead of allowing lamport dusting to block a claim.

## What earns progression

The server still validates the live game: complete an uninterrupted band take, 2–4 players, at least two instruments, at least four timed hits each. It freezes the result, authenticates wallet control using a one-use expiring challenge, then signs the binary program voucher. The program trusts that issuer for gameplay; it does not run hand tracking or prove human play.

Every accepted claim awards `10 + floor(performance / 10)` XP, at most 20. Performance is points / maximum chart points, normalized per instrument. Newcomer/Blue ink starts at profile creation; first claim unlocks Musician/Mint halo; 60 XP unlocks Groove Keeper/Violet rays; 120 XP unlocks Session Star/Golden constellation. Titles/looks derive from verified profile state and customize the in-app profile. They do not modify the independent musician NFT metadata.

Vouchers expire seven days after the take. The current room UI offers claims while that room/result is retained. Downloaded proof includes the program voucher for independent tooling; importing/redeeming files through the UI is not implemented. Old Memo proofs do not automatically grant program XP.

## Wire format

Instructions: `0 || issuer[32]` initializes config; `1` creates/loads profile; `2 || voucher[168]` claims; `3 || issuer[32]` rotates config (admin only).

Voucher byte offsets: 0 domain `SONARA_BAND_V1` padded to 16 bytes; 16 program public key; 48 wallet; 80 session hash; 112 song hash; 144 u16 points; 146 u16 performance; 148 u8 hits; 149 u8 band size; 150 u8 role; 151 mode (0 band, 1 solo); 152 i64 ended seconds; 160 i64 expiry seconds. Integers are little-endian. The message is domain-separated and bound to the program identity; clients/deployment scripts enforce the Devnet genesis hash.

Profile: 64 bytes, discriminator `SONPROF1`, wallet at 8, u64 XP at 40, u64 sessions at 48, u16 best performance at 56, First Band flag at 58. Claim: 120 bytes, discriminator `SONCLM01`, wallet at 8, session at 40, song at 72, points at 104, performance at 106, role at 108, band size at 109, ended at 110, XP award at 118. Config: 40 bytes, `SONCONF1` followed by issuer.

## Build and verify

```sh
cargo test --manifest-path chain/program/Cargo.toml
cargo build-sbf --manifest-path chain/program/Cargo.toml --arch v0
npm test
npm run build
```

Use the locked Cargo dependencies. `blake3` is pinned in Cargo.lock to an SDK-compatible version avoiding SBF stack diagnostics from newer host hash dependencies. Rust SDK 2.3.0 is ABI-compatible with the tested Agave 4.4 validator. Build tooling used platform-tools 1.57.

Full validator tests: use RPC port 8908 (WebSocket 8909), then start a disposable local validator with `--bpf-program PROGRAM_ID path/to/sonara_achievements.so`, then run `node chain/test-validator.mjs` from the app root. These tests use ignored local project keypairs and localhost only. They exercise successful signed claims, correct XP, replay failures, wrong wallets/issuers/profiles, missing verifier instructions, unsafe signature offsets, expiry, hit bounds and prefunded PDAs. Rust unit tests additionally validate binary voucher/offset guards. TypeScript tests validate cross-language layout, signature checks, PDA derivation, profile decoding and transaction sizes.

`chain/upload-devnet.mjs` throttles resumable loader buffer writes for the public RPC. `chain/initialize-devnet.mjs` checks genesis, executable ownership, upgrade authority and byte-for-byte artifact equivalence, then configures the live server issuer. `chain/live-claim-check.mjs` is a clearly labeled automated band/test-wallet integration test; it is not proof of a human webcam session or a transaction from the user's Phantom wallet.

## Operational limits

Devnet only; no real funds. Accounts require test-SOL rent and transaction fees. The program remains upgradeable by the local deployment administrator; keep ignored `.sonara-data/onchain/` keys private and backed up. The game issuer secret remains only in Render environment configuration. This is a tested hackathon program, not a formally audited mainnet contract. In-memory game rooms still reset on server restarts; confirmed profiles and claims persist on Devnet, subject to Devnet resets.

## First Solo

Solo mode uses a private one-player server room, with the same timestamp validation, chart scoring, wallet binding and signed voucher flow. Full completion plus four timed hits unlocks First Solo. Voucher mode byte 151 is 1 and participant count is 1; band mode keeps byte 151 at 0 and 2–4 participants. The contract checks these combinations. Both award 10–20 XP to the existing profile and share wallet/session replay protection. Solo claims do not set the First Band flag. Local browser practice badges remain separate.
