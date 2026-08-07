import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function CandidateRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    className: '',
    category: '',
    programs: []
  });

  const [candidates, setCandidates] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [limits, setLimits] = useState({
    registrationOpen: true,
    totalPrograms: 4,
    general: 2,
    stageIndividual: 3,
    stageGroup: 2,
    offstageIndividual: 4,
    offstageGroup: 3
  });

  // Fetch programs, categories, and candidates from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const teamId = user.teamId || user.id || user._id;

        const [progRes, catRes, candRes, limitRes] = await Promise.all([
          fetch(`${API_URL}/api/programs`),
          fetch(`${API_URL}/api/categories`),
          teamId ? fetch(`${API_URL}/api/candidates/team/${teamId}`) : Promise.resolve({ ok: false }),
          fetch(`${API_URL}/api/controller/limits`)
        ]);

        if (progRes.ok) {
          const data = await progRes.json();
          setAllPrograms(data);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(candData);
        }
        if (limitRes.ok) {
          const limitData = await limitRes.json();
          if (limitData.data && limitData.data.categoryLimits) {
            const getLimit = (catName, defaultVal) => {
              const l = limitData.data.categoryLimits.find(c => c.category.toLowerCase() === catName.toLowerCase());
              return l ? l.count : defaultVal;
            };
            
            setLimits({
              registrationOpen: limitData.data.registrationOpen ?? true,
              totalPrograms: getLimit('total programs', getLimit('for person', 4)),
              general: getLimit('general', 2),
              stageIndividual: getLimit('stage individual', 3),
              stageGroup: getLimit('stage group', 2),
              offstageIndividual: getLimit('off-stage individual', 4),
              offstageGroup: getLimit('off-stage group', 3)
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const getClassNumber = (classNameStr) => {
    const match = classNameStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-assign category based on class
      if (name === 'className') {
        const classNum = getClassNumber(value);
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase() !== 'general' && 
          classNum >= cat.classFrom && 
          classNum <= cat.classTo
        );
        updated.category = matchedCategory ? matchedCategory.name : '';
        updated.programs = []; // Reset programs when class/category changes
      }

      if (name === 'gender') {
        updated.programs = []; // Reset programs when gender changes
      }

      return updated;
    });
  };

  const handleCheckboxChange = (program) => {
    setFormData(prev => {
      const currentPrograms = prev.programs;
      if (currentPrograms.includes(program)) {
        return { ...prev, programs: currentPrograms.filter(p => p !== program) };
      } else {
        return { ...prev, programs: [...currentPrograms, program] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.gender || !formData.className || !formData.category) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const teamId = user.teamId || user.id || user._id;

      const payload = { ...formData, team: teamId };

      if (editingId) {
        const res = await fetch(`${API_URL}/api/candidates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updatedCandidate = await res.json();
          setCandidates(prev => prev.map(c => c._id === editingId ? updatedCandidate : c));
          setEditingId(null);
          Swal.fire('Success', 'Candidate updated successfully', 'success');
        } else {
          const err = await res.json();
          Swal.fire('Error', err.message || 'Failed to update candidate', 'error');
        }
      } else {
        const res = await fetch(`${API_URL}/api/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const newCandidate = await res.json();
          setCandidates(prev => [newCandidate, ...prev]);
          Swal.fire('Success', 'Candidate registered successfully', 'success');
        } else {
          const err = await res.json();
          Swal.fire('Error', err.message || 'Failed to register candidate', 'error');
        }
      }

      // Reset form except category to allow faster bulk entry
      setFormData(prev => ({
        ...prev,
        name: '',
        programs: []
      }));
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  const handleEdit = (candidate) => {
    setFormData({
      name: candidate.name,
      gender: candidate.gender,
      className: candidate.className,
      category: candidate.category,
      programs: candidate.programs
    });
    setEditingId(candidate.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL}/api/candidates/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setCandidates(prev => prev.filter(c => c._id !== id));
            Swal.fire('Deleted!', 'Candidate has been deleted.', 'success');
          } else {
            Swal.fire('Error', 'Failed to delete candidate', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Server connection failed', 'error');
        }
      }
    });
  };

  const handleHold = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Hold' ? 'Active' : 'Hold';
      const res = await fetch(`${API_URL}/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedCandidate = await res.json();
        setCandidates(prev => prev.map(c => c._id === id ? updatedCandidate : c));
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const { categoryPrograms, generalPrograms } = useMemo(() => {
    if (!formData.category || !formData.gender) return { 
      categoryPrograms: { stage: [], offStage: [] }, 
      generalPrograms: { stage: [], offStage: [] } 
    };
    
    const filterPrograms = (progs, categoryName) => {
      return progs.filter(p => 
        p.category.toLowerCase() === categoryName.toLowerCase() && 
        (p.gender === formData.gender || p.gender.toLowerCase() === 'general')
      );
    };

    let catProgs = filterPrograms(allPrograms, formData.category);
    let genProgs = filterPrograms(allPrograms, 'general');
    
    if (formData.category.toLowerCase() === 'general') {
      genProgs = []; // avoid duplicating if category is already general
    }
      
    const groupAndMap = (programsList) => {
      const stage = programsList.filter(p => p.venueType?.toUpperCase() === 'STAGE').map(p => p.name);
      const offStage = programsList.filter(p => p.venueType?.toUpperCase() === 'OFF-STAGE' || p.venueType?.toUpperCase() === 'OFFSTAGE').map(p => p.name);
      return {
        stage: Array.from(new Set(stage)),
        offStage: Array.from(new Set(offStage))
      };
    };

    return {
      categoryPrograms: groupAndMap(catProgs),
      generalPrograms: groupAndMap(genProgs)
    };
  }, [formData.category, formData.gender, allPrograms]);

  const renderProgramCheckboxes = (programsList) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {programsList.map(program => (
        <label
          key={program}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${formData.programs.includes(program)
              ? 'border-teal-500 bg-teal-50/50 shadow-sm'
              : 'border-slate-100 bg-white/50 hover:border-teal-200 hover:bg-white'
            }`}
        >
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.programs.includes(program) ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300'
            }`}>
            {formData.programs.includes(program) && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={formData.programs.includes(program)}
            onChange={() => handleCheckboxChange(program)}
          />
          <span className={`font-medium text-sm ${formData.programs.includes(program) ? 'text-teal-800' : 'text-slate-600'}`}>
            {program}
          </span>
        </label>
      ))}
    </div>
  );

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin' || user.role === 'admin';
  const isRegistrationClosed = !limits.registrationOpen && !isAdmin;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h1 className="text-3xl font-bold text-slate-800 mb-2 relative z-10">Candidate Registration</h1>
        <p className="text-slate-500 relative z-10">Register students to your team and assign them to competition programs.</p>
      </div>

      {/* Registration Form */}
      {!isRegistrationClosed ? (
        <div className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 relative z-10">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          Student Details
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Candidate Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Muhammed Ali"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Class / Standard</label>
              <select
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800 appearance-none"
              >
                <option value="" disabled>Select Class</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category (Auto-assigned)</label>
              <select
                name="category"
                value={formData.category}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed transition text-slate-800 appearance-none"
              >
                <option value="">Select Class First</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Gender</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.gender === 'Boy' ? 'border-teal-500' : 'border-slate-300 group-hover:border-teal-400'}`}>
                  {formData.gender === 'Boy' && <div className="w-3 h-3 rounded-full bg-teal-500" />}
                </div>
                <input type="radio" name="gender" value="Boy" checked={formData.gender === 'Boy'} onChange={handleInputChange} className="hidden" />
                <span className="text-slate-700 font-medium group-hover:text-teal-600 transition">Boy</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.gender === 'Girl' ? 'border-teal-500' : 'border-slate-300 group-hover:border-teal-400'}`}>
                  {formData.gender === 'Girl' && <div className="w-3 h-3 rounded-full bg-teal-500" />}
                </div>
                <input type="radio" name="gender" value="Girl" checked={formData.gender === 'Girl'} onChange={handleInputChange} className="hidden" />
                <span className="text-slate-700 font-medium group-hover:text-teal-600 transition">Girl</span>
              </label>
            </div>
          </div>

          {/* Programs Checkboxes */}
          {formData.category && formData.gender && (
            <div className="space-y-6">
              {(categoryPrograms.stage.length > 0 || categoryPrograms.offStage.length > 0) && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Available Programs for {formData.category}
                  </label>
                  
                  {categoryPrograms.stage.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Stage Programs</h4>
                      {renderProgramCheckboxes(categoryPrograms.stage)}
                    </div>
                  )}

                  {categoryPrograms.offStage.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Off-Stage Programs</h4>
                      {renderProgramCheckboxes(categoryPrograms.offStage)}
                    </div>
                  )}
                </div>
              )}

              {(generalPrograms.stage.length > 0 || generalPrograms.offStage.length > 0) && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">
                    General Programs
                  </label>
                  
                  {generalPrograms.stage.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Stage Programs</h4>
                      {renderProgramCheckboxes(generalPrograms.stage)}
                    </div>
                  )}

                  {generalPrograms.offStage.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">Off-Stage Programs</h4>
                      {renderProgramCheckboxes(generalPrograms.offStage)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-6 flex justify-end">

            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {editingId ? 'Update Candidate' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
      ) : (
        <div className="glass p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mt-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Registration is Closed</h2>
          <p className="text-slate-500 mb-4">You can no longer register or edit candidates. Please contact the administrator for any changes.</p>
        </div>
      )}

      {/* Registered Candidates Preview */}
      <div className="glass p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Recently Registered ({candidates.length})
        </h2>

        {candidates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">No candidates registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {candidates.map(candidate => (
              <div key={candidate._id} className={`bg-white/60 border ${candidate.status === 'Hold' ? 'border-amber-400 bg-amber-50/30' : 'border-slate-100'} p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col h-full`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      {candidate.name}
                      {candidate.status === 'Hold' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">On Hold</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium mt-1">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{candidate.className}</span>
                      <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md">{candidate.category}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${candidate.gender === 'Boy' || candidate.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {candidate.gender}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex-grow">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Registered Programs ({candidate.programs.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.programs.map(p => (
                      <span key={p} className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg">
                        {p}
                      </span>
                    ))}
                    {candidate.programs.length === 0 && (
                      <span className="text-xs text-rose-500 font-medium">No programs assigned</span>
                    )}
                  </div>
                </div>

                {!isRegistrationClosed && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <button type="button" onClick={() => handleEdit(candidate)} className="px-3 py-1.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition">Edit</button>
                    <button type="button" onClick={() => handleHold(candidate._id, candidate.status)} className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${candidate.status === 'Hold' ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}>{candidate.status === 'Hold' ? 'Unhold' : 'Hold'}</button>
                    <button type="button" onClick={() => handleDelete(candidate._id)} className="px-3 py-1.5 text-sm font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
