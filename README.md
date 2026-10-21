# FixIt Bobcat 🐾

**See waste. Snap it. Fix it.** — GCSU Kiro Codeathon, Oct 21 2026 (Environment & Sustainability track).

A student snaps a photo of waste on campus; FixIt Bobcat identifies the problem with Amazon Bedrock, writes the facilities report, estimates the impact, and logs it to a public feed.

Stack: React + Vite + TypeScript · Amplify Gen 2 · Bedrock (vision) · S3 · DynamoDB · **us-east-2**.

Specs live in `.kiro/specs/fixit-bobcat/` (requirements, design, tasks). Team plan: `TEAM-PLAN.md`.

## Teammate setup (5 minutes)

```bash
git clone <this repo> && cd fixit-bobcat
npm install
```

**AWS login.** Our account is the *new AWS experience* (project "Blank Slate"). There are no access keys and no SSO start URL. Use the browser login:

```bash
aws configure set region us-east-2
aws login --region us-east-2      # opens the browser; pick the "Blank Slate" session
aws sts get-caller-identity       # should print account 509425091556
```

Credentials last 12 hours; rerun `aws login` if commands start failing with `ExpiredToken`.

**Backend (one person runs this and leaves it running):**

```bash
npx ampx sandbox
```

This writes `amplify_outputs.json` (git-ignored) when the deploy finishes. Share that file with the team if more than one person needs to run the frontend against the same backend.

**Frontend:**

```bash
npm run dev             # http://localhost:5173
npm run dev -- --host   # to open it from a phone on the same Wi-Fi
```

## Things we learned (don't rediscover these)

- `us.anthropic.claude-sonnet-4-20250514-v1:0` from the spec is **end-of-life** on Bedrock. Sonnet 4.5 (`us.anthropic.claude-sonnet-4-5-20250929-v1:0`) exists but every call fails with *"Model use case details have not been submitted for this account"* until someone fills out the Anthropic use-case form in the Bedrock console (Model access → Anthropic). So the Lambda defaults to **`us.amazon.nova-lite-v1:0`**, which handles photos fine. To switch back after the form is approved, change `MODEL_ID` in `amplify/functions/analyze/resource.ts`; the running sandbox redeploys automatically.
- Amplify Storage `allow.guest` **requires** an auth resource (Cognito identity pool) or the sandbox refuses to deploy. `amplify/auth/resource.ts` exists only for that. There is no login UI anywhere.
- The Vite 8 template omits `"strict": true`; Amplify's data client types break without it. Already fixed in `tsconfig.app.json`.
- CDK had to be bootstrapped in us-east-2 once (`npx aws-cdk bootstrap aws://509425091556/us-east-2`). Done.

## Demo fallback

`VITE_DEMO=true npm run dev` shows the seed reports in `src/seed.ts` on the Feed if the backend is down.
