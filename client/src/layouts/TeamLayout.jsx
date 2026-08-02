import { Outlet } from 'react-router-dom';

export default function TeamLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/30 flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Team Portal</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/team" className="text-teal-600 font-medium border-b-2 border-teal-500 px-1 py-5">Dashboard</a>
              <a href="/team/students" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Students</a>
              <a href="/team/results" className="text-slate-500 hover:text-slate-700 font-medium px-1 py-5 transition">Results</a>
            </nav>
            <div className="flex items-center gap-4">
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
