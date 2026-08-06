import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function TeamLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teamName = user.name || 'Team';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 transition hover:opacity-80">
              <div className="w-10 h-10 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl">
                <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-800 tracking-tight flex flex-col items-start gap-0.5">
                  Meelad Fest
                  <span className="text-sm font-semibold text-slate-500">{teamName} Portal</span>
                </h1>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/team" className="text-teal-600 font-medium border-b-2 border-teal-500 px-1 py-5">Dashboard</Link>
              <Link to="/team/students" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Students</Link>
              <Link to="/team/results" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Results</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition">
                ← Back to Home
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-slate-700 transition">Log out</button>
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
