import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config/api.js';
import Swal from 'sweetalert2';

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
  const [customCounts, setCustomCounts] = useState({}); // Custom student counts for selected programs
  const [programStageAssigns, setProgramStageAssigns] = useState({}); // Custom stage assignments

  const [candidates, setCandidates] = useState([]);
  const [actualSchedule, setActualSchedule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportProgram, setSelectedReportProgram] = useState(null);
  const [savedSchedules, setSavedSchedules] = useState([]);

  const formatMinutes = (totalMins) => {
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    fetchData();
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/schedules`);
      if (res.ok) {
        const data = await res.json();
        setSavedSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

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

  const availabilityStats = useMemo(() => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let totalMinutesAvailable = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutesAvailable < 0) totalMinutesAvailable += 24 * 60; // handle crossing midnight if any
    
    const stages = parseInt(stageQuantity) || 1;
    const sim = parseInt(simultaneous) || 1;
    const totalCapacity = totalMinutesAvailable * stages * sim;
    
    return { totalMinutesAvailable, stages, sim, totalCapacity };
  }, [startTime, endTime, stageQuantity, simultaneous]);

  const selectedProgramDetails = useMemo(() => {
    let totalRequired = 0;
    const details = [];
    
    const selectedProgramInfos = programs.filter(p => selectedPrograms.includes(p._id));
    
    selectedProgramInfos.forEach(p => {
      // Find candidates for this program (case-insensitive, trimmed)
      const progName = p.name.trim().toLowerCase();
      const eligibleCandidates = candidates.filter(c => {
        const pCat = p.category ? p.category.toLowerCase() : '';
        if (pCat !== 'general' && pCat !== 'common' && pCat !== 'all' && c.category !== p.category) {
          return false;
        }
        if (genderFilter !== 'All') {
          const fGender = genderFilter.toLowerCase();
          const cGender = (c.gender || '').toLowerCase();
          if (fGender === 'boys only' && cGender !== 'boy' && cGender !== 'male') return false;
          if (fGender === 'girls only' && cGender !== 'girl' && cGender !== 'female') return false;
        }
        return c.programs && c.programs.some(cp => typeof cp === 'string' && cp.trim().toLowerCase() === progName);
      });

      let originalCount = 0;
      if (p.type === 'Group') {
        const uniqueGroups = new Set();
        eligibleCandidates.forEach(c => {
          let assignedGroup = null;
          if (c.groupAssignments) {
            for (const key in c.groupAssignments) {
              if (key.trim().toLowerCase() === progName) {
                assignedGroup = c.groupAssignments[key];
                break;
              }
            }
          }
          if (assignedGroup) {
            const teamId = c.team?._id || c.team?.id || c.team || 'unknown';
            uniqueGroups.add(`${teamId}_${assignedGroup}`);
          }
        });
        originalCount = uniqueGroups.size;
      } else {
        originalCount = eligibleCandidates.length;
      }
      
      const count = customCounts[p._id] !== undefined ? customCounts[p._id] : originalCount;

      const durMatch = (p.duration || '5').toString().match(/\d+/);
      const duration = durMatch ? parseInt(durMatch[0]) : 5;
      
      let timeNeeded = 0;
      if (p.venueType === 'OFF-STAGE') {
        timeNeeded = count > 0 ? duration : 0;
      } else {
        timeNeeded = count * duration;
      }
      
      totalRequired += timeNeeded;
      
      details.push({
        id: p._id,
        name: p.name,
        category: p.category,
        studentCount: count,
        durationPerStudent: duration,
        timeNeeded,
        venueType: p.venueType,
        type: p.type
      });
    });
    
    return { 
      details, 
      totalRequired,
      isFeasible: totalRequired <= availabilityStats.totalCapacity
    };
  }, [selectedPrograms, programs, candidates, genderFilter, customCounts, availabilityStats]);

  const handleManualCountChange = (id, newCount) => {
    if (isNaN(newCount) || newCount < 0) return;
    setCustomCounts(prev => ({ ...prev, [id]: newCount }));
    // Clear generated schedule if counts change
    setActualSchedule(null);
  };

  const handleMoveItem = (stageIndex, itemIndex, direction) => {
    const newSchedule = [...actualSchedule];
    const stage = { ...newSchedule[stageIndex] };
    const items = [...stage.items];
    
    if (direction === 'up' && itemIndex > 0) {
      const temp = items[itemIndex];
      items[itemIndex] = items[itemIndex - 1];
      items[itemIndex - 1] = temp;
    } else if (direction === 'down' && itemIndex < items.length - 1) {
      const temp = items[itemIndex];
      items[itemIndex] = items[itemIndex + 1];
      items[itemIndex + 1] = temp;
    } else {
      return;
    }
    
    const [startH, startM] = startTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    
    const updatedItems = items.map(item => {
      const startMin = currentMinutes;
      const endMin = startMin + item.timeNeeded;
      currentMinutes = endMin;
      return {
        ...item,
        startTimeFormatted: formatMinutes(startMin),
        endTimeFormatted: formatMinutes(endMin)
      };
    });
    
    stage.items = updatedItems;
    stage.currentMinutes = currentMinutes;
    newSchedule[stageIndex] = stage;
    setActualSchedule(newSchedule);
  };

  const handleAddBreak = async (stageIndex) => {
    const { value: formValues } = await Swal.fire({
      title: 'Add Break',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Break Name (e.g. Lunch Break)">' +
        '<input id="swal-input2" type="number" class="swal2-input" placeholder="Duration in minutes (e.g. 30)">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const duration = parseInt(document.getElementById('swal-input2').value);
        if (!name || !duration || isNaN(duration)) {
          Swal.showValidationMessage('Please enter both name and valid duration');
          return null;
        }
        return { name, duration };
      }
    });

    if (formValues) {
      const newSchedule = [...actualSchedule];
      const stage = { ...newSchedule[stageIndex] };
      const items = [...stage.items];
      
      items.push({
        id: `break_${Date.now()}`,
        name: formValues.name,
        category: 'BREAK',
        studentCount: '-',
        durationPerStudent: formValues.duration,
        timeNeeded: formValues.duration,
        venueType: 'ALL',
        type: 'Break',
        isBreak: true
      });
      
      const [startH, startM] = startTime.split(':').map(Number);
      let currentMinutes = startH * 60 + startM;
      
      const updatedItems = items.map(item => {
        const startMin = currentMinutes;
        const endMin = startMin + item.timeNeeded;
        currentMinutes = endMin;
        return {
          ...item,
          startTimeFormatted: formatMinutes(startMin),
          endTimeFormatted: formatMinutes(endMin)
        };
      });
      
      stage.items = updatedItems;
      stage.currentMinutes = currentMinutes;
      newSchedule[stageIndex] = stage;
      setActualSchedule(newSchedule);
    }
  };

  const handleRemoveBreak = (stageIndex, itemIndex) => {
    const newSchedule = [...actualSchedule];
    const stage = { ...newSchedule[stageIndex] };
    const items = [...stage.items];
    
    items.splice(itemIndex, 1);
    
    const [startH, startM] = startTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    
    const updatedItems = items.map(item => {
      const startMin = currentMinutes;
      const endMin = startMin + item.timeNeeded;
      currentMinutes = endMin;
      return {
        ...item,
        startTimeFormatted: formatMinutes(startMin),
        endTimeFormatted: formatMinutes(endMin)
      };
    });
    
    stage.items = updatedItems;
    stage.currentMinutes = currentMinutes;
    newSchedule[stageIndex] = stage;
    setActualSchedule(newSchedule);
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    
    const [startH, startM] = startTime.split(':').map(Number);
    const { stages } = availabilityStats;
    const { details } = selectedProgramDetails;
    
    const stageSchedules = Array.from({ length: stages }, (_, i) => ({
      stageName: `Stage ${i + 1}`,
      items: [],
      currentMinutes: startH * 60 + startM
    }));

    const sortedBreakdown = [...details].filter(b => b.timeNeeded > 0).sort((a, b) => b.timeNeeded - a.timeNeeded);
    
    sortedBreakdown.forEach(item => {
      const assigned = programStageAssigns[item.id];
      let earliestStage;
      
      if (assigned && assigned !== 'Auto' && parseInt(assigned) <= stages) {
        earliestStage = stageSchedules[parseInt(assigned) - 1];
      } else {
        earliestStage = stageSchedules[0];
        for (let i = 1; i < stageSchedules.length; i++) {
          if (stageSchedules[i].currentMinutes < earliestStage.currentMinutes) {
            earliestStage = stageSchedules[i];
          }
        }
      }
      
      const startMin = earliestStage.currentMinutes;
      const endMin = startMin + item.timeNeeded;
      
      earliestStage.items.push({
        ...item,
        startTimeFormatted: formatMinutes(startMin),
        endTimeFormatted: formatMinutes(endMin)
      });
      
      earliestStage.currentMinutes = endMin;
    });

    setActualSchedule(stageSchedules);
    setIsGenerating(false);
  };


  const handleSaveSchedule = async () => {
    if (!actualSchedule || actualSchedule.length === 0) return;

    const { value: scheduleName } = await Swal.fire({
      title: 'Save Schedule',
      input: 'text',
      inputLabel: 'Enter a name for this schedule (e.g. Day 1 - Boys Main)',
      inputPlaceholder: 'Schedule Name',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write a name!';
        }
      }
    });

    if (scheduleName) {
      try {
        const res = await fetch(`${API_URL}/api/schedules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: scheduleName,
            stages: actualSchedule,
            report: {
              ...availabilityStats,
              breakdown: selectedProgramDetails.details,
              totalRequired: selectedProgramDetails.totalRequired,
              isFeasible: selectedProgramDetails.isFeasible
            }
          })
        });

        if (res.ok) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          Toast.fire({
            icon: 'success',
            title: 'Schedule saved successfully'
          });
          fetchSchedules(); // Refresh the list
        } else {
          const err = await res.json();
          Swal.fire('Error', err.message || 'Failed to save schedule', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Network error while saving schedule', 'error');
      }
    }
  };

  const handlePrint = (schedule) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Error', 'Popup blocked. Please allow popups to print.', 'error');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Schedule - ${schedule.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #334155; }
          @media print {
            body { background-color: white; }
            .no-print { display: none !important; }
            .print-break-avoid { page-break-inside: avoid; }
            .glass { border: none !important; box-shadow: none !important; background: transparent !important; }
            th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
            .break-row { background-color: #fff7ed !important; -webkit-print-color-adjust: exact; }
          }
          .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        </style>
      </head>
      <body class="p-4 md:p-8 custom-scrollbar">
        <div class="max-w-5xl mx-auto space-y-8">
          <div class="no-print flex justify-end mb-4">
            <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print Schedule
            </button>
          </div>

          <div class="glass p-8 rounded-3xl text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h1 class="text-3xl font-black text-slate-800 uppercase tracking-widest">${schedule.name}</h1>
            <p class="text-slate-500 mt-2 font-medium">
              Generated on: ${new Date(schedule.createdAt).toLocaleDateString()} at ${new Date(schedule.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <div class="space-y-8">
            ${schedule.stages.map(stage => `
              <div class="glass rounded-3xl overflow-hidden print-break-avoid border border-slate-200">
                <div class="bg-indigo-50/80 px-6 py-4 border-b border-indigo-100/50">
                  <h3 class="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    ${stage.stageName}
                  </h3>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm border-collapse">
                    <thead class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                        <th class="px-6 py-4 w-48">Time</th>
                        <th class="px-6 py-4">Programme</th>
                        <th class="px-6 py-4">Category</th>
                        <th class="px-6 py-4 text-center">Students</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100/80">
                      ${stage.items.length > 0 ? stage.items.map(item => `
                        <tr class="hover:bg-slate-50/50 transition ${item.isBreak ? 'bg-orange-50/40 break-row' : ''}">
                          <td class="px-6 py-4 font-bold ${item.isBreak ? 'text-orange-600' : 'text-slate-600'} whitespace-nowrap">
                            ${item.startTimeFormatted} <span class="text-slate-300 font-normal mx-1">to</span> ${item.endTimeFormatted}
                          </td>
                          <td class="px-6 py-4">
                            <div class="font-bold ${item.isBreak ? 'text-orange-700 text-base' : 'text-slate-800'}">${item.name} ${item.isBreak ? '☕' : ''}</div>
                          </td>
                          <td class="px-6 py-4">
                            ${item.category ? `<span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.isBreak ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}">${item.category}</span>` : '-'}
                          </td>
                          <td class="px-6 py-4 text-center font-medium ${item.isBreak ? 'text-orange-400' : 'text-slate-500'}">
                            ${item.isBreak ? '-' : item.studentCount + ' students'}
                          </td>
                        </tr>
                      `).join('') : '<tr><td colspan="4" class="text-center py-8 text-slate-400">No programs scheduled</td></tr>'}
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
      if (!selectedCategories.includes(p.category)) {
        return false;
      }
      
      // Gender filter
      if (genderFilter !== 'All') {
        const fGender = genderFilter.toLowerCase();
        const pGender = (p.gender || '').toLowerCase();
        if (fGender === 'boys only' && !['boy', 'male', 'general', 'common'].includes(pGender)) return false;
        if (fGender === 'girls only' && !['girl', 'female', 'general', 'common'].includes(pGender)) return false;
        if (fGender === 'general' && !['general', 'common'].includes(pGender)) return false;
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

  // Cascading logic for Gender and Programme Type dropdowns
  const dynamicGenders = useMemo(() => {
    const genders = new Set(programs.filter(p => {
      if (!selectedCategories.includes(p.category)) return false;
      if (programmeType !== 'Stage + Off-stage') {
        const pType = (p.venueType || '').toLowerCase();
        if (programmeType === 'Stage' && pType !== 'stage') return false;
        if (programmeType === 'Off-stage' && pType !== 'off-stage') return false;
      }
      return true;
    }).map(p => {
      const g = (p.gender || '').toLowerCase();
      if (g === 'boy' || g === 'male') return 'Boys only';
      if (g === 'girl' || g === 'female') return 'Girls only';
      if (g === 'general' || g === 'common') return 'General';
      return null;
    }));
    return [...genders].filter(Boolean).sort();
  }, [programs, selectedCategories, programmeType]);

  const dynamicVenues = useMemo(() => {
    const venues = new Set(programs.filter(p => {
      if (!selectedCategories.includes(p.category)) return false;
      if (genderFilter !== 'All') {
        const fGender = genderFilter.toLowerCase();
        const pGender = (p.gender || '').toLowerCase();
        if (fGender === 'boys only' && !['boy', 'male', 'general', 'common'].includes(pGender)) return false;
        if (fGender === 'girls only' && !['girl', 'female', 'general', 'common'].includes(pGender)) return false;
        if (fGender === 'general' && !['general', 'common'].includes(pGender)) return false;
      }
      return true;
    }).map(p => {
      const v = (p.venueType || '').toLowerCase();
      if (v === 'stage') return 'Stage';
      if (v === 'off-stage') return 'Off-stage';
      return null;
    }));
    return [...venues].filter(Boolean).sort();
  }, [programs, selectedCategories, genderFilter]);

  // Reset invalid selections
  useEffect(() => {
    if (genderFilter !== 'All' && genderFilter !== 'Common' && !dynamicGenders.includes(genderFilter)) setGenderFilter('All');
    if (programmeType !== 'Stage + Off-stage' && !dynamicVenues.includes(programmeType)) setProgrammeType('Stage + Off-stage');
  }, [genderFilter, programmeType, dynamicGenders, dynamicVenues]);


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
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700"
              >
                <option>All</option>
                {dynamicGenders.map(g => <option key={g}>{g}</option>)}
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
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm text-slate-700"
              >
                <option value="Stage + Off-stage">Stage + Off-stage</option>
                {dynamicVenues.map(v => <option key={v} value={v}>{v}</option>)}
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
          
        </div>

        {/* Selected Programmes & Report Section */}
        {selectedPrograms.length > 0 && (
          <div className="glass p-6 md:p-8 rounded-3xl relative animate-fade-in mt-8">
             <div className="absolute top-6 right-8 text-slate-700">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
             </div>
             
             <h2 className="text-2xl font-bold text-slate-800">Selected Programmes List</h2>
             
             <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                       <tr>
                         <th className="px-6 py-4">Programme</th>
                         <th className="px-6 py-4">Category</th>
                         <th className="px-6 py-4 text-center">Stage</th>
                         <th className="px-6 py-4 text-center">Students</th>
                         <th className="px-6 py-4 text-center">Duration</th>
                         <th className="px-6 py-4 text-right">Total Time</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {selectedProgramDetails.details.length > 0 ? (
                         selectedProgramDetails.details.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50/50 transition">
                             <td 
                               className="px-6 py-4 font-bold text-indigo-600 cursor-pointer hover:underline"
                               onClick={() => setSelectedReportProgram(item)}
                             >
                               {item.name}
                             </td>
                             <td className="px-6 py-4">{item.category}</td>
                             <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                <select 
                                  value={programStageAssigns[item.id] || 'Auto'}
                                  onChange={(e) => setProgramStageAssigns(prev => ({...prev, [item.id]: e.target.value}))}
                                  className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                  <option value="Auto">Auto</option>
                                  {Array.from({ length: availabilityStats.stages }).map((_, i) => (
                                    <option key={i} value={i + 1}>Stage {i + 1}</option>
                                  ))}
                                </select>
                             </td>
                             <td className="px-6 py-4 text-center font-medium" onClick={e => e.stopPropagation()}>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.studentCount}
                                  onChange={(e) => handleManualCountChange(item.id, parseInt(e.target.value, 10) || 0)}
                                  className="w-16 bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
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
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-center">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Available Capacity</h3>
                   <div className="flex items-end gap-2">
                     <span className="text-4xl font-black text-slate-800">{availabilityStats.totalCapacity}</span>
                     <span className="text-slate-500 mb-1 font-medium">minutes</span>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">
                     ({availabilityStats.totalMinutesAvailable} mins × {availabilityStats.stages} stages × {availabilityStats.simultaneous} prog/stage)
                   </p>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-center shadow-sm ${selectedProgramDetails.isFeasible ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                   <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${selectedProgramDetails.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>Required Time</h3>
                   <div className="flex items-end gap-2">
                     <span className={`text-4xl font-black ${selectedProgramDetails.isFeasible ? 'text-emerald-700' : 'text-rose-700'}`}>{selectedProgramDetails.totalRequired}</span>
                     <span className={`mb-1 font-medium ${selectedProgramDetails.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>minutes</span>
                   </div>
                   <p className={`text-xs font-semibold mt-2 flex items-center gap-1.5 ${selectedProgramDetails.isFeasible ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {selectedProgramDetails.isFeasible ? (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                         Schedule is feasible within timeframe
                       </>
                     ) : (
                       <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                         Timeframe exceeded by {selectedProgramDetails.totalRequired - availabilityStats.totalCapacity} mins
                       </>
                     )}
                   </p>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={generateSchedule}
                  disabled={isGenerating || selectedPrograms.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition text-lg"
                >
                  {isGenerating ? 'Generating...' : 'Generate Schedule'}
                </button>
             </div>
          </div>
        )}

        {/* Actual Timetable Section */}
        {actualSchedule && (
          <div className="glass p-6 md:p-8 rounded-3xl relative animate-fade-in mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Generated Timetable</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {actualSchedule.map((stage, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-indigo-900">{stage.stageName}</h3>
                    <button 
                      onClick={() => handleAddBreak(idx)}
                      className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-600 hover:text-white transition flex items-center gap-1 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                      Add Break
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {stage.items.length > 0 ? (
                      stage.items.map((item, i) => (
                        <div key={item.id || i} className={`p-4 transition flex items-start gap-4 ${item.isBreak ? 'bg-orange-50/30 hover:bg-orange-50' : 'hover:bg-slate-50'}`}>
                          <div className="flex-shrink-0 text-center w-24">
                            <p className="text-xs font-bold text-slate-800">{item.startTimeFormatted}</p>
                            <p className="text-[10px] text-slate-400 font-medium">to</p>
                            <p className="text-xs font-bold text-slate-500">{item.endTimeFormatted}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold truncate ${item.isBreak ? 'text-orange-600' : 'text-slate-800'}`}>
                              {item.name} {item.isBreak && '☕'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.isBreak ? 'text-orange-600 bg-orange-100' : 'text-indigo-600 bg-indigo-50'}`}>{item.category}</span>
                              {!item.isBreak && <span className="text-xs text-slate-500">{item.studentCount} students</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xs font-bold text-slate-400">{item.timeNeeded}m</span>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-1 ml-2 border-l border-slate-100 pl-2">
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleMoveItem(idx, i, 'up')} disabled={i === 0} className={`p-1 rounded ${i === 0 ? 'text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                              </button>
                              <button onClick={() => handleMoveItem(idx, i, 'down')} disabled={i === stage.items.length - 1} className={`p-1 rounded ${i === stage.items.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                              </button>
                            </div>
                            {item.isBreak && (
                              <button onClick={() => handleRemoveBreak(idx, i)} className="p-1.5 ml-1 rounded text-red-400 hover:bg-red-50 hover:text-red-600" title="Remove Break">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">No programs assigned</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               <button 
                 onClick={handleSaveSchedule}
                 className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                 Save Schedule
               </button>
            </div>
          </div>
        )}

        {/* Saved Schedules Section */}
        {savedSchedules.length > 0 && (
          <div className="glass p-6 md:p-8 rounded-3xl relative animate-fade-in mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Saved Schedules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSchedules.map((schedule) => (
                <div key={schedule._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={schedule.name}>
                      {schedule.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Saved: {new Date(schedule.createdAt).toLocaleDateString()} {new Date(schedule.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Stages</span>
                        <span className="font-bold text-slate-700">{schedule.stages?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Programmes</span>
                        <span className="font-bold text-slate-700">
                          {schedule.stages?.reduce((acc, stage) => acc + (stage.items?.length || 0), 0) || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => handlePrint(schedule)}
                      className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Are you sure?',
                          text: "You won't be able to revert this!",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          cancelButtonColor: '#94a3b8',
                          confirmButtonText: 'Yes, delete it!'
                        });
                        if (result.isConfirmed) {
                          try {
                            const res = await fetch(`${API_URL}/api/schedules/${schedule._id}`, { method: 'DELETE' });
                            if (res.ok) {
                              Swal.fire('Deleted!', 'Schedule has been deleted.', 'success');
                              fetchSchedules();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Delete Schedule"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Program Students Modal */}
      {selectedReportProgram && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedReportProgram.name}</h3>
                <p className="text-sm text-slate-500">{selectedReportProgram.category}</p>
              </div>
              <button onClick={() => setSelectedReportProgram(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
                {candidates.filter(c => {
                  if (c.category !== selectedReportProgram.category) return false;
                  if (genderFilter !== 'All') {
                    const fGender = genderFilter.toLowerCase();
                    const cGender = (c.gender || '').toLowerCase();
                    if (fGender === 'boys only' && cGender !== 'boy' && cGender !== 'male') return false;
                    if (fGender === 'girls only' && cGender !== 'girl' && cGender !== 'female') return false;
                  }
                  return c.programs && c.programs.some(cp => typeof cp === 'string' && cp.trim().toLowerCase() === selectedReportProgram.name.trim().toLowerCase());
                }).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-xl bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">{i + 1}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">Chest No: {c.chestNo} | Team: {c.team?.name || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
