import { useState } from 'react';
import Report from './Report';
import Feed from './Feed';

export type Tab = 'report' | 'feed';

export default function App() {
  const [tab, setTab] = useState<Tab>('report');

  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <span className="brand-emoji" aria-hidden="true">🐾</span>
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
    </div>
  );
}
