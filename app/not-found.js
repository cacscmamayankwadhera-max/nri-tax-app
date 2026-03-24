import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-8">
      <div className="card-theme p-8 max-w-md text-center">
        <div className="text-6xl font-serif font-bold text-theme-accent mb-4">404</div>
        <h2 className="font-serif text-xl font-bold text-theme mb-2">Page not found</h2>
        <p className="text-theme-muted text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary px-6 py-2 rounded-lg inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
