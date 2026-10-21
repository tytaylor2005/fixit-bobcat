import { useEffect, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { getClient } from './client';
import { CATEGORY_LABELS, type Category, type Severity } from './buildings';
import { SEED_REPORTS, type ReportItem } from './seed';

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
  createdAt: string;
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
    createdAt: r.createdAt,
  };
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
        <span className="paw" aria-hidden="true">🐾</span>
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
          <div className="empty-emoji" aria-hidden="true">🐱</div>
          <p className="empty-text">Nothing reported yet. Be the first.</p>
        </section>
      ) : (
        reports.map((r) => (
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
              <p className="feed-impact">📊 {r.impact}</p>
            </div>
          </article>
        ))
      )}
    </>
  );
}
