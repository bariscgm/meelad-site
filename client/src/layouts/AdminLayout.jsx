import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 glass-dark text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
            Meelad Admin
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="/admin" className="block px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-medium">Dashboard</a>
          <a href="/admin/programs" className="block px-4 py-3 rounded-xl hover:bg-white/10 transition text-sm font-medium text-slate-300 hover:text-white">Programs</a>
          <a href="/admin/teams" className="block px-4 py-3 rounded-xl hover:bg-white/10 transition text-sm font-medium text-slate-300 hover:text-white">Teams</a>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <button className="w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition text-sm font-medium">Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="md:hidden font-bold text-teal-600">Admin Panel</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30">A</div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
