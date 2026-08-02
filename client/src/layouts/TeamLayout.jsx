import { Outlet, Link } from 'react-router-dom';

export default function TeamLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 transition hover:opacity-80">
              <img src="/ilmul_rasool_logo.png" alt="Ilmul Rasool Logo" className="w-10 h-10 object-contain bg-teal-500/10 p-1 rounded-xl border border-teal-500/20 shadow-sm" />
              <div>
                <span className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                  <span dir="rtl">إلى الرسول</span>
                  <span className="text-teal-600 font-mono text-sm">'26</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium leading-none">Team Portal</p>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="/team" className="text-teal-600 font-medium border-b-2 border-teal-500 px-1 py-5">Dashboard</a>
              <a href="/team/students" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Students</a>
              <a href="/team/results" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Results</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition">
                ← Back to Home
              </Link>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-700 transition">Log out</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
