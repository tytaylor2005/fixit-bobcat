import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { getClient } from './client';
import { BUILDINGS, CATEGORY_LABELS, type Category, type Severity } from './buildings';
import { Bobcat } from './art';
import { usd } from './format';

type Phase = 'idle' | 'picked' | 'analyzing' | 'result' | 'submitting' | 'done' | 'error';

interface Analysis {
  category: Category;
  title: string;
  description: string;
  impact: string;
  impactScore: number;
  severity: Severity;
  action: string;
  estimatedCost: number | null;
}

interface ReportProps {
  onViewFeed: () => void;
}

const ANALYZE_TIMEOUT_MS = 25_000;
const MAX_EDGE = 1600;

const BUILDING_KEY = 'fixit.building';
const rememberedBuilding = (): string => {
  try {
    const saved = localStorage.getItem(BUILDING_KEY);
    return saved && (BUILDINGS as readonly string[]).includes(saved) ? saved : BUILDINGS[0];
  } catch {
    return BUILDINGS[0];
  }
};

const CATEGORY_SET = new Set<string>(['WATER', 'ENERGY', 'WASTE', 'DAMAGE', 'OTHER']);
const SEVERITY_SET = new Set<string>(['LOW', 'MEDIUM', 'HIGH']);

/** Downscale to a JPEG ≤ MAX_EDGE on the long side. Falls back to the original file. */
async function toJpeg(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

function severityClass(s: Severity) {
  return s === 'HIGH' ? 'chip chip-high' : s === 'MEDIUM' ? 'chip chip-medium' : 'chip chip-low';
}

const STAGES = ['Snap', 'Look', 'Review', 'Done'] as const;

function stageOf(phase: Phase): number {
  switch (phase) {
    case 'idle':
    case 'picked':
      return 0;
    case 'analyzing':
    case 'error':
      return 1;
    case 'result':
    case 'submitting':
      return 2;
    case 'done':
      return 3;
  }
}

/** Four-dot progress strip at the top of the report card so students always know where they are. */
function Stepper({ phase }: { phase: Phase }) {
  const cur = stageOf(phase);
  return (
    <ol className="stepper" aria-label="Progress">
      {STAGES.map((label, i) => (
        <li
          key={label}
          className={`stepper-item ${i < cur ? 'is-done' : i === cur ? 'is-current' : ''}`}
          aria-current={i === cur ? 'step' : undefined}
        >
          <span className="stepper-dot" aria-hidden="true">{i < cur ? '✓' : i + 1}</span>
          <span className="stepper-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Report({ onViewFeed }: ReportProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [building, setBuilding] = useState<string>(rememberedBuilding);
  const [photoKey, setPhotoKey] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const analyzeRef = useRef<HTMLButtonElement>(null);
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number | null>(null);

  // Once a photo is picked, bring the primary action into view on small screens.
  useEffect(() => {
    if (phase === 'picked') analyzeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [phase]);

  // Measure photo pick -> successful submit without touching the analyze/submit logic.
  useEffect(() => {
    if (phase === 'done' && startedAtRef.current !== null) {
      setElapsedSec(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
    }
  }, [phase]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    startedAtRef.current = Date.now();
    setElapsedSec(null);
    setFile(f);
    setPhotoKey('');
    setAnalysis(null);
    setErrorMsg('');
    setPhase('picked');
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl('');
    setPhotoKey('');
    setAnalysis(null);
    setErrorMsg('');
    startedAtRef.current = null;
    setElapsedSec(null);
    setPhase('idle');
    if (cameraRef.current) cameraRef.current.value = '';
    if (libraryRef.current) libraryRef.current.value = '';
  };

  const analyze = async () => {
    if (!file) return;
    setPhase('analyzing');
    setErrorMsg('');
    try {
      const jpeg = await toJpeg(file);
      const key = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      await withTimeout(
        uploadData({ path: key, data: jpeg, options: { contentType: 'image/jpeg' } }).result,
        ANALYZE_TIMEOUT_MS,
      );
      setPhotoKey(key);

      const { data, errors } = await withTimeout(
        getClient().queries.analyze({ photoKey: key, building }),
        ANALYZE_TIMEOUT_MS,
      );
      if (errors?.length || !data) throw new Error(errors?.[0]?.message ?? 'No analysis returned');

      const category = String(data.category ?? 'OTHER').toUpperCase();
      const severity = String(data.severity ?? 'MEDIUM').toUpperCase();
      const result: Analysis = {
        category: (CATEGORY_SET.has(category) ? category : 'OTHER') as Category,
        title: data.title ?? 'Possible issue spotted',
        description: data.description ?? '',
        impact: data.impact ?? 'Unknown',
        impactScore: Math.min(10, Math.max(1, Math.round(Number(data.impactScore ?? 3)))),
        severity: (SEVERITY_SET.has(severity) ? severity : 'MEDIUM') as Severity,
        action: data.action ?? '',
        estimatedCost: typeof data.estimatedCost === 'number' ? data.estimatedCost : null,
      };
      setAnalysis(result);
      setTitle(result.title);
      setDescription(result.description);
      setPhase('result');
    } catch (err) {
      console.error('analyze failed', err);
      const timedOut = err instanceof Error && err.message === 'timeout';
      setErrorMsg(
        timedOut
          ? 'Bobcat took too long to look. Check your connection and try again.'
          : "Bobcat couldn't look at that photo. Give it another try.",
      );
      setPhase('error');
    }
  };

  const submit = async () => {
    if (!analysis || !photoKey) return;
    setPhase('submitting');
    try {
      const { errors } = await getClient().models.Report.create({
        photoKey,
        building,
        category: analysis.category,
        title: title.trim() || analysis.title,
        description: description.trim(),
        impact: analysis.impact,
        impactScore: analysis.impactScore,
        severity: analysis.severity,
        action: analysis.action,
        status: 'OPEN',
        estimatedCost: analysis.estimatedCost,
      });
      if (errors?.length) throw new Error(errors[0].message);
      setPhase('done');
    } catch (err) {
      console.error('submit failed', err);
      setErrorMsg("Couldn't save the report. Try submitting again.");
      setPhase('result');
    }
  };

  // ---------- Render ----------

  if (phase === 'done') {
    return (
      <section className="card report-card">
        <Stepper phase={phase} />
        <div className="hero hero-center">
          <Bobcat mood="happy" size={104} />
        </div>
        <div className="success">✅ Reported. Thanks, Bobcat.</div>
        {elapsedSec !== null && (
          <p className="muted reported-in">⏱️ Reported in {elapsedSec} second{elapsedSec === 1 ? '' : 's'}</p>
        )}
        {analysis && analysis.estimatedCost !== null && (
          <p className="cost-line">
            💵 {analysis.estimatedCost > 0 ? `Bobcat estimates this fix at ${usd(analysis.estimatedCost)}` : 'Quick fix, no parts needed'}
          </p>
        )}
        <p className="muted">Facilities can see it on the Feed now.</p>
        <button type="button" className="btn btn-primary" onClick={onViewFeed}>
          See the Feed
        </button>
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Report another
        </button>
      </section>
    );
  }

  if (phase === 'analyzing') {
    return (
      <section className="card report-card">
        <Stepper phase={phase} />
        {previewUrl && <img className="preview" src={previewUrl} alt="Your photo" />}
        <div className="loading" role="status" aria-live="polite">
          <Bobcat mood="curious" lens size={110} className="mascot-bob" />
          Bobcat is looking…
        </div>
      </section>
    );
  }

  if (phase === 'error') {
    return (
      <section className="card report-card">
        <Stepper phase={phase} />
        {previewUrl && <img className="preview" src={previewUrl} alt="Your photo" />}
        <div className="hero">
          <Bobcat mood="sleepy" size={84} />
          <div className="error" role="alert">{errorMsg}</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={analyze}>
          Try again
        </button>
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Pick a different photo
        </button>
      </section>
    );
  }

  if ((phase === 'result' || phase === 'submitting') && analysis) {
    return (
      <section className="card report-card">
        <Stepper phase={phase} />
        {previewUrl && <img className="preview" src={previewUrl} alt="Your photo" />}
        <div className="chips">
          <span className="chip chip-category">{CATEGORY_LABELS[analysis.category]}</span>
          <span className={severityClass(analysis.severity)}>{analysis.severity} severity</span>
          <span className="chip chip-category">{building}</span>
        </div>

        <div className="field">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={400}
          />
        </div>

        <p className="feed-impact">📊 Impact: {analysis.impact}</p>
        <p className="cost-line">
          💵{' '}
          {analysis.estimatedCost === null
            ? 'Repair cost: unknown'
            : analysis.estimatedCost > 0
              ? `Estimated repair cost: ${usd(analysis.estimatedCost)}`
              : 'Quick fix, no parts needed'}
        </p>
        <p className="muted">🛠️ {analysis.action}</p>

        {errorMsg && <div className="error" role="alert">{errorMsg}</div>}

        <button
          type="button"
          className="btn btn-primary sticky-cta"
          onClick={submit}
          disabled={phase === 'submitting'}
        >
          {phase === 'submitting' ? 'Saving…' : 'Submit report'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={reset} disabled={phase === 'submitting'}>
          Start over
        </button>
      </section>
    );
  }

  // idle / picked
  return (
    <section className={`card report-card ${phase === 'idle' ? 'card-idle card-dark' : ''}`}>
      <Stepper phase={phase} />
      {phase === 'idle' ? (
        <div className="hero-stack">
          <div className="mascot-disc">
            <Bobcat mood="curious" size={84} />
          </div>
          <h2 className="display">Spot something wasteful on campus?</h2>
          <p className="lede">
            Snap it. Bobcat writes the facilities report, sizes up the waste, and estimates the fix.
          </p>
        </div>
      ) : (
        previewUrl && <img className="preview" src={previewUrl} alt="Your photo" />
      )}

      <input
        ref={cameraRef}
        id="photo-camera"
        className="file-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
      />
      <input
        ref={libraryRef}
        id="photo-library"
        className="file-input"
        type="file"
        accept="image/*"
        onChange={onPick}
      />

      {phase === 'idle' ? (
        <>
          <div className="cta-group">
            <label htmlFor="photo-camera" className="btn btn-light btn-xl">
              Take a photo
            </label>
            <label htmlFor="photo-library" className="btn btn-outline-light">
              Choose from library
            </label>
          </div>
          <div className="spots" aria-label="What Bobcat can spot">
            <p className="spots-label">Bobcat spots</p>
            <span className="spot">💧 Running water</span>
            <span className="spot">💡 Lights left on</span>
            <span className="spot">🗑️ Overflowing bins</span>
            <span className="spot">🔧 Broken fixtures</span>
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <label className="label" htmlFor="building">Where is this?</label>
            <select
              id="building"
              className="select"
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                try {
                  localStorage.setItem(BUILDING_KEY, e.target.value);
                } catch {
                  /* private mode: ignore */
                }
              }}
            >
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <button ref={analyzeRef} type="button" className="btn btn-primary sticky-cta" onClick={analyze}>
            🔍 Analyze
          </button>
          <label htmlFor="photo-library" className="btn btn-secondary">
            Choose a different photo
          </label>
        </>
      )}
    </section>
  );
}
