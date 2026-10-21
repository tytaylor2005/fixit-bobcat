import { useEffect, useState, type FormEvent } from 'react';
import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { getStaffClient } from './client';
import { CATEGORY_LABELS } from './buildings';
import { Thumb, severityClass, timeAgo, toItem } from './Feed';
import { Bobcat } from './art';
import { usd } from './format';
import type { ReportItem } from './seed';

type AuthState = 'checking' | 'out' | 'in';
type Filter = 'OPEN' | 'FIXED' | 'ALL';
type Patch = { status?: 'OPEN' | 'FIXED'; estimatedCost?: number | null; actualCost?: number | null };

/** "" → null (clear), "120" → 120, garbage → undefined (invalid, ignore). */
function parseMoney(raw: string): number | null | undefined {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

function DeltaChip({ r }: { r: ReportItem }) {
  if (r.status !== 'FIXED' || r.estimatedCost === null || r.actualCost === null) return null;
  const diff = r.actualCost - r.estimatedCost;
  if (diff === 0) return <span className="chip chip-low">On estimate</span>;
  return diff < 0 ? (
    <span className="chip chip-low">{usd(-diff)} under estimate</span>
  ) : (
    <span className="chip chip-medium">{usd(diff)} over estimate</span>
  );
}

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
      <div className="hero">
        <Bobcat mood="curious" hat size={96} />
        <div className="bubble">
          Staff only past this point.
          <small>Sign in to triage reports, set costs, and mark things fixed.</small>
        </div>
      </div>
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
  const [fixingId, setFixingId] = useState('');
  const [actualDraft, setActualDraft] = useState('');

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
        if (alive) setLoadError("Couldn't load reports. Refresh or sign in again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth]);

  const patch = async (id: string, changes: Patch): Promise<boolean> => {
    setBusyId(id);
    try {
      const { data, errors } = await getStaffClient().models.Report.update({ id, ...changes });
      if (errors?.length || !data) throw new Error(errors?.[0]?.message ?? 'update failed');
      setReports((prev) => prev.map((r) => (r.id === id ? toItem(data) : r)));
      return true;
    } catch (err) {
      console.error('update failed', err);
      alert("Couldn't save that change. Try again.");
      return false;
    } finally {
      setBusyId('');
    }
  };

  const saveCost = async (r: ReportItem) => {
    const raw = costDraft[r.id];
    if (raw === undefined) return;
    const n = parseMoney(raw);
    if (n === undefined) return;
    const ok = await patch(r.id, r.status === 'FIXED' ? { actualCost: n } : { estimatedCost: n });
    if (ok) {
      setCostDraft((d) => {
        const copy = { ...d };
        delete copy[r.id];
        return copy;
      });
    }
  };

  const startFix = (r: ReportItem) => {
    setFixingId(r.id);
    setActualDraft(r.estimatedCost !== null ? String(r.estimatedCost) : '');
  };

  const confirmFix = async (r: ReportItem) => {
    const n = parseMoney(actualDraft);
    if (n === undefined) return;
    const ok = await patch(r.id, { status: 'FIXED', actualCost: n });
    if (ok) setFixingId('');
  };

  const reopen = (r: ReportItem) => void patch(r.id, { status: 'OPEN' });

  const doSignOut = async () => {
    await signOut();
    setReports([]);
    setAuth('out');
  };

  const openItems = reports.filter((r) => r.status === 'OPEN');
  const fixedItems = reports.filter((r) => r.status === 'FIXED');
  const expectedOpen = openItems.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
  const spentFixed = fixedItems.reduce((s, r) => s + (r.actualCost ?? r.estimatedCost ?? 0), 0);
  const visible = filter === 'ALL' ? reports : filter === 'OPEN' ? openItems : fixedItems;

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="brand-emoji" aria-hidden="true">🛠️</span>
            <div>
              <h1 className="brand-title">FixIt Bobcat</h1>
              <p className="brand-tagline">Staff console</p>
            </div>
          </div>
          <nav className="topbar-nav" aria-label="Site">
            <a className="topbar-link" href="#">Student app</a>
            {auth === 'in' && (
              <button type="button" className="btn btn-light btn-small" onClick={doSignOut}>
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container content">
        {auth === 'checking' && (
          <div className="loading" role="status">
            <Bobcat mood="curious" lens size={100} className="mascot-bob" />
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
                <span className="stat-value">{usd(expectedOpen)}</span>
                <span className="stat-label">Expected (open)</span>
              </div>
              <div className="stat">
                <span className="stat-value">{usd(spentFixed)}</span>
                <span className="stat-label">Spent (fixed)</span>
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
                  {f === 'OPEN'
                    ? `Open (${openItems.length})`
                    : f === 'FIXED'
                      ? `Fixed (${fixedItems.length})`
                      : `All (${reports.length})`}
                </button>
              ))}
            </div>

            {loading && (
              <div className="loading" role="status">
                <Bobcat mood="curious" lens size={100} className="mascot-bob" />
                Fetching reports…
              </div>
            )}
            {loadError && <div className="error" role="alert">{loadError}</div>}

            {!loading && !loadError && visible.length === 0 && (
              <section className="empty">
                <Bobcat mood={filter === 'OPEN' ? 'happy' : 'sleepy'} size={92} />
                <p className="empty-text">
                  {filter === 'OPEN' ? 'Nothing open. Nice work.' : 'Nothing here yet.'}
                </p>
              </section>
            )}

            <div className="cards-grid">
            {visible.map((r) => (
              <article key={r.id} className="card feed-card feed-card-static">
                <div className="tile">
                  <Thumb photoKey={r.photoKey} category={r.category} />
                  <span className="tile-tag">{CATEGORY_LABELS[r.category]}</span>
                  {r.status === 'FIXED' && <span className="tile-tag tile-tag-fixed">✓ Fixed</span>}
                </div>
                <div className="feed-body">
                  <h3 className="feed-title">{r.title}</h3>
                  <p className="feed-meta">
                    {r.building} · {timeAgo(r.createdAt)}
                  </p>
                  <div className="chips">
                    <span className={severityClass(r.severity)}>{r.severity} severity</span>
                    <DeltaChip r={r} />
                  </div>
                </div>

                <div className="feed-actions admin-details">
                  {r.description && <p className="card-desc">{r.description}</p>}
                  <p className="feed-impact">📊 {r.impact}</p>
                  {r.action && <p className="muted">🛠️ {r.action}</p>}

                  {r.status === 'FIXED' && (
                    <div className="cost-compare">
                      <span>Estimated {r.estimatedCost === null ? '—' : usd(r.estimatedCost)}</span>
                      <span className="arrow" aria-hidden="true">→</span>
                      <span>Actual {r.actualCost === null ? '—' : usd(r.actualCost)}</span>
                    </div>
                  )}

                  <div className="cost-row">
                    <label className="label" htmlFor={`cost-${r.id}`}>
                      {r.status === 'FIXED' ? 'Actual cost ($)' : 'Expected cost ($)'}
                    </label>
                    <div className="cost-controls">
                      <input
                        id={`cost-${r.id}`}
                        className="input"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        placeholder="0"
                        value={costDraft[r.id] ?? ((r.status === 'FIXED' ? r.actualCost : r.estimatedCost) ?? '')}
                        onChange={(e) => setCostDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => saveCost(r)}
                        disabled={busyId === r.id || costDraft[r.id] === undefined}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {r.status === 'OPEN' ? (
                    fixingId === r.id ? (
                      <div className="fix-panel">
                        <label className="label" htmlFor={`actual-${r.id}`}>What did it actually cost? ($)</label>
                        <input
                          id={`actual-${r.id}`}
                          className="input"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          placeholder="0"
                          value={actualDraft}
                          onChange={(e) => setActualDraft(e.target.value)}
                        />
                        <div className="row-2">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setFixingId('')}
                            disabled={busyId === r.id}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => confirmFix(r)}
                            disabled={busyId === r.id}
                          >
                            {busyId === r.id ? 'Saving…' : '✓ Confirm fixed'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => startFix(r)}
                        disabled={busyId === r.id}
                      >
                        ✓ Mark fixed
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => reopen(r)}
                      disabled={busyId === r.id}
                    >
                      {busyId === r.id ? 'Saving…' : 'Reopen'}
                    </button>
                  )}
                </div>
              </article>
            ))}
            </div>
          </>
        )}
      </main>

      <footer className="container footer">
        <a className="link" href="#">← Back to student app</a>
      </footer>
    </div>
  );
}
