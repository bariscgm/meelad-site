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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, progRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/programs`)
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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
             <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition">
               Generate Schedule
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
