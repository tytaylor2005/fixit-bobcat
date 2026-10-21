You are Terminal B on FixIt Bobcat, a three-terminal Claude Code build with a hard 30-minute deadline. Terminal A (another Claude session, already running) owns the backend (`amplify/`), the running `npx ampx sandbox`, the dev server on port 5173, and demo seed data. Terminal C owns docs and the pitch. You own the FRONTEND ONLY: `src/**`, `public/**`, `index.html`. Touch nothing else.

Read first: `.kiro/steering/fixit-bobcat.md` (palette, rules), `.kiro/specs/fixit-bobcat/requirements.md` (including US-5/US-6 at the bottom), `README.md`. The app is DONE and working end to end: student page at `/`, staff console at `/#admin`. Do not refactor working code, do not change data flow, do not change the model (Nova Lite via the Lambda).

Rules:
- Plain CSS in `src/styles.css` only. No new npm packages. No routers, no state libraries, no UI kits.
- `npx tsc -b` must pass after every item. Check at 375 px wide: no horizontal scroll, every button at least 48 px tall.
- A dev server with HMR is already running at http://localhost:5173. Refresh it to see your changes. If you need your own, run `npm run dev -- --port 5174`. NEVER run `npx ampx sandbox`. Never edit `amplify/`, `amplify_outputs.json`, `STAFF-LOGIN.local.md`, or any `.md` file.
- Git: after each item run `git add <only the files you changed>` (never `git add -A`), commit with a one-line message, then `git pull --rebase origin main && git push origin main`. If a rebase conflicts, resolve only inside your own files.
- Stop adding things at minute 20. Use the last 10 minutes to verify, commit, push, and report.

Do these in order; each one is independently shippable:

1. Brand mark + installable on phones (8 min). In `src/App.tsx` replace the 🐾 emoji in the student header with an inline SVG mark: a bobcat paw print overlapping a wrench, gold `#C9A227` on the navy header, 40×40, `aria-hidden`. Add `public/favicon.svg` (same mark), `public/apple-touch-icon.png` (180×180, navy background, gold mark; render it from the SVG with `qlmanage -t -s 180 -o . file.svg` then `sips -s format png`, or a tiny Node script using only built-ins), and `public/manifest.webmanifest` (name "FixIt Bobcat", short_name "FixIt", start_url "/", display "standalone", background_color "#F7F5EF", theme_color "#0A2240", icons). Link all three from `index.html`. Leave the staff console header (`src/Admin.tsx`) using 🛠️.

2. Student ease of use (7 min), `src/Report.tsx`, idle and confirmation states only. Under the "Snap a photo" button add a small muted three-step hint row: "1 Snap · 2 Bobcat writes the report · 3 Submit". When a photo is picked, scroll the Analyze button into view (`scrollIntoView({ block: 'nearest' })`). On the confirmation screen add a line "Reported in N seconds", where N is measured from the photo pick to the successful submit (keep the start time in a ref). Do NOT change the analyze or submit logic.

3. Feed card detail (5 min), `src/Feed.tsx`. Make each public feed card expandable: tapping the card (or a chevron button with `aria-expanded`) shows the description and the suggested action ("🛠️ …") under the impact line, tapping again collapses it. Keyboard accessible. Fixed cards keep the green Fixed chip.

4. Final pass. `npx tsc -b`, check 375 px on both `/` and `/#admin`, commit, `git pull --rebase origin main`, push. Reply with: what shipped, what did not, and anything Terminal A must know.
