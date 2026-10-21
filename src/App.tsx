import { useEffect, useRef, useState } from 'react';
import Report from './Report';
import Feed from './Feed';
import Admin from './Admin';
import HowItWorks from './HowItWorks';

export type Tab = 'report' | 'feed';

/** Tiny hash router: "/" is the student app, "/#admin" is the staff side. */
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

/** True on wide screens, where Report and Feed sit side by side instead of behind tabs. */
function useDesktop() {
  const query = '(min-width: 900px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return wide;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('report');
  const hash = useHash();
  const desktop = useDesktop();
  const feedRef = useRef<HTMLDivElement>(null);

  if (hash === '#admin') return <Admin />;

  const viewFeed = () => {
    setTab('feed');
    if (desktop) feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <svg
              className="brand-mark"
              viewBox="0 0 64 64"
              width="36"
              height="36"
              aria-hidden="true"
              focusable="false"
            >
              <g fill="var(--gold)">
                <g transform="rotate(45 32 32)">
                  <path d="M28 5.75 L28 17 L36 17 L36 5.75 A11 11 0 1 1 28 5.75 Z" />
                  <rect x="28" y="20" width="8" height="36" rx="4" />
                </g>
                <g stroke="var(--navy)" strokeWidth="2">
                  <ellipse cx="40" cy="46" rx="8.5" ry="6.5" />
                  <circle cx="30.5" cy="38.5" r="3.6" />
                  <circle cx="37.5" cy="34.5" r="3.6" />
                  <circle cx="45" cy="35.5" r="3.6" />
                  <circle cx="50.5" cy="40.5" r="3.6" />
                </g>
              </g>
            </svg>
            <div>
              <h1 className="brand-title">FixIt Bobcat</h1>
              <p className="brand-tagline">See waste. Snap it. Fix it.</p>
            </div>
          </div>
          <nav className="topbar-nav" aria-label="Site">
            <a className="topbar-link" href="#how">How it works</a>
            <a className="topbar-link" href="#admin">Staff</a>
          </nav>
        </div>
      </header>
      <nav className="container tabs" aria-label="Views">
        <button
          type="button"
          className={`tab ${tab === 'report' ? 'tab-active' : ''}`}
          onClick={() => setTab('report')}
          aria-current={tab === 'report' ? 'page' : undefined}
        >
          Report
        </button>
        <button
          type="button"
          className={`tab ${tab === 'feed' ? 'tab-active' : ''}`}
          onClick={() => setTab('feed')}
          aria-current={tab === 'feed' ? 'page' : undefined}
        >
          Feed
        </button>
      </nav>

      {desktop ? (
        <main className="container content content-desktop">
          <div className="col">
            <Report onViewFeed={viewFeed} />
            <HowItWorks />
          </div>
          <div className="col" ref={feedRef}>
            <Feed />
          </div>
        </main>
      ) : (
        <main className="container content">
          {tab === 'report' ? (
            <>
              <Report onViewFeed={viewFeed} />
              <HowItWorks />
            </>
          ) : (
            <Feed />
          )}
        </main>
      )}

      <footer className="container footer">
        <a className="link" href="#how">How it works</a>
        <span className="footer-dot" aria-hidden="true">·</span>
        <a className="link" href="#admin">Staff sign in</a>
      </footer>
    </div>
  );
}
