import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../config/api.js';

export default function HomePage() {
  const [teams, setTeams] = useState([]);
  const [latestResults, setLatestResults] = useState([]);
  const [categorizedTeams, setCategorizedTeams] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [chestNoSearch, setChestNoSearch] = useState('');
  const [studentResult, setStudentResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!chestNoSearch.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setStudentResult(null);
    
    try {
      const res = await fetch(`${API_URL}/api/candidates/result/${chestNoSearch.trim()}`);
      const data = await res.json();
      
      if (res.ok) {
        setStudentResult(data);
      } else {
        setSearchError(data.message || 'Student not found');
      }
    } catch (error) {
      setSearchError('Error searching student');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, teamsRes] = await Promise.all([
          fetch(`${API_URL}/api/results/published`),
          fetch(`${API_URL}/api/teams`)
        ]);
        
        if (resultsRes.ok && teamsRes.ok) {
          const resultsData = await resultsRes.json();
          const teamsData = await teamsRes.json();
          
          const published = resultsData.reverse();
          setLatestResults(published.slice(0, 5));
          
          const overallPoints = {};
          const catPoints = {};
          
          teamsData.forEach(t => {
            overallPoints[t._id] = { ...t, totalPoints: 0, aGrades: 0, bGrades: 0, cGrades: 0 };
          });
          
          published.forEach(r => {
            const cat = r.program?.category || 'General';
            if (!catPoints[cat]) {
              catPoints[cat] = {};
              teamsData.forEach(t => {
                catPoints[cat][t._id] = { ...t, totalPoints: 0, aGrades: 0, bGrades: 0, cGrades: 0 };
              });
            }

            r.winners?.forEach(w => {
              if (w.team && w.team._id) {
                const tId = w.team._id;
                const pts = Number(w.points) || 0;
                
                if (overallPoints[tId]) {
                  overallPoints[tId].totalPoints += pts;
                  if (w.grade === 'A') overallPoints[tId].aGrades++;
                  else if (w.grade === 'B') overallPoints[tId].bGrades++;
                  else if (w.grade === 'C') overallPoints[tId].cGrades++;
                }

                if (catPoints[cat][tId]) {
                  catPoints[cat][tId].totalPoints += pts;
                  if (w.grade === 'A') catPoints[cat][tId].aGrades++;
                  else if (w.grade === 'B') catPoints[cat][tId].bGrades++;
                  else if (w.grade === 'C') catPoints[cat][tId].cGrades++;
                }
              }
            });
          });
          
          const sortedTeams = Object.values(overallPoints).sort((a, b) => b.totalPoints - a.totalPoints);
          setTeams(sortedTeams);
          
          const categorized = {};
          Object.keys(catPoints).forEach(c => {
            categorized[c] = Object.values(catPoints[c]).sort((a, b) => b.totalPoints - a.totalPoints);
          });
          setCategorizedTeams(categorized);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-200 relative font-sans selection:bg-teal-500/30">

      {/* Abstract Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl group-hover:bg-teal-500/20 transition">
              <svg className="w-7 h-7 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 leading-tight">
                Meelad Fest
              </h1>
            </div>
          </Link>
          <div className="hidden md:flex gap-6">
            <a href="#scoreboard" className="text-sm font-medium hover:text-teal-400 transition">Live Scoreboard</a>
            <a href="#portals" className="text-sm font-medium hover:text-emerald-400 transition">Login Portals</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-300 hover:text-white focus:outline-none p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-white/5 absolute w-full left-0 top-full shadow-2xl">
            <div className="flex flex-col px-6 py-5 space-y-4">
              <a href="#scoreboard" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-200 hover:text-teal-400 transition flex items-center gap-2">
                📊 Live Scoreboard
              </a>
              <div className="h-px bg-white/10 w-full my-2"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Login Portals</p>
              <Link to="/login" state={{ portal: 'Admin' }} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-blue-400 hover:text-blue-300 transition pl-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Admin Control
              </Link>
              <Link to="/login" state={{ portal: 'Team Leader' }} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-teal-400 hover:text-teal-300 transition pl-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Team Leaders
              </Link>
              <Link to="/login" state={{ portal: 'Stage Manager' }} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-amber-400 hover:text-amber-300 transition pl-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Stage Manager
              </Link>
              <Link to="/login" state={{ portal: 'Judge' }} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-purple-400 hover:text-purple-300 transition pl-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Judge Access
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 py-12 space-y-24">

        {/* Hero Section */}
        <section id="scoreboard" className="space-y-12">
          {/* Centered Hero Content */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Live Competition Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Live Competition
            </div>

            {/* Animated PNG Logo */}
            <div className="py-2 inline-flex flex-col items-center justify-center transition hover:scale-[1.02] gap-4 mb-4">
              <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center drop-shadow-[0_20px_50px_rgba(20,184,166,0.3)] animate-float">
                <img src="/ilmul_rasool_logo.png" alt="Meelad Fest Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mt-4">
                Meelad Fest
              </h1>
            </div>

            {/* Subtext */}
            <div className="space-y-2">
              <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
                Experience the pulse of Meelad Fest. Follow the live scoreboard, witness the crowning of champions, and support your favorite teams.
              </p>
            </div>
          </div>

          {/* Glassmorphic Scoreboard Preview */}
          <div className="glass-dark p-8 rounded-3xl max-w-5xl mx-auto relative grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
            
            {/* Top Teams Standings */}
            <div className="space-y-10">
              {/* Overall Teams */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  🏆 Overall Top Teams
                </h3>
                <div className="space-y-4">
                  {teams.length === 0 ? (
                    <p className="text-slate-400">Loading standings...</p>
                  ) : (
                    teams.slice(0, 3).map((team, index) => (
                      <div key={team._id} className="flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0"
                             style={{ backgroundColor: team.color || '#2dd4bf' }}>
                          #{index + 1}
                        </div>
                        <div className="ml-4 flex-1 text-left min-w-0">
                          <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition truncate">{team.name}</h4>

                        </div>
                        <div className="text-2xl font-extrabold text-teal-400 ml-4">
                          {team.totalPoints} <span className="text-sm font-medium text-slate-500">pts</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Categorized Teams */}
              {Object.keys(categorizedTeams).map(cat => {
                const catTeams = categorizedTeams[cat].slice(0, 3);
                if (catTeams.length === 0 || catTeams[0].totalPoints === 0) return null; // hide empty categories
                return (
                  <div key={cat}>
                    <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      {cat} Top Teams
                    </h3>
                    <div className="space-y-3">
                      {catTeams.map((team, index) => (
                        <div key={team._id} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0 text-sm"
                               style={{ backgroundColor: team.color || '#2dd4bf' }}>
                            #{index + 1}
                          </div>
                          <div className="ml-3 flex-1 text-left min-w-0">
                            <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition truncate">{team.name}</h4>

                          </div>
                          <div className="text-lg font-extrabold text-teal-400 ml-4">
                            {team.totalPoints} <span className="text-xs font-medium text-slate-500">pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <Link to="/score" className="block text-center w-full mt-6 py-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-medium transition border border-teal-500/20">
                View Full Scoreboard
              </Link>
              
              {/* Student Result Search */}
              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🔍 Search My Program
                </h3>
                <form onSubmit={handleStudentSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Chest No..."
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-slate-400 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={chestNoSearch}
                    onChange={(e) => setChestNoSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-medium transition disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {searchError && (
                  <p className="mt-3 text-rose-400 text-sm font-medium">{searchError}</p>
                )}

                {studentResult && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl">
                      <p className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">{studentResult.candidate.team?.name}</p>
                      <h4 className="text-lg font-bold text-white">{studentResult.candidate.name}</h4>
                      <p className="text-slate-300 text-sm">Chest No: {studentResult.candidate.chestNo} | {studentResult.candidate.category}</p>
                    </div>

                    <div className="space-y-3 mt-4">
                      <h5 className="text-white font-semibold text-sm border-b border-white/10 pb-2">Programs & Results</h5>
                      {(() => {
                        const programs = studentResult.participatingPrograms || [];
                        if (programs.length === 0) {
                          return <p className="text-slate-400 text-sm">No programs found.</p>;
                        }

                        return programs.map((prog, idx) => {
                          // Check if they won anything in this program
                          const wonResult = (studentResult.results || []).find(r => r.program?.name === prog.name);

                          return (
                            <div key={`prog-${idx}`} className="flex flex-col gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-bold text-white">{prog.name}</span>
                                  <span className="text-[10px] text-teal-400 uppercase tracking-wider">{prog.category}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {prog.isResultPublished ? (
                                    wonResult ? (
                                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300">
                                        {(() => {
                                          const posText = Number(wonResult.position) === 1 ? 'First' : 
                                                          Number(wonResult.position) === 2 ? 'Second' : 
                                                          Number(wonResult.position) === 3 ? 'Third' : 
                                                          wonResult.position ? `Pos: ${wonResult.position}` : '';
                                          const gradeText = (wonResult.grade && wonResult.grade !== 'None') ? `Grade ${wonResult.grade}` : '';
                                          const pointsText = wonResult.points ? `${wonResult.points} Pts` : '';
                                          return [posText, gradeText, pointsText].filter(Boolean).join(' | ');
                                        })()}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-500/20 text-slate-300">
                                        Participated
                                      </span>
                                    )
                                  ) : (
                                    <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-500/20 text-amber-300">
                                      Result Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Latest Published Results */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Latest Results
              </h3>
              
              <div className="space-y-4">
                {latestResults.length === 0 ? (
                  <p className="text-slate-400">No results published yet.</p>
                ) : (
                  latestResults.map(res => (
                    <div key={res._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{res.program?.name}</h4>
                          <span className="text-[10px] text-teal-400 uppercase tracking-wider">{res.program?.category}</span>
                        </div>
                        <button
                          onClick={() => {
                            const text = `Meelad Fest Result: ${res.program?.name} (${res.program?.category})\n` + 
                              res.winners.map(w => `${w.position}. ${w.name} (${w.team?.name}) - ${w.points} pts`).join('\n');
                            if (navigator.share) {
                              navigator.share({ title: `${res.program?.name} Result`, text });
                            } else {
                              navigator.clipboard.writeText(text);
                              alert('Result copied to clipboard!');
                            }
                          }}
                          className="text-slate-400 hover:text-teal-400 transition"
                          title="Share Result"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        {res.winners?.slice(0, 3).map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-4" style={{ color: w.team?.color || '#94a3b8' }}>{w.position}</span>
                              <span className="text-slate-300 truncate max-w-[120px]">{w.name}</span>
                            </div>
                            <span className="font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: `${w.team?.color}40` || '#334155' }}>
                              {w.team?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="pt-12 border-t border-white/5">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Access Portals</h2>
            <p className="text-slate-400">Secure access for organizers, team leaders, stage managers, and judges.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Admin Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-blue-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin Control</h3>
                <p className="text-slate-400 text-sm mb-6">Manage programs, students, results, and overall festival settings.</p>
              </div>
              <Link to="/login" state={{ portal: 'Admin' }} className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300">
                Go to Admin <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Team Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-teal-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Team Leaders</h3>
                <p className="text-slate-400 text-sm mb-6">Register students, view team schedules, and track individual scores.</p>
              </div>
              <Link to="/login" state={{ portal: 'Team Leader' }} className="inline-flex items-center gap-2 text-teal-400 font-medium group-hover:text-teal-300">
                Go to Team Portal <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Stage Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Stage Manager</h3>
                <p className="text-slate-400 text-sm mb-6">Control live stage proceedings, calls, and performance status.</p>
              </div>
              <Link to="/login" state={{ portal: 'Stage Manager' }} className="inline-flex items-center gap-2 text-amber-400 font-medium group-hover:text-amber-300">
                Go to Stage Portal <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            {/* Judges Portal Card */}
            <div className="glass-dark p-6 rounded-3xl hover:-translate-y-2 transition duration-300 group border-t border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Judge Access</h3>
                <p className="text-slate-400 text-sm mb-6">Secure portal for entering marks and evaluating live stage performances.</p>
              </div>
              <Link to="/login" state={{ portal: 'Judge' }} className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300">
                Go to Judging <span className="group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* Proper Footer */}
      <footer className="w-full bg-slate-900 border-t border-white/10 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-white">Meelad Fest</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Meelad Fest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
