# FixIt Bobcat — Requirements

## Problem
Waste on the GCSU campus goes unreported because nobody knows who to tell or how. A running faucet in a residence hall, lights left on in an empty classroom, an overflowing recycling bin, a broken water fountain — students walk past them every day. Facilities can only fix what gets reported.

## One-sentence product
A student snaps a photo of waste on campus; FixIt Bobcat identifies the problem, writes the facilities report for them, estimates the impact, and logs it to a public feed.

## Users
- **Reporter** — any GCSU student with a phone. No account. Must be able to report in under 30 seconds.
- **Viewer** — anyone looking at the Feed (students, facilities staff, judges).

## User stories

### US-1: Report an issue from a photo
As a student, I want to take or choose a photo and have the app figure out what the problem is, so I don't have to write anything.

Acceptance criteria:
1. WHEN I open the app THEN I see the Report view with a large "Snap a photo" button that opens the device camera on mobile (`<input type="file" accept="image/*" capture="environment">`).
2. WHEN I choose a photo THEN I see a preview and a building selector (dropdown of GCSU buildings) and a primary "Analyze" button.
3. WHEN I tap Analyze THEN the photo is uploaded to S3 and sent to the analyze function, and a loading state reads "Bobcat is looking…".
4. WHEN analysis completes THEN I see a result card with: category, a one-line title, a 1–2 sentence description, an impact estimate (string), a severity (low / medium / high), and a suggested action.
5. WHEN analysis fails or times out (> 25 s) THEN I see a friendly error and a "Try again" button, never a blank screen or raw error.

### US-2: Submit the report
As a student, I want to submit the generated report with one tap so it gets logged.

Acceptance criteria:
1. WHEN I tap "Submit report" on the result card THEN a Report record is created in the database with the fields in design.md.
2. WHEN submission succeeds THEN I see a confirmation ("Reported. Thanks, Bobcat.") and a button to view the Feed.
3. The reporter can edit the title and description before submitting (simple text inputs pre-filled by the AI).

### US-3: Browse the Feed
As a viewer, I want to see all reports, newest first, so I can see what's broken and what's been fixed.

Acceptance criteria:
1. WHEN I open the Feed tab THEN I see cards for every report, newest first, each showing the photo thumbnail, title, building, category chip, severity chip, impact estimate, and time ago.
2. WHEN there are no reports THEN I see an empty state with a bobcat emoji and "Nothing reported yet. Be the first."
3. WHEN I tap "Mark fixed" on a card THEN its status becomes `FIXED` and the card shows a green "Fixed" chip. (No auth — anyone can mark fixed; that's fine for the prototype.)
4. The top of the Feed shows three stat tiles: Open reports, Fixed, and "Estimated impact avoided" (sum of a numeric `impactScore` the AI returns, 1–10 per report).

### US-4: Works on a phone
Acceptance criteria:
1. All views render correctly at 375 px width with no horizontal scroll.
2. Primary buttons are at least 48 px tall.

## Non-goals (do NOT build)
- Accounts, login, roles, admin panels.
- Email/SMS notifications to facilities.
- Maps or geolocation (building dropdown is enough).
- Image editing, cropping, multiple photos per report.
- Comments, likes, upvotes.
- Pagination (we will never have more than ~50 reports).

## Issue categories (fixed list)
`WATER` (leaks, running faucets, broken fountains) · `ENERGY` (lights/AC on in empty rooms, open doors with AC running) · `WASTE` (overflowing bins, recycling contamination, litter) · `DAMAGE` (broken fixtures that cause waste) · `OTHER`

## GCSU buildings (fixed list for the dropdown)
Atkinson Hall, Arts & Sciences, Beeson Hall, Bell Hall, Centennial Center, Foundation Hall, Herty Hall, Ina Dillard Russell Library, Kilpatrick Hall, Magnolia Ballroom, Napier Hall, Parkhurst Hall, Sanford Hall, Terrell Hall, The Village, Wells Hall, Wellness & Recreation Center, Other
