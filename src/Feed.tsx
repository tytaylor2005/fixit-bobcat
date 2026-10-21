import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { getClient } from './client';
import { CATEGORY_LABELS, type Category, type Severity } from './buildings';
import { SEED_REPORTS, type ReportItem } from './seed';
import { Bobcat } from './art';
import { usd } from './format';

const DEMO = import.meta.env.VITE_DEMO === 'true';

const CATEGORY_EMOJI: Record<Category, string> = {
  WATER: '💧',
  ENERGY: '💡',
  WASTE: '🗑️',
  DAMAGE: '🔧',
  OTHER: '❓',
};

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export function severityClass(s: Severity) {
  return s === 'HIGH' ? 'chip chip-high' : s === 'MEDIUM' ? 'chip chip-medium' : 'chip chip-low';
}

/** Map a raw Report record from the API into the shape the UI renders. */
export function toItem(r: {
  id: string;
  photoKey: string;
  building: string;
  category?: string | null;
  title: string;
  description?: string | null;
  impact?: string | null;
  impactScore?: number | null;
  severity?: string | null;
  action?: string | null;
  status?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}): ReportItem {
  return {
    id: r.id,
    photoKey: r.photoKey,
    building: r.building,
    category: (r.category ?? 'OTHER') as Category,
    title: r.title,
    description: r.description ?? '',
    impact: r.impact ?? 'Unknown',
    impactScore: r.impactScore ?? 0,
    severity: (r.severity ?? 'MEDIUM') as Severity,
    action: r.action ?? '',
    status: r.status === 'FIXED' ? 'FIXED' : 'OPEN',
    estimatedCost: r.estimatedCost ?? null,
    actualCost: r.actualCost ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt ?? undefined,
  };
}

/** One line about money: the estimate while open, what it really cost once fixed. */
export function CostLine({ r }: { r: ReportItem }) {
  if (r.status === 'FIXED') {
    if (r.actualCost !== null) {
      const est = r.estimatedCost !== null && r.estimatedCost !== r.actualCost ? ` · est. ${usd(r.estimatedCost)}` : '';
      return <p className="cost-line cost-fixed">✅ Fixed for {usd(r.actualCost)}{est}</p>;
    }
    return r.estimatedCost === null ? null : <p className="cost-line cost-fixed">✅ Fixed · est. {usd(r.estimatedCost)}</p>;
  }
  if (r.estimatedCost === null) return null;
  return (
    <p className="cost-line">
      💵 {r.estimatedCost > 0 ? `Est. repair ${usd(r.estimatedCost)}` : 'Quick fix, no parts needed'}
    </p>
  );
}

export function Thumb({ photoKey, category }: { photoKey: string; category: Category }) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    let alive = true;
    if (photoKey.startsWith('seed/')) return;
    getUrl({ path: photoKey })
      .then((r) => alive && setUrl(r.url.toString()))
      .catch(() => alive && setUrl(''));
    return () => {
      alive = false;
    };
  }, [photoKey]);

  if (!url) {
    return (
      <div className="thumb" aria-hidden="true">
        {CATEGORY_EMOJI[category]}
      </div>
    );
  }
  return <img className="thumb" src={url} alt="" loading="lazy" />;
}

export default function Feed() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await getClient().models.Report.list({ limit: 200 });
        const items = (data ?? []).map(toItem);
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (!alive) return;
        setReports(items.length === 0 && DEMO ? SEED_REPORTS : items);
      } catch (err) {
        console.error('feed load failed', err);
        if (alive) setReports(DEMO ? SEED_REPORTS : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const open = reports.filter((r) => r.status === 'OPEN').length;
  const fixed = reports.length - open;
  const impactAvoided = reports.reduce((sum, r) => sum + (r.impactScore || 0), 0);

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <Bobcat mood="curious" lens size={100} className="mascot-bob" />
        Fetching reports…
      </div>
    );
  }

  return (
    <>
      <div className="stats" aria-label="Campus stats">
        <div className="stat">
          <span className="stat-value">{open}</span>
          <span className="stat-label">Open reports</span>
        </div>
        <div className="stat">
          <span className="stat-value">{fixed}</span>
          <span className="stat-label">Fixed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{impactAvoided}</span>
          <span className="stat-label">Impact avoided</span>
        </div>
      </div>

      {reports.length === 0 ? (
        <section className="empty">
          <Bobcat mood="sleepy" size={96} />
          <p className="empty-text">Nothing reported yet. Be the first.</p>
        </section>
      ) : (
        <div className="cards-grid">
        {reports.map((r) => {
          const expanded = openId === r.id;
          const detailId = `feed-detail-${r.id}`;
          return (
            <article
              key={r.id}
              className={`card feed-card ${expanded ? 'feed-card-open' : ''}`}
              onClick={() => toggle(r.id)}
            >
              <div className="tile">
                <Thumb photoKey={r.photoKey} category={r.category} />
                <span className={`tile-tag cat-${r.category.toLowerCase()}`}>{CATEGORY_LABELS[r.category]}</span>
                {r.status === 'FIXED' && <span className="tile-tag tile-tag-fixed">✓ Fixed</span>}
              </div>
              <div className="feed-body">
                <div className="feed-head">
                  <h3 className="feed-title">{r.title}</h3>
                  <button
                    type="button"
                    className="chevron"
                    aria-expanded={expanded}
                    aria-controls={detailId}
                    aria-label={expanded ? 'Hide details' : 'Show details'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(r.id);
                    }}
                  >
                    <span className="chevron-icon" aria-hidden="true">⌄</span>
                  </button>
                </div>
                <p className="feed-meta">
                  {r.building} · {timeAgo(r.createdAt)}
                </p>
                <div className="chips">
                  <span className={severityClass(r.severity)}>{r.severity} severity</span>
                </div>
                <p className="feed-impact">📊 {r.impact}</p>
                <CostLine r={r} />
              </div>
              {expanded && (
                <div id={detailId} className="feed-detail">
                  {r.description && <p className="card-desc">{r.description}</p>}
                  {r.action && <p className="muted">🛠️ {r.action}</p>}
                  {!r.description && !r.action && <p className="muted">No extra details.</p>}
                </div>
              )}
            </article>
          );
        })}
        </div>
      )}
    </>
  );
}
