import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function ResultManagement() {
  const [results, setResults] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [editingResult, setEditingResult] = useState(null);
  const [showTotalPoints, setShowTotalPoints] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchTeams();
  }, []);

  const categoriesList = ['All', ...new Set(results.map(r => r.program?.category).filter(Boolean))];

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.program?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.winners?.some((w) => w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || w.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.program?.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchResults();
      } else {
        Swal.fire('Error', 'Failed to update result status', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/results/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchResults();
          Swal.fire('Deleted!', 'Result has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error', 'Server connection failed', 'error');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/results/${editingResult._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: editingResult.winners }),
      });
      if (res.ok) {
        setEditingResult(null);
        fetchResults();
        Swal.fire('Success', 'Result updated successfully', 'success');
      } else {
        Swal.fire('Error', 'Failed to update result', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">Results Control</span>
          <h1 className="text-3xl font-bold text-slate-800">Results Management</h1>
        </div>
        <button onClick={() => window.print()} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Results
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="glass p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20">
          <p className="text-xs uppercase font-bold text-emerald-600">Published Results</p>
          <p className="text-3xl font-extrabold text-emerald-800 mt-1">
            {results.filter((r) => r.status === 'Published').length}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-amber-100 bg-amber-50/20">
          <p className="text-xs uppercase font-bold text-amber-600">Draft Results</p>
          <p className="text-3xl font-extrabold text-amber-800 mt-1">
            {results.filter((r) => r.status === 'Draft').length}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-blue-100 bg-blue-50/20">
          <p className="text-xs uppercase font-bold text-blue-600">Total Results Processed</p>
          <p className="text-3xl font-extrabold text-blue-800 mt-1">{results.length}</p>
        </div>
      </div>

      {/* Team Points Overview */}
      <div className="glass p-6 rounded-3xl space-y-6 print:hidden">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>🏆</span> Team Points Overview
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 font-semibold">Team</th>
                <th className="py-3 px-4 font-semibold text-emerald-600">Published</th>
                <th className="py-3 px-4 font-semibold text-rose-600 flex items-center gap-2">
                  Total Uploaded
                  <button onClick={() => setShowTotalPoints(!showTotalPoints)} className="text-slate-400 hover:text-slate-600 transition" title="Toggle Visibility">
                    {showTotalPoints ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 font-extrabold text-amber-600">Hold Total Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const teamStats = {};
                results.forEach(r => {
                  const isPub = r.status === 'Published';
                  const isHeld = r.status === 'Hold';

                  r.winners?.forEach(w => {
                    if (w.team) {
                      const tId = w.team._id || w.team;
                      if (!teamStats[tId]) {
                        teamStats[tId] = { 
                          id: tId, 
                          name: w.team.name || 'Unknown Team', 
                          color: w.team.color || '#333', 
                          published: 0, 
                          unpublished: 0, 
                          heldPoints: 0 
                        };
                      }
                      
                      const calculatePoints = (type, position, grade) => {
                        let pts = 0;
                        const pos = Number(position);
                        if (type === 'Individual') {
                          if (pos === 1) pts += 5;
                          else if (pos === 2) pts += 3;
                          else if (pos === 3) pts += 1;
                          if (grade === 'A') pts += 5;
                          else if (grade === 'B') pts += 3;
                          else if (grade === 'C') pts += 1;
                        } else if (type === 'Group') {
                          if (pos === 1) pts += 10;
                          else if (pos === 2) pts += 5;
                          else if (pos === 3) pts += 3;
                          if (grade === 'A') pts += 10;
                          else if (grade === 'B') pts += 5;
                          else if (grade === 'C') pts += 3;
                        }
                        return pts;
                      };
                      
                      const pts = w.points || calculatePoints(r.program?.type, w.position, w.grade);
                      
                      if (isPub) {
                        teamStats[tId].published += pts;
                      } else {
                        teamStats[tId].unpublished += pts;
                        if (isHeld) {
                          teamStats[tId].heldPoints += pts;
                        }
                      }
                    }
                  });
                });
                
                const sortedTeams = Object.values(teamStats).sort((a, b) => {
                   const aTotal = a.published + a.heldPoints;
                   const bTotal = b.published + b.heldPoints;
                   if (bTotal !== aTotal) return bTotal - aTotal;
                   return b.published - a.published;
                });
                
                if (sortedTeams.length === 0) {
                  return (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500 text-sm">
                        No team data available.
                      </td>
                    </tr>
                  );
                }
                
                return sortedTeams.map(t => (
                  <tr key={t.id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: t.color }}></span>
                        <span className="font-bold text-slate-700">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{t.published}</td>
                    <td className="py-3 px-4 font-bold text-rose-700">{t.unpublished}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-xl font-extrabold text-sm">
                        {t.published + t.heldPoints}
                      </span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="relative md:col-span-1">
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search programme or winner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Draft (Pending)</option>
            <option value="Hold">Hold Results</option>
          </select>
        </div>
      </div>

      {/* Results Cards List */}
      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading results...</p>
      ) : filteredResults.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center">
          <p className="text-slate-400 font-medium">No results found matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((r) => (
            <div key={r._id} className="glass p-6 rounded-3xl space-y-4 border border-slate-100 hover:border-teal-200 transition">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{r.program?.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.category}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Judge: {r.judge?.name}</p>
                </div>
                
                <div className="flex items-center gap-3 print:hidden">
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => handleStatusChange(r._id, 'Draft')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${r.status === 'Draft' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Draft
                    </button>
                    <button
                      onClick={() => handleStatusChange(r._id, 'Hold')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${r.status === 'Hold' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-amber-600'}`}
                    >
                      Hold
                    </button>
                    <button
                      onClick={() => handleStatusChange(r._id, 'Published')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${r.status === 'Published' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                      Publish
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => setEditingResult(r)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Result"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Result"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Winners List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {r.winners?.map((w, idx) => {
                  const getPosColor = (pos) => {
                    if (pos === 1) return { bg: '#dcfce7', text: '#15803d' }; // green
                    if (pos === 2) return { bg: '#dbeafe', text: '#1d4ed8' }; // blue
                    if (pos === 3) return { bg: '#fee2e2', text: '#b91c1c' }; // red
                    return { bg: '#f1f5f9', text: '#64748b' };
                  };
                  
                  const calculatePoints = (type, position, grade) => {
                    let pts = 0;
                    const pos = Number(position);
                    if (type === 'Individual') {
                      if (pos === 1) pts += 5;
                      else if (pos === 2) pts += 3;
                      else if (pos === 3) pts += 1;
                      if (grade === 'A') pts += 5;
                      else if (grade === 'B') pts += 3;
                      else if (grade === 'C') pts += 1;
                    } else if (type === 'Group') {
                      if (pos === 1) pts += 10;
                      else if (pos === 2) pts += 5;
                      else if (pos === 3) pts += 3;
                      if (grade === 'A') pts += 10;
                      else if (grade === 'B') pts += 5;
                      else if (grade === 'C') pts += 3;
                    }
                    return pts;
                  };

                  const posColors = getPosColor(w.position);
                  const displayPoints = w.points || calculatePoints(r.program?.type, w.position, w.grade);
                  
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: posColors.bg, color: posColors.text }}>
                        {w.position}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{w.name} <span className="text-slate-400 text-xs">({w.chestNo})</span></p>
                        <p className="text-xs font-semibold" style={{ color: posColors.text }}>{w.team?.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-1.5 py-0.5 rounded">
                          Grade {w.grade}
                        </span>
                        <span className="inline-block bg-slate-200 text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded">
                          {displayPoints} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Edit Result</h3>
                <p className="text-sm text-slate-500 mt-1">{editingResult.program?.name} - {editingResult.program?.category}</p>
              </div>
              <button onClick={() => setEditingResult(null)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="editResultForm" onSubmit={handleEditSubmit} className="space-y-6">
                {editingResult.winners?.map((w, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Position</label>
                      <input 
                        type="number" 
                        value={w.position || ''} 
                        onChange={(e) => {
                          const newWinners = [...editingResult.winners];
                          newWinners[index].position = Number(e.target.value);
                          setEditingResult({...editingResult, winners: newWinners});
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chest No</label>
                      <input 
                        type="text" 
                        value={w.chestNo || ''} 
                        onChange={(e) => {
                          const newWinners = [...editingResult.winners];
                          newWinners[index].chestNo = e.target.value;
                          setEditingResult({...editingResult, winners: newWinners});
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                      <input 
                        type="text" 
                        value={w.name || ''} 
                        onChange={(e) => {
                          const newWinners = [...editingResult.winners];
                          newWinners[index].name = e.target.value;
                          setEditingResult({...editingResult, winners: newWinners});
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Team</label>
                      <select 
                        value={w.team?._id || w.team || ''}
                        onChange={(e) => {
                          const newWinners = [...editingResult.winners];
                          const selectedTeam = teams.find(t => t._id === e.target.value);
                          newWinners[index].team = selectedTeam || e.target.value;
                          setEditingResult({...editingResult, winners: newWinners});
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="">Select Team</option>
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grade</label>
                      <select 
                        value={w.grade || ''}
                        onChange={(e) => {
                          const newWinners = [...editingResult.winners];
                          newWinners[index].grade = e.target.value;
                          setEditingResult({...editingResult, winners: newWinners});
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="None">None</option>
                        <option value="A">A Grade</option>
                        <option value="B">B Grade</option>
                        <option value="C">C Grade</option>
                      </select>
                    </div>
                  </div>
                ))}
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setEditingResult(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="editResultForm"
                className="px-6 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
