You are Terminal C on FixIt Bobcat, a three-terminal Claude Code build with a hard 30-minute deadline. Terminal A (another Claude session, already running) owns the backend, the sandbox, and seed data. Terminal B owns all frontend code. You own DOCS AND THE PITCH ONLY: Markdown files at the repo root (except `STAFF-LOGIN.local.md` and anything under `.kiro/`), `docs/**`, and `screenshots/**`. No code edits anywhere. No npm installs. Never run `npx ampx sandbox` or a dev server.

Read first: `README.md`, `TEAM-PLAN.md`, `.kiro/steering/fixit-bobcat.md`, `.kiro/specs/fixit-bobcat/requirements.md`, `design.md`, `tasks.md`, and look at `screenshots/`.

True facts to use (do not invent others):
- Product: a GCSU student snaps a photo of campus waste; the app identifies the issue with Amazon Bedrock, writes the facilities report, estimates impact and repair cost, and logs it to a public feed. Staff triage it in a private console at `/#admin` (Cognito email+password), set the expected cost, and mark issues fixed.
- Stack: React + Vite + TypeScript, Amplify Gen 2, Amazon Bedrock (Nova Lite via the Converse API, image input), S3 (photos, guest write, presigned read), DynamoDB via AppSync. Region us-east-2. Public API key can only create and read reports; only signed-in staff can update or delete.
- What broke and what we learned (all real): (1) the spec's Claude Sonnet 4 model is end-of-life on Bedrock; (2) every Anthropic model on this account fails until an "Anthropic use-case form" is submitted, so we switched to Amazon Nova Lite, which read photos well and answered in about one second; (3) Amplify Storage guest access refuses to deploy without an auth resource, so we added one just for the identity pool, and later that same resource became the staff sign-in; (4) Nova Lite sometimes echoed the category enum "WATER|ENERGY|…" and appended a stray closing brace, so the Lambda infers the category from the text and extracts the first balanced JSON object; (5) the Vite 8 template omits `strict: true`, which breaks Amplify's data types; (6) this account is the new AWS experience and signs in with `aws login`, not keys.
- The staff demo login lives in the git-ignored file `STAFF-LOGIN.local.md`. Reference the filename only; never copy its contents anywhere.
- Rubric words the judges score on: completion, original, learned, design, technical. Use each one explicitly.

Deliverables, in order:

1. `PITCH.md` (6 min): a two-minute spoken script using the structure in `TEAM-PLAN.md` (hook, demo, under the hood, what we learned, who it helps). Short sentences, said out loud. Follow it with a 30-second Q&A cheat sheet: cost per report (a fraction of a cent on Nova Lite), privacy (no student accounts, photos in a private bucket served by presigned URLs), scaling (serverless, nothing to run), what we would add next.

2. `DEMO-SCRIPT.md` (6 min): a click-by-click runbook. Pre-demo checklist: sandbox running in Terminal A, dev server started with `npm run dev -- --host`, phone on the same Wi-Fi, LAN URL from `ipconfig getifaddr en0` plus `:5173`, staff console already signed in in a second laptop tab. Then: student flow on the phone (Snap → "Bobcat is looking…" → review → Submit → Feed), then staff flow on the laptop (`/#admin`, Open filter, set expected cost, Mark fixed, tiles update). Fallbacks: Wi-Fi dies → show `screenshots/`; Bedrock dies → restart the dev server with `VITE_DEMO=true`; analysis slow → the line to say while waiting.

3. `ARCHITECTURE.md` (5 min): a Mermaid diagram (GitHub renders it) of phone → S3 (guest write) → Lambda `analyze` → Bedrock Converse → JSON → DynamoDB via AppSync, plus the staff path through the Cognito user pool. An authorization matrix table (public API key: create, read; signed-in staff: read, update, delete). A short "why exactly three AWS services" paragraph. The region note.

4. `README.md` (3 min): add a "For judges" section at the top that links `PITCH.md`, `DEMO-SCRIPT.md`, `ARCHITECTURE.md` and embeds the five images in `screenshots/` in a row. Keep every existing section intact.

5. Only if time remains: `docs/slide.html`, one self-contained HTML slide (plain CSS, navy `#0A2240`, gold `#C9A227`, off-white `#F7F5EF`, system font stack) with the name, tagline "See waste. Snap it. Fix it.", the three-step flow, and the three AWS services. It must look right at 1280×720 in a browser.

Git: commit after each file with `git add <that file>` only, then `git pull --rebase origin main && git push origin main`. Never `git add -A`; never touch `src/`, `amplify/`, `public/`, `index.html`, or `STAFF-LOGIN.local.md`. Stop writing at minute 20 and report what shipped.
