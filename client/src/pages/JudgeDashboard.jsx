import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function JudgeDashboard() {
  const [programs, setPrograms] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [programCandidates, setProgramCandidates] = useState([]);
  const [candidateScores, setCandidateScores] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [programsRes, teamsRes] = await Promise.all([
        fetch(`${API_URL}/api/programs`),
        fetch(`${API_URL}/api/teams`)
      ]);

      if (programsRes.ok && teamsRes.ok) {
        const programsData = await programsRes.json();
        const teamsData = await teamsRes.json();
        
        // Filter programs assigned to this judge
        const assigned = programsData.filter(p => 
          p.assignedJudges?.some(j => (j._id || j) === (user.id || user._id))
        );
        
        setPrograms(assigned);
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScoring = async (program) => {
    setSelectedProgram(program);
    setProgramCandidates([]);
    setCandidateScores({});
    setShowScoringModal(true);
    setLoadingCandidates(true);
    
    try {
      const res = await fetch(`${API_URL}/api/programs/${program._id}/candidates`);
      if (res.ok) {
        const data = await res.json();
        setProgramCandidates(data);
        const initialScores = {};
        data.forEach(c => {
          initialScores[c._id] = { position: '', grade: '' };
        });
        setCandidateScores(initialScores);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleScoreChange = (candidateId, field, value) => {
    setCandidateScores(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value
      }
    }));
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    
    // Filter out candidates that have a position or grade
    const validWinners = [];
    for (const cand of programCandidates) {
      const score = candidateScores[cand._id];
      if (score && (score.position || score.grade)) {
        validWinners.push({
          position: score.position ? parseInt(score.position) : null,
          chestNo: cand.programCodes?.[selectedProgram._id] || 'N/A',
          name: cand.name,
          team: cand.team?._id || cand.team,
          points: 0, // points can be calculated later by controller
          grade: score.grade || ''
        });
      }
    }
    
    if (validWinners.length === 0) {
      Swal.fire('Error', 'Please assign at least one position or grade', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: selectedProgram._id,
          judge: user.id || user._id,
          winners: validWinners,
        })
      });

      if (res.ok) {
        Swal.fire('Success', 'Scores submitted successfully! Awaiting controller publication.', 'success');
        setShowScoringModal(false);
        fetchData(); // Refresh to show program as Finished
      } else {
        const data = await res.json();
        Swal.fire('Error', data.message || 'Failed to submit score', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to connect to server', 'error');
    }
  };

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
                <span className="text-xl">Judge Portal</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Welcome, {user.name} - View assigned programs and submit scores.</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-100 transition">
            ← Back to Home
          </Link>
        </div>

        {/* Assigned Programs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Your Assigned Programs</h2>
          
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading programs...</p>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
              You haven't been assigned to any programs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map(program => (
                <div key={program._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800">{program.name}</h3>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        program.status === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 
                        program.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {program.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{program.category} • {program.gender} • {program.type}</p>
                    {program.class && <p className="text-xs font-semibold text-purple-600 mt-1">Class: {program.class}</p>}
                  </div>
                  
                  {program.status !== 'Finished' ? (
                    <button 
                      onClick={() => handleOpenScoring(program)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
                    >
                      Score Program
                    </button>
                  ) : (
                    <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-medium rounded-xl cursor-not-allowed">
                      Score Submitted
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Scoring Modal */}
      {showScoringModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Submit Scores</h2>
                <p className="text-sm text-slate-500">{selectedProgram?.name} ({selectedProgram?.category})</p>
              </div>
              <button onClick={() => setShowScoringModal(false)} className="text-slate-400 hover:text-rose-500 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitScore} className="space-y-6">
              <div className="overflow-x-auto">
                {loadingCandidates ? (
                  <p className="text-center py-8 text-slate-500">Loading candidates...</p>
                ) : programCandidates.length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No candidates found for this program.</p>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="p-3 text-sm font-semibold text-slate-700 w-1/3">Code Letter</th>
                        <th className="p-3 text-sm font-semibold text-slate-700 w-1/3">Position</th>
                        <th className="p-3 text-sm font-semibold text-slate-700 w-1/3">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {programCandidates.map((cand) => {
                        const score = candidateScores[cand._id] || { position: '', grade: '' };
                        const code = cand.programCodes?.[selectedProgram._id];
                        return (
                          <tr key={cand._id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-700">
                              {code ? (
                                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-lg">{code}</span>
                              ) : (
                                <span className="text-xs text-slate-400">Not assigned</span>
                              )}
                            </td>
                            <td className="p-3">
                              <select 
                                value={score.position} 
                                onChange={(e) => handleScoreChange(cand._id, 'position', e.target.value)} 
                                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">None</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <select 
                                value={score.grade} 
                                onChange={(e) => handleScoreChange(cand._id, 'grade', e.target.value)} 
                                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">None</option>
                                <option value="A">A Grade</option>
                                <option value="B">B Grade</option>
                                <option value="C">C Grade</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowScoringModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition">
                  Submit Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
