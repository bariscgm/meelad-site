import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedVenue, setSelectedVenue] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'status'
  const [editingId, setEditingId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const fileInputRef = useRef(null);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  // Fetch programs from API
  useEffect(() => {
    fetchPrograms();
    fetchCategories();
    fetchCandidates();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        const order = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General'];
        const cats = data.map(c => c.name).sort((a, b) => {
          let idxA = order.findIndex(o => o.toLowerCase() === a.toLowerCase());
          let idxB = order.findIndex(o => o.toLowerCase() === b.toLowerCase());
          if (idxA === -1) idxA = 999;
          if (idxB === -1) idxB = 999;
          if (idxA !== idxB) return idxA - idxB;
          return a.localeCompare(b);
        });
        setCategoriesList(cats);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.map(p => ({ ...p, id: p._id })));
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/candidates`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    category: categoriesList.length > 0 ? categoriesList[0] : '',
    type: 'Individual',
    venueType: 'STAGE',
    gender: 'Boy',
    maxParticipants: 1,
    duration: '10 min',
  });

  // Cascading Filter Logic
  const getAvailableOptions = (field) => {
    const options = [...new Set(programs.filter(p => {
      if (field !== 'category' && selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (field !== 'gender' && selectedGender !== 'All' && p.gender !== selectedGender) return false;
      if (field !== 'type' && selectedType !== 'All' && p.type !== selectedType) return false;
      if (field !== 'venueType' && selectedVenue !== 'All' && p.venueType !== selectedVenue) return false;
      return true;
    }).map(p => p[field]))].filter(Boolean);

    if (field === 'category') {
      const order = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General'];
      return options.sort((a, b) => {
        let idxA = order.findIndex(o => o.toLowerCase() === a.toLowerCase());
        let idxB = order.findIndex(o => o.toLowerCase() === b.toLowerCase());
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        if (idxA !== idxB) return idxA - idxB;
        return a.localeCompare(b);
      });
    }
    return options.sort();
  };

  const dynamicCategories = getAvailableOptions('category');
  const typesList = getAvailableOptions('type');
  const gendersList = getAvailableOptions('gender');
  const venuesList = getAvailableOptions('venueType');

  // Reset invalid selections when dependencies change
  useEffect(() => {
    if (selectedCategory !== 'All' && !dynamicCategories.includes(selectedCategory)) setSelectedCategory('All');
    if (selectedType !== 'All' && !typesList.includes(selectedType)) setSelectedType('All');
    if (selectedGender !== 'All' && !gendersList.includes(selectedGender)) setSelectedGender('All');
    if (selectedVenue !== 'All' && !venuesList.includes(selectedVenue)) setSelectedVenue('All');
  }, [selectedCategory, selectedType, selectedGender, selectedVenue, dynamicCategories, typesList, gendersList, venuesList]);

  // Calculate groups formed for a program
  const getGroupCount = (p) => {
    if (p.type !== 'Group') return null;
    const progName = p.name.trim().toLowerCase();
    
    const eligibleCandidates = candidates.filter(c => {
      const pCat = p.category ? p.category.toLowerCase() : '';
      if (pCat !== 'general' && pCat !== 'common' && pCat !== 'all' && c.category !== p.category) {
        return false;
      }
      return c.programs && c.programs.some(cp => typeof cp === 'string' && cp.trim().toLowerCase() === progName);
    });
    
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
    return uniqueGroups.size;
  };

  // Filter logic for the table
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    const matchesVenue = selectedVenue === 'All' || p.venueType === selectedVenue;
    const matchesGender = selectedGender === 'All' || p.gender === selectedGender;
    return matchesSearch && matchesCategory && matchesType && matchesVenue && matchesGender;
  }).sort((a, b) => {
    const order = ['Kiddies', 'Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General'];
    let idxA = order.findIndex(o => o.toLowerCase() === a.category.toLowerCase());
    let idxB = order.findIndex(o => o.toLowerCase() === b.category.toLowerCase());
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    if (idxA !== idxB) return idxA - idxB;
    return a.name.localeCompare(b.name);
  });

  // Handle modal submit (Add / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/api/programs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setPrograms((prev) =>
            prev.map((p) => (p.id === editingId ? { ...updated, id: updated._id } : p))
          );
          Toast.fire({ icon: 'success', title: 'Program updated successfully' });
        }
        setEditingId(null);
      } else {
        const res = await fetch(`${API_URL}/api/programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const created = await res.json();
          setPrograms((prev) => [{ ...created, id: created._id }, ...prev]);
          Toast.fire({ icon: 'success', title: 'Program added successfully' });
        }
      }
    } catch (error) {
      console.error('Failed to save program:', error);
      Toast.fire({ icon: 'error', title: 'Failed to save program' });
    }

    setFormData({
      name: '',
      category: categoriesList.length > 0 ? categoriesList[0] : '',
      type: 'Individual',
      venueType: 'STAGE',
      gender: 'Boy',
      maxParticipants: 1,
      duration: '10 min',
    });
    setShowAddModal(false);
  };

  const handleUpdateProgramStatus = async (programId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPrograms(programs.map(p => p.id === programId ? { ...p, status: newStatus } : p));
        Toast.fire({ icon: 'success', title: 'Program status updated!' });
      } else {
        console.error('Failed to update status');
        Toast.fire({ icon: 'error', title: 'Failed to update status' });
      }
    } catch (error) {
      console.error('Failed to update status', error);
      Toast.fire({ icon: 'error', title: 'Error updating status' });
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      category: p.category,
      type: p.type,
      venueType: p.venueType,
      gender: p.gender,
      maxParticipants: p.maxParticipants,
      duration: p.duration,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this program deletion!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/programs/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setPrograms((prev) => prev.filter((p) => p.id !== id));
          Toast.fire({
            icon: 'success',
            title: 'Program deleted successfully'
          });
        } else {
          Toast.fire({
            icon: 'error',
            title: 'Failed to delete the program'
          });
        }
      } catch (error) {
        console.error('Failed to delete program:', error);
        Toast.fire({
          icon: 'error',
          title: 'An unexpected error occurred'
        });
      }
    }
  };

  // Delete All Programs
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete ALL programs! You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete ALL!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/programs`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setPrograms([]);
          Toast.fire({
            icon: 'success',
            title: 'All programs deleted successfully'
          });
        } else {
          Toast.fire({
            icon: 'error',
            title: 'Failed to delete programs'
          });
        }
      } catch (error) {
        console.error('Failed to delete programs:', error);
        Toast.fire({
          icon: 'error',
          title: 'An unexpected error occurred'
        });
      }
    }
  };

  // Restore deleted program
  const handleRestore = async () => {
    try {
      const res = await fetch(`${API_URL}/api/restore/Program`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        Toast.fire({
          icon: 'success',
          title: data.message
        });
        fetchPrograms();
      } else {
        const errorData = await res.json();
        Toast.fire({
          icon: 'error',
          title: errorData.message || 'Failed to restore'
        });
      }
    } catch (error) {
      console.error('Failed to restore program:', error);
      Toast.fire({
        icon: 'error',
        title: 'An unexpected error occurred'
      });
    }
  };

  // Export to Excel / CSV
  const exportToExcel = () => {
    const headers = ['ID', 'Programme Name', 'Category', 'Type', 'Venue Type', 'Gender', 'Max Participants', 'Duration'];
    const rows = filteredPrograms.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.type}"`,
      `"${p.venueType}"`,
      `"${p.gender}"`,
      p.maxParticipants,
      `"${p.duration}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Programmes_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print view
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Programmes List Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            h1 { color: #0f766e; font-size: 24px; margin-bottom: 5px; }
            p { color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .stage { background: #f3e8ff; color: #7e22ce; }
            .offstage { background: #ecfdf5; color: #047857; }
          </style>
        </head>
        <body>
          <h1>Meelad Competition - Programmes List</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} | Total Items: ${filteredPrograms.length}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Programme Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Venue</th>
                <th>Gender</th>
                <th>Max Part.</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPrograms
                .map(
                  (p, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.category}</td>
                  <td>${p.type}</td>
                  <td><span class="badge ${p.venueType === 'STAGE' ? 'stage' : 'offstage'}">${p.venueType}</span></td>
                  <td>${p.gender}</td>
                  <td>${p.maxParticipants}</td>
                  <td>${p.duration}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          Swal.fire('Error', 'The uploaded file is empty.', 'error');
          return;
        }

        const res = await fetch(`${API_URL}/api/programs/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const result = await res.json();
          Swal.fire('Success', result.message, 'success');
          fetchPrograms(); // Refresh the list
        } else {
          const errorData = await res.json();
          Swal.fire('Error', errorData.message || 'Failed to import programs.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'An error occurred while parsing the file.', 'error');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    e.target.value = null;
  };

  const downloadCSVTemplate = () => {
    const templateData = [
      {
        Name: 'Qiraat',
        Category: 'Senior',
        Type: 'Individual',
        VenueType: 'STAGE',
        Gender: 'Boy',
        MaxParticipants: 1,
        Duration: '10 mins',
        Class: '10A',
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Programme_Import_Template.csv');
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Main Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-600">Programme Control</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800">Programmes</h1>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
              {filteredPrograms.length} of {programs.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import Excel */}
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Excel
          </button>

          {/* Export to Excel */}
          <button
            onClick={exportToExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>

          {/* Export to PDF */}
          <button
            onClick={exportToPDF}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export PDF
          </button>

          {/* Add Programme Button */}
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                category: categoriesList.length > 0 ? categoriesList[0] : '',
                type: 'Individual',
                venueType: 'STAGE',
                gender: 'Boy',
                maxParticipants: 1,
                duration: '10 min',
              });
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add programme
          </button>

          {/* Restore Button */}
          <button
            onClick={handleRestore}
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Restore
          </button>

          {/* Delete All Button */}
          {programs.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Bulk programme upload section */}
      <div className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-100 bg-purple-50/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Bulk programme upload</h3>
            <p className="text-slate-500 text-sm">Upload several programmes at once using a CSV file.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadCSVTemplate}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV template
          </button>
          <button 
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search programme"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm text-slate-800"
            >
              <option value="All">All Categories</option>
              {dynamicCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm text-slate-800"
            >
              <option value="All">All types</option>
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Venue Type Filter */}
          <div>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm text-slate-800"
            >
              <option value="All">All venues</option>
              {venuesList.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm text-slate-800"
            >
              <option value="All">All genders</option>
              {gendersList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Programme Management</h1>
          <p className="text-slate-500 text-sm">Create, configure, and manage competition programmes.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center mr-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('status')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
                viewMode === 'status' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Status Section
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'status' ? (
        <div className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Program Status Management</h2>
          <p className="text-slate-500 text-xs">Manage the current status of all programs.</p>
          
          <div className="space-y-3 mt-4">
            {filteredPrograms.length === 0 ? (
              <div className="p-8 text-center bg-white/50 rounded-2xl text-slate-400 text-sm">
                No programs match the selected filters.
              </div>
            ) : (
              filteredPrograms.map((p) => (
                <div key={p.id} className="bg-white/60 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.category} • {p.type} • {p.venueType}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status:</span>
                    <select
                      value={p.status || 'Pending'}
                      onChange={(e) => handleUpdateProgramStatus(p.id, e.target.value)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Finished">Finished</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Programmes Card Grid */
        filteredPrograms.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center">
            <p className="text-slate-400 font-medium">No programmes match the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {filteredPrograms.map((p) => (
              <div
                key={p.id}
                className="glass p-6 rounded-2xl border border-slate-100 hover:border-purple-200 transition shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Stage Badge + Edit/Delete Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                        p.venueType === 'STAGE'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {p.venueType}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Title & Category Subtitle */}
                  <h3 className="text-lg font-bold text-slate-800">{p.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 mb-4">{p.category}</p>
                </div>

                {/* Tag Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{p.type}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{p.gender}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">Max {p.maxParticipants}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{p.duration}</span>
                  {p.type === 'Group' && (
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                      {getGroupCount(p)} Groups
                    </span>
                  )}
                  {p.status && p.status !== 'Pending' && (
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                      {p.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add / Edit Programme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Programme' : 'Add New Programme'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Programme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arabic Song"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {typesList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Venue Type</label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="STAGE">STAGE</option>
                    <option value="OFF-STAGE">OFF-STAGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {gendersList.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 min"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-500/20 transition"
                >
                  {editingId ? 'Save Changes' : 'Create Programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
