import { useEffect, useState } from 'react';
import { Bobcat } from './art';

export const WALKTHROUGH_KEY = 'fixit.walkthrough';

const SLIDES = [
  {
    img: '/walkthrough/1-report-idle.png',
    title: 'Snap it',
    text: 'Open FixIt Bobcat and tap Take a photo. Point at the problem: a running faucet, lights on in an empty room, an overflowing bin, anything broken that wastes.',
    tip: 'No account. No form. One photo.',
  },
  {
    img: '/walkthrough/2-result-card.png',
    title: 'Bobcat looks',
    text: 'In about a second Bobcat names the problem, writes the facilities report, rates the severity, and estimates the waste and the repair cost. Edit the title or description if you like.',
    tip: "Not a real issue? Bobcat says so and lets you pick another photo.",
  },
  {
    img: '/walkthrough/3-confirmation.png',
    title: 'Submit',
    text: 'One tap and it is logged. You see how long it took, the cost estimate, and a thank-you from Bobcat.',
    tip: 'Photos Bobcat is unsure about go to staff for a quick review first.',
  },
  {
    img: '/walkthrough/4-feed.png',
    title: 'Watch it get fixed',
    text: 'Every report lives on the public Feed with its photo, severity, impact, and cost. When Facilities fixes it, the Feed shows what it really cost.',
    tip: 'Staff triage everything in a private console with campus analytics.',
  },
];

export default function Walkthrough({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((v) => Math.min(v + 1, SLIDES.length - 1));
      if (e.key === 'ArrowLeft') setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="wt-backdrop" onClick={onClose}>
      <div
        className="wt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wt-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wt-head">
          <Bobcat mood="happy" size={46} />
          <div className="wt-head-text">
            <p className="wt-kicker">How FixIt Bobcat works</p>
            <h2 id="wt-title" className="wt-title">
              <span className="step-num">{i + 1}</span>
              {s.title}
            </h2>
          </div>
          <button type="button" className="wt-close" onClick={onClose} aria-label="Close walkthrough">
            ×
          </button>
        </div>

        <div className="wt-body">
          <div className="wt-shot">
            <img src={s.img} alt={`Screenshot of the ${s.title} step`} />
          </div>
          <div className="wt-copy">
            <ol className="wt-dots" aria-label="Walkthrough progress">
              {SLIDES.map((slide, k) => (
                <li key={slide.title} className={k === i ? 'is-on' : k < i ? 'is-done' : ''} aria-current={k === i ? 'step' : undefined} />
              ))}
            </ol>
            <p className="wt-text">{s.text}</p>
            <p className="wt-tip">{s.tip}</p>
          </div>
        </div>

        <div className="wt-actions">
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => (i === 0 ? onClose() : setI(i - 1))}
          >
            {i === 0 ? 'Skip' : 'Back'}
          </button>
          <span className="wt-count">
            {i + 1} / {SLIDES.length}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => (last ? onClose() : setI(i + 1))}
          >
            {last ? 'Start reporting' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
