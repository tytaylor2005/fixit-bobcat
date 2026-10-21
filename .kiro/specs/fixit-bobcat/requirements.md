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

## Post-spec additions (requested by the team after Task 13, Oct 21 2026)

### US-5: Staff console (private)
As facilities staff, I want a private page to triage reports, so students can report without accounts while only staff can change records.

Acceptance criteria:
1. `/#admin` shows an email + password sign-in (Cognito user pool from `amplify/auth`). No sign-up; staff accounts are created by an admin with the AWS CLI.
2. WHEN signed in THEN I see all reports newest first with Open / Fixed / All filters and tiles for Open count, expected cost of open issues, and spent on fixed issues.
3. Each report shows the photo, description, impact, suggested action, an editable **Expected cost ($)** (pre-filled by the AI's estimate), and **Mark fixed** / **Reopen**.
4. Only signed-in staff can update or delete reports; the public API key can only create and read. The public Feed no longer has "Mark fixed".

### US-6: Student page stays effortless
1. Root URL is the student page: snap → "Bobcat is looking…" → review → submit, three taps.
2. The building picker remembers the last choice on this device.
3. A small "Staff sign in" link in the footer leads to the staff console.

### US-7: Costs, estimated and actual (added in the final hour)
1. WHEN analysis completes THEN the result card shows Bobcat's estimated repair cost in dollars (or "Quick fix, no parts needed" when the fix is free), and the confirmation screen repeats it.
2. Feed cards show the estimate while a report is open, and "Fixed for $X · est. $Y" once fixed.
3. WHEN staff tap Mark fixed THEN they are asked what the fix actually cost (pre-filled with the estimate) before the status changes. Fixed reports show estimated → actual with an under/over-estimate chip, and the actual cost stays editable.
4. Staff tiles: Open count, Expected cost of open issues, Spent on fixed issues (actual, falling back to the estimate).

### US-8: Personality
A hand-drawn inline-SVG bobcat mascot appears on the student hero, loading, success, error and empty states, and wears a hard hat on the staff sign-in. A faint paw-print pattern sits behind the page.

### US-9: Staff analytics
1. The staff console opens with a KPI row: open issues, fixed (with % resolved), median time to fix, expected cost of open issues, spent on fixes (with % vs estimate), impact avoided (with impact still open).
2. A collapsible "Campus analytics" panel shows reports by category (open vs fixed, one-hue ramp validated for color-vision safety), severity mix of open issues, top buildings, new reports per day for the last 7 days, and a resolution-rate meter. Every chart has a table view and a CSV export.
3. Charts are plain HTML/CSS (no chart library), with hover titles and direct labels.

### US-10: Personality
The student hero shows a rotating "Bobcat fact"; the confirmation screen adds a rotating thank-you line; feed category tags are tinted by category; a faint paw-print pattern sits behind the page.
