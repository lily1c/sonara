# Solana integration — Devnet musician

This release adds an optional wallet-owned Metaplex Core musician NFT. It does not yet implement server-earned XP or verified game achievements. The connected wallet owns the asset AND controls its update authority. The demo counter proves that an attribute update can be signed, confirmed and read back; it is not a trustworthy score.

## Try it

1. Open the public HTTPS game in a browser with a Wallet Standard Solana wallet enabled. The Codex in-app browser may not expose browser wallet extensions.
2. Click **Musician · Devnet**, then your wallet. Enable test networks / Devnet in the wallet if needed.
3. Use the linked official Devnet faucet to obtain free test SOL. Refresh from chain. The mint flow requires 0.02 test SOL as conservative headroom; actual rent and fees vary.
4. Click **Mint Devnet musician**, review the transaction in your wallet, and approve it yourself.
5. Wait for confirmation and the on-chain attributes. Open the asset/transaction Explorer links (Devnet).
6. Click **Sign test update** and approve it. `demo_updates` should increase after a confirmed readback.
7. Disconnect and reconnect, then refresh the saved asset address to verify persistence across reloads.

No wallet is required to play. The app never asks for seed phrases or private keys. Wallet account changes invalidate the current UI connection. Every signing request includes `solana:devnet`; RPC genesis is also checked before signing, preventing an accidental mainnet endpoint configuration. Transaction messages returned by wallets must match the requested message.

## Implementation

- `src/solana/client.ts`: Wallet Standard discovery/connect/signing bridge, Umi + Metaplex Core transaction builders, confirmed RPC reads, owner/update-authority validation.
- `src/solana/policy.ts`: Devnet identity, schema and full attribute-list merge. Attribute updates replace the full list, so existing traits are retained.
- `src/solana/MusicianPanel.tsx`: explicit actions, pending/confirmation/errors, optional local public asset reference. No wallet state is sent to the multiplayer room server.
- Metadata and original doodle artwork: `public/musician/`. Camera, inference, notes and multiplayer do not go on-chain.

The current Solana frontend docs recommend Kit for general applications. This integration uses Wallet Standard directly and Metaplex's documented Umi/Core SDK for NFT instructions. Its web3.js dependency is transitive, with a browser-only Vite alias. Wallet code is loaded only when the drawer opens.

## Configuration and hosting

Default RPC is `https://api.devnet.solana.com`. An optional `.env.local` setting `VITE_SOLANA_RPC_URL` can point at a Devnet RPC that supports Core `getProgramAccounts` discovery. All VITE values are public browser configuration; do not put secret keys in them. Public RPCs may rate-limit or restrict discovery. The app reports failure rather than silently minting another asset; use a suitable Devnet provider if discovery is unavailable.

Before minting from a new tunnel/domain, update the absolute artwork URL and rebuild:

```sh
node scripts/musician-metadata.mjs https://your-public-host.example
npm run build
```

The current temporary Cloudflare metadata URI will stop working when its tunnel disappears. On-chain ownership survives, but the image/JSON URL does not. Use durable metadata storage before distributing lasting collectibles. The demo update authority also retains metadata control; this release does not promise immutability or a verified SONARA collection.

The pending asset address is saved before signing. A rejected request or timeout can leave a local reference. Refresh that address first; an RPC timeout does not prove a transaction failed. Clear the local reference only after checking Explorer. Discovery reduces duplicate mints but is not an on-chain one-per-wallet constraint. Another client can mint duplicates or edit the owner-managed traits. Transferring an asset does not automatically transfer its update authority.

## Validation and remaining work

25 tests cover existing gestures/rooms plus Devnet guardrails, attribute merging, metadata URL rules, and offline creation/serialization of a Core transaction with two signatures. Production build and public no-wallet drawer were checked. No real wallet-approved mint/update has been executed by the coding agent. Complete the manual steps above before claiming end-to-end chain success.

Next milestone: authenticate players with a nonce-bound wallet challenge; have the authoritative room server issue replay-protected session receipts; use a dedicated controlled authority or program to award earned achievements. Keep signing keys on the server, never in VITE configuration. This owner-managed demo must not be presented as verified gameplay progression.

Dependency audit at integration: 9 moderate transitive findings in the installed Umi/web3.js dependency tree (including stream-json and uuid paths). `npm audit fix` did not resolve them within compatible versions. No forced major overrides were applied. Review upstream fixes before a production release.

## Official sources consulted

- https://solana.com/docs/frontend
- https://www.metaplex.com/docs/smart-contracts/core/sdk/javascript
- https://www.metaplex.com/docs/smart-contracts/core/create-asset
- https://www.metaplex.com/docs/smart-contracts/core/plugins/attribute
- https://www.metaplex.com/docs/smart-contracts/core/plugins/update-plugins

## Earned First Band achievement

Multiplayer results now offer a separate server-attested badge receipt. Eligibility requires an uninterrupted completed take with at least two different instruments and at least four Perfect/Good notes from every player. The server freezes end-of-take scores and roles. A nonce-bound, origin/session/player/wallet-specific message (two-minute expiry, one use) proves wallet control. The issuer signs the result with Ed25519; the client verifies that signature before requesting a wallet-signed Devnet Memo transaction containing the receipt. The user's wallet pays only the Devnet transaction fee; no server wallet needs funding. A transaction is shown confirmed only after RPC confirmation and readback.

This is an achievement receipt, not a newly minted NFT or a mutation of the owner-managed musician traits. Both are associated through the player's wallet. A signed receipt can be downloaded and independently verified using its issuer key and exact JSON payload. Trust depends on recognizing the genuine server issuer; an arbitrary server can sign arbitrary scores. The Memo program stores the receipt but does not itself enforce eligibility, verify the issuer signature, or enforce one claim. Re-recording the same receipt earns nothing new; consumers must deduplicate by issuer + match + wallet. Client timing and keyboard/touch inputs remain accepted, so this is not proof of human webcam play or bot resistance.

The issuer private key is generated locally at `.sonara-data/achievement-issuer.pem` (directory 0700, file 0600) and is ignored by git. Preserve it securely across deployments; changing it changes the issuer identity. Set `SONARA_DATA_DIR` to persistent private storage for deployment. Never serve this directory or expose the key in VITE variables. Guest sessions and claim eligibility remain in memory: claim before leaving the room or restarting the server. Issued signed proofs and on-chain records survive. One wallet cannot bind two players' receipts in the same room take; each player binding survives reconnect while the seat is retained.

Claim flow: finish a qualifying band take → results → **Claim with [wallet]** → approve binding message → approve Devnet Memo → Explorer transaction / download signed proof. Wallet address, instrument, score and session become public; no names, video, landmarks or room code are included. Submission signatures are saved before sending so uncertain RPC responses show an Explorer link rather than an automatic resubmission. Reloading restores this local link, but local confirmation labels are convenience state, not independent chain verification. For a failed transaction use Explorer; the UI deliberately avoids automatic duplicate submission.

29 automated tests now include real WebSocket eligibility, frozen-score issuance, message verification, wallet reuse rejection and challenge replay rejection. The human wallet approval path still needs a real Devnet wallet test.

Additional official references: https://solana.com/docs/frontend/messages-and-auth and https://www.solana-program.com/docs/memo.

### Final demo readback improvement

The achievement panel now offers **Verify record from Devnet**. Reloaded local references begin unverified; readback checks the issuer signature, successful transaction metadata, wallet signer membership, and exact Memo bytes. This also helps recover a submission whose initial confirmation timed out. The offline `verify:proof` script requires a separately trusted issuer public key. It verifies the downloaded signed receipt without claiming that a chain record exists. Final regression suite: 32 passing tests.
