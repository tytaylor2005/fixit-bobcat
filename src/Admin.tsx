import { useEffect, useState, type FormEvent } from 'react';
import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { getStaffClient } from './client';
import { CATEGORY_LABELS } from './buildings';
import { Thumb, severityClass, timeAgo, toItem } from './Feed';
import type { ReportItem } from './seed';

type AuthState = 'checking' | 'out' | 'in';
type Filter = 'OPEN' | 'FIXED' | 'ALL';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email.trim(), password });
      if (isSignedIn) onSignedIn();
      else setError(`Extra sign-in step required: ${nextStep.signInStep}`);
    } catch (err) {
      console.error('sign in failed', err);
      setError('That email or password did not work.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title">Staff sign in</h2>
      <p className="muted">Facilities and campus staff only.</p>
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState<AuthState>('checking');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<Filter>('OPEN');
  const [busyId, setBusyId] = useState('');
  const [costDraft, setCostDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    getCurrentUser()
      .then(() => setAuth('in'))
      .catch(() => setAuth('out'));
  }, []);

  useEffect(() => {
    if (auth !== 'in') return;
    let alive = true;
    setLoading(true);
    setLoadError('');
    (async () => {
      try {
        const { data, errors } = await getStaffClient().models.Report.list({ limit: 500 });
        if (errors?.length) throw new Error(errors[0].message);
        const items = (data ?? []).map(toItem);
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (alive) setReports(items);
      } catch (err) {
        console.error('admin load failed', err);
        if (alive) setLoadError("Couldn't load reports. Pull to refresh or sign in again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth]);

  const patch = async (id: string, changes: { status?: 'OPEN' | 'FIXED'; estimatedCost?: number | null }) => {
    setBusyId(id);
    try {
      const { data, errors } = await getStaffClient().models.Report.update({ id, ...changes });
      if (errors?.length || !data) throw new Error(errors?.[0]?.message ?? 'update failed');
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...toItem(data) } : r)));
    } catch (err) {
      console.error('update failed', err);
      alert("Couldn't save that change. Try again.");
    } finally {
      setBusyId('');
    }
  };

  const saveCost = (r: ReportItem) => {
    const raw = costDraft[r.id];
    const n = raw === undefined ? r.estimatedCost : raw.trim() === '' ? null : Number(raw);
    if (n !== null && !Number.isFinite(n)) return;
    void patch(r.id, { estimatedCost: n });
  };

  const doSignOut = async () => {
    await signOut();
    setReports([]);
    setAuth('out');
  };

  const openItems = reports.filter((r) => r.status === 'OPEN');
  const fixedItems = reports.filter((r) => r.status === 'FIXED');
  const openCost = openItems.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
  const fixedCost = fixedItems.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
  const visible = filter === 'ALL' ? reports : filter === 'OPEN' ? openItems : fixedItems;

  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner admin-bar">
          <div className="brand">
            <span className="brand-emoji" aria-hidden="true">🛠️</span>
            <div>
              <h1 className="brand-title">FixIt Bobcat</h1>
              <p className="brand-tagline">Staff console</p>
            </div>
          </div>
          {auth === 'in' ? (
            <button type="button" className="btn btn-ghost btn-small" onClick={doSignOut}>
              Sign out
            </button>
          ) : (
            <a className="link link-light" href="#">← Student app</a>
          )}
        </div>
      </header>

      <main className="container content">
        {auth === 'checking' && (
          <div className="loading" role="status">
            <span className="paw" aria-hidden="true">🐾</span>
            Checking sign-in…
          </div>
        )}

        {auth === 'out' && <SignIn onSignedIn={() => setAuth('in')} />}

        {auth === 'in' && (
          <>
            <div className="stats" aria-label="Facilities stats">
              <div className="stat">
                <span className="stat-value">{openItems.length}</span>
                <span className="stat-label">Open</span>
              </div>
              <div className="stat">
                <span className="stat-value">{usd(openCost)}</span>
                <span className="stat-label">Expected cost (open)</span>
              </div>
              <div className="stat">
                <span className="stat-value">{usd(fixedCost)}</span>
                <span className="stat-label">Spent on fixed</span>
              </div>
            </div>

            <div className="filters" role="tablist" aria-label="Filter reports">
              {(['OPEN', 'FIXED', 'ALL'] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  className={`filter ${filter === f ? 'filter-active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'OPEN' ? `Open (${openItems.length})` : f === 'FIXED' ? `Fixed (${fixedItems.length})` : `All (${reports.length})`}
                </button>
              ))}
            </div>

            {loading && (
              <div className="loading" role="status">
                <span className="paw" aria-hidden="true">🐾</span>
                Fetching reports…
              </div>
            )}
            {loadError && <div className="error" role="alert">{loadError}</div>}

            {!loading && !loadError && visible.length === 0 && (
              <section className="empty">
                <div className="empty-emoji" aria-hidden="true">🎉</div>
                <p className="empty-text">
                  {filter === 'OPEN' ? 'Nothing open. Nice work.' : 'Nothing here yet.'}
                </p>
              </section>
            )}

            {visible.map((r) => (
              <article key={r.id} className="card feed-card">
                <Thumb photoKey={r.photoKey} category={r.category} />
                <div className="feed-body">
                  <h3 className="feed-title">{r.title}</h3>
                  <p className="feed-meta">
                    📍 {r.building} · {timeAgo(r.createdAt)}
                  </p>
                  <div className="chips">
                    <span className="chip chip-category">{CATEGORY_LABELS[r.category]}</span>
                    <span className={severityClass(r.severity)}>{r.severity}</span>
                    {r.status === 'FIXED' && <span className="chip chip-fixed">✓ Fixed</span>}
                  </div>
                </div>

                <div className="feed-actions admin-details">
                  {r.description && <p className="card-desc">{r.description}</p>}
                  <p className="feed-impact">📊 {r.impact}</p>
                  {r.action && <p className="muted">🛠️ {r.action}</p>}

                  <div className="cost-row">
                    <label className="label" htmlFor={`cost-${r.id}`}>Expected cost ($)</label>
                    <div className="cost-controls">
                      <input
                        id={`cost-${r.id}`}
                        className="input"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        placeholder="0"
                        value={costDraft[r.id] ?? (r.estimatedCost ?? '')}
                        onChange={(e) => setCostDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => saveCost(r)}
                        disabled={busyId === r.id}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {r.status === 'OPEN' ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => patch(r.id, { status: 'FIXED' })}
                      disabled={busyId === r.id}
                    >
                      {busyId === r.id ? 'Saving…' : '✓ Mark fixed'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => patch(r.id, { status: 'OPEN' })}
                      disabled={busyId === r.id}
                    >
                      {busyId === r.id ? 'Saving…' : 'Reopen'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </>
        )}
      </main>

      <footer className="container footer">
        <a className="link" href="#">← Back to student app</a>
      </footer>
    </div>
  );
}
