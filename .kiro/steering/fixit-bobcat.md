---
inclusion: always
---

# FixIt Bobcat — project steering

## What this is
A 90-minute codeathon prototype for the GCSU Kiro Codeathon (AWS for Social Good, Environment & Sustainability track). Students photograph waste or broken things on the Georgia College & State University campus (lights on in an empty room, running faucet, overflowing bin, broken water fountain). Amazon Bedrock identifies the issue from the photo, drafts a facilities report, estimates impact, and the report is logged to a public feed.

## Hard constraints (do not violate)
- We have 90 minutes total. Favor the simplest working thing over the "right" thing. Finished and simple beats ambitious and broken.
- Stack: React + TypeScript + Vite, AWS Amplify Gen 2 (`amplify/backend.ts`, `amplify/data/resource.ts`, `amplify/storage/resource.ts`, `amplify/functions/`).
- AWS Region: **us-east-2** for everything.
- NO authentication. NO login screens. Use `allow.guest()` / public API key for Data and guest read/write for Storage.
- Single-page app, mobile-first (it will be demoed from a phone or a narrow browser window). Two views toggled by a top tab bar: **Report** and **Feed**.
- Exactly three AWS services beyond hosting: Amazon Bedrock (vision), Amazon S3 (via Amplify Storage), DynamoDB (via Amplify Data). Nothing else.
- Bedrock calls go through ONE Lambda (`amplify/functions/analyze/`) using the **Converse API** with an image content block. Default model id: `us.anthropic.claude-sonnet-4-20250514-v1:0` (cross-region inference profile). Read the model id from env var `MODEL_ID` so it can be swapped to `us.amazon.nova-lite-v1:0` in seconds if access isn't enabled.
- The Lambda must return STRICT JSON. Ask the model for JSON only and `JSON.parse` the first `{...}` block; on parse failure return a safe fallback object instead of throwing.
- Keep dependencies minimal. No UI framework beyond plain CSS (one `src/styles.css`). No state libraries. No routers.
- Never block on deployment. `npx ampx sandbox` is how we get a backend during the build; Amplify Hosting is a stretch goal.
- Use the AWS MCP server / AWS skills installed by the Agent Toolkit for any AWS API questions instead of guessing.

## Working rules
- Follow `.kiro/specs/fixit-bobcat/tasks.md` in order. One task at a time. Check it off when the app still runs.
- If a step is failing for more than 5 minutes, STOP and propose the fallback listed in design.md for that step.
- After every task: `npm run dev` must start with no TypeScript errors.
- Put ALL demo/seed data in `src/seed.ts` so the Feed looks populated even if the backend is down.
- Commit after every task with a one-line message.

## Design direction (UI)
- Name on screen: **FixIt Bobcat**. Tagline: "See waste. Snap it. Fix it."
- Palette: GCSU navy `#0A2240`, bobcat gold `#C9A227`, off-white `#F7F5EF`, success green `#2E7D32`, alert amber `#E65100`.
- Big tap targets, one primary button per screen, friendly copy, visible loading state ("Bobcat is looking…"), visible empty state on Feed.
- Font: system UI stack. No web fonts (saves time and a network dependency).
