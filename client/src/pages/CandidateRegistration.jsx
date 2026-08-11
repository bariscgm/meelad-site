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

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All categories');
  const [filterProgram, setFilterProgram] = useState('All programmes');
  const [filterGender, setFilterGender] = useState('All genders');
  const [limits, setLimits] = useState({
    registrationOpen: true,
  });
  const [categoryLimits, setCategoryLimits] = useState([]);

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
          const order = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General'];
          const sortedCats = catData.sort((a, b) => {
            let idxA = order.findIndex(o => o.toLowerCase() === a.name.toLowerCase());
            let idxB = order.findIndex(o => o.toLowerCase() === b.name.toLowerCase());
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            if (idxA !== idxB) return idxA - idxB;
            return a.name.localeCompare(b.name);
          });
          setCategories(sortedCats);
        }
        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(candData);
        }
        if (limitRes.ok) {
          const limitData = await limitRes.json();
          if (limitData.data && limitData.data.categoryLimits) {
            setCategoryLimits(limitData.data.categoryLimits);
            setLimits({
              registrationOpen: limitData.data.registrationOpen ?? true,
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
        const catLimitObj = categoryLimits.find(c => c.category.toLowerCase() === prev.category.toLowerCase());
        const limit = catLimitObj ? catLimitObj.count : 4; // Default limit fallback
        
        if (currentPrograms.length >= limit) {
          Swal.fire('Limit Exceeded', `You can only select up to ${limit} programs for the ${prev.category} category.`, 'warning');
          return prev;
        }

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

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const searchMatch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c._id.slice(-4).includes(search);
      
      const categoryMatch = filterCategory === 'All categories' || c.category === filterCategory;
      const programMatch = filterProgram === 'All programmes' || c.programs.includes(filterProgram);
      const genderMatch = filterGender === 'All genders' || c.gender === filterGender;

      return searchMatch && categoryMatch && programMatch && genderMatch;
    }).sort((a, b) => {
      const order = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General'];
      let idxA = order.findIndex(o => o.toLowerCase() === a.category.toLowerCase());
      let idxB = order.findIndex(o => o.toLowerCase() === b.category.toLowerCase());
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });
  }, [candidates, search, filterCategory, filterProgram, filterGender]);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Student Registrations</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #1e293b; margin-bottom: 20px; }
            .filters { text-align: center; margin-bottom: 20px; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; color: #475569; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            @media print {
              @page { margin: 1cm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Team Candidates List</h1>
          <div class="filters">
            Total Students: ${filteredCandidates.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Category</th>
                <th>Programmes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCandidates.map(c => `
                <tr>
                  <td>${c.chestNo || '-'}</td>
                  <td>${c.name}</td>
                  <td>${c.className || '-'}</td>
                  <td>${c.category || '-'}</td>
                  <td>${c.programs.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handlePrintCard = () => {
    const printContent = `
      <html>
        <head>
          <title>Print Cards</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
            .print-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              padding: 10px;
            }
            .card {
              border: 1px solid #1e293b;
              border-radius: 6px;
              padding: 8px;
              page-break-inside: avoid;
              background: #fff;
            }
            .card-header {
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            .card-header h2 { margin: 0; font-size: 14px; color: #0f172a; text-transform: uppercase; font-weight: bold; }
            .card-header h3 { margin: 2px 0 0 0; font-size: 11px; color: #475569; }
            .chest-no {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              color: #4f46e5;
              margin: 4px 0;
              padding: 2px;
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 4px;
            }
            .programs { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: space-between; }
            .program-section { margin-bottom: 2px; flex: 1; min-width: 30%; }
            .program-section h4 {
              margin: 0 0 2px 0;
              font-size: 10px;
              color: #334155;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 1px;
            }
            .program-section ul {
              margin: 0;
              padding-left: 12px;
              font-size: 9px;
              color: #1e293b;
            }
            .program-section li { margin-bottom: 1px; line-height: 1.1; }
            
            @media print {
              @page { size: A4; margin: 8mm; }
              body { padding: 0; }
              .print-container { gap: 8px; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${filteredCandidates.map(c => {
              const studentPrograms = c.programs.map(pName => {
                return allPrograms.find(p => p.name === pName) || { name: pName, venueType: '', category: '' };
              });
              
              const isGeneral = (p) => p.category?.toLowerCase() === 'general' || p.gender?.toLowerCase() === 'general';
              
              const stagePrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType === 'STAGE');
              const offStagePrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType === 'OFF-STAGE');
              const generalPrograms = studentPrograms.filter(p => isGeneral(p));
              
              const unknownPrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType !== 'STAGE' && p.venueType !== 'OFF-STAGE');
              if (unknownPrograms.length > 0) {
                generalPrograms.push(...unknownPrograms);
              }

              return `
                <div class="card">
                  <div class="card-header">
                    <h2>${c.name}</h2>
                    <h3>${user.team || 'Unknown Team'}</h3>
                    <h3 style="margin-top: 2px;">${c.className || ''}</h3>
                  </div>
                  <div class="chest-no">
                    ${c.chestNo || '-'}
                  </div>
                  <div class="programs">
                    ${stagePrograms.length > 0 ? `
                      <div class="program-section">
                        <h4>Stage Programs</h4>
                        <ul>${stagePrograms.map(p => `<li>${p.name}</li>`).join('')}</ul>
                      </div>
                    ` : ''}
                    ${offStagePrograms.length > 0 ? `
                      <div class="program-section">
                        <h4>Non-Stage Programs</h4>
                        <ul>${offStagePrograms.map(p => `<li>${p.name}</li>`).join('')}</ul>
                      </div>
                    ` : ''}
                    ${generalPrograms.length > 0 ? `
                      <div class="program-section">
                        <h4>General Programs</h4>
                        <ul>${generalPrograms.map(p => `<li>${p.name}</li>`).join('')}</ul>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

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
          Recently Registered ({filteredCandidates.length})
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Name or registration num..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option>All categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
          >
            <option>All programmes</option>
            {allPrograms
              .filter(p => filterCategory === 'All categories' || p.category === filterCategory)
              .filter(p => filterGender === 'All genders' || p.gender === filterGender)
              .map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
          </select>

          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option>All genders</option>
            <option value="Boy">Boy</option>
            <option value="Girl">Girl</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="General">General</option>
          </select>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print list
            </button>
            
            <button 
              onClick={handlePrintCard}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white border border-teal-700 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
            >
              <svg className="w-4 h-4 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Print Card
            </button>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">No candidates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCandidates.map(candidate => (
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
