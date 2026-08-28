import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/analytics', label: 'Analytics', end: true },
  { to: '/analytics/state', label: 'State Analysis', end: true },
  { to: '/analytics/district', label: 'District Analysis', end: true },
];

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mplads_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on mobile, inline on desktop with width transition */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 text-white transition-all duration-200 lg:static lg:inset-auto lg:z-auto lg:shrink-0 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 w-64 shrink-0 items-center border-b border-gray-700 px-5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">MPLADS</span>
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">Sentinel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 px-4 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          {/* Mobile: hamburger + brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-bold tracking-tight text-gray-900">MPLADS
              <span className="ml-1 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">Sentinel</span>
            </span>
          </div>
          {/* Desktop: hamburger toggle + subtitle */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm text-gray-500">Members of Parliament Local Area Development Scheme — Monitoring Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Analyst
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
