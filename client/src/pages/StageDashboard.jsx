import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function StageDashboard() {
  const [programs, setPrograms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingJudges, setPendingJudges] = useState({});

  const [expandedDetails, setExpandedDetails] = useState({});
  const [candidatesByProgram, setCandidatesByProgram] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState({});
  const [showAssigned, setShowAssigned] = useState(false);

  // Filters
  const [filterClass, setFilterClass] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterVenue, setFilterVenue] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

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
        return { ...prev, [programId]: [] }; // Deselect if already selected
      } else {
        return { ...prev, [programId]: [judgeId] }; // Only allow one judge
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

  const handleReassign = (programId) => {
    Swal.fire({
      title: 'Enter Password',
      input: 'password',
      inputLabel: 'Password required to re-assign program',
      inputPlaceholder: 'Enter password',
      showCancelButton: true,
      confirmButtonText: 'Verify & Re-assign',
      confirmButtonColor: '#14b8a6',
      inputValidator: (value) => {
        if (!value) {
          return 'Password is required!';
        }
        if (value !== '1234') {
          return 'Incorrect Password!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL}/api/programs/${programId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedJudges: [], status: 'Pending' })
          });

          if (res.ok) {
            Swal.fire(
              'Re-assigned!',
              'The program has been moved back to Pending status.',
              'success'
            );
            fetchData();
          } else {
            Swal.fire('Error', 'Failed to re-assign program', 'error');
          }
        } catch (error) {
          console.error('Error re-assigning:', error);
          Swal.fire('Error', 'Network error occurred', 'error');
        }
      }
    });
  };

  const handleToggleDetails = async (programId) => {
    const isCurrentlyExpanded = expandedDetails[programId];
    
    // Toggle state
    setExpandedDetails(prev => ({...prev, [programId]: !isCurrentlyExpanded}));

    // If we are expanding and we haven't loaded candidates for this program yet
    if (!isCurrentlyExpanded && !candidatesByProgram[programId]) {
      setLoadingCandidates(prev => ({...prev, [programId]: true}));
      try {
        const res = await fetch(`${API_URL}/api/programs/${programId}/candidates`);
        if (res.ok) {
          const data = await res.json();
          setCandidatesByProgram(prev => ({...prev, [programId]: data}));
        }
      } catch (error) {
        console.error('Failed to load candidates:', error);
      } finally {
        setLoadingCandidates(prev => ({...prev, [programId]: false}));
      }
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
          setCandidatesByProgram(prev => ({...prev, [programId]: data}));
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

  const handleToggleAbsent = async (cand, programId) => {
    try {
      const candidateIds = cand.isGroup ? cand.memberIds : [cand._id];
      const promises = candidateIds.map(id => 
        fetch(`${API_URL}/api/candidates/${id}/absent`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programId })
        }).then(res => {
          if (!res.ok) throw new Error('Failed to update');
          return res.json();
        })
      );
      
      const updatedCandidates = await Promise.all(promises);
      
      setCandidatesByProgram(prev => {
        const programCandidates = prev[programId] || [];
        const newCandidates = programCandidates.map(c => 
          (c._id === cand._id) ? { ...c, absentPrograms: updatedCandidates[0].absentPrograms } : c
        );
        return { ...prev, [programId]: newCandidates };
      });
    } catch (error) {
      console.error('Failed to toggle absent status:', error);
      Swal.fire('Error', 'Failed to update absent status', 'error');
    }
  };

  const handlePrint = (program) => {
    const candidates = candidatesByProgram[program._id] || [];
    
    let candidatesHtml = '<p style="text-align:center;">No candidates registered.</p>';
    if (candidates.length > 0) {
      const rows = candidates.map((cand, index) => {
        const isAbsent = cand.absentPrograms && cand.absentPrograms.includes(program._id);
        const membersHtml = cand.isGroup && cand.members ? 
          '<span class="members">Members: ' + cand.members.map(m => m.name).join(', ') + '</span>' : '';
        const codeHtml = cand.programCodes && cand.programCodes[program._id] ?
          ' (Code: ' + cand.programCodes[program._id] + ')' : '';
          
        return `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${cand.name}</strong>${codeHtml}${membersHtml}</td>
            <td>${cand.chestNo || '-'}</td>
            <td>${cand.team?.name || '-'}</td>
            <td>${cand.className || cand.category || '-'}</td>
            <td class="${isAbsent ? 'absent' : ''}">${isAbsent ? 'Absent' : ''}</td>
          </tr>
        `;
      }).join('');
      
      candidatesHtml = `
        <table>
          <thead>
            <tr>
              <th width="8%">Sl No</th>
              <th width="30%">Name</th>
              <th width="15%">Chest No</th>
              <th width="20%">Team / Group</th>
              <th width="15%">Class</th>
              <th width="12%">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    const printContent = `
      <html>
        <head>
          <title>${program.name} - Candidates List</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #1e293b; margin-bottom: 5px; font-size: 24px; }
            .meta { text-align: center; font-size: 14px; color: #64748b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 14px; }
            th { background-color: #f8fafc; font-weight: 600; color: #475569; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .absent { color: #ef4444; font-weight: bold; }
            .members { font-size: 11px; color: #64748b; display: block; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${program.name}</h1>
          <div class="meta">${program.category} • ${program.gender}</div>
          ${candidatesHtml}
          
          <div style="margin-top: 40px; text-align: right; font-size: 14px;">
            <p>Signature of Stage Manager: ____________________</p>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintAllFiltered = async () => {
    if (filteredPrograms.length === 0) {
      Swal.fire('Info', 'No programs to print', 'info');
      return;
    }

    Swal.fire({
      title: 'Preparing Print...',
      text: 'Fetching candidates for all selected programs',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const candidatesData = {};
      const fetchPromises = filteredPrograms.map(async (prog) => {
        if (candidatesByProgram[prog._id]) {
          candidatesData[prog._id] = candidatesByProgram[prog._id];
        } else {
          const res = await fetch(`${API_URL}/api/programs/${prog._id}/candidates`);
          if (res.ok) {
            candidatesData[prog._id] = await res.json();
          } else {
            candidatesData[prog._id] = [];
          }
        }
      });
      
      await Promise.all(fetchPromises);
      
      const programHtmls = filteredPrograms.map(prog => {
        const candidates = candidatesData[prog._id] || [];
        let candidatesHtml = '<p style="font-size: 13px; color: #64748b;">No candidates registered.</p>';
        if (candidates.length > 0) {
          const rows = candidates.map((cand, index) => {
            const isAbsent = cand.absentPrograms && cand.absentPrograms.includes(prog._id);
            const membersHtml = cand.isGroup && cand.members ? 
              '<span class="members">Members: ' + cand.members.map(m => m.name).join(', ') + '</span>' : '';
            const codeHtml = cand.programCodes && cand.programCodes[prog._id] ?
              ' (Code: ' + cand.programCodes[prog._id] + ')' : '';
              
            return `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${cand.name}</strong>${codeHtml}${membersHtml}</td>
                <td>${cand.chestNo || '-'}</td>
                <td>${cand.team?.name || '-'}</td>
                <td>${cand.className || cand.category || '-'}</td>
                <td class="${isAbsent ? 'absent' : ''}">${isAbsent ? 'Absent' : ''}</td>
              </tr>
            `;
          }).join('');

          candidatesHtml = `
            <table>
              <thead>
                <tr>
                  <th width="5%">Sl No</th>
                  <th width="30%">Name</th>
                  <th width="15%">Chest No</th>
                  <th width="20%">Team / Group</th>
                  <th width="15%">Class</th>
                  <th width="15%">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          `;
        }

        return `
          <div class="program-section">
            <div class="program-title">${prog.name} (${prog.category} • ${prog.gender})</div>
            ${candidatesHtml}
          </div>
        `;
      }).join('');

      let html = `
        <html>
          <head>
            <title>Filtered Programs List</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
              h1 { text-align: center; color: #1e293b; margin-bottom: 5px; font-size: 24px; }
              .meta { text-align: center; font-size: 14px; color: #64748b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
              .program-section { margin-bottom: 40px; page-break-inside: avoid; }
              .program-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 10px; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 13px; }
              th { background-color: #f8fafc; font-weight: 600; color: #475569; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .absent { color: #ef4444; font-weight: bold; }
              .members { font-size: 11px; color: #64748b; display: block; margin-top: 4px; }
              @media print {
                body { padding: 0; }
                button { display: none; }
                .program-section { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>Stage Manager - Selected Programs List</h1>
            <div class="meta">Total Programs: ${filteredPrograms.length}</div>
            
            ${programHtmls}
            
            <div style="margin-top: 40px; text-align: right; font-size: 14px;">
              <p>Signature of Stage Manager: ____________________</p>
            </div>
            
            <script>
              window.onload = () => {
                window.print();
              };
            </script>
          </body>
        </html>
      `;
      
      setCandidatesByProgram(prev => ({...prev, ...candidatesData}));
      Swal.close();
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Failed to print filtered programs:', error);
      Swal.fire('Error', 'Failed to load candidates for printing', 'error');
    }
  };

  const filteredPrograms = programs.filter(p => {
    const classMatch = filterClass === 'All' || p.class === filterClass;
    const categoryMatch = filterCategory === 'All' || p.category === filterCategory;
    const genderMatch = filterGender === 'All' || p.gender === filterGender;
    const venueMatch = filterVenue === 'All' || p.venueType === filterVenue;
    
    let statusMatch = true;
    if (filterStatus === 'Pending') statusMatch = p.status === 'Pending';
    if (filterStatus === 'Assigned/Finished') statusMatch = p.status === 'Assigned' || p.status === 'Finished';
    
    return classMatch && categoryMatch && genderMatch && statusMatch && venueMatch;
  });

  const uniqueClasses = ['All', ...new Set(programs.map(p => p.class).filter(Boolean))];
  const uniqueCategories = ['All', ...new Set(programs.map(p => p.category).filter(Boolean))];
  const uniqueGenders = ['All', 'Boy', 'Girl', 'General'];
  const uniqueVenues = ['All', ...new Set(programs.map(p => p.venueType).filter(Boolean))];

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
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handlePrintAllFiltered} 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Filtered
            </button>
            <Link to="/" className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition flex items-center justify-center">
              ← Back to Home
            </Link>
          </div>
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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
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
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500">Venue</label>
              <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                {uniqueVenues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Assigned/Finished">Assigned/Finished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Program List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Pending Programs ({filteredPrograms.filter(p => p.status === 'Pending').length})</h2>
          
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading programs...</p>
          ) : filteredPrograms.filter(p => p.status === 'Pending').length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
              No pending programs found matching the filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.filter(p => p.status === 'Pending').map(program => (
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

                  <div className="flex items-center gap-3 mt-1 self-start">
                    <button 
                      onClick={() => handleToggleDetails(program._id)}
                      className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                    >
                      {expandedDetails[program._id] ? 'Hide Details' : 'View Details'}
                      <svg className={`w-4 h-4 transform transition-transform ${expandedDetails[program._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {program.candidateCount !== undefined && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {program.candidateCount} Candidates
                      </span>
                    )}
                  </div>
                  
                  {/* Additional Details Sections */}
                  {expandedDetails[program._id] && (
                    <div className="flex flex-col gap-4 mt-2">
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
                              type="radio" 
                              name={`judge-${program._id}`}
                              checked={isAssigned} 
                              disabled={isLocked}
                              onChange={() => handleCheckboxChange(program._id, judge._id)}
                              className="w-4 h-4 text-amber-600 border-slate-300 focus:ring-amber-500 disabled:opacity-50"
                            />
                            <span className="text-sm font-medium">{judge.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {program.status === 'Pending' ? (
                      <button 
                        onClick={() => handleAssignJudgeSubmit(program._id)}
                        disabled={!program.isCodeShuffled || !(pendingJudges[program._id] || []).length}
                        className={`mt-2 self-start px-4 py-2 font-bold text-sm rounded-xl transition shadow-sm ${
                          program.isCodeShuffled && (pendingJudges[program._id] || []).length > 0
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {!program.isCodeShuffled 
                          ? 'Shuffle Codes First' 
                          : !(pendingJudges[program._id] || []).length
                            ? 'Select a Judge'
                            : 'Submit Assignment'}
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
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-bold text-slate-800">Candidates ({(candidatesByProgram[program._id] || []).length})</h4>
                          <div className="flex gap-2">
                            {(candidatesByProgram[program._id] || []).length > 0 && (
                              <button
                                onClick={() => handlePrint(program)}
                                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 transition flex items-center gap-1"
                                title="Print Candidates List"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                              </button>
                            )}
                            {(candidatesByProgram[program._id] || []).length > 0 && (
                              <button
                                onClick={() => handleShuffleCodes(program._id)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                              >
                                Auto-Shuffle Code Letters
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {loadingCandidates[program._id] ? (
                          <p className="text-xs text-slate-500">Loading...</p>
                        ) : (candidatesByProgram[program._id] || []).length === 0 ? (
                          <p className="text-xs text-slate-500">No active candidates found for this program.</p>
                        ) : (
                          <ul className="space-y-2">
                            {(candidatesByProgram[program._id] || []).map((cand, idx) => (
                              <li key={cand._id} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100 shadow-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">{idx + 1}. {cand.name}</span>
                                  <span className="text-xs text-slate-500">{cand.team?.name || 'Unknown Team'} • {cand.className} {cand.category ? `• ${cand.category}` : ''}</span>
                                  {cand.isGroup && cand.members && (
                                    <div className="mt-1 text-xs text-slate-400">
                                      Members: {cand.members.map(m => m.name).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {cand.programCodes && cand.programCodes[program._id] ? (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded">
                                      Code: {cand.programCodes[program._id]}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 font-medium text-[10px] rounded">
                                      No Code
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleToggleAbsent(cand, program._id)}
                                    className={`px-2 py-1 text-xs font-bold rounded border transition ${
                                      cand.absentPrograms && cand.absentPrograms.includes(program._id)
                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {cand.absentPrograms && cand.absentPrograms.includes(program._id) ? 'Marked Absent' : 'Mark Absent'}
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                  </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Programs Section */}
        {filteredPrograms.filter(p => p.status !== 'Pending').length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <button 
              onClick={() => setShowAssigned(!showAssigned)}
              className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-semibold"
            >
              <span>View Assigned/Completed Programs ({filteredPrograms.filter(p => p.status !== 'Pending').length})</span>
              <svg className={`w-5 h-5 transition-transform ${showAssigned ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAssigned && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {filteredPrograms.filter(p => p.status !== 'Pending').map(program => (
                  <div key={program._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm opacity-80 flex items-center justify-between group">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm font-bold text-slate-800 truncate" title={program.name}>{program.name}</h3>
                      <p className="text-xs text-slate-500">{program.category} • {program.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md whitespace-nowrap ${
                        program.status === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {program.status}
                      </span>
                      <button 
                        onClick={() => handleReassign(program._id)}
                        className="px-2 py-1 text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition whitespace-nowrap"
                      >
                        Re-assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
