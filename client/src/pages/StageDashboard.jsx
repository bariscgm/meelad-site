import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function StageDashboard() {
  const [programs, setPrograms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingJudges, setPendingJudges] = useState({});

  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [programCandidates, setProgramCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

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

        // Limit Finished programs to 10
        const finishedPrograms = programsData.filter(p => p.status === 'Finished');
        finishedPrograms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const top10Finished = finishedPrograms.slice(0, 10);
        
        const processedPrograms = programsData.filter(p => p.status !== 'Finished' || top10Finished.some(f => f._id === p._id));

        setPrograms(processedPrograms);
        setJudges(judgesData.data || []);

        // Initialize pending judges state based on actual assignments
        const initialPending = {};
        programsData.forEach(p => {
          initialPending[p._id] = p.assignedJudges?.map(j => j._id || j) || [];
        });
        setPendingJudges(initialPending);

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

  const handleCheckboxChange = (programId, judgeId) => {
    setPendingJudges(prev => {
      const current = prev[programId] || [];
      if (current.includes(judgeId)) {
        return { ...prev, [programId]: current.filter(id => id !== judgeId) };
      } else {
        return { ...prev, [programId]: [...current, judgeId] };
      }
    });
  };

  const handleAssignJudgeSubmit = async (programId) => {
    try {
      const assignedJudges = pendingJudges[programId] || [];
      const status = assignedJudges.length > 0 ? 'Assigned' : 'Pending';
      
      const res = await fetch(`${API_URL}/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedJudges, status })
      });

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Judges successfully assigned to program.',
          icon: 'success',
          confirmButtonColor: '#14b8a6'
        });
        fetchData();
      } else {
        Swal.fire('Error', 'Failed to assign judges', 'error');
      }
    } catch (error) {
      console.error('Error assigning judge:', error);
      Swal.fire('Error', 'Network error occurred', 'error');
    }
  };

  const handleToggleCandidates = async (programId) => {
    if (expandedProgramId === programId) {
      setExpandedProgramId(null);
      setProgramCandidates([]);
      return;
    }
    
    setExpandedProgramId(programId);
    setLoadingCandidates(true);
    try {
      const res = await fetch(`${API_URL}/api/programs/${programId}/candidates`);
      if (res.ok) {
        const data = await res.json();
        setProgramCandidates(data);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleShuffleCodes = async (programId) => {
    try {
      const res = await fetch(`${API_URL}/api/programs/${programId}/shuffle-codes`, {
        method: 'POST'
      });
      if (res.ok) {
        Swal.fire('Success', 'Code letters auto-shuffled!', 'success');
        
        // Update local state to enable the submit button immediately
        setPrograms(prev => prev.map(p => p._id === programId ? { ...p, isCodeShuffled: true } : p));

        // Reload candidates to see the new codes
        const reloadRes = await fetch(`${API_URL}/api/programs/${programId}/candidates`);
        if (reloadRes.ok) {
          const data = await reloadRes.json();
          setProgramCandidates(data);
        }
      } else {
        const err = await res.json();
        Swal.fire('Error', err.message || 'Failed to shuffle codes', 'error');
      }
    } catch (error) {
      console.error('Failed to shuffle codes:', error);
      Swal.fire('Error', 'Network error occurred', 'error');
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
                      program.status === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 
                      program.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {program.status || 'Pending'}
                    </span>
                  </div>
                  
                  {/* Judge Assignment */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-700">Assign Judges:</p>
                    <div className="flex flex-wrap gap-2">
                      {judges.map(judge => {
                        const isAssigned = (pendingJudges[program._id] || []).includes(judge._id);
                        const isLocked = program.status !== 'Pending';
                        return (
                          <label key={judge._id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
                            isAssigned ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                          } ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-slate-100'}`}>
                            <input 
                              type="checkbox" 
                              checked={isAssigned} 
                              disabled={isLocked}
                              onChange={() => handleCheckboxChange(program._id, judge._id)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 disabled:opacity-50"
                            />
                            <span className="text-sm font-medium">{judge.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {program.status === 'Pending' ? (
                      <button 
                        onClick={() => handleAssignJudgeSubmit(program._id)}
                        disabled={!program.isCodeShuffled}
                        className={`mt-2 self-start px-4 py-2 font-bold text-sm rounded-xl transition shadow-sm ${
                          program.isCodeShuffled 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {program.isCodeShuffled ? 'Submit Assignment' : 'Shuffle Codes First'}
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="mt-2 self-start px-4 py-2 bg-slate-200 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed"
                      >
                        {program.status === 'Finished' ? 'Scoring Completed' : 'Already Assigned'}
                      </button>
                    )}
                  </div>

                  {/* Candidates Management Section */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <button
                      onClick={() => handleToggleCandidates(program._id)}
                      className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 w-fit"
                    >
                      {expandedProgramId === program._id ? 'Hide Candidates' : 'View Candidates'} 
                      <svg className={`w-4 h-4 transform transition-transform ${expandedProgramId === program._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {expandedProgramId === program._id && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-slate-800">Candidates ({programCandidates.length})</h4>
                          {programCandidates.length > 0 && (
                            <button
                              onClick={() => handleShuffleCodes(program._id)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                            >
                              Auto-Shuffle Code Letters
                            </button>
                          )}
                        </div>
                        
                        {loadingCandidates ? (
                          <p className="text-xs text-slate-500">Loading...</p>
                        ) : programCandidates.length === 0 ? (
                          <p className="text-xs text-slate-500">No active candidates found for this program.</p>
                        ) : (
                          <ul className="space-y-2">
                            {programCandidates.map((cand, idx) => (
                              <li key={cand._id} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100 shadow-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">{idx + 1}. {cand.name}</span>
                                  <span className="text-xs text-slate-500">{cand.team?.name || 'Unknown Team'} • {cand.className}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  {cand.programCodes && cand.programCodes[program._id] ? (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded">
                                      Code: {cand.programCodes[program._id]}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 font-medium text-[10px] rounded">
                                      No Code
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
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
