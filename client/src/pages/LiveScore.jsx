import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api.js';
import { socket } from '../config/socket.js';

export default function LiveScore() {
  const [results, setResults] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categorizedTeams, setCategorizedTeams] = useState({});
  const [loading, setLoading] = useState(true);

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
          
          const published = resultsData; // Backend already filters
          // Sort by creation date or just reverse since latest are typically at the end
          setResults(published.reverse());
          
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

            r.winners.forEach(w => {
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Auto refresh every 30 seconds as fallback
    const interval = setInterval(fetchData, 30000);

    // Real-time updates via Socket.IO
    socket.emit('join:scoreboard');
    socket.on('scoreboard:update', () => fetchData());
    socket.on('result:updated', () => fetchData());
    socket.on('result:created', () => fetchData());
    socket.on('result:deleted', () => fetchData());

    return () => {
      clearInterval(interval);
      socket.off('scoreboard:update');
      socket.off('result:updated');
      socket.off('result:created');
      socket.off('result:deleted');
    };
  }, []);

  const latestResults = results.slice(0, 5);
  const topTeam = teams.length > 0 ? teams[0] : null;
  const secondTeam = teams.length > 1 ? teams[1] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-200 relative font-sans selection:bg-teal-500/30">
      
      {/* Abstract Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-lg group-hover:bg-teal-500/20 transition">
              <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.894-15.682a8.001 8.001 0 00-4.57 11.238A8.001 8.001 0 0015.68 15.54a6.5 6.5 0 11-5.575-9.222z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Meelad Fest
              </h1>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 items-center font-medium text-sm">
            <Link to="/" className="text-slate-300 hover:text-white transition">Home</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        <section id="scoreboard" className="space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              Live Scoreboard
            </h2>
            <p className="text-lg text-slate-400">
              Real-time updates of the latest competition results.
            </p>
          </div>

          <div className="glass-dark p-6 md:p-10 rounded-3xl w-full relative overflow-hidden mt-12 border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
            
            {loading ? (
              <div className="text-center py-12 text-teal-400 animate-pulse">Loading live scores...</div>
            ) : (
              <>
                {/* Top Teams Header */}
                <div className="relative mb-16 flex flex-col md:flex-row items-center justify-center pt-4">
                  <div className="absolute inset-0 top-1/2 md:top-[60%] h-px bg-white/10 w-full -z-10" />
                  
                  <div className="flex flex-col md:flex-row items-center w-full justify-center gap-4 md:gap-0 drop-shadow-2xl">
                    {/* Team 2 */}
                    {secondTeam && (
                      <div className="rounded-full py-4 px-8 md:px-12 text-white font-black text-lg md:text-xl shadow-lg md:w-1/3 text-center border-2 z-0 md:-mr-6"
                           style={{ backgroundColor: `${secondTeam.color}dd`, borderColor: `${secondTeam.color}` }}>
                        <div className="text-xs uppercase tracking-widest opacity-80">2nd Place</div>
                        <div className="truncate">{secondTeam.name} - {secondTeam.totalPoints} pts</div>
                        <div className="text-xs font-semibold opacity-90 mt-1 flex justify-center gap-2">
                          <span>A:{secondTeam.aGrades}</span>
                          <span>B:{secondTeam.bGrades}</span>
                          <span>C:{secondTeam.cGrades}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Center Team 1 */}
                    {topTeam && (
                      <div className="bg-gradient-to-b from-slate-900 to-black border-2 rounded-3xl py-6 px-10 z-10 shadow-2xl flex flex-col items-center justify-center min-w-[220px]"
                           style={{ borderColor: topTeam.color || '#0d9488' }}>
                        <span className="text-xs uppercase font-bold tracking-[0.2em] mb-1" style={{ color: topTeam.color || '#2dd4bf' }}>Current Leader</span>
                        <div className="text-3xl font-black text-white tracking-wider font-mono truncate max-w-[200px] text-center">{topTeam.name}</div>
                        <div className="text-4xl font-black mt-2" style={{ color: topTeam.color || '#2dd4bf' }}>{topTeam.totalPoints} <span className="text-lg text-slate-400">pts</span></div>
                        <div className="text-xs font-semibold text-slate-300 mt-3 flex justify-center gap-3">
                          <span className="text-emerald-400">A:{topTeam.aGrades}</span>
                          <span className="text-blue-400">B:{topTeam.bGrades}</span>
                          <span className="text-amber-400">C:{topTeam.cGrades}</span>
                        </div>
                      </div>
                    )}

                    {/* Team 3 */}
                    {teams.length > 2 && (
                      <div className="rounded-full py-4 px-8 md:px-12 text-white font-black text-lg md:text-xl shadow-lg md:w-1/3 text-center border-2 z-0 md:-ml-6"
                           style={{ backgroundColor: `${teams[2].color}dd`, borderColor: `${teams[2].color}` }}>
                        <div className="text-xs uppercase tracking-widest opacity-80">3rd Place</div>
                        <div className="truncate">{teams[2].name} - {teams[2].totalPoints} pts</div>
                        <div className="text-xs font-semibold opacity-90 mt-1 flex justify-center gap-2">
                          <span>A:{teams[2].aGrades}</span>
                          <span>B:{teams[2].bGrades}</span>
                          <span>C:{teams[2].cGrades}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categorized Teams Standings */}
                {Object.keys(categorizedTeams).length > 0 && (
                  <div className="mt-8 mb-16 space-y-10">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                      🏆 Category Standings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.keys(categorizedTeams).map(cat => {
                        const catTeams = categorizedTeams[cat].slice(0, 3);
                        if (catTeams.length === 0 || catTeams[0].totalPoints === 0) return null;
                        return (
                          <div key={cat} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h4 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-400" />
                              {cat} Top Teams
                            </h4>
                            <div className="space-y-4">
                              {catTeams.map((team, index) => (
                                <div key={team._id} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0 text-sm"
                                         style={{ backgroundColor: team.color || '#2dd4bf' }}>
                                      #{index + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-base font-bold text-white truncate group-hover:text-teal-300 transition">{team.name}</div>
                                      <div className="flex gap-1.5 text-[10px] font-semibold mt-0.5">
                                        <span className="text-emerald-400 bg-emerald-400/10 px-1 rounded">A:{team.aGrades}</span>
                                        <span className="text-blue-400 bg-blue-400/10 px-1 rounded">B:{team.bGrades}</span>
                                        <span className="text-amber-400 bg-amber-400/10 px-1 rounded">C:{team.cGrades}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-lg font-extrabold text-teal-400 shrink-0 ml-3">
                                    {team.totalPoints} <span className="text-xs font-medium text-slate-500">pts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Latest Published Results - Single Column */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    Latest Results
                  </h3>

                  <div className="space-y-6">
                    {latestResults.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">No results published yet.</p>
                    ) : (
                      latestResults.map(res => (
                        <div key={res._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                          {/* Program Title Header */}
                          <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <div>
                              <h4 className="text-lg font-bold text-white">{res.program?.name}</h4>
                              <p className="text-sm text-slate-400">{res.program?.category} • {res.program?.type}</p>
                            </div>
                            <div className="flex items-center gap-3">
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
                                className="text-slate-400 hover:text-teal-400 transition p-2 rounded-full hover:bg-white/5"
                                title="Share Result"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                              </button>
                              <span className="text-xs font-semibold text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full uppercase tracking-wider hidden sm:block">
                                Published
                              </span>
                            </div>
                          </div>
                          
                          {/* Winners Rows */}
                          <div className="divide-y divide-white/5">
                            {res.winners?.map((w, idx) => {
                              const getPosColor = (pos) => {
                                if (pos === 1) return { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' }; // Green
                                if (pos === 2) return { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa' }; // Blue
                                if (pos === 3) return { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' }; // Red
                                return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' }; // Default Slate
                              };
                              const posStyle = getPosColor(w.position);
                              
                              return (
                              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition"
                                   style={{ borderLeft: `4px solid ${posStyle.text}` }}>
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                       style={{ backgroundColor: posStyle.bg, color: posStyle.text }}>
                                    {w.position}
                                  </div>
                                  <div>
                                    <p className="text-base font-bold text-slate-200">{w.name} <span className="text-slate-500 text-sm font-normal">({w.chestNo})</span></p>
                                    <p className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: w.team?.color || '#aaa' }}>
                                      {w.team?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-white">{w.points} pts</div>
                                  {w.grade && <div className="text-xs font-semibold text-emerald-400">Grade {w.grade}</div>}
                                </div>
                              </div>
                            )})}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
