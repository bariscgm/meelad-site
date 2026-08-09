import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config/api.js';

export default function ScheduleManagement() {
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState('2026-08-09');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:30');
  const [genderFilter, setGenderFilter] = useState('Boys only');
  const [stageQuantity, setStageQuantity] = useState('2 stages');
  const [simultaneous, setSimultaneous] = useState('1 programme');
  const [programmeType, setProgrammeType] = useState('Stage + Off-stage');
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]); // IDs of selected programs

  const [candidates, setCandidates] = useState([]);
  const [scheduleReport, setScheduleReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, progRes, candRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/programs`),
        fetch(`${API_URL}/api/candidates`)
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.map(c => c.name));
        setSelectedCategories(catData.map(c => c.name)); // Select all by default
      }
      
      if (progRes.ok) {
        const progData = await progRes.json();
        setPrograms(progData);
      }
      
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    
    // Parse time
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let totalMinutesAvailable = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutesAvailable < 0) totalMinutesAvailable += 24 * 60; // handle crossing midnight if any
    
    const stages = parseInt(stageQuantity) || 1;
    const sim = parseInt(simultaneous) || 1;
    const totalCapacity = totalMinutesAvailable * stages * sim;
    
    let totalRequired = 0;
    const breakdown = [];
    
    const selectedProgramDetails = programs.filter(p => selectedPrograms.includes(p._id));
    
    selectedProgramDetails.forEach(p => {
      // Find candidates for this program (case-insensitive, trimmed)
      const progName = p.name.trim().toLowerCase();
      const count = candidates.filter(c => 
        c.programs && c.programs.some(cp => typeof cp === 'string' && cp.trim().toLowerCase() === progName)
      ).length;
      
      const durMatch = (p.duration || '5').toString().match(/\d+/);
      const duration = durMatch ? parseInt(durMatch[0]) : 5;
      
      let timeNeeded = 0;
      
      if (p.venueType === 'OFF-STAGE') {
        // All participants perform simultaneously
        timeNeeded = count > 0 ? duration : 0;
      } else if (p.type === 'Group') {
        // 3 people per group, each group takes `duration` time
        timeNeeded = Math.ceil(count / 3) * duration;
      } else {
        // Individual stage items
        timeNeeded = count * duration;
      }
      
      totalRequired += timeNeeded;
      
      breakdown.push({
        id: p._id,
        name: p.name,
        category: p.category,
        studentCount: count,
        durationPerStudent: duration,
        timeNeeded
      });
    });
    
    setScheduleReport({
      totalMinutesAvailable,
      stages,
      simultaneous: sim,
      totalCapacity,
      totalRequired,
      isFeasible: totalRequired <= totalCapacity,
      breakdown
    });
    
    setIsGenerating(false);
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const selectAllCategories = () => setSelectedCategories(categories);
  const clearCategories = () => setSelectedCategories([]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }
      
      // Gender filter
      if (genderFilter !== 'All') {
        const fGender = genderFilter.toLowerCase();
        const pGender = (p.gender || '').toLowerCase();
        if (fGender === 'boys only' && pGender !== 'boy' && pGender !== 'male') return false;
        if (fGender === 'girls only' && pGender !== 'girl' && pGender !== 'female') return false;
        if (fGender === 'general' && pGender !== 'general' && pGender !== 'common') return false;
        if (fGender === 'common' && pGender !== 'common' && pGender !== 'general') return false;
      }

      // Programme Type filter
      if (programmeType !== 'Stage + Off-stage') {
        const pType = (p.venueType || '').toLowerCase();
        if (programmeType === 'Stage' && pType !== 'stage') return false;
        if (programmeType === 'Off-stage' && pType !== 'off-stage') return false;
      }

      return true;
    });
  }, [programs, selectedCategories, genderFilter, programmeType]);

  // Sync selected programs when filter changes
  useEffect(() => {
    setSelectedPrograms(filteredPrograms.map(p => p._id));
  }, [filteredPrograms]);

  const toggleProgram = (id) => {
    setSelectedPrograms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="glass p-6 md:p-8 rounded-3xl relative">
          <div className="absolute top-6 right-8 text-slate-700">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 14v4m-2-2h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Programme scheduler</h1>
            <p className="text-slate-500 mt-1">Build sequential and parallel programme plans.</p>
          </div>

          {/* Form Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700"
                />
              </div>
            </div>
            
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Start time</label>
              <div className="relative">
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">End time</label>
              <div className="relative">
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Who will compete?</label>
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700 appearance-none"
              >
                <option value="Boys only">Boys only</option>
                <option value="Girls only">Girls only</option>
                <option value="Common">Common</option>
                <option value="General">General</option>
                <option value="All">All</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Stage quantity</label>
              <select 
                value={stageQuantity}
                onChange={(e) => setStageQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700 appearance-none"
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={`${n} stages`}>{n} {n === 1 ? 'stage' : 'stages'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Simultaneous per stage</label>
              <select 
                value={simultaneous}
                onChange={(e) => setSimultaneous(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700 appearance-none"
              >
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={`${n} programme`}>{n} programme</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500">Programme type</label>
              <select 
                value={programmeType}
                onChange={(e) => setProgrammeType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700 appearance-none"
              >
                <option value="Stage + Off-stage">Stage + Off-stage</option>
                <option value="Stage">Stage</option>
                <option value="Off-stage">Off-stage</option>
              </select>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 text-left">Select categories</h3>
                <p className="text-xs text-slate-500 text-left">You can select one or multiple categories.</p>
              </div>
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg mr-2">
                  {selectedCategories.length} selected
                </span>
                <button onClick={selectAllCategories} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition shadow-sm">
                  Select all
                </button>
                <button onClick={clearCategories} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition shadow-sm">
                  Clear
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{cat}</span>
                      {isSelected ? (
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Preview Section */}
        <div className="glass p-6 md:p-8 rounded-3xl relative">
          <div className="absolute top-6 right-8 text-slate-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-800">Schedule preview</h2>
            <p className="text-slate-500 mt-1 text-sm">Select the programmes you want to include.</p>
          </div>

          <div className="mt-8 text-left">
            {loading ? (
              <div className="text-slate-500 text-center py-10">Loading programmes...</div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-slate-500 text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                No programmes found matching the filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPrograms.map(p => {
                  const isSelected = selectedPrograms.includes(p._id);
                  return (
                    <div 
                      key={p._id}
                      onClick={() => toggleProgram(p._id)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        isSelected 
                          ? 'border-indigo-200 bg-white shadow-sm' 
                          : 'border-slate-200 bg-slate-50/50 opacity-70 hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                          <span>{p.category}</span>
                          <span className="text-slate-300">|</span>
                          <span>{p.gender || 'General'}</span>
                          <span className="text-slate-300">|</span>
                          <span>{p.duration || '5'} min</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
             <button 
               onClick={generateSchedule}
               disabled={isGenerating || selectedPrograms.length === 0}
               className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition"
             >
               {isGenerating ? 'Generating...' : 'Generate Schedule'}
             </button>
          </div>
        </div>

        {/* Schedule Report Section */}
        {scheduleReport && (
          <div className="glass p-6 md:p-8 rounded-3xl relative animate-fade-in">
             <div className="absolute top-6 right-8 text-slate-700">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
             </div>
             
             <h2 className="text-2xl font-bold text-slate-800">Generation Report</h2>
             
             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-center">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Available Capacity</h3>
                   <div className="flex items-end gap-2">
                     <span className="text-4xl font-black text-slate-800">{scheduleReport.totalCapacity}</span>
                     <span className="text-slate-500 mb-1 font-medium">minutes</span>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">
                     ({scheduleReport.totalMinutesAvailable} mins × {scheduleReport.stages} stages × {scheduleReport.simultaneous} prog/stage)
                   </p>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-center shadow-sm ${scheduleReport.isFeasible ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                   <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${scheduleReport.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>Required Time</h3>
                   <div className="flex items-end gap-2">
                     <span className={`text-4xl font-black ${scheduleReport.isFeasible ? 'text-emerald-700' : 'text-rose-700'}`}>{scheduleReport.totalRequired}</span>
                     <span className={`mb-1 font-medium ${scheduleReport.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>minutes</span>
                   </div>
                   <p className={`text-xs font-semibold mt-2 flex items-center gap-1.5 ${scheduleReport.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {scheduleReport.isFeasible ? (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                         Schedule is feasible within timeframe
                       </>
                     ) : (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                         Timeframe exceeded by {scheduleReport.totalRequired - scheduleReport.totalCapacity} mins
                       </>
                     )}
                   </p>
                </div>
             </div>

             <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                       <tr>
                         <th className="px-6 py-4">Programme</th>
                         <th className="px-6 py-4">Category</th>
                         <th className="px-6 py-4 text-center">Students</th>
                         <th className="px-6 py-4 text-center">Duration</th>
                         <th className="px-6 py-4 text-right">Total Time</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {scheduleReport.breakdown.length > 0 ? (
                         scheduleReport.breakdown.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50/50 transition">
                             <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                             <td className="px-6 py-4">{item.category}</td>
                             <td className="px-6 py-4 text-center font-medium">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{item.studentCount}</span>
                             </td>
                             <td className="px-6 py-4 text-center">{item.durationPerStudent} min</td>
                             <td className="px-6 py-4 text-right font-bold text-indigo-600">{item.timeNeeded} min</td>
                           </tr>
                         ))
                       ) : (
                         <tr><td colSpan="5" className="text-center py-8 text-slate-400">No programs selected</td></tr>
                       )}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
