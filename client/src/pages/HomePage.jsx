import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden font-sans selection:bg-teal-500/30">

      {/* Abstract Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <img src="/ilmul_rasool_logo.png" alt="Ilmul Rasool Logo" className="w-14 h-14 object-contain bg-white/10 p-1.5 rounded-xl group-hover:scale-105 transition" />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex flex-col items-start leading-tight">
                <span dir="rtl">إلى الرسول</span>
                <span className="text-sm font-semibold text-teal-400">Festival Hub</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">Darussalam Higher Secondary Madrasa Narikkuni | Calicut Reg No: 2179</p>
            </div>
          </Link>
          <div className="hidden md:flex gap-6">
            <a href="#scoreboard" className="text-sm font-medium hover:text-teal-400 transition">Live Scoreboard</a>
            <a href="#portals" className="text-sm font-medium hover:text-emerald-400 transition">Login Portals</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-24">

        {/* Hero Section */}
        <section id="scoreboard" className="space-y-12">
          {/* Centered Hero Content */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Live Competition Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Live Competition
            </div>

            {/* Blended PNG Logo */}
            <Link to="/" className="py-2 inline-block transition hover:scale-[1.02]">
              <img
                src="/ilmul_rasool_logo.png"
                alt="Ilmul Rasool Logo"
                className="w-80 md:w-[480px] max-w-full drop-shadow-[0_20px_50px_rgba(20,184,166,0.15)] mx-auto object-contain"
              />
            </Link>

            {/* Madrasa Details Text directly under PNG Logo */}
            <div className="space-y-2">
              <p className="text-sm md:text-base font-bold text-teal-300 tracking-wide">
                Darussalam Higher Secondary Madrasa Narikkuni | Calicut Reg No: 2179
              </p>
              <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
                Experience the pulse of Meelad Fest. Follow the live scoreboard, witness the crowning of champions, and support your favorite teams.
              </p>
            </div>
          </div>

          {/* Glassmorphic Scoreboard Preview */}
          <div className="glass-dark p-8 rounded-3xl max-w-3xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              🏆 Top Teams Leaderboard
            </h3>

            <div className="space-y-4">
              {/* Dummy Teams */}
              {[
                { rank: 1, name: "Team Alpha", points: 1250, color: "from-amber-400 to-orange-500" },
                { rank: 2, name: "Team Beta", points: 980, color: "from-slate-300 to-slate-400" },
              ].map(team => (
                <div key={team.rank} className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${team.color} shadow-lg`}>
                    #{team.rank}
                  </div>
                  <div className="ml-4 flex-1 text-left">
                    <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition">{team.name}</h4>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-400">
                    {team.points} <span className="text-sm font-medium text-slate-500">pts</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-medium transition border border-teal-500/20">
              View Full Scoreboard
            </button>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="pt-12 border-t border-white/5">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Access Portals</h2>
            <p className="text-slate-400">Secure access for organizers, team leaders, stage managers, and judges.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Admin Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-blue-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin Control</h3>
                <p className="text-slate-400 text-sm mb-6">Manage programs, students, results, and overall festival settings.</p>
              </div>
              <Link to="/login" state={{ portal: 'Admin' }} className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300">
                Go to Admin <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Team Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-teal-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Team Leaders</h3>
                <p className="text-slate-400 text-sm mb-6">Register students, view team schedules, and track individual scores.</p>
              </div>
              <Link to="/login" state={{ portal: 'Team Leader' }} className="inline-flex items-center gap-2 text-teal-400 font-medium group-hover:text-teal-300">
                Go to Team Portal <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Stage Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Stage Manager</h3>
                <p className="text-slate-400 text-sm mb-6">Control live stage proceedings, calls, and performance status.</p>
              </div>
              <Link to="/login" state={{ portal: 'Stage Manager' }} className="inline-flex items-center gap-2 text-amber-400 font-medium group-hover:text-amber-300">
                Go to Stage Portal <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Judges Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Judge Access</h3>
                <p className="text-slate-400 text-sm mb-6">Secure portal for entering marks and evaluating live stage performances.</p>
              </div>
              <Link to="/login" state={{ portal: 'Judge' }} className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300">
                Go to Judging <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
