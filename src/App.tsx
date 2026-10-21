import { useEffect, useState } from 'react';
import Report from './Report';
import Feed from './Feed';
import Admin from './Admin';

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

export default function App() {
  const [tab, setTab] = useState<Tab>('report');
  const hash = useHash();

  if (hash === '#admin') return <Admin />;

  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <svg
              className="brand-mark"
              viewBox="0 0 64 64"
              width="40"
              height="40"
              aria-hidden="true"
              focusable="false"
            >
              <g fill="#C9A227">
                <g transform="rotate(45 32 32)">
                  <path d="M28 5.75 L28 17 L36 17 L36 5.75 A11 11 0 1 1 28 5.75 Z" />
                  <rect x="28" y="20" width="8" height="36" rx="4" />
                </g>
                <g stroke="#0A2240" strokeWidth="2">
                  <ellipse cx="40" cy="46" rx="8.5" ry="6.5" />
                  <circle cx="30.5" cy="38.5" r="3.6" />
                  <circle cx="36.5" cy="33" r="3.8" />
                  <circle cx="43.5" cy="33" r="3.8" />
                  <circle cx="49.5" cy="38.5" r="3.6" />
                </g>
              </g>
            </svg>
            <div>
              <h1 className="brand-title">FixIt Bobcat</h1>
              <p className="brand-tagline">See waste. Snap it. Fix it.</p>
            </div>
          </div>
        </div>
        <nav className="container tabs" aria-label="Views">
          <button
            type="button"
            className={`tab ${tab === 'report' ? 'tab-active' : ''}`}
            onClick={() => setTab('report')}
            aria-current={tab === 'report' ? 'page' : undefined}
          >
            📷 Report
          </button>
          <button
            type="button"
            className={`tab ${tab === 'feed' ? 'tab-active' : ''}`}
            onClick={() => setTab('feed')}
            aria-current={tab === 'feed' ? 'page' : undefined}
          >
            📋 Feed
          </button>
        </nav>
      </header>

      <main className="container content">
        {tab === 'report' ? <Report onViewFeed={() => setTab('feed')} /> : <Feed />}
      </main>

      <footer className="container footer">
        <a className="link" href="#admin">Staff sign in</a>
      </footer>
    </div>
  );
}
