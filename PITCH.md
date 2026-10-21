# FixIt Bobcat — Pitch (2 minutes, spoken)

> Read this out loud. Short sentences. Breathe at the blank lines.
> Rubric words are in **bold** so you don't forget to say them: **completion, original, learned, design, technical.**

---

## Hook (15 s)

Last week a faucet in Beeson Hall ran for three days.

Everybody saw it. Nobody knew who to tell.

That's the problem. Waste on campus goes unreported, because reporting is work.

FixIt Bobcat makes it three taps. See waste. Snap it. Fix it.

## Demo (60 s)

*(Phone in hand. Start on the student page.)*

I'm a student. I open the app. One big button: Snap a photo.

I take the picture. I pick the building. I tap Analyze.

"Bobcat is looking…" *(wait a beat)*

And here's the report. Amazon Bedrock looked at the photo and wrote it.

Category: Water. Severity. A title. A plain-English description for facilities.

An impact estimate, in gallons per day. A suggested fix. And a repair cost.

I can edit the text if I want. I don't need to. Submit.

Reported. Thanks, Bobcat. It's on the public Feed right now, with the photo.

*(Switch to the laptop.)*

Now I'm facilities staff. This is the private console. I had to sign in to get here.

Same report, newest first. I filter to Open. I confirm the expected cost. I mark it fixed.

The tiles update. That's the full loop: student, AI, staff, done.

## Under the hood (20 s)

**Technical** side: exactly three AWS services, all in us-east-2.

The photo goes to S3. One Lambda sends it to Bedrock through the Converse API, with the image as input.

Bedrock returns strict JSON. That becomes a DynamoDB record through AppSync.

Students never log in. The public key can only create and read. Only signed-in staff can change a record.

It's serverless, so there's nothing to run. Each report costs a fraction of a cent.

## What we learned (15 s)

We **learned** fast. The spec said Claude Sonnet 4. That model is end-of-life on Bedrock.

Every Anthropic model needs a use-case form on this account. So we switched to Amazon Nova Lite.

It read the photos well and answered in about a second.

Nova sometimes echoed our category list back at us with a stray brace. So the Lambda infers the category from the text and pulls the first balanced JSON object.

Finished and simple beat ambitious and broken.

## Who it helps (10 s)

Facilities gets a free, photo-first reporting layer with a cost on every ticket.

Students get a reason to notice. Campus wastes less.

**Completion**: the whole loop works, end to end, from a phone.

**Original**: nobody asked students to write a work order. The AI writes it. The student just points.

**Design**: one button per screen, Bobcat colors, built for a phone.

See waste. Snap it. Fix it. Thank you.

---

## Q&A cheat sheet (30 seconds each, max)

**What does a report cost to run?**
A fraction of a cent. Nova Lite on Bedrock prices by the token. One photo plus a short prompt, with a 400-token answer, is well under a penny. The Lambda, S3, and DynamoDB usage per report is pennies per thousand.

**What about privacy?**
There are no student accounts, so nothing identifies the reporter. Photos sit in a private S3 bucket. The browser gets short-lived presigned URLs to show them, and the only credentials the public app holds are a guest identity and a read-and-create API key.

**Does it scale?**
It's all serverless: S3, Lambda, Bedrock, AppSync, DynamoDB, Cognito. There is no server to run and nothing to patch. A whole campus reporting at once is still a small day for those services.

**Why Nova Lite and not Claude?**
The spec called for Claude Sonnet 4, which is end-of-life on Bedrock, and this account needs the Anthropic use-case form approved before any Anthropic model will answer. The model id is one environment variable, so swapping back after approval is a thirty-second change.

**Why the staff console if the spec said no auth?**
Amplify Storage guest access refused to deploy without an auth resource. We added a Cognito user pool just for the identity pool. Then we realized that same pool could be the staff sign-in, which fixed the "anyone can mark fixed" problem for free.

**What would you add next?**
Amplify Hosting for a public URL. A location pin instead of a building dropdown. An email to the facilities desk when severity is high. And a monthly "waste avoided" number on the Feed that the sustainability office can quote.
