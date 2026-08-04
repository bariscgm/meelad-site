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
  const [winners, setWinners] = useState([
    { position: 1, chestNo: '', name: '', team: '', points: 0, grade: '' },
    { position: 2, chestNo: '', name: '', team: '', points: 0, grade: '' },
    { position: 3, chestNo: '', name: '', team: '', points: 0, grade: '' },
    { position: 4, chestNo: '', name: '', team: '', points: 0, grade: '' },
    { position: 5, chestNo: '', name: '', team: '', points: 0, grade: '' }
  ]);

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
          p.assignedJudges?.some(j => (j._id || j) === user._id)
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

  const handleOpenScoring = (program) => {
    setSelectedProgram(program);
    setWinners([
      { position: 1, chestNo: '', name: '', team: '', points: 0, grade: '' },
      { position: 2, chestNo: '', name: '', team: '', points: 0, grade: '' },
      { position: 3, chestNo: '', name: '', team: '', points: 0, grade: '' },
      { position: 4, chestNo: '', name: '', team: '', points: 0, grade: '' },
      { position: 5, chestNo: '', name: '', team: '', points: 0, grade: '' }
    ]);
    setShowScoringModal(true);
  };

  const handleWinnerChange = (index, field, value) => {
    const newWinners = [...winners];
    newWinners[index][field] = value;
    setWinners(newWinners);
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    
    // Filter out rows that are completely empty
    const validWinners = winners.filter(w => w.team && (w.chestNo || w.name));
    
    if (validWinners.length === 0) {
      Swal.fire('Error', 'Please fill in at least one winner', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: selectedProgram._id,
          judge: user._id,
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
              <img src="/ilmul_rasool_logo.png" alt="Ilmul Rasool Logo" className="w-14 h-14 object-contain bg-purple-100 p-2 rounded-2xl border border-purple-200" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex flex-col items-start gap-1">
                <span dir="rtl" className="text-purple-600">إلى الرسول</span>
                <span>Judge Portal</span>
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
                        program.status === 'Finished' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="p-3 text-sm font-semibold text-slate-700">Position</th>
                      <th className="p-3 text-sm font-semibold text-slate-700">Chest No</th>
                      <th className="p-3 text-sm font-semibold text-slate-700">Candidate Name</th>
                      <th className="p-3 text-sm font-semibold text-slate-700">Team</th>
                      <th className="p-3 text-sm font-semibold text-slate-700 w-24">Points</th>
                      <th className="p-3 text-sm font-semibold text-slate-700 w-32">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {winners.map((winner, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-700">{winner.position}{['st','nd','rd','th','th'][index]}</td>
                        <td className="p-3">
                          <input type="text" value={winner.chestNo} onChange={(e) => handleWinnerChange(index, 'chestNo', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g. 101" />
                        </td>
                        <td className="p-3">
                          <input type="text" value={winner.name} onChange={(e) => handleWinnerChange(index, 'name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Candidate name" />
                        </td>
                        <td className="p-3">
                          <select value={winner.team} onChange={(e) => handleWinnerChange(index, 'team', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="">Select Team</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <input type="number" value={winner.points} onChange={(e) => handleWinnerChange(index, 'points', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500" min="0" />
                        </td>
                        <td className="p-3">
                          <select value={winner.grade} onChange={(e) => handleWinnerChange(index, 'grade', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="">None</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
