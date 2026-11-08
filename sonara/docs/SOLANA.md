# Current Solana integration

SONARA now uses two distinct on-chain systems on **Solana Devnet**:

1. **Earned progression:** the native SONARA achievement program verifies server-signed results, binds them to the signing wallet, creates a unique claim account, and updates wallet-owned profile XP. Duplicate wallet/session claims are rejected by the program. See [program specification and deployment](PROGRAM.md).
2. **Optional musician collectible:** Metaplex Core mint/read/test-update flow. Its owner-managed `demo_updates` counter is not earned XP. The connected wallet owns this NFT and controls its update authority.

Legacy Memo receipts remain readable by the application but are not the current claim path and do not automatically award program XP.

## Try earned progression

Open the stable HTTPS game in a browser with Phantom/another Wallet Standard Solana wallet. Enable Solana Devnet/test networks. Click **Musician · Devnet**, connect, and use the official Devnet faucet for free test SOL. You may create an on-chain profile now, or your first claim will create it.

Choose Band session, invite another player, choose at least two different instruments, and ready/start together. Each player must land at least four Perfect/Good notes and remain connected through completion. Results explain unmet rules. In a qualifying result, click **Claim with [wallet]**. Each band player uses a different wallet. Approve the performance-binding message, then the program transaction. Rent and fees use test SOL, not real SOL. Wait for account readback, then view the claim/profile in Explorer. Use **Verify program claim** after uncertain confirmation; do not repeatedly submit blindly.

The profile displays verified XP, session count, best performance, First Band status and the unlocked title/look. Read it again after reconnecting to demonstrate persistence across devices. The poster is a separate SVG souvenir, never evidence of a successful transaction.

## Wallet and network handling

Wallet Standard discovers/connects wallets and requests explicit signatures. Umi serializes and sends transactions. The app checks the RPC Devnet genesis before reads/signing and rejects wallet-returned transactions if their messages change. Program claims verify the voucher signature and compare its issuer with on-chain configuration before prompting. Client readback checks account owner, PDA/schema, wallet/session/song/result fields. Browser storage is a convenience reference; confirmation is not trusted solely from cache.

`VITE_SOLANA_RPC_URL` optionally selects a Devnet provider. VITE values are public; never put signing secrets there. Public RPCs can rate-limit, including Core NFT discovery; use a suitable Devnet provider if necessary. The in-app browser might not expose wallet extensions; use the actual browser with Phantom installed.

## Issuer and metadata hosting

Render generates a persistent private `SONARA_ISSUER_SEED`, deriving the game's Ed25519 receipt/voucher key. Preserve it. The on-chain config must match its public key; rotating issuer configuration requires the deployment administrator. `/api/issuer` publishes only public identity/program information. No private keys, camera frames, landmarks or musician names go into the program voucher.

Hosted musician metadata uses the HTTPS `SONARA_PUBLIC_URL` or `RENDER_EXTERNAL_URL`. The stable service supplies the artwork URL. Previously minted tunnel-based assets are not automatically migrated; the owner/update authority can manage their metadata separately. The NFT remains mutable and is not a verified achievement collection.

## Validation and limits

The real program compiled to SBF and passed Rust guardrails, full local-validator transactions and application tests. Deployment and live test evidence is retained in `chain/release/`. The game server remains trusted for musical performance; keyboard/touch and automated protocol inputs are accepted. On-chain validation enforces authorization and uniqueness, not human-play or camera authenticity. The program is upgradeable and not formally audited. Only Devnet is supported.

The agent's project test wallet is separate from the user's Phantom wallet. Human wallet extension approval and the optional Metaplex NFT mint should still be checked separately; an automated program integration test does not establish those UI paths worked.

Dependency audit at SDK integration found nine moderate transitive JavaScript findings. Compatible `npm audit fix` did not resolve them; no forced major overrides were applied. Rust dependencies and notices are listed under `chain/DEPENDENCIES.md`.

Official sources: https://solana.com/docs/core/programs/precompiles, https://solana.com/docs/intro/installation, https://solana.com/docs/frontend, https://www.metaplex.com/docs/smart-contracts/core/create-asset.
