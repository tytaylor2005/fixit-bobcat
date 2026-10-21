# FixIt Bobcat — Team Plan (GCSU Kiro Codeathon, Oct 21 2026)

> **CHANGE OF PLAN (final 30 minutes).** Only Ty and three Claude Code terminals are coding. The original roles below are kept for reference; the live plan is this section.
>
> | Who | Owns (nobody else edits these) | Prompt |
> |---|---|---|
> | Terminal A (original session) | `amplify/`, `ampx sandbox`, dev server :5173, demo seed data, final integration | already running |
> | Terminal B | `src/**`, `public/**`, `index.html` — brand mark, installable on phones, student ease-of-use, feed card detail | `prompts/TERMINAL-B-frontend.md` |
> | Terminal C | root `*.md`, `docs/`, `screenshots/` — pitch script, demo runbook, architecture, judges section | `prompts/TERMINAL-C-pitch-docs.md` |
> | Ty | things only a human can do: phone test over LAN, take 3 real campus photos, (optional) Anthropic use-case form in Bedrock console, rehearse the pitch | — |
>
> **Clock:** 0–3 start B and C · 3–20 parallel build · 20–25 everyone pushes, Terminal A pulls + verifies end to end · 25–30 freeze, Ty rehearses the pitch out loud once.
>
> **Git protocol for every terminal:** commit only your own files (`git add <paths>`, never `-A`), then `git pull --rebase origin main && git push origin main`. Never run a second `ampx sandbox`. Never edit `amplify_outputs.json` or `STAFF-LOGIN.local.md`.


**Track:** Environment & Sustainability · **Pitch:** See waste. Snap it. Fix it.
**Stack:** React + Vite · Amplify Gen 2 · Amazon Bedrock (vision) · S3 · DynamoDB · Region us-east-2

## Roles

| Role | Name | Owns |
|---|---|---|
| Driver | ______ | The ONE Kiro session. Paste `KICKOFF-PROMPT.md`. Works `tasks.md` top to bottom. |
| AWS / Deploy | ______ | AWS login, Bedrock model access, `npx ampx sandbox` terminal, IAM errors, hosting stretch. |
| Design + Pitch | Ty | Logo (bobcat + wrench), palette, UI copy, demo photos staged, 2-min pitch, slide. |
| Data + QA | ______ | 5 seed reports written, 3 real demo photos taken on campus, tests every build, keeps the clock, calls scope cuts. |

## Before the clock starts (everyone)
1. Kiro installed + signed in + credit code redeemed.
2. AWS signed in, region us-east-2, **Bedrock → Model access → Claude Sonnet 4 and Nova Lite enabled**.
3. Agent Toolkit prompt from the event site run inside Kiro (installs AWS CLI + MCP servers). `aws sts get-caller-identity` works.
4. Driver has this folder open in Kiro. Everyone has the GitHub repo.

## Clock
| Min | Milestone | Who |
|---|---|---|
| 0–5 | Repo created, kickoff prompt pasted, Kiro starts Task 1 | Driver |
| 5–15 | Skeleton runs (Tasks 1–3). Logo + palette delivered | Driver / Ty |
| 15–35 | Backend deployed via sandbox (Tasks 4–6) | Driver + AWS |
| 35–55 | Report flow works end-to-end with a real photo (Tasks 7–9) | Driver |
| **45** | **SCOPE CHECK — anything not working gets cut or faked** | QA |
| 55–70 | Feed + stat tiles (Tasks 10–11) | Driver |
| 70–82 | Polish, 3 clean demo runs, screenshots (Tasks 12–13) | All |
| 82–90 | Freeze. Rehearse pitch out loud once. | Ty leads |

## Demo photos to take NOW (Data + QA)
1. A faucet running / dripping (any bathroom).
2. Lights on in an empty classroom or lounge.
3. An overflowing or contaminated recycling bin.
Backup: a propped-open door with AC running, a broken water fountain.

## 2-minute pitch (Ty)
1. **Hook (15 s):** "Last week a faucet in Beeson Hall ran for three days. Everybody saw it. Nobody knew who to tell."
2. **Demo (60 s):** Phone → snap faucet photo → "Bobcat is looking…" → result card: *Running faucet, ~1,500 gal/week, HIGH* → Submit → Feed updates, impact tile ticks up → Mark fixed.
3. **Under the hood (20 s):** "Kiro built it from a spec in 90 minutes. Bedrock's vision model reads the photo, S3 stores it, DynamoDB logs it, Amplify runs it — all in us-east-2."
4. **What we learned (15 s):** name the thing that broke and how you fixed it.
5. **Who it helps (10 s):** "Facilities gets a free, photo-first reporting layer. Students get a reason to notice. Campus wastes less."

Say the words **completion, original, learned, design, technical** somewhere in the pitch. Judges have a rubric.

## If things break
- Bedrock denied → `MODEL_ID=us.amazon.nova-lite-v1:0`.
- Sandbox dead → `VITE_DEMO=true`, seed data on Feed, hard-code the 3 demo photo results.
- Wi-Fi dead → screenshots from Task 13.
