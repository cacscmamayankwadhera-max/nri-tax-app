'use client';
export default function DashboardError({ error, reset }) {
  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-8">
      <div className="card-theme p-8 max-w-lg text-center">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="font-serif text-xl font-bold text-theme mb-2">Dashboard Error</h2>
        <p className="text-theme-muted text-sm mb-4">Something went wrong while loading the dashboard.</p>
        <p className="text-xs text-theme-muted mb-6 font-mono bg-theme-secondary p-2 rounded">{error?.message || 'Unknown error'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-2 rounded-lg">Retry</button>
          <a href="/login" className="btn-secondary px-6 py-2 rounded-lg">Back to Login</a>
        </div>
      </div>
    </div>
  );
}
