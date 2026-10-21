import { useMemo, useState } from 'react';
import { CATEGORY_LABELS, type Category, type Severity } from './buildings';
import { usd } from './format';
import type { ReportItem } from './seed';

/* Colors validated with the dataviz palette validator (light surface #ffffff):
   one-hue ordinal ramp open #17804a -> fixed #6cc48f (passes), single-hue bars #17804a (4.97:1).
   Severity uses the app's status colors with icon + label pairing. */

const CATEGORY_ORDER: Category[] = ['WATER', 'ENERGY', 'WASTE', 'DAMAGE', 'OTHER'];
const SEVERITY_ORDER: Severity[] = ['HIGH', 'MEDIUM', 'LOW'];
const DAY = 24 * 60 * 60 * 1000;

interface Props {
  reports: ReportItem[];
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function fmtDays(ms: number): string {
  const h = ms / (60 * 60 * 1000);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} hr`;
  return `${(h / 24).toFixed(1)} days`;
}

function toCsv(reports: ReportItem[]): string {
  const cols = ['id', 'createdAt', 'status', 'building', 'category', 'severity', 'title', 'impact', 'impactScore', 'estimatedCost', 'actualCost', 'action'] as const;
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...reports.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export default function Analytics({ reports }: Props) {
  const [tableOpen, setTableOpen] = useState(false);

  const m = useMemo(() => {
    const open = reports.filter((r) => r.status === 'OPEN');
    const fixed = reports.filter((r) => r.status === 'FIXED');

    const byCategory = CATEGORY_ORDER.map((c) => ({
      category: c,
      open: open.filter((r) => r.category === c).length,
      fixed: fixed.filter((r) => r.category === c).length,
    })).filter((row) => row.open + row.fixed > 0);
    const maxCat = Math.max(1, ...byCategory.map((r) => r.open + r.fixed));

    const bySeverity = SEVERITY_ORDER.map((s) => ({ severity: s, count: open.filter((r) => r.severity === s).length }));
    const sevTotal = Math.max(1, bySeverity.reduce((a, b) => a + b.count, 0));

    const buildingCounts = new Map<string, { total: number; open: number }>();
    for (const r of reports) {
      const b = buildingCounts.get(r.building) ?? { total: 0, open: 0 };
      b.total += 1;
      if (r.status === 'OPEN') b.open += 1;
      buildingCounts.set(r.building, b);
    }
    const buildings = [...buildingCounts.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .slice(0, 5);
    const maxBuilding = Math.max(1, ...buildings.map((b) => b.total));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * DAY);
      const next = new Date(d.getTime() + DAY);
      const count = reports.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), count, iso: d.toISOString().slice(0, 10) };
    });
    const maxDay = Math.max(1, ...days.map((d) => d.count));

    const fixTimes = fixed
      .filter((r) => r.updatedAt)
      .map((r) => new Date(r.updatedAt as string).getTime() - new Date(r.createdAt).getTime())
      .filter((ms) => ms > 0);
    const medianFix = median(fixTimes);

    const expectedOpen = open.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
    const spent = fixed.reduce((s, r) => s + (r.actualCost ?? r.estimatedCost ?? 0), 0);
    const both = fixed.filter((r) => r.estimatedCost !== null && r.actualCost !== null);
    const estSum = both.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);
    const actSum = both.reduce((s, r) => s + (r.actualCost ?? 0), 0);
    const variance = estSum > 0 ? Math.round(((actSum - estSum) / estSum) * 100) : null;

    const impactOpen = open.reduce((s, r) => s + (r.impactScore || 0), 0);
    const impactAvoided = fixed.reduce((s, r) => s + (r.impactScore || 0), 0);
    const resolution = reports.length ? Math.round((fixed.length / reports.length) * 100) : 0;

    return {
      open, fixed, byCategory, maxCat, bySeverity, sevTotal, buildings, maxBuilding, days, maxDay,
      medianFix, expectedOpen, spent, variance, both: both.length, impactOpen, impactAvoided, resolution,
    };
  }, [reports]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(reports)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixit-bobcat-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="analytics" aria-label="Campus analytics">
      <div className="kpis">
        <div className="kpi">
          <span className="kpi-value">{m.open.length}</span>
          <span className="kpi-label">Open issues</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{m.fixed.length}</span>
          <span className="kpi-label">Fixed</span>
          <span className="kpi-delta">{m.resolution}% resolved</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{m.medianFix === null ? '—' : fmtDays(m.medianFix)}</span>
          <span className="kpi-label">Median time to fix</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{usd(m.expectedOpen)}</span>
          <span className="kpi-label">Expected cost, open</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{usd(m.spent)}</span>
          <span className="kpi-label">Spent on fixes</span>
          {m.variance !== null && (
            <span className={`kpi-delta ${m.variance > 0 ? 'is-over' : 'is-under'}`}>
              {m.variance > 0 ? '+' : ''}{m.variance}% vs estimate ({m.both} fixed)
            </span>
          )}
        </div>
        <div className="kpi">
          <span className="kpi-value">{m.impactAvoided}</span>
          <span className="kpi-label">Impact avoided</span>
          <span className="kpi-delta">{m.impactOpen} still open</span>
        </div>
      </div>

      <details className="charts" open>
        <summary className="charts-summary">
          <span>Campus analytics</span>
          <span className="charts-hint">Tap to collapse</span>
        </summary>

        <div className="charts-grid">
          <figure className="chart">
            <figcaption>
              <h3 className="chart-title">Reports by category</h3>
              <p className="chart-sub">Open and fixed, all time</p>
            </figcaption>
            <ul className="legend" aria-label="Legend">
              <li className="legend-item"><span className="swatch sw-open" />Open</li>
              <li className="legend-item"><span className="swatch sw-fixed" />Fixed</li>
            </ul>
            <div className="bars">
              {m.byCategory.map((row) => {
                const total = row.open + row.fixed;
                return (
                  <div className="bar-row" key={row.category}>
                    <span className="bar-label">{CATEGORY_LABELS[row.category]}</span>
                    <div className="bar-track" title={`${CATEGORY_LABELS[row.category]}: ${row.open} open, ${row.fixed} fixed`}>
                      {row.open > 0 && (
                        <span className="bar-seg seg-open" style={{ width: `${(row.open / m.maxCat) * 100}%` }} />
                      )}
                      {row.fixed > 0 && (
                        <span className="bar-seg seg-fixed" style={{ width: `${(row.fixed / m.maxCat) * 100}%` }} />
                      )}
                      <span className="bar-value">{total}</span>
                    </div>
                  </div>
                );
              })}
              {m.byCategory.length === 0 && <p className="chart-empty">No reports yet.</p>}
            </div>
          </figure>

          <figure className="chart">
            <figcaption>
              <h3 className="chart-title">Severity of open issues</h3>
              <p className="chart-sub">{m.open.length} open</p>
            </figcaption>
            <div className="sev-bar" role="img" aria-label={m.bySeverity.map((s) => `${s.count} ${s.severity.toLowerCase()}`).join(', ')}>
              {m.bySeverity.map((s) =>
                s.count > 0 ? (
                  <span
                    key={s.severity}
                    className={`sev-seg sev-${s.severity.toLowerCase()}`}
                    style={{ width: `${(s.count / m.sevTotal) * 100}%` }}
                    title={`${s.severity}: ${s.count}`}
                  >
                    {s.count / m.sevTotal >= 0.18 ? s.count : ''}
                  </span>
                ) : null,
              )}
            </div>
            <ul className="legend" aria-label="Severity legend">
              {m.bySeverity.map((s) => (
                <li className="legend-item" key={s.severity}>
                  <span className={`swatch dot-${s.severity.toLowerCase()}`} />
                  {s.severity === 'HIGH' ? 'High' : s.severity === 'MEDIUM' ? 'Medium' : 'Low'} · {s.count}
                </li>
              ))}
            </ul>
          </figure>

          <figure className="chart">
            <figcaption>
              <h3 className="chart-title">Where it's happening</h3>
              <p className="chart-sub">Top buildings by reports</p>
            </figcaption>
            <div className="bars">
              {m.buildings.map((b) => (
                <div className="bar-row" key={b.name}>
                  <span className="bar-label">{b.name}</span>
                  <div className="bar-track" title={`${b.name}: ${b.total} reports, ${b.open} open`}>
                    <span className="bar-seg seg-open" style={{ width: `${(b.total / m.maxBuilding) * 100}%` }} />
                    <span className="bar-value">{b.total}{b.open > 0 ? ` · ${b.open} open` : ''}</span>
                  </div>
                </div>
              ))}
              {m.buildings.length === 0 && <p className="chart-empty">No reports yet.</p>}
            </div>
          </figure>

          <figure className="chart">
            <figcaption>
              <h3 className="chart-title">Last 7 days</h3>
              <p className="chart-sub">New reports per day</p>
            </figcaption>
            <div className="cols" role="img" aria-label={m.days.map((d) => `${d.label} ${d.count}`).join(', ')}>
              {m.days.map((d) => (
                <div className="col-item" key={d.iso} title={`${d.iso}: ${d.count} report${d.count === 1 ? '' : 's'}`}>
                  <span className="col-value">{d.count > 0 ? d.count : ''}</span>
                  <span className="col-bar" style={{ height: `${Math.max(d.count > 0 ? 6 : 2, (d.count / m.maxDay) * 100)}%` }} />
                  <span className="col-day">{d.label}</span>
                </div>
              ))}
            </div>
          </figure>

          <figure className="chart chart-wide">
            <figcaption>
              <h3 className="chart-title">Resolution rate</h3>
              <p className="chart-sub">{m.fixed.length} of {reports.length} reports fixed</p>
            </figcaption>
            <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={m.resolution} aria-label="Share of reports fixed">
              <span className="meter-fill" style={{ width: `${m.resolution}%` }} />
            </div>
            <p className="chart-sub">{m.resolution}% fixed · {m.open.length} still open</p>
          </figure>
        </div>

        <div className="chart-actions">
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setTableOpen((v) => !v)}>
            {tableOpen ? 'Hide table' : 'Table view'}
          </button>
          <button type="button" className="btn btn-secondary btn-small" onClick={exportCsv} disabled={reports.length === 0}>
            Export CSV
          </button>
        </div>

        {tableOpen && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Category</th><th>Open</th><th>Fixed</th><th>Total</th></tr>
              </thead>
              <tbody>
                {m.byCategory.map((row) => (
                  <tr key={row.category}>
                    <td>{CATEGORY_LABELS[row.category]}</td>
                    <td>{row.open}</td>
                    <td>{row.fixed}</td>
                    <td>{row.open + row.fixed}</td>
                  </tr>
                ))}
                {m.buildings.map((b) => (
                  <tr key={b.name}>
                    <td>{b.name}</td>
                    <td>{b.open}</td>
                    <td>{b.total - b.open}</td>
                    <td>{b.total}</td>
                  </tr>
                ))}
                {m.days.map((d) => (
                  <tr key={d.iso}>
                    <td>{d.iso}</td>
                    <td colSpan={2}>new reports</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </section>
  );
}
