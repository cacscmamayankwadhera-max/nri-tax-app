'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/theme-provider';
import { createClient } from '@/lib/supabase-browser';

/* ================================================================
   ADMIN SETTINGS PANEL — NRI Tax Suite
   Protected by auth (admin/partner role).
   Tabs: API Keys | Team | Firm Settings | System
   ================================================================ */

const TABS = [
  { id: 'api-keys', label: 'API Keys', icon: 'key' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'firm', label: 'Firm Settings', icon: 'building' },
  { id: 'system', label: 'System', icon: 'activity' },
];

const ROLE_LABELS = {
  admin: 'Admin',
  partner: 'Partner',
  senior: 'Senior Associate',
  preparer: 'Preparer',
  client: 'Client',
  deactivated: 'Deactivated',
};

const ROLE_COLORS = {
  admin: '#C49A3C',
  partner: '#2A6B4A',
  senior: '#5670A8',
  preparer: '#6b6256',
  client: '#9ca3af',
  deactivated: '#a04848',
};

/* ================================================================
   ICON COMPONENTS
   ================================================================ */
function IconKey({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconUsers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBuilding({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  );
}

function IconActivity({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function IconSettings({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEye({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function IconExternalLink({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function IconArrowLeft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

const ICON_MAP = {
  key: IconKey,
  users: IconUsers,
  building: IconBuilding,
  activity: IconActivity,
};

/* ================================================================
   THEME TOGGLE (same as dashboard)
   ================================================================ */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
      style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* ================================================================
   MASKED INPUT WITH SHOW/HIDE
   ================================================================ */
function MaskedInput({ value, placeholder, readOnly = true }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value || ''}
        placeholder={placeholder || 'Not configured'}
        readOnly={readOnly}
        className="input-theme text-xs pr-8"
        style={{ fontFamily: 'monospace', letterSpacing: value ? '0.05em' : 'normal' }}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
        style={{ color: 'var(--text-muted)' }}
        aria-label={visible ? 'Hide value' : 'Show value'}
      >
        {visible ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

/* ================================================================
   STATUS DOT
   ================================================================ */
function StatusDot({ configured }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{
        background: configured ? 'var(--green)' : 'var(--text-muted)',
        boxShadow: configured ? '0 0 6px rgba(42, 107, 74, 0.4)' : 'none',
      }}
      aria-label={configured ? 'Configured' : 'Not configured'}
    />
  );
}

/* ================================================================
   MAIN ADMIN PAGE
   ================================================================ */
export default function AdminPage() {
  const [tab, setTab] = useState('api-keys');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [integrations, setIntegrations] = useState({});
  const [stats, setStats] = useState(null);
  const [team, setTeam] = useState([]);
  const [firmForm, setFirmForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('preparer');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const { theme } = useTheme();
  const supabase = createClient();

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Auth check + load data
  useEffect(() => {
    async function init() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) {
          window.location.href = '/login';
          return;
        }
        setUser(u);

        // Check role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single();
        if (!profile || !['admin', 'partner'].includes(profile.role)) {
          window.location.href = '/dashboard';
          return;
        }

        setAuthorized(true);

        // Load settings + stats + team in parallel
        const [settingsRes, statsRes, teamRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/stats'),
          fetch('/api/admin/team'),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data.settings);
          setIntegrations(data.integrations);
          setFirmForm(data.settings || {});
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeam(data.members || []);
        }
      } catch (e) {
        console.error('Admin init error:', e);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Test connection handler
  const handleTestConnection = useCallback(async (integrationId) => {
    setTesting(prev => ({ ...prev, [integrationId]: true }));
    try {
      const res = await fetch(`/api/admin/settings?test=${integrationId}`);
      const result = await res.json();
      setTestResults(prev => ({ ...prev, [integrationId]: result }));
    } catch (e) {
      setTestResults(prev => ({ ...prev, [integrationId]: { ok: false, message: e.message } }));
    }
    setTesting(prev => ({ ...prev, [integrationId]: false }));
  }, []);

  // Save firm settings
  const handleSaveFirm = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firmForm),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Settings saved successfully' });
        setSettings(firmForm);
      } else {
        setToast({ type: 'error', message: 'Failed to save settings' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to save settings' });
    }
    setSaving(false);
  }, [firmForm]);

  // Change team member role
  const handleRoleChange = useCallback(async (memberId, newRole) => {
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (res.ok) {
        setTeam(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        setToast({ type: 'success', message: 'Role updated' });
      } else {
        setToast({ type: 'error', message: 'Failed to update role' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to update role' });
    }
  }, []);

  // Invite new team member
  const handleInvite = useCallback(async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, fullName: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteMsg({ type: 'success', text: `Invite sent to ${inviteEmail}` });
        setInviteEmail('');
        setInviteName('');
        setInviteRole('preparer');
        // Reload team list
        const teamRes = await fetch('/api/admin/team');
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData.members || []);
        }
      } else {
        setInviteMsg({ type: 'error', text: data.error || 'Failed to invite member' });
      }
    } catch (e) {
      setInviteMsg({ type: 'error', text: 'Failed to invite member' });
    }
    setInviting(false);
  }, [inviteEmail, inviteName, inviteRole]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl animate-pulse mb-3" style={{ color: 'var(--accent)' }}>
            <IconSettings size={32} />
          </div>
          <div className="text-sm text-theme-muted">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="min-h-screen bg-theme animate-fade-in">
      {/* Top nav */}
      <nav className="bg-theme-nav px-6 h-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex items-center gap-2 text-theme-on-dark hover:opacity-80 transition-opacity" aria-label="Back to dashboard">
            <IconArrowLeft size={14} />
          </a>
          <span className="font-serif text-theme-accent font-bold tracking-wide text-sm">ADMIN SETTINGS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-0.5 rounded hidden sm:inline-block" style={{ background: 'var(--bg-badge)', color: 'var(--text-badge)', border: '1px solid var(--border)' }}>
            Admin Panel
          </span>
          <ThemeToggle />
          {user && (
            <span className="text-xs text-theme-muted hidden md:inline">
              {user.email?.split('@')[0]}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-3rem)]">
        {/* SIDEBAR — Desktop */}
        <aside className="hidden md:flex w-56 flex-col flex-shrink-0 border-r border-theme" style={{ background: 'var(--bg-secondary)' }}>
          <div className="p-4 border-b border-theme">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(196,154,60,0.1)', border: '1.5px solid var(--accent)' }}>
                <IconSettings size={14} />
              </div>
              <div>
                <div className="text-xs font-bold text-theme">Settings</div>
                <div className="text-[10px] text-theme-muted">Platform Control</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-2" aria-label="Admin navigation">
            {TABS.map(t => {
              const Icon = ICON_MAP[t.icon];
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all text-left"
                  style={{
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                    background: active ? 'var(--bg-card)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-theme">
            <a href="/dashboard" className="text-xs text-theme-muted hover:text-theme-accent transition-colors flex items-center gap-1.5">
              <IconArrowLeft size={12} />
              Back to Dashboard
            </a>
          </div>
        </aside>

        {/* MOBILE TAB BAR */}
        <div className="md:hidden flex overflow-x-auto border-b border-theme bg-theme-card flex-shrink-0 fixed top-12 left-0 right-0 z-40" style={{ background: 'var(--bg-card)' }}>
          {TABS.map(t => {
            const Icon = ICON_MAP[t.icon];
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 md:pt-8 pt-20">
          <div className="max-w-4xl mx-auto">

            {/* Firm name header */}
            {settings?.firmName && (
              <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="font-serif text-2xl font-bold text-theme">{settings.firmName}</h2>
                {settings?.firmTagline && (
                  <p className="text-xs text-theme-muted mt-1">{settings.firmTagline}</p>
                )}
              </div>
            )}

            {/* ============== TAB: API KEYS ============== */}
            {tab === 'api-keys' && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h1 className="font-serif text-xl font-bold text-theme">API Integrations</h1>
                  <p className="text-xs text-theme-muted mt-1">
                    Configure external service connections. API keys are stored as environment variables on the server.
                    {' '}
                    <a href="https://vercel.com/docs/environment-variables" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline inline-flex items-center gap-0.5">
                      Update via Vercel Dashboard <IconExternalLink />
                    </a>
                  </p>
                </div>

                <div className="space-y-4 stagger-premium">
                  {Object.entries(integrations).map(([id, integration]) => (
                    <div key={id} className="card-premium p-5 animate-fade-in-up" style={{ borderLeft: `4px solid ${integration.configured ? 'var(--green)' : 'var(--border)'}` }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <StatusDot configured={integration.configured} />
                          <div>
                            <div className="text-sm font-bold text-theme">{integration.label}</div>
                            <div className="text-[10px] text-theme-muted">
                              {integration.configured ? 'Configured' : 'Not configured'}
                            </div>
                          </div>
                        </div>
                        {integration.pricing && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(196,154,60,0.1)', color: 'var(--accent)', border: '1px solid rgba(196,154,60,0.2)' }}>
                            {integration.pricing}
                          </span>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="space-y-2 mb-3">
                        {id === 'anthropic' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API Key</label>
                              <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Model</label>
                              <input type="text" value={integration.model || ''} readOnly className="input-theme text-xs" style={{ fontFamily: 'monospace' }} />
                            </div>
                          </>
                        )}
                        {id === 'supabase' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Project URL</label>
                              <input type="text" value={integration.maskedUrl || ''} readOnly className="input-theme text-xs" style={{ fontFamily: 'monospace' }} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Service Role Key</label>
                              <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                            </div>
                          </>
                        )}
                        {id === 'pan' && (
                          <div>
                            <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API Key</label>
                            <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                          </div>
                        )}
                        {id === 'eri' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API Key</label>
                              <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API URL</label>
                              <input type="text" value={integration.apiUrl || ''} readOnly placeholder="Not configured" className="input-theme text-xs" style={{ fontFamily: 'monospace' }} />
                            </div>
                          </>
                        )}
                        {id === 'whatsapp' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API Key</label>
                              <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Sender Number</label>
                              <input type="text" value={integration.sender || ''} readOnly placeholder="Not configured" className="input-theme text-xs" />
                            </div>
                          </>
                        )}
                        {id === 'digilocker' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Client ID</label>
                              <MaskedInput value={integration.maskedClientId} placeholder="Not configured" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Client Secret</label>
                              <MaskedInput value="" placeholder="Not configured" />
                            </div>
                          </>
                        )}
                        {(id === 'setu' || id === 'cams' || id === 'resend' || id === 'sentry') && (
                          <div>
                            <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">API Key</label>
                            <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                          </div>
                        )}
                        {id === 'razorpay' && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Key ID</label>
                              <MaskedInput value={integration.maskedKey} placeholder="Not configured" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Key Secret</label>
                              <MaskedInput value="" placeholder="Not configured" />
                            </div>
                          </>
                        )}
                        {integration.envVars && (
                          <div className="text-[10px] text-theme-muted mt-1">
                            <span className="font-medium">Env vars:</span>{' '}
                            {integration.envVars.map((v, i) => (
                              <code key={v} className="px-1 rounded" style={{ background: 'var(--bg-secondary)' }}>{v}{i < integration.envVars.length - 1 ? ', ' : ''}</code>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Test result */}
                      {testResults[id] && (
                        <div
                          className="rounded-lg px-3 py-2 text-xs flex items-center gap-2 mb-3"
                          style={{
                            background: testResults[id].ok
                              ? 'color-mix(in srgb, var(--green) 10%, transparent)'
                              : 'color-mix(in srgb, var(--red) 10%, transparent)',
                            border: testResults[id].ok
                              ? '1px solid color-mix(in srgb, var(--green) 30%, transparent)'
                              : '1px solid color-mix(in srgb, var(--red) 30%, transparent)',
                            color: testResults[id].ok ? 'var(--green)' : 'var(--red)',
                          }}
                        >
                          {testResults[id].ok ? <IconCheck /> : <IconX />}
                          {testResults[id].message}
                        </div>
                      )}

                      {/* Actions + Info */}
                      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="text-[10px] text-theme-muted">
                          <span className="font-medium">Used for:</span> {integration.description}
                          <br />
                          {integration.signupUrl && (
                            <a href={integration.signupUrl} target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline inline-flex items-center gap-0.5 mt-0.5">
                              {integration.signupUrl.replace('https://', '')} <IconExternalLink />
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleTestConnection(id)}
                            disabled={testing[id] || !integration.configured}
                            className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all"
                            style={{
                              border: '1px solid var(--border)',
                              color: integration.configured ? 'var(--text-primary)' : 'var(--text-muted)',
                              opacity: !integration.configured ? 0.5 : 1,
                            }}
                          >
                            {testing[id] ? 'Testing...' : 'Test Connection'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Environment variables info */}
                <div className="card-theme p-4 mt-6" style={{ borderLeftColor: 'var(--accent)', borderLeftWidth: '3px' }}>
                  <div className="text-xs font-bold text-theme mb-1">How to update API keys</div>
                  <ol className="text-[11px] text-theme-secondary list-decimal pl-4 space-y-1">
                    <li>Go to your <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">Vercel Dashboard</a> (or update <code className="px-1 rounded text-[10px]" style={{ background: 'var(--bg-secondary)' }}>.env.local</code> for local dev)</li>
                    <li>Navigate to Settings &rarr; Environment Variables</li>
                    <li>Add or update the variable (e.g., <code className="px-1 rounded text-[10px]" style={{ background: 'var(--bg-secondary)' }}>SUREPASS_API_KEY</code>)</li>
                    <li>Redeploy the application for changes to take effect</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ============== TAB: TEAM ============== */}
            {tab === 'team' && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h1 className="font-serif text-xl font-bold text-theme">Team Members</h1>
                  <p className="text-xs text-theme-muted mt-1">Manage team members and their roles. {team.length} member{team.length !== 1 ? 's' : ''} total.</p>
                </div>

                {/* Invite Team Member form */}
                <div className="card-theme p-5 mb-6">
                  <div className="text-sm font-semibold text-theme mb-3">Invite Team Member</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      placeholder="Email address *"
                      className="input-theme text-xs py-2 px-3" />
                    <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)}
                      placeholder="Full name"
                      className="input-theme text-xs py-2 px-3" />
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="input-theme text-xs py-2 px-3">
                      <option value="preparer">Preparer</option>
                      <option value="senior">Senior Associate</option>
                      <option value="partner">Partner</option>
                    </select>
                    <button onClick={handleInvite} disabled={inviting || !inviteEmail}
                      className="btn-primary text-xs py-2 disabled:opacity-40">
                      {inviting ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                  {inviteMsg && (
                    <div className={`mt-3 text-xs font-medium ${inviteMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {inviteMsg.text}
                    </div>
                  )}
                </div>

                {team.length === 0 ? (
                  <div className="card-theme p-12 text-center">
                    <div className="text-3xl opacity-20 mb-2"><IconUsers size={48} /></div>
                    <div className="font-semibold text-theme-muted text-sm">No team members found</div>
                    <div className="text-xs text-theme-muted mt-1">Team members appear here after signing up</div>
                  </div>
                ) : (
                  <div className="space-y-2 stagger-children">
                    {/* Header row */}
                    <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                      <div className="col-span-4">Member</div>
                      <div className="col-span-2">Role</div>
                      <div className="col-span-2">Cases</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Joined</div>
                    </div>

                    {team.map(member => (
                      <div key={member.id} className="card-theme p-4 animate-fade-in-up">
                        <div className="md:grid md:grid-cols-12 md:gap-3 md:items-center space-y-2 md:space-y-0">
                          {/* Name + Email */}
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: `${ROLE_COLORS[member.role]}15`, color: ROLE_COLORS[member.role], border: `1.5px solid ${ROLE_COLORS[member.role]}30` }}
                              >
                                {(member.name || '?')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-theme truncate">{member.name}</div>
                                <div className="text-[10px] text-theme-muted truncate">{member.email}</div>
                              </div>
                            </div>
                          </div>

                          {/* Role */}
                          <div className="col-span-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="input-theme text-xs py-1"
                              style={{ maxWidth: '140px' }}
                            >
                              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Cases */}
                          <div className="col-span-2">
                            <span className="text-xs font-semibold text-theme">{member.casesAssigned}</span>
                            <span className="text-[10px] text-theme-muted ml-1">cases</span>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                background: member.status === 'active' ? 'color-mix(in srgb, var(--green) 15%, transparent)' : 'color-mix(in srgb, var(--red) 15%, transparent)',
                                color: member.status === 'active' ? 'var(--green)' : 'var(--red)',
                              }}
                            >
                              {member.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Joined + Actions */}
                          <div className="col-span-2 flex items-center gap-2">
                            <span className="text-[10px] text-theme-muted">
                              {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
                            </span>
                            {member.id !== user?.id && member.role !== 'deactivated' && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Deactivate ${member.name}? They will no longer be able to sign in.`)) return;
                                  try {
                                    const res = await fetch('/api/admin/team', {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: member.id }),
                                    });
                                    if (res.ok) {
                                      setTeam(prev => prev.map(m => m.id === member.id ? { ...m, role: 'deactivated', status: 'inactive' } : m));
                                      setToast({ type: 'success', message: `${member.name} has been deactivated` });
                                    } else {
                                      const data = await res.json();
                                      setToast({ type: 'error', message: data.error || 'Failed to deactivate' });
                                    }
                                  } catch (e) {
                                    setToast({ type: 'error', message: 'Failed to deactivate member' });
                                  }
                                }}
                                className="text-[9px] px-2 py-0.5 rounded"
                                style={{ color: 'var(--red)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)' }}
                                title="Deactivate this team member"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============== TAB: FIRM SETTINGS ============== */}
            {tab === 'firm' && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h1 className="font-serif text-xl font-bold text-theme">Firm Settings</h1>
                  <p className="text-xs text-theme-muted mt-1">Configure your firm details and platform defaults.</p>
                </div>

                <div className="card-premium p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Firm Name</label>
                      <input
                        type="text"
                        value={firmForm.firmName || ''}
                        onChange={e => setFirmForm(prev => ({ ...prev, firmName: e.target.value }))}
                        placeholder="MKW Advisors"
                        className="input-theme text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Firm Tagline</label>
                      <input
                        type="text"
                        value={firmForm.firmTagline || ''}
                        onChange={e => setFirmForm(prev => ({ ...prev, firmTagline: e.target.value }))}
                        placeholder="NRI Tax Filing - Advisory - Compliance"
                        className="input-theme text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={firmForm.contactEmail || ''}
                        onChange={e => setFirmForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="tax@mkwadvisors.com"
                        className="input-theme text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Contact Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={firmForm.contactPhone || ''}
                        onChange={e => setFirmForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="input-theme text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Website URL</label>
                      <input
                        type="url"
                        value={firmForm.websiteUrl || ''}
                        onChange={e => setFirmForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                        placeholder="https://mkwadvisors.com"
                        className="input-theme text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Default Financial Year</label>
                      <select
                        value={firmForm.defaultFY || '2025-26'}
                        onChange={e => setFirmForm(prev => ({ ...prev, defaultFY: e.target.value }))}
                        className="input-theme text-sm"
                      >
                        <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                        <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-theme-muted uppercase tracking-wider mb-1">Default AI Model</label>
                      <select
                        value={firmForm.defaultModel || 'claude-sonnet-4-20250514'}
                        onChange={e => setFirmForm(prev => ({ ...prev, defaultModel: e.target.value }))}
                        className="input-theme text-sm"
                      >
                        <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
                        <option value="claude-haiku-4-20250514">Claude Haiku 4 (Faster, cheaper)</option>
                        <option value="claude-opus-4-20250514">Claude Opus 4 (Most capable)</option>
                      </select>
                      <p className="text-[10px] text-theme-muted mt-1.5 leading-relaxed">
                        To change the AI model, update <code className="font-mono" style={{ color: 'var(--accent)' }}>ANTHROPIC_MODEL</code> in your Vercel Environment Variables and redeploy. The selection above is for reference only.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={handleSaveFirm}
                      disabled={saving}
                      className="btn-primary text-sm"
                      style={{ padding: '0.625rem 2rem' }}
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="card-theme p-5 mt-4" style={{ borderLeftColor: 'var(--accent)', borderLeftWidth: '3px' }}>
                  <div className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2">Preview</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{firmForm.firmName || 'MKW Advisors'}</div>
                  <div className="text-xs text-theme-muted italic">{firmForm.firmTagline || 'NRI Tax Filing - Advisory - Compliance'}</div>
                  {firmForm.contactEmail && <div className="text-xs text-theme-secondary mt-1">{firmForm.contactEmail}</div>}
                  {firmForm.contactPhone && <div className="text-xs text-theme-secondary">{firmForm.contactPhone}</div>}
                </div>
              </div>
            )}

            {/* ============== TAB: SYSTEM ============== */}
            {tab === 'system' && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h1 className="font-serif text-xl font-bold text-theme">System Health</h1>
                  <p className="text-xs text-theme-muted mt-1">Platform status, connection health, and usage statistics.</p>
                </div>

                {/* Integration health */}
                <div className="card-premium p-5 mb-4">
                  <div className="text-xs font-bold text-theme mb-3 uppercase tracking-wider">Service Connections</div>
                  <div className="space-y-2">
                    {[
                      { key: 'supabase', label: 'Supabase (Database)' },
                      { key: 'anthropic', label: 'Anthropic (Claude AI)' },
                      { key: 'pan', label: 'PAN Verification (Surepass)' },
                      { key: 'eri', label: 'ERI (Income Tax APIs)' },
                      { key: 'whatsapp', label: 'WhatsApp (AiSensy)' },
                      { key: 'digilocker', label: 'Digilocker' },
                    ].map(svc => {
                      const status = stats?.integrations?.[svc.key];
                      return (
                        <div key={svc.key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                          <span className="text-xs text-theme-secondary flex items-center gap-2">
                            <StatusDot configured={status?.ok} />
                            {svc.label}
                          </span>
                          <div className="flex items-center gap-2">
                            {status?.ok ? (
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--green)' }}>
                                <IconCheck size={12} /> {status.message}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs" style={{ color: status ? 'var(--red)' : 'var(--text-muted)' }}>
                                {status ? <IconX size={12} /> : <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />}
                                {status?.message || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Cases', value: stats?.cases ?? '--', color: 'var(--accent)' },
                    { label: 'Team Members', value: stats?.team ?? '--', color: 'var(--green)' },
                    { label: 'Knowledge Guides', value: stats?.blogs ?? '--', color: 'var(--accent-secondary)' },
                    { label: 'Platform Version', value: stats?.version || '--', color: 'var(--text-muted)' },
                  ].map((s, i) => (
                    <div key={i} className="card-theme p-4">
                      <div className="text-[10px] text-theme-muted uppercase tracking-wider">{s.label}</div>
                      <div className="text-xl font-serif font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Additional info */}
                <div className="card-theme p-5">
                  <div className="text-xs font-bold text-theme mb-3 uppercase tracking-wider">Platform Info</div>
                  <div className="space-y-2">
                    {[
                      { label: 'Database', value: stats?.dbConnected ? 'Connected' : 'Disconnected', ok: stats?.dbConnected },
                      { label: 'Last Case Created', value: stats?.latestCase ? new Date(stats.latestCase).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No cases yet' },
                      { label: 'App URL', value: process.env.NEXT_PUBLIC_APP_URL || window.location.origin },
                      { label: 'Environment', value: process.env.NODE_ENV || 'development' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="text-xs text-theme-muted">{item.label}</span>
                        <span className="text-xs font-medium" style={{ color: item.ok !== undefined ? (item.ok ? 'var(--green)' : 'var(--red)') : 'var(--text-primary)' }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refresh button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/admin/stats');
                      if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                        setToast({ type: 'success', message: 'Stats refreshed' });
                      }
                    }}
                    className="btn-secondary text-xs"
                    style={{ padding: '0.5rem 1.5rem' }}
                  >
                    Refresh Stats
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up"
          style={{ background: toast.type === 'error' ? 'var(--red)' : 'var(--accent)', color: '#fff', maxWidth: 360 }}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-3 opacity-70 hover:opacity-100">
            <IconX size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
