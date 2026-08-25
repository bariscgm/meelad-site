import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export default function TeamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teamId = user.teamId || user.id || user._id;

  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!teamId) return;
        const [resRes, candRes] = await Promise.all([
          fetch(`${API_URL}/api/results/published`),
          fetch(`${API_URL}/api/candidates/team/${teamId}`)
        ]);
        if (resRes.ok) {
          const data = await resRes.json();
          setResults(data);
        }
        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(candData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId]);

  const teamWins = [];
  results.forEach(r => {
    r.winners.forEach(w => {
      if ((w.team?._id || w.team?.id || w.team) === teamId) {
        teamWins.push({
          programId: r.program?._id,
          programName: r.program?.name,
          programCategory: r.program?.category,
          programGender: r.program?.gender,
          programType: r.program?.type,
          ...w
        });
      }
    });
  });

  teamWins.forEach(w => {
    if (w.programType === 'Group') {
      w.groupMembers = candidates.filter(c => {
         const assignedGroup = c.groupAssignments?.[w.programId] || c.groupAssignments?.[w.programName];
         if (assignedGroup && assignedGroup === w.name) return true;
         if ((w.name === user.name || w.name === (w.team && w.team.name)) && c.programs?.includes(w.programName)) return true;
         return false;
      }).map(c => c.name);
    }
  });

  const categories = [...new Set(teamWins.map(w => w.programCategory).filter(Boolean))];
  const genders = [...new Set(teamWins.map(w => w.programGender).filter(Boolean))];
  const programs = [...new Set(teamWins.map(w => w.programName).filter(Boolean))];

  const filteredWins = teamWins.filter(w => {
    const matchCategory = categoryFilter ? w.programCategory === categoryFilter : true;
    const matchGender = genderFilter ? w.programGender === genderFilter : true;
    const matchProgram = programFilter ? w.programName === programFilter : true;
    return matchCategory && matchGender && matchProgram;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl print:hidden">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Team Results</h1>
        <p className="text-slate-500">View all your published results and filter them by category, gender, or program.</p>
      </div>

      <div className="glass p-6 rounded-3xl print:shadow-none print:border-none print:bg-transparent">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 print:hidden">
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={genderFilter} 
            onChange={e => setGenderFilter(e.target.value)}
            className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 bg-white"
          >
            <option value="">All Genders</option>
            {genders.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select 
            value={programFilter} 
            onChange={e => setProgramFilter(e.target.value)}
            className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 bg-white"
          >
            <option value="">All Programs</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button 
            onClick={() => window.print()}
            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition flex items-center justify-center gap-2 sm:ml-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>

        {filteredWins.length > 0 ? (
          <div className="space-y-3">
            {filteredWins.map((w, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">{w.programName}</h4>
                    {w.programCategory && (
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{w.programCategory}</span>
                    )}
                    {w.programGender && (
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{w.programGender}</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-600 text-sm">
                    {w.programType === 'Group' && w.groupMembers && w.groupMembers.length > 0 ? w.groupMembers.join(', ') : w.name} 
                    <span className="text-slate-400 text-xs ml-1">({w.chestNo})</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  {w.position && (
                    <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg text-xs font-bold">{w.position}</span>
                  )}
                  {w.grade && (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">{w.grade} Grade</span>
                  )}
                  <span className="font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-lg text-sm">{w.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl">
            <span className="text-slate-400">No results found for the selected filters.</span>
          </div>
        )}
      </div>
    </div>
  );
}
