# FixIt Bobcat — Demo Runbook

Click-by-click. One person drives the laptop, one holds the phone. Total demo time: about 60 seconds.

## Pre-demo checklist (do this 10 minutes before)

- [ ] **Sandbox is running** in Terminal A (`npx ampx sandbox`). The terminal shows "Deployed" or is watching for changes. Do **not** start a second sandbox.
- [ ] **AWS login is fresh.** If the sandbox terminal shows `ExpiredToken`, run `aws login --region us-east-2` and pick the "Blank Slate" session.
- [ ] **Dev server is up with LAN access:**
  ```bash
  npm run dev -- --host
  ```
- [ ] **LAN URL is known.** Run `ipconfig getifaddr en0` on the laptop and add `:5173`. Example: `http://10.0.0.12:5173`. Type it into the phone's browser now, not on stage.
- [ ] **Phone is on the same Wi-Fi as the laptop.** Hotspot from the phone to the laptop is a fine backup. Open the LAN URL on the phone and confirm the Report page renders.
- [ ] **Staff console is already signed in** in a second laptop tab at `http://localhost:5173/#admin`. The login is in `STAFF-LOGIN.local.md` on the driver's laptop. Sign in before you walk up, so nobody watches you type a password.
- [ ] **Laptop tab one** is the student Feed at `http://localhost:5173` (Feed tab), so the audience can see the new report land on the big screen.
- [ ] **Screenshots folder is open** in Finder (`screenshots/`) as the Wi-Fi fallback.
- [ ] **Demo photo is ready.** Either a real campus photo you'll take live, or one already in the phone's camera roll (faucet, lights on, overflowing bin).
- [ ] Phone brightness up, Do Not Disturb on, laptop notifications off.

## Student flow (phone, ~35 s)

| # | Tap | What you see | Say |
|---|---|---|---|
| 1 | Open the LAN URL on the phone | Green header, "FixIt Bobcat. See waste. Snap it. Fix it." Report tab active. One big green button. | "I'm a student. One button." |
| 2 | **📷 Snap a photo** | Camera opens (or the picker). Take or choose the photo. | "I take the picture." |
| 3 | Pick the building in the dropdown (it remembers the last choice) | Photo preview, building selected, **🔍 Analyze** button. | "I pick the building." |
| 4 | **🔍 Analyze** | Pulsing 🐾 and "Bobcat is looking…". Usually about one second on Nova Lite. | "Bobcat is looking…" |
| 5 | Wait for the result card | Category chip, severity chip, building chip. Editable title and description. Impact line. Suggested action. Estimated cost. | "Bedrock read the photo and wrote the report. Impact in gallons. A suggested fix. A cost." |
| 6 | (Optional) tap the title field and change one word | Shows the text is editable. | "I can edit it. I don't have to." |
| 7 | **Submit report** | "✅ Reported. Thanks, Bobcat." and a **See the Feed** button. | "Submit. Done." |
| 8 | **See the Feed** | Feed tab: the new report at the top with its thumbnail and chips. Stat tiles above. | "It's on the public Feed now, photo and all." |

Then point at the laptop: the Feed tab on the big screen shows the same card. (Reload the laptop tab if it was open before the submit.)

## Staff flow (laptop, ~25 s)

| # | Click | What you see | Say |
|---|---|---|---|
| 1 | Switch to the signed-in tab at `/#admin` | "Staff console" header, **Sign out** button, three tiles: Open, Expected cost (open), Spent on fixed. Filter bar Open / Fixed / All. | "Now I'm facilities. This page needs a sign-in. Students never see it." |
| 2 | Reload the page if the new report isn't there yet | The student's report appears at the top, status Open. | |
| 3 | Click **Open** in the filter bar | Only open reports, newest first. | "I filter to what's still open." |
| 4 | Click into **Expected cost ($)**, adjust the number, click **Save** | The field saves, the Expected cost (open) tile changes. | "The AI pre-filled the cost. I confirm it." |
| 5 | Click **✓ Mark fixed** | Card gets a green "✓ Fixed" chip. Open tile goes down, Spent on fixed goes up. | "Mark it fixed. The tiles update. That's the whole loop." |
| 6 | (If asked) click **All**, then **Reopen** on the card | Status goes back to Open. | "And we can reopen it if the fix didn't take." |

Do not click **Sign out** during the demo.

## Fallbacks

**Wi-Fi dies (phone can't reach the laptop).**
Open the `screenshots/` folder and walk the five images in order while saying the same lines:
`1-report-idle.png` → `2-result-card.png` → `3-confirmation.png` → `4-feed.png` → `5-staff-console.png`.
Alternative: do the student flow in the laptop browser at 375 px width using a photo from the desktop. The app is the same.

**Bedrock dies ("Bobcat couldn't look at that photo").**
Tap **Try again** once. If it fails again, stop the dev server (Ctrl+C) and restart it in demo mode:
```bash
VITE_DEMO=true npm run dev -- --host
```
The Feed then shows the five seed reports (running faucet, lights on, overflowing recycling, broken fountain, AC with doors open). Demo from the Feed and the staff console, and show the result card from `screenshots/2-result-card.png`.

**Analysis is slow (more than 5 seconds).**
Keep talking. Say this while you wait:
> "Right now the photo is in S3, a Lambda has handed it to Bedrock, and Nova Lite is writing the report. First call after a quiet spell can take a few seconds while the Lambda warms up."
If it reaches the 25-second timeout you'll see the friendly error. Tap **Try again**; the second call is almost always fast.

**Staff tab got signed out.**
Reload `/#admin` and sign in with the login from `STAFF-LOGIN.local.md`. Turn the screen away from the audience while you type.

**The report shows the "Possible issue spotted" fallback text.**
That is the Lambda's safe fallback when the model's JSON couldn't be parsed. Say: "Bobcat flagged it anyway so facilities still gets the ticket." Then tap **Start over** and analyze a different photo.

## Reset between runs

- Student page: tap **Start over** (or reload).
- Staff console: click **Reopen** on anything you marked fixed if you want the same card again, or just leave it. Fixed cards make the "Spent on fixed" tile look good.
