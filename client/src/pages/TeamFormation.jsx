import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import Swal from 'sweetalert2';

export default function TeamFormation() {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const teamId = user.teamId || user.id || user._id;

      const [progRes, candRes] = await Promise.all([
        fetch(`${API_URL}/api/programs`),
        teamId ? fetch(`${API_URL}/api/candidates/team/${teamId}`) : Promise.resolve({ ok: false, json: () => [] })
      ]);

      if (progRes.ok) {
        const data = await progRes.json();
        // Filter only Group programs
        const groupPrograms = data.filter(p => p.type === 'Group');
        setPrograms(groupPrograms);

        // Extract unique categories
        const uniqueCategories = [...new Set(groupPrograms.map(p => p.category))];
        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          setSelectedCategory('All Categories');
        }
      }

      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedProgram(null);
  };

  const filteredPrograms = selectedCategory === 'All Categories' 
    ? programs 
    : programs.filter(p => p.category === selectedCategory);

  const eligibleCandidates = selectedProgram
    ? candidates.filter(c => {
        const progName = selectedProgram.name.trim().toLowerCase();
        const hasProgram = c.programs.some(p => typeof p === 'string' && p.trim().toLowerCase() === progName);
        if (!hasProgram) return false;
        
        const pCat = selectedProgram.category ? selectedProgram.category.toLowerCase() : '';
        if (pCat !== 'general' && pCat !== 'common' && pCat !== 'all' && c.category !== selectedProgram.category) {
          return false;
        }

        const pGender = selectedProgram.gender;
        if (pGender !== 'General' && pGender !== 'All' && pGender !== 'Common') {
          const isProgramMale = pGender === 'Boy' || pGender === 'Male';
          const isCandidateMale = c.gender === 'Boy' || c.gender === 'Male';
          if (isProgramMale && !isCandidateMale) return false;
          
          const isProgramFemale = pGender === 'Girl' || pGender === 'Female';
          const isCandidateFemale = c.gender === 'Girl' || c.gender === 'Female';
          if (isProgramFemale && !isCandidateFemale) return false;
        }

        return true;
      })
    : [];

  const handleGroupAssignment = async (candidateId, groupName) => {
    try {
      setUpdatingId(candidateId);
      const candidateToUpdate = candidates.find(c => c._id === candidateId);
      if (!candidateToUpdate) return;

      const newAssignments = { ...candidateToUpdate.groupAssignments };
      
      if (groupName === 'None') {
        delete newAssignments[selectedProgram.name];
      } else {
        newAssignments[selectedProgram.name] = groupName;
      }

      const res = await fetch(`${API_URL}/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupAssignments: newAssignments })
      });

      if (res.ok) {
        const updatedCandidate = await res.json();
        setCandidates(prev => prev.map(c => c._id === candidateId ? updatedCandidate : c));
      } else {
        const err = await res.json();
        Swal.fire('Error', err.message || 'Failed to assign group', 'error');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      Swal.fire('Error', 'Server connection failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group names available
  const availableGroups = ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'];

  // Count candidates assigned to each group for the selected program
  const getGroupCounts = () => {
    const counts = {};
    availableGroups.forEach(g => counts[g] = 0);
    eligibleCandidates.forEach(c => {
      const g = c.groupAssignments?.[selectedProgram?.name];
      if (g && counts[g] !== undefined) {
        counts[g]++;
      }
    });
    return counts;
  };

  const groupCounts = selectedProgram ? getGroupCounts() : {};

  return (
    <div className="space-y-6">
      <div className="glass p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Team Formation</h1>
          <p className="text-slate-500 mt-1">Manage and assign candidates to specific groups for group programs.</p>
        </div>
      </div>

      <div className="glass p-6 sm:p-8 rounded-3xl space-y-6 min-h-[500px]">
        {loading ? (
          <div className="animate-pulse space-y-4 flex justify-center items-center h-40">
            <div className="text-teal-500 font-semibold">Loading data...</div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar: Categories & Programs */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="font-semibold text-slate-700">Select Category:</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                >
                  {categories.length > 0 ? (
                    <>
                      <option value="All Categories">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </>
                  ) : (
                    <option value="">No categories found</option>
                  )}
                </select>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Group Programs ({filteredPrograms.length})</h3>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPrograms.length > 0 ? (
                    filteredPrograms.map((program) => (
                      <button
                        key={program._id}
                        onClick={() => setSelectedProgram(program)}
                        className={`text-left p-4 rounded-2xl border transition duration-200 ${
                          selectedProgram?._id === program._id
                            ? 'border-teal-500 bg-teal-50 shadow-md ring-1 ring-teal-500'
                            : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold ${selectedProgram?._id === program._id ? 'text-teal-800' : 'text-slate-700'}`}>
                            {program.name}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs mt-2">
                          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium border border-teal-100">
                            {program.category}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {program.gender === 'General' ? 'All Genders' : program.gender}
                          </span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            Max {program.maxParticipants}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                      No group programs found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Candidates & Assignments */}
            <div className="w-full lg:w-2/3 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8 pt-8 lg:pt-0 flex flex-col">
              {selectedProgram ? (
                <>
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      {selectedProgram.name}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Assign the registered candidates into groups. (Max {selectedProgram.maxParticipants} per group).
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {availableGroups.map(group => {
                        const count = groupCounts[group];
                        if (count === 0) return null;
                        return (
                          <div key={group} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                            <span className="font-semibold text-sm text-slate-700">{group}:</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > selectedProgram.maxParticipants ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'}`}>
                              {count}/{selectedProgram.maxParticipants}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {eligibleCandidates.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                            <th className="px-6 py-4 font-semibold text-slate-600">Chest No.</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Candidate Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Class</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Group Assignment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {eligibleCandidates.map((candidate) => {
                            const currentGroup = candidate.groupAssignments?.[selectedProgram.name] || 'None';
                            const isUpdating = updatingId === candidate._id;

                            return (
                              <tr key={candidate._id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
                                    {candidate.chestNo || '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-800">{candidate.name}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">{candidate.gender}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {candidate.className}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <select
                                    value={currentGroup}
                                    onChange={(e) => handleGroupAssignment(candidate._id, e.target.value)}
                                    disabled={isUpdating}
                                    className={`px-3 py-1.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer ${
                                      currentGroup === 'None' 
                                        ? 'bg-slate-50 text-slate-500 border-slate-200' 
                                        : 'bg-teal-50 text-teal-700 border-teal-200'
                                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <option value="None">Not Assigned</option>
                                    {availableGroups.map(group => (
                                      <option key={group} value={group}>{group}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="font-medium text-slate-500">No candidates have registered for this program.</p>
                      <p className="text-sm mt-1">Please register candidates in this program first.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="font-medium text-lg text-slate-500">Select a program</p>
                  <p className="text-sm">Choose a group program from the list to manage its candidates.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
