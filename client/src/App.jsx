import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import TeamLayout from './layouts/TeamLayout';

function AdminDashboard() {
  return (
    <div className="glass p-8 rounded-3xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-teal-500/10 border border-teal-200 p-6 rounded-2xl">
          <p className="text-teal-600 font-medium">Total Teams</p>
          <p className="text-4xl font-bold text-teal-700 mt-2">12</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-200 p-6 rounded-2xl">
          <p className="text-blue-600 font-medium">Total Students</p>
          <p className="text-4xl font-bold text-blue-700 mt-2">450</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-200 p-6 rounded-2xl">
          <p className="text-purple-600 font-medium">Active Programs</p>
          <p className="text-4xl font-bold text-purple-700 mt-2">34</p>
        </div>
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
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
