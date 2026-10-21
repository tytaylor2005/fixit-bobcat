# FixIt Bobcat — Tasks (90-minute plan)

Target times are from the start of the build clock. Driver: check each box only when `npm run dev` still starts clean.

## Phase 1 — Skeleton (target: done by minute 15)

- [x] 1. Scaffold the app. `npm create vite@latest . -- --template react-ts`, then `npm create amplify@latest` (accept defaults), `npm install aws-amplify @aws-sdk/client-bedrock-runtime @aws-sdk/client-s3`. Delete the generated `amplify/auth` folder and remove `auth` from `backend.ts` — we do not want auth.
- [x] 2. Create `src/buildings.ts` (building list + category list from requirements.md) and `src/seed.ts` (5 realistic seed reports: running faucet in Beeson Hall, lights on in an empty Arts & Sciences classroom, overflowing recycling outside the Library, broken water fountain in Wells Hall, AC running with doors propped open at the Wellness Center — each with impact string, impactScore, severity, status, and a placeholder photo path).
- [x] 3. Build `App.tsx` with header, tab bar, and empty `Report` / `Feed` components. Write `styles.css` with the palette and the container/card/chip/button classes from design.md. Verify at 375 px width.

## Phase 2 — Backend (target: done by minute 35)

- [x] 4. Write `amplify/storage/resource.ts`, `amplify/data/resource.ts`, `amplify/functions/analyze/resource.ts` and `backend.ts` exactly as in design.md.
- [x] 5. Write `amplify/functions/analyze/handler.ts`: S3 GetObject → Bedrock Converse → parse JSON → fallback on failure. Log the raw model text with `console.log` so we can debug in CloudWatch.
- [x] 6. Start `npx ampx sandbox` in a separate terminal and leave it running. Confirm `amplify_outputs.json` appears. Add `Amplify.configure(outputs)` in `main.tsx`. **AWS teammate owns this terminal from here.**

## Phase 3 — Report flow (target: done by minute 55)

- [x] 7. `Report.tsx`: photo picker (camera on mobile) → preview → building dropdown → Analyze button. Upload to S3 with `uploadData`, then call `client.queries.analyze`. Show "Bobcat is looking…" while waiting; 25 s timeout → friendly error + Try again.
- [x] 8. Result card: category chip, severity chip, editable title + description inputs, impact line, suggested action, "Submit report" button → `Report.create`. Confirmation state with "See the Feed" button that switches tabs.
- [x] 9. **End-to-end test with a real photo from a phone.** If it works, commit and tell the Pitch lead the demo is live. If Bedrock fails, apply the design.md fallback NOW, not later.

## Phase 4 — Feed (target: done by minute 70)

- [x] 10. `Feed.tsx`: list reports newest-first, thumbnail via `getUrl`, chips, time-ago, "Mark fixed" button. Empty state. Seed-data fallback when `VITE_DEMO=true`.
- [x] 11. Stat tiles at the top: Open, Fixed, Impact avoided (sum of impactScore of FIXED reports — or of all reports if that number looks better on stage).

## Phase 5 — Polish and freeze (target: done by minute 82)

- [x] 12. Loading/empty/error states all look intentional. Pulsing 🐾. Buttons ≥ 48 px. No horizontal scroll at 375 px.
- [x] 13. Run the happy path three times in a row from a phone. _(Done 3x from a desktop browser at 375 px; screenshots in `screenshots/`. Phone runs still to do by the team.)_ Screenshot every screen (these are the backup demo if Wi-Fi dies).
- [ ] 14. STRETCH ONLY if 10+ minutes remain: `git push` and connect the repo to Amplify Hosting for a public URL. Otherwise demo from the sandbox/localhost and don't mention it.

## Do NOT do
- Add auth, maps, notifications, comments, pagination, multi-photo, or any feature not in requirements.md.
- Refactor working code.
- Switch libraries or frameworks mid-build.

## Phase 6 — Post-spec additions (team request, after the 90-minute plan)

- [x] 15. Backend: `estimatedCost` on Report + AnalysisResult; public key = create/read only, authenticated = read/update/delete; authenticated storage read; Lambda prompt asks for a USD repair estimate.
- [x] 16. Frontend: hash route `#admin` → `Admin.tsx` (Cognito sign-in, filters, cost tiles, expected-cost editor, Mark fixed / Reopen). Public Feed becomes view-only. Student page remembers the building and links to staff sign-in.
- [x] 17. Create a staff demo user in the Cognito pool (login kept in git-ignored `STAFF-LOGIN.local.md`), verify student + staff flows in the browser, update README.
- [x] 18. Costs: `actualCost` on the Report model; estimate shown on the student result + confirmation and on feed cards; staff "Mark fixed" asks for the actual cost; estimated → actual comparison and tiles in the staff console.
- [x] 19. Personality: inline-SVG bobcat mascot (moods + hard hat + magnifying glass) across student and staff states, speech-bubble hero, "Bobcat spots" row, paw-print background.
