import { Bobcat } from './art';

const STEPS = [
  {
    n: 1,
    icon: '📷',
    title: 'Snap it',
    text: 'Point your phone at the problem and take one photo. A running faucet, lights on in an empty room, an overflowing bin, a broken fountain, a door propped open with the AC on.',
  },
  {
    n: 2,
    icon: '🔍',
    title: 'Bobcat looks',
    text: 'Your photo goes to an AI vision model on Amazon Bedrock. In about a second it names the problem, writes a short facilities report, rates the severity, estimates the waste in real units, and guesses what the fix will cost.',
  },
  {
    n: 3,
    icon: '✏️',
    title: 'You review',
    text: 'Read what Bobcat wrote. Fix the title or description if it missed something. Nothing is sent until you tap Submit.',
  },
  {
    n: 4,
    icon: '📣',
    title: 'It gets fixed',
    text: 'Your report lands on the public Feed right away. Facilities staff see it in their console, set the expected cost, and mark it fixed. The Feed then shows that it was fixed and what it really cost.',
  },
];

const FAQ = [
  {
    q: 'What should I photograph?',
    a: 'Anything on campus that wastes water, energy, or materials, or is broken in a way that causes waste. Get the whole fixture in the frame, and include a room number or sign if there is one nearby. Lights on or daylight helps Bobcat see.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. There is no sign-up, no name, no email, and no location tracking. Just pick the building from the list so Facilities knows where to go.',
  },
  {
    q: 'Where does my photo go?',
    a: 'It is uploaded to a private storage bucket in our AWS account and shown only on the Feed as a thumbnail. It is not posted anywhere else.',
  },
  {
    q: 'What if Bobcat gets it wrong?',
    a: 'Edit the title and description before you submit. If the AI could not read the photo at all, you will see a friendly message with a Try again button, or you can pick a different photo.',
  },
  {
    q: 'How are the estimates made?',
    a: 'The AI gives a rough impact figure (gallons per week, kWh per day, pounds of waste) and a ballpark repair cost from what it sees. Staff can correct the cost, and once an issue is fixed the real cost is shown next to the estimate.',
  },
  {
    q: 'How long does it take?',
    a: 'Most reports take about ten seconds from photo to Feed. The confirmation screen shows your time.',
  },
];

const STUDENT_BENEFITS = [
  { icon: '⚡', title: 'Ten seconds', text: 'Photo to Feed, start to finish.' },
  { icon: '🙈', title: 'No account', text: 'No sign-up, no name, no email.' },
  { icon: '✍️', title: 'Bobcat writes it', text: 'Title, description, severity, impact, cost.' },
  { icon: '📊', title: 'Real numbers', text: 'Gallons, kWh, pounds, and dollars.' },
  { icon: '👀', title: 'See it fixed', text: 'The Feed shows the fix and what it cost.' },
  { icon: '🌱', title: 'Less waste', text: 'Every report is water, power, or material saved.' },
];

const STAFF_BENEFITS = [
  { icon: '🗂️', title: 'A triage queue', text: 'Photos, severity, location, and a suggested fix.' },
  { icon: '💵', title: 'Costs that add up', text: 'Expected vs actual on every fix.' },
  { icon: '📈', title: 'Campus analytics', text: 'Categories, hot spots, trends, CSV export.' },
  { icon: '🛡️', title: 'Built-in guardrails', text: 'AI relevance gate, duplicate check, review queue.' },
];

export default function HowItWorks({ onWalkthrough }: { onWalkthrough?: () => void }) {
  return (
    <section className="card how" id="how">
      <div className="hero">
        <Bobcat mood="happy" size={72} />
        <div>
          <h2 className="card-title">How it works</h2>
          <p className="muted">One photo. Bobcat does the paperwork.</p>
        </div>
      </div>

      <ol className="how-steps">
        {STEPS.map((s) => (
          <li key={s.n} className="how-step">
            <span className="how-icon" aria-hidden="true">{s.icon}</span>
            <div>
              <h3 className="how-title">
                <span className="step-num">{s.n}</span>
                {s.title}
              </h3>
              <p className="how-text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="benefits">
        <h3 className="how-h3">Why students use it</h3>
        <ul className="benefit-grid">
          {STUDENT_BENEFITS.map((b) => (
            <li key={b.title} className="benefit">
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <span className="benefit-title">{b.title}</span>
              <span className="benefit-text">{b.text}</span>
            </li>
          ))}
        </ul>
        <h3 className="how-h3">Why Facilities likes it</h3>
        <ul className="benefit-grid">
          {STAFF_BENEFITS.map((b) => (
            <li key={b.title} className="benefit">
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <span className="benefit-title">{b.title}</span>
              <span className="benefit-text">{b.text}</span>
            </li>
          ))}
        </ul>
        {onWalkthrough && (
          <button type="button" className="btn btn-secondary" onClick={onWalkthrough}>
            ▶ Watch the 4-step walkthrough
          </button>
        )}
      </div>

      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q} className="faq-item">
            <summary className="faq-q">{f.q}</summary>
            <p className="faq-a">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
