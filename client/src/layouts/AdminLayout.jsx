import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Teams',
      path: '/admin/team-management',
      altPaths: ['/admin/teams'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Categories',
      path: '/admin/add-category',
      altPaths: ['/admin/addcategory'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Programmes',
      path: '/admin/programs',
      altPaths: ['/admin/programm'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Results',
      path: '/admin/results',
      altPaths: ['/admin/result'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Controls',
      path: '/admin/controller',
      altPaths: ['/admin/controls'],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.altPaths && item.altPaths.includes(location.pathname)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121124] text-white hidden md:flex flex-col border-r border-slate-800">
        {/* Brand Header */}
        <Link to="/" className="p-6 flex items-center gap-3 transition hover:opacity-80">
          <img src="/ilmul_rasool_logo.png" alt="Ilmul Rasool Logo" className="w-10 h-10 object-contain bg-white/10 p-1 rounded-xl" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span dir="rtl">إلى الرسول</span>
              <span className="text-teal-400 font-mono text-sm">'26</span>
            </h2>
            <p className="text-[9px] text-slate-400 font-medium leading-tight">Darussalam HSM Narikkuni (Reg 2179)</p>
          </div>
        </Link>

        {/* Section Label */}
        <div className="px-6 py-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            ADMIN CONTROLLER
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                  active
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={active ? 'text-purple-400' : 'text-slate-400'}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sign Out & Home Link */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            className="w-full py-2 px-4 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2"
          >
            ← Back to Public Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-slate-700/50 text-slate-300 rounded-xl transition text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="md:hidden font-bold text-purple-700 flex items-center gap-2">
            <img src="/ilmul_rasool_logo.png" alt="Ilmul Rasool Logo" className="w-7 h-7 object-contain bg-purple-100 p-0.5 rounded-lg" />
            <span dir="rtl">إلى الرسول</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Ilmul Rasool Admin</p>
              <p className="text-[10px] text-teal-600 font-semibold">Super Admin</p>
            </div>
            <img
              src="/ilmul_rasool_logo.png"
              alt="Admin Avatar"
              className="w-9 h-9 rounded-full bg-purple-50 p-1 object-contain border border-purple-200 shadow-sm"
            />
          </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
