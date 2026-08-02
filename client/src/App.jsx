import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import TeamLayout from './layouts/TeamLayout';

function AdminDashboard() {
  const stats = [
    {
      title: 'Total Registered Students',
      value: '450',
      change: '+12% from last week',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200/60',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Programs',
      value: '34',
      change: '8 Active today',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-200/60',
      textColor: 'text-purple-700',
    },
    {
      title: 'Submitted Results',
      value: '28',
      change: 'Pending verification',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-200/60',
      textColor: 'text-amber-700',
    },
    {
      title: 'Published Results',
      value: '16',
      change: 'Live on scoreboard',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-200/60',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Total Teams',
      value: '12',
      change: 'All active',
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-200/60',
      textColor: 'text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of students, programs, teams, and result status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bgColor} border ${stat.borderColor} p-6 rounded-2xl transition hover:shadow-lg hover:-translate-y-0.5 duration-200 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-white/80 shadow-sm">{stat.icon}</span>
              </div>
              <p className="text-sm font-semibold text-slate-600">{stat.title}</p>
              <p className={`text-4xl font-extrabold ${stat.textColor} mt-2`}>{stat.value}</p>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-4 pt-3 border-t border-slate-200/40">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamDashboard() {
  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, Team Alpha!</h1>
        <p className="text-slate-500">Manage your students and view upcoming events here.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-3xl">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Stats</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500">Registered Students</span>
                <span className="font-bold text-slate-700">24</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500">Total Points</span>
                <span className="font-bold text-teal-600">1,250</span>
              </div>
           </div>
        </div>
        <div className="glass p-6 rounded-3xl">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Programs</h3>
           <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl">
             <span className="text-slate-400">No upcoming programs</span>
           </div>
        </div>
      </div>
    </div>
  );
}

import HomePage from './pages/HomePage';

function JudgeDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="glass p-8 rounded-3xl max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Judge Portal</h1>
        <p className="text-slate-500">Live stage scoring interface coming soon.</p>
      </div>
    </div>
  );
}

import TeamManagement from './pages/TeamManagement';
import CategoryManagement from './pages/CategoryManagement';
import ProgramManagement from './pages/ProgramManagement';
import ResultManagement from './pages/ResultManagement';
import ControllerManagement from './pages/ControllerManagement';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="team-management" element={<TeamManagement />} />
            <Route path="teams" element={<TeamManagement />} />
            <Route path="add-category" element={<CategoryManagement />} />
            <Route path="addcategory" element={<CategoryManagement />} />
            <Route path="programs" element={<ProgramManagement />} />
            <Route path="programm" element={<ProgramManagement />} />
            <Route path="results" element={<ResultManagement />} />
            <Route path="result" element={<ResultManagement />} />
            <Route path="controller" element={<ControllerManagement />} />
            <Route path="controls" element={<ControllerManagement />} />
          </Route>
        </Route>

        {/* Team Routes */}
        <Route path="/team" element={<TeamLayout />}>
          <Route index element={<TeamDashboard />} />
        </Route>
        
        {/* Judge Routes */}
        <Route path="/judge" element={<JudgeDashboard />} />

        {/* Public / Scoreboard */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
