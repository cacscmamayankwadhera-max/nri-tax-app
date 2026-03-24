'use client';
export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-8">
      <div className="card-theme p-8 max-w-md text-center">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="font-serif text-xl font-bold text-theme mb-2">Something went wrong</h2>
        <p className="text-theme-muted text-sm mb-6">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="btn-primary px-6 py-2 rounded-lg">Try Again</button>
      </div>
    </div>
  );
}
