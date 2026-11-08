# SONARA submission answers

Copy-ready project facts and suggested narrative. Personal survey answers below are drafts for the builder to review, not recorded opinions or submitted responses.

## Project details

**Project name:** SONARA — Your Air Studio

**Source code:** https://github.com/lily1c/sonara

**Live demo:** https://sonara-gby7.onrender.com/

**Demo video:** Required before submission. Record and upload your real demo to YouTube, Vimeo or Loom, then paste its URL. No video URL is available in the project.

**Technologies used:** Solana Devnet, native Rust Solana program, Metaplex Core, Wallet Standard / Phantom, React 19, TypeScript, Vite, Node.js, WebSockets, MediaPipe Tasks Vision, Tone.js.

**AI your project calls while people use it:** None of the listed hosted prompt APIs. SONARA runs a pretrained MediaPipe hand-tracking model locally. It does not send prompts to OpenAI or Gemini. Remove those selections if they were chosen only because AI helped write the code. Describe MediaPipe under technologies.

**AI coding tools:** Codex. Add other tools only if you actually used them. Select the model shown in your coding tool if known, otherwise choose “Not sure which model.” Do not select “Hand-coded, no AI.”

**Prize categories:** Top 3 Overall and Gaming Track fit the current project. Best Beginner Hack is appropriate only if you satisfy the event's beginner criteria. AI Track may fit local hand tracking, but describe it accurately and check event criteria. The project does not implement DeFi, so DeFi Track is not supported by current functionality.

**Other links:** Link the three-slide pitch when you have a shareable deck URL. The repository also includes `sonara/docs/PROGRAM.md`, `sonara/docs/DEMO.md` and release evidence under `sonara/chain/release/`.

## Project description

SONARA makes a laptop into a playful air studio. Players use webcam hand gestures, keyboard keys or touch to play piano, drums, violin and saxophone. They can practice songs alone or invite friends into a band through a room code. Completed takes include timing feedback and a personalized doodle concert poster.

Solo practice rewards completed songs with browser-local XP, badges and musician titles. In multiplayer, eligible completed takes produce signed results that players can claim on Solana Devnet. Our native Rust program verifies the authorized issuer and wallet signer, prevents duplicate wallet/session claims, and adds 10–20 XP to a wallet-owned profile. Titles and doodle looks reflect verified profile progress. An optional Metaplex Core collectible is separate from earned achievements.

MediaPipe runs hand tracking locally, so the instrument needs no paid AI API and does not send camera frames to a hosted model. Room camera sharing is an explicit opt-in. Solana provides persistent, inspectable musician progression while the game server remains responsible for judging music performance.

## Experience building on Solana

Suggested draft, edit to match your own experience:

“Building SONARA helped me understand the boundary between a game result and an on-chain achievement. Solana let me give each wallet a persistent musician profile and a unique claim account for each performance. The most useful part was being able to inspect accounts and transactions in Explorer and show exactly where XP came from.

The hardest parts were wallet message signing, Devnet RPC reliability, matching binary voucher layouts between TypeScript and Rust, and making retries safe when confirmation was uncertain. I also had to keep local practice progress, verified program XP and optional NFT traits clearly separated in the interface. More small end-to-end examples of game-server attestations and wallet claims would make this easier for beginners.”

## Most interesting thing learned

Suggested draft:

“I learned that an on-chain reward does not have to be an NFT. A program-owned profile and a unique wallet/session PDA can track progression and stop duplicate claims. I also learned that the chain cannot know whether a player really performed with a webcam: the game server judges the take, while the program checks the signed authorization and claim rules.”

## Personal survey fields

These require your own choices. If the narrative above reflects your experience, these are possible starting points:

- Overall experience: 4/5.
- Recommend Solana: 8/10.
- Better understanding of blockchain: Strongly Agree.
- Resources available: Yes, if documentation, Devnet and tools met your needs. Otherwise choose No and describe the missing resource.
- Missing resources, if applicable: “A beginner-oriented example covering a signed game result, wallet authentication, replay protection and confirmation recovery would have helped.”
- Likely to use Solana afterward: Very Likely, if that is your intention.
- Future Midnight Hackathons: Yes, if you want to participate.

## Before pressing Submit

Upload a real demo video and paste the supported video URL. Check the live site after its cold start. Demonstrate a solo reward, then a two-player completed take and a wallet-approved Devnet claim if possible. Confirm beginner eligibility and personal ratings. The source changes in this workspace still need committing, pushing and deployment before the hosted demo reflects the new solo rewards. This file does not submit the form.
