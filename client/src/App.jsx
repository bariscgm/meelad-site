import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import TeamLayout from './layouts/TeamLayout';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalTeams: 0,
      totalPrograms: 0,
      submittedResults: 0,
      publishedResults: 0
    },
    topTeams: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/admin');
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Registered Students',
      value: dashboardData.stats.totalStudents,
      change: 'Will be available soon',
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
      value: dashboardData.stats.totalPrograms,
      change: 'Active in system',
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
      value: dashboardData.stats.submittedResults,
      change: 'Total drafted or published',
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
      value: dashboardData.stats.publishedResults,
      change: 'Live on scoreboard',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-200/60',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Total Teams',
      value: dashboardData.stats.totalTeams,
      change: 'Active teams in system',
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

  const quickActions = [
    { name: 'Team Management', path: '/admin/team-management', color: 'bg-blue-500 text-white', icon: '👥' },
    { name: 'Add Category', path: '/admin/add-category', color: 'bg-teal-500 text-white', icon: '📖' },
    { name: 'Programmes', path: '/admin/programs', color: 'bg-purple-500 text-white', icon: '🏆' },
    { name: 'Results Control', path: '/admin/results', color: 'bg-emerald-500 text-white', icon: '📝' },
    { name: 'System Controls', path: '/admin/controller', color: 'bg-slate-700 text-white', icon: '⚙️' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="glass p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-teal-600 tracking-wider">Welcome Administrator</span>
          <h1 className="text-3xl font-bold text-slate-800 mt-1">Meelad Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Live monitoring for teams, students, programmes, and result publishing.</p>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Quick Action Navigation */}
      <div className="glass p-8 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Quick Navigation Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.path}
              className="p-4 rounded-2xl border border-slate-200/60 bg-white/80 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition flex flex-col items-center text-center space-y-2 group"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Feed & Team Standing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Teams Standings */}
        <div className="glass p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🏆</span> Top Teams Points Leaderboard
          </h2>
          <div className="space-y-3">
            {dashboardData.topTeams.length > 0 ? (
              dashboardData.topTeams.map((t) => (
                <div key={t.rank} className="p-4 rounded-2xl bg-white/60 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${t.color}`}>
                      {t.rank}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                      <span className="text-xs font-mono text-slate-500">{t.code}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-teal-600 text-sm">{t.points}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-sm text-center">No results published yet.</div>
            )}
          </div>
        </div>

        {/* Recent Admin Activity Log */}
        <div className="glass p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚡</span> Recent System Activity
          </h2>
          <div className="space-y-3 text-xs">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between ${activity.colorClass}`}>
                  <span>{activity.message}</span>
                  <span className={`font-medium ${activity.timeClass}`}>
                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-sm text-center">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teamName = user.name || 'Team';

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {teamName}!</h1>
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
import LiveScore from './pages/LiveScore';

import JudgeDashboard from './pages/JudgeDashboard';

import StageDashboard from './pages/StageDashboard';

import TeamManagement from './pages/TeamManagement';
import CategoryManagement from './pages/CategoryManagement';
import ProgramManagement from './pages/ProgramManagement';
import ResultManagement from './pages/ResultManagement';
import ControllerManagement from './pages/ControllerManagement';
import Login from './pages/Login';
import CandidateRegistration from './pages/CandidateRegistration';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        {/* Support old route just in case */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
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
        <Route element={<ProtectedRoute allowedRoles={['Team Leader']} />}>
          <Route path="/team" element={<TeamLayout />}>
            <Route index element={<TeamDashboard />} />
            <Route path="students" element={<CandidateRegistration />} />
          </Route>
        </Route>
        
        {/* Stage Route */}
        <Route element={<ProtectedRoute allowedRoles={['Stage Manager']} />}>
          <Route path="/stage" element={<StageDashboard />} />
        </Route>

        {/* Judge Route */}
        <Route element={<ProtectedRoute allowedRoles={['Judge']} />}>
          <Route path="/judge" element={<JudgeDashboard />} />
        </Route>

        {/* Public / Scoreboard */}
        <Route path="/" element={<HomePage />} />
        <Route path="/score" element={<LiveScore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
