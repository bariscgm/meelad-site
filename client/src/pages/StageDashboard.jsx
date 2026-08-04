import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api.js';

export default function StageDashboard() {
  const [programs, setPrograms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClass, setFilterClass] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterGender, setFilterGender] = useState('All');

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, finished: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, judgesRes] = await Promise.all([
        fetch(`${API_URL}/api/programs`),
        fetch(`${API_URL}/api/controller/users?role=Judge`)
      ]);

      if (programsRes.ok && judgesRes.ok) {
        const programsData = await programsRes.json();
        const judgesData = await judgesRes.json();

        setPrograms(programsData);
        setJudges(judgesData.data || []);

        // Calculate Stats
        const pending = programsData.filter(p => p.status === 'Pending').length;
        const finished = programsData.filter(p => p.status === 'Finished').length;
        setStats({ total: programsData.length, pending, finished });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignJudge = async (programId, judgeId) => {
    try {
      const program = programs.find(p => p._id === programId);
      let assignedJudges = program.assignedJudges.map(j => j._id || j);
      
      if (assignedJudges.includes(judgeId)) {
        assignedJudges = assignedJudges.filter(id => id !== judgeId);
      } else {
        assignedJudges.push(judgeId);
      }

      const res = await fetch(`${API_URL}/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedJudges })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning judge:', error);
    }
  };

  const filteredPrograms = programs.filter(p => {
    const classMatch = filterClass === 'All' || p.class === filterClass;
    const categoryMatch = filterCategory === 'All' || p.category === filterCategory;
    const genderMatch = filterGender === 'All' || p.gender === filterGender;
    return classMatch && categoryMatch && genderMatch;
  });

  const uniqueClasses = ['All', ...new Set(programs.map(p => p.class).filter(Boolean))];
  const uniqueCategories = ['All', ...new Set(programs.map(p => p.category).filter(Boolean))];
  const uniqueGenders = ['All', 'Boy', 'Girl', 'General'];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="glass p-6 md:p-8 rounded-3xl max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <div className="w-14 h-14 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-2xl group-hover:bg-teal-500/20 transition">
                <svg className="w-8 h-8 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
                </svg>
              </div>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex flex-col items-start gap-1">
                <span className="text-teal-600">Meelad Fest</span>
                <span className="text-xl">Stage Manager Portal</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Live stage proceedings, calls & order management interface.</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition">
            ← Back to Home
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-800">{stats.total}</span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Total Programs</span>
          </div>
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600">{stats.pending}</span>
            <span className="text-sm font-medium text-amber-600 uppercase tracking-wider mt-1">Pending Programs</span>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-emerald-600">{stats.finished}</span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider mt-1">Finished Programs</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500">Class (Calls-wise)</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500">Gender</label>
            <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
              {uniqueGenders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Program List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Filtered Programs ({filteredPrograms.length})</h2>
          
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading programs...</p>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
              No programs found matching the filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.map(program => (
                <div key={program._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{program.name}</h3>
                      <p className="text-sm text-slate-500">{program.category} • {program.gender} • {program.type}</p>
                      {program.class && <p className="text-xs font-semibold text-amber-600 mt-1">Class: {program.class}</p>}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      program.status === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {program.status || 'Pending'}
                    </span>
                  </div>
                  
                  {/* Judge Assignment */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Assign Judges:</p>
                    <div className="flex flex-wrap gap-2">
                      {judges.map(judge => {
                        const isAssigned = program.assignedJudges?.some(j => (j._id || j) === judge._id);
                        return (
                          <label key={judge._id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${
                            isAssigned ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={isAssigned} 
                              onChange={() => handleAssignJudge(program._id, judge._id)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium">{judge.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
