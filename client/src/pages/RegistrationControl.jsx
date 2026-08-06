import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config/api.js';
import Swal from 'sweetalert2';

export default function RegistrationControl() {
  const [candidates, setCandidates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('All teams');
  const [filterCategory, setFilterCategory] = useState('All categories');
  const [filterProgram, setFilterProgram] = useState('All programmes');
  const [filterGender, setFilterGender] = useState('All genders');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candRes, teamRes, catRes, progRes] = await Promise.all([
        fetch(`${API_URL}/api/candidates`),
        fetch(`${API_URL}/api/teams`),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/programs`)
      ]);

      if (candRes.ok) setCandidates(await candRes.json());
      if (teamRes.ok) setTeams(await teamRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (progRes.ok) setPrograms(await progRes.json());

    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch registration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Registration?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/candidates/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setCandidates(prev => prev.filter(c => c._id !== id));
          Swal.fire('Deleted!', 'Candidate has been removed.', 'success');
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', 'Could not delete candidate', 'error');
      }
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Search
      const searchMatch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c._id.slice(-4).includes(search);
      
      // Team
      const teamMatch = filterTeam === 'All teams' || (c.team?.name === filterTeam);
      
      // Category
      const categoryMatch = filterCategory === 'All categories' || c.category === filterCategory;
      
      // Program
      const programMatch = filterProgram === 'All programmes' || c.programs.includes(filterProgram);
      
      // Gender
      const genderMatch = filterGender === 'All genders' || c.gender === filterGender;

      return searchMatch && teamMatch && categoryMatch && programMatch && genderMatch;
    });
  }, [candidates, search, filterTeam, filterCategory, filterProgram, filterGender]);

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
          <h1>Student Registrations</h1>
          <div class="filters">
            Total Students: ${filteredCandidates.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Student Name</th>
                <th>Team</th>
                <th>Programmes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCandidates.map(c => `
                <tr>
                  <td>${c._id.slice(-4).toUpperCase()}</td>
                  <td>${c.name}</td>
                  <td>${c.team?.name || 'Unknown'}</td>
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
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Optional: close the window after print dialog is closed
      // printWindow.close();
    }, 250);
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
              gap: 20px;
              padding: 20px;
            }
            .card {
              border: 2px solid #1e293b;
              border-radius: 12px;
              padding: 20px;
              page-break-inside: avoid;
              background: #fff;
            }
            .card-header {
              text-align: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .card-header h2 { margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase; }
            .card-header h3 { margin: 5px 0 0 0; font-size: 18px; color: #475569; }
            .chest-no {
              font-size: 28px;
              font-weight: bold;
              text-align: center;
              color: #4f46e5;
              margin: 10px 0;
              padding: 10px;
              background: #f8fafc;
              border: 2px dashed #cbd5e1;
              border-radius: 8px;
            }
            .programs { margin-top: 15px; }
            .program-section { margin-bottom: 15px; }
            .program-section h4 {
              margin: 0 0 5px 0;
              font-size: 14px;
              color: #334155;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 3px;
            }
            .program-section ul {
              margin: 0;
              padding-left: 20px;
              font-size: 13px;
              color: #1e293b;
            }
            .program-section li { margin-bottom: 3px; }
            
            @media print {
              @page { size: A4; margin: 15mm; }
              body { padding: 0; }
              .print-container { gap: 15px; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${filteredCandidates.map(c => {
              const studentPrograms = c.programs.map(pName => {
                return programs.find(p => p.name === pName) || { name: pName, venueType: '', category: '' };
              });
              
              const isGeneral = (p) => p.category?.toLowerCase() === 'general' || p.gender?.toLowerCase() === 'general';
              
              const stagePrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType === 'STAGE');
              const offStagePrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType === 'OFF-STAGE');
              const generalPrograms = studentPrograms.filter(p => isGeneral(p));
              
              // If venueType is unknown and not general, put them in General just in case
              const unknownPrograms = studentPrograms.filter(p => !isGeneral(p) && p.venueType !== 'STAGE' && p.venueType !== 'OFF-STAGE');
              if (unknownPrograms.length > 0) {
                generalPrograms.push(...unknownPrograms);
              }

              return `
                <div class="card">
                  <div class="card-header">
                    <h2>${c.name}</h2>
                    <h3>${c.team?.name || 'Unknown Team'}</h3>
                  </div>
                  <div class="chest-no">
                    ${c._id.slice(-4).toUpperCase()}
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-bold text-purple-600 tracking-wider">REGISTRATION CONTROL</span>
        <div className="flex justify-between items-center mt-1">
          <h1 className="text-3xl font-bold text-slate-800">Student registrations</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-lg font-medium">
              {filteredCandidates.length} of {candidates.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Name or registration num..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option>All teams</option>
          {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
        </select>

        <select 
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option>All categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>

        <select 
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option>All programmes</option>
          {programs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
        </select>

        <select 
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
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
        
        <div class="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition hidden sm:flex"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print list
          </button>
          
          <button 
            onClick={handlePrintCard}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white border border-purple-700 rounded-xl text-sm font-medium hover:bg-purple-700 transition hidden sm:flex"
          >
            <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Print Card
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading registrations...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            No registrations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-100/50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200/60">
                  <th className="px-6 py-4">Reg. No.</th>
                  <th className="px-6 py-4">Student & Programmes</th>
                  <th className="px-6 py-4">Team & Category</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 align-top pt-5">
                      <span className="font-bold text-blue-600">{c._id.slice(-4).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-base">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Class {c.className} • <span className="uppercase">{c.gender}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed">
                        {c.programs.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="font-bold text-slate-800">{c.team?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.category}</div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(c._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
