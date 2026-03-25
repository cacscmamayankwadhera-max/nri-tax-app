'use client';
import { useTheme } from '@/app/theme-provider';
import NavBar from '@/app/components/NavBar';

export default function Signup() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-theme">
      <NavBar />
      <div className="max-w-md mx-auto py-20 px-5 text-center">
        <div className="card-theme p-8">
          <h1 className="font-serif text-2xl mb-4 text-theme">Team Access</h1>
          <p className="text-sm text-theme-secondary mb-6">
            Team accounts are created by the administrator. If you need access to the NRI Tax Suite dashboard, please contact your team lead.
          </p>
          <a href="mailto:tax@mkwadvisors.com" className="btn-primary inline-block">
            Request Access
          </a>
          <div className="mt-6">
            <a href="/login" className="text-sm text-theme-accent hover:underline">
              Already have access? Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
