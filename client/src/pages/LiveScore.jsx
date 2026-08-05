import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api.js';
import { socket } from '../config/socket.js';

export default function LiveScore() {
  const [results, setResults] = useState([]);
  const [teams, setTeams] = useState([]);
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
          
          // Calculate team points
          const teamPoints = {};
          teamsData.forEach(t => teamPoints[t._id] = { ...t, totalPoints: 0 });
          
          published.forEach(r => {
            r.winners.forEach(w => {
              if (w.team && w.team._id && teamPoints[w.team._id]) {
                teamPoints[w.team._id].totalPoints += (Number(w.points) || 0);
              }
            });
          });
          
          const sortedTeams = Object.values(teamPoints).sort((a, b) => b.totalPoints - a.totalPoints);
          setTeams(sortedTeams);
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
                      </div>
                    )}
                    
                    {/* Center Team 1 */}
                    {topTeam && (
                      <div className="bg-gradient-to-b from-slate-900 to-black border-2 rounded-3xl py-6 px-10 z-10 shadow-2xl flex flex-col items-center justify-center min-w-[220px]"
                           style={{ borderColor: topTeam.color || '#0d9488' }}>
                        <span className="text-xs uppercase font-bold tracking-[0.2em] mb-1" style={{ color: topTeam.color || '#2dd4bf' }}>Current Leader</span>
                        <div className="text-3xl font-black text-white tracking-wider font-mono truncate max-w-[200px] text-center">{topTeam.name}</div>
                        <div className="text-4xl font-black mt-2" style={{ color: topTeam.color || '#2dd4bf' }}>{topTeam.totalPoints} <span className="text-lg text-slate-400">pts</span></div>
                      </div>
                    )}

                    {/* Team 3 */}
                    {teams.length > 2 && (
                      <div className="rounded-full py-4 px-8 md:px-12 text-white font-black text-lg md:text-xl shadow-lg md:w-1/3 text-center border-2 z-0 md:-ml-6"
                           style={{ backgroundColor: `${teams[2].color}dd`, borderColor: `${teams[2].color}` }}>
                        <div className="text-xs uppercase tracking-widest opacity-80">3rd Place</div>
                        <div className="truncate">{teams[2].name} - {teams[2].totalPoints} pts</div>
                      </div>
                    )}
                  </div>
                </div>

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
                            <span className="text-xs font-semibold text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
                              Published
                            </span>
                          </div>
                          
                          {/* Winners Rows */}
                          <div className="divide-y divide-white/5">
                            {res.winners?.map((w, idx) => (
                              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition"
                                   style={{ borderLeft: `4px solid ${w.team?.color || '#333'}` }}>
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                       style={{ backgroundColor: `${w.team?.color}20`, color: w.team?.color || '#fff' }}>
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
                            ))}
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
