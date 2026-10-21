interface ReportProps {
  onViewFeed: () => void;
}

export default function Report(_props: ReportProps) {
  return (
    <section className="card">
      <h2 className="card-title">Spot some waste?</h2>
      <p className="muted">Snap a photo and Bobcat will write the report for you.</p>
    </section>
  );
}
