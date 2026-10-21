import { useEffect, useRef, useState } from 'react';
import Report from './Report';
import Feed from './Feed';
import Admin from './Admin';
import HowItWorks from './HowItWorks';
import { BrandMark } from './art';

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

  // "#how" (top bar + footer link) must work even when the Feed tab is showing on a phone.
  useEffect(() => {
    if (hash !== '#how') return;
    const t = setTimeout(() => {
      setTab('report');
      requestAnimationFrame(() =>
        document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    }, 0);
    return () => clearTimeout(t);
  }, [hash]);

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
            <BrandMark size={38} tone="light" />
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
        <div className="footer-brand">
          <BrandMark size={28} tone="dark" />
          <span className="footer-wordmark">FixIt Bobcat</span>
          <span className="footer-sub">Georgia College &amp; State University</span>
        </div>
        <div>
          <a className="link" href="#how">How it works</a>
          <span className="footer-dot" aria-hidden="true">·</span>
          <a className="link" href="#admin">Staff sign in</a>
        </div>
      </footer>
    </div>
  );
}
