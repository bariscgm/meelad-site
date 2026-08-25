import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';
import ResultPoster from '../components/ResultPoster';

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

export default function ResultManagement() {
  const [results, setResults] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [editingResult, setEditingResult] = useState(null);
  const [showTotalPoints, setShowTotalPoints] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [posterResult, setPosterResult] = useState(null);
  const [showPublished, setShowPublished] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [programCandidates, setProgramCandidates] = useState([]);
  const [candidateScores, setCandidateScores] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const toggleExpand = (id) => {
    setExpandedResults(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.reverse());
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

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(['All', ...data.map(c => c.name)]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/candidates`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchTeams();
    fetchCategories();
    fetchCandidates();
  }, []);

  // Cascading Filter Logic
  const getAvailableOptions = (field) => {
    return [...new Set(results.filter(r => {
      if (field !== 'category' && selectedCategory !== 'All' && r.program?.category !== selectedCategory) return false;
      if (field !== 'gender' && selectedGender !== 'All' && r.program?.gender !== selectedGender) return false;
      if (field !== 'status' && selectedStatus !== 'All' && r.status !== selectedStatus) return false;
      return true;
    }).map(r => {
      if (field === 'category') return r.program?.category;
      if (field === 'gender') return r.program?.gender;
      if (field === 'status') return r.status;
      return null;
    }))].filter(Boolean).sort();
  };

  const dynamicCategories = getAvailableOptions('category');
  const dynamicGenders = getAvailableOptions('gender');
  const dynamicStatuses = getAvailableOptions('status');

  // Reset invalid selections
  useEffect(() => {
    if (selectedCategory !== 'All' && !dynamicCategories.includes(selectedCategory)) setSelectedCategory('All');
    if (selectedGender !== 'All' && !dynamicGenders.includes(selectedGender)) setSelectedGender('All');
    if (selectedStatus !== 'All' && !dynamicStatuses.includes(selectedStatus)) setSelectedStatus('All');
  }, [selectedCategory, selectedGender, selectedStatus, dynamicCategories, dynamicGenders, dynamicStatuses]);

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.program?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.winners?.some((w) => w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || w.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.program?.category === selectedCategory;
    const matchesGender = selectedGender === 'All' || r.program?.gender === selectedGender;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesGender && matchesStatus;
  });

  // Restore deleted result
  const handleRestore = async () => {
    try {
      const res = await fetch(`${API_URL}/api/restore/Result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        Toast.fire({
          icon: 'success',
          title: data.message
        });
        fetchResults();
      } else {
        const errorData = await res.json();
        Toast.fire({
          icon: 'error',
          title: errorData.message || 'Failed to restore'
        });
      }
    } catch (error) {
      console.error('Failed to restore result:', error);
      Toast.fire({
        icon: 'error',
        title: 'An unexpected error occurred'
      });
    }
  };

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

  const handleProtectedAction = async (action, r) => {
    if (r.status === 'Published') {
      const { value: password } = await Swal.fire({
        title: 'Authentication Required',
        text: 'Enter password to modify a published result',
        input: 'password',
        inputPlaceholder: 'Enter password',
        showCancelButton: true,
        confirmButtonColor: '#0f766e',
        cancelButtonColor: '#ef4444',
      });

      if (password === '1234') {
        action();
      } else if (password !== undefined) {
        Swal.fire('Error', 'Incorrect password', 'error');
      }
    } else {
      action();
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

  const handleOpenEdit = async (r) => {
    setEditingResult(r);
    setProgramCandidates([]);
    setCandidateScores({});
    setLoadingCandidates(true);
    try {
      const progId = r.program?._id || r.program;
      const res = await fetch(`${API_URL}/api/programs/${progId}/candidates`);
      if (res.ok) {
        const data = await res.json();
        setProgramCandidates(data);
        const initialScores = {};
        
        data.forEach(c => {
          const existingWinner = r.winners?.find(w => w.name === c.name);
          initialScores[c._id] = { 
            position: existingWinner?.position || '', 
            grade: existingWinner?.grade || '' 
          };
        });
        setCandidateScores(initialScores);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const validWinners = [];
    for (const cand of programCandidates) {
      const score = candidateScores[cand._id];
      if (score && (score.position || (score.grade && score.grade !== 'None'))) {
        const progId = editingResult.program?._id || editingResult.program;
        validWinners.push({
          position: score.position ? parseInt(score.position) : null,
          chestNo: cand.programCodes?.[progId] || 'N/A',
          name: cand.name,
          team: cand.team?._id || cand.team,
          points: 0,
          grade: score.grade === 'None' ? '' : (score.grade || '')
        });
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/results/${editingResult._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: validWinners }),
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

  const handleProtectedEdit = (r) => {
    handleProtectedAction(() => handleOpenEdit(r), r);
  };


  const unpublishedResults = filteredResults.filter(r => r.status !== 'Published');
  const publishedResults = filteredResults.filter(r => r.status === 'Published');

  const renderResultCard = (r, index) => (
            <div key={r._id} className="glass p-6 rounded-3xl space-y-4 border border-slate-100 hover:border-teal-200 transition">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">#{index + 1}</span>
                    <h3 className="text-xl font-bold text-slate-800">{r.program?.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.category}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.type}
                    </span>
                    {r.program?.gender && (
                      <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2.5 py-0.5 rounded-full font-semibold">
                        {r.program?.gender}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Judge: {r.judge?.name}</p>
                  
                  {/* Team Points for this program */}
                  {(() => {
                    const teamPts = {};
                    r.winners?.forEach(w => {
                      if (w.team) {
                        const tId = w.team._id || w.team;
                        const tName = w.team.name || 'Team';
                        const tColor = w.team.color || '#ccc';
                        const pts = w.points || calculatePoints(r.program?.type, w.position, w.grade);
                        if (!teamPts[tId]) {
                          teamPts[tId] = { name: tName, color: tColor, pts: 0 };
                        }
                        teamPts[tId].pts += pts;
                      }
                    });
                    const teamsArray = Object.values(teamPts).sort((a,b) => b.pts - a.pts);
                    if (teamsArray.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teamsArray.map(t => (
                          <div key={t.name} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold shadow-sm">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
                            <span className="text-slate-600">{t.name}:</span>
                            <span className="text-slate-800 font-bold">{t.pts}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                
                <div className="flex items-center gap-3 print:hidden">
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <select
                      value={r.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleProtectedAction(() => handleStatusChange(r._id, newStatus), r);
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition focus:outline-none cursor-pointer ${
                        r.status === 'Draft' ? 'bg-white shadow-sm text-slate-800' : 
                        r.status === 'Hold' ? 'bg-amber-100 text-amber-700 shadow-sm' : 
                        'bg-emerald-100 text-emerald-700 shadow-sm'
                      }`}
                    >
                      <option value="Draft" className="font-bold text-slate-800 bg-white">Draft</option>
                      <option value="Hold" className="font-bold text-amber-700 bg-white">Hold</option>
                      <option value="Published" className="font-bold text-emerald-700 bg-white">Published</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => setPosterResult(r)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg transition bg-purple-100 text-purple-700 hover:bg-purple-200"
                      title="Generate Poster"
                    >
                      Poster
                    </button>
                    <button
                      onClick={() => toggleExpand(r._id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${expandedResults[r._id] ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {expandedResults[r._id] ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => handleProtectedEdit(r)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Result"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleProtectedAction(() => handleDelete(r._id), r)}
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
              {expandedResults[r._id] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...(r.winners || [])].sort((a, b) => (Number(a.position) || 999) - (Number(b.position) || 999)).map((w, idx) => {
                    const getPosColor = (pos) => {
                      if (pos === 1) return { bg: '#dcfce7', text: '#15803d' }; // green
                      if (pos === 2) return { bg: '#dbeafe', text: '#1d4ed8' }; // blue
                      if (pos === 3) return { bg: '#fee2e2', text: '#b91c1c' }; // red
                      return { bg: '#f1f5f9', text: '#64748b' };
                    };
                    const posColors = getPosColor(w.position);
                    const displayPoints = w.points || calculatePoints(r.program?.type, w.position, w.grade);
                    const candidate = candidates.find(c => c.name === w.name);
                    const actualChestNo = candidate ? candidate.chestNo : null;
                    const groupMembers = r.program?.type === 'Group' ? candidates.filter(c => {
                       const progId = r.program?._id;
                       const progName = r.program?.name;
                       const assignedGroup = c.groupAssignments?.[progId] || c.groupAssignments?.[progName];
                       if (assignedGroup && assignedGroup === w.name) return true;
                       if ((w.name === (w.team && w.team.name) || w.name === c.team?.name) && c.programs?.includes(progName)) return true;
                       return false;
                    }).map(c => c.name) : [];

                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: posColors.bg, color: posColors.text }}>
                          {w.position}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {w.name} 
                            <span className="text-slate-400 text-xs ml-1">
                              (Code: {w.chestNo}{actualChestNo ? ` | Chest No: ${actualChestNo}` : ''})
                            </span>
                          </p>
                          {r.program?.type === 'Group' && groupMembers.length > 0 && (
                            <p className="text-[10.5px] text-slate-600 mt-0.5 font-medium leading-tight">
                              {groupMembers.join(', ')}
                            </p>
                          )}
                          <p className="text-xs font-semibold mt-0.5" style={{ color: posColors.text }}>{w.team?.name}</p>
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
              )}
            </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">Results Control</span>
          <h1 className="text-3xl font-bold text-slate-800">Results Management</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRestore} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Restore
          </button>
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Results
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 print:hidden">
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
        <div className="glass p-6 rounded-2xl border border-rose-100 bg-rose-50/20">
          <p className="text-xs uppercase font-bold text-rose-600">Hold Results</p>
          <p className="text-3xl font-extrabold text-rose-800 mt-1">
            {results.filter((r) => r.status === 'Hold').length}
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
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {showTotalPoints ? (t.published + t.unpublished + t.heldPoints) : '***'}
                    </td>
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
      <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
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
            <option value="All">All Categories</option>
            {dynamicCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            <option value="All">All Genders</option>
            {dynamicGenders.map((g) => (
              <option key={g} value={g}>{g}</option>
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
            {dynamicStatuses.map((s) => (
              <option key={s} value={s}>{s === 'Published' ? 'Published Only' : s === 'Draft' ? 'Draft (Pending)' : 'Hold Results'}</option>
            ))}
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
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-bold text-slate-700">Displaying {unpublishedResults.length} Unpublished Results</h2>
            </div>
            {unpublishedResults.map((r, index) => renderResultCard(r, index))}
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => setShowPublished(!showPublished)}
              className="w-full flex justify-between items-center bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition border border-emerald-200"
            >
              <span>View Published Results ({publishedResults.length})</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${showPublished ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showPublished && (
              <div className="space-y-4 pt-2">
                {publishedResults.map((r, index) => renderResultCard(r, index))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Poster Generator Modal */}
      {posterResult && (
        <ResultPoster result={posterResult} candidates={candidates} onClose={() => setPosterResult(null)} />
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
              {loadingCandidates ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : programCandidates.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No candidates registered for this program.</p>
                </div>
              ) : (
                <form id="editResultForm" onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <div className="col-span-2">Chest No</div>
                    <div className="col-span-5">Candidate Name & Team</div>
                    <div className="col-span-2">Position</div>
                    <div className="col-span-3">Grade</div>
                  </div>
                  
                  {programCandidates.map((cand) => {
                    const candId = cand._id;
                    const progId = editingResult.program?._id || editingResult.program;
                    const chestNo = cand.programCodes?.[progId] || 'N/A';
                    
                    return (
                      <div key={candId} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200">
                        <div className="col-span-2 font-mono font-bold text-slate-700">{chestNo}</div>
                        <div className="col-span-5">
                          <p className="font-bold text-slate-800">{cand.name}</p>
                          <p className="text-xs text-slate-500">{cand.team?.name || 'Unknown Team'}</p>
                        </div>
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            min="1"
                            max="3"
                            placeholder="1-3"
                            value={candidateScores[candId]?.position || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCandidateScores(prev => ({
                                ...prev,
                                [candId]: { ...prev[candId], position: val }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-center font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div className="col-span-3">
                          <select 
                            value={candidateScores[candId]?.grade || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCandidateScores(prev => ({
                                ...prev,
                                [candId]: { ...prev[candId], grade: val }
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 bg-white"
                          >
                            <option value="">None</option>
                            <option value="A">A Grade</option>
                            <option value="B">B Grade</option>
                            <option value="C">C Grade</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </form>
              )}
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
