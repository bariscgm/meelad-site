import { useState } from 'react';

export default function ProgramManagement() {
  const initialPrograms = [
    { id: 1, name: 'Andhakshary', category: 'General', type: 'Group', venueType: 'STAGE', gender: 'Boy', maxParticipants: 4, duration: '30 min' },
    { id: 2, name: 'Andhakshary', category: 'General', type: 'Group', venueType: 'STAGE', gender: 'Girl', maxParticipants: 4, duration: '30 min' },
    { id: 3, name: 'Arabic Song', category: 'Super Senior', type: 'Individual', venueType: 'STAGE', gender: 'Girl', maxParticipants: 3, duration: '4 min' },
    { id: 4, name: 'Baloon Quiz', category: 'Sub Junior', type: 'Individual', venueType: 'OFF-STAGE', gender: 'Boy', maxParticipants: 4, duration: '20 min' },
    { id: 5, name: 'Baloon Quiz', category: 'Sub Junior', type: 'Individual', venueType: 'OFF-STAGE', gender: 'Girl', maxParticipants: 4, duration: '20 min' },
    { id: 6, name: 'Bank', category: 'Senior', type: 'Individual', venueType: 'OFF-STAGE', gender: 'Boy', maxParticipants: 4, duration: '4 min' },
    { id: 7, name: 'Book Review', category: 'Super Senior', type: 'Individual', venueType: 'STAGE', gender: 'Girl', maxParticipants: 3, duration: '4 min' },
    { id: 8, name: 'Build The Time Line', category: 'Senior', type: 'Individual', venueType: 'OFF-STAGE', gender: 'Boy', maxParticipants: 4, duration: '20 min' },
    { id: 9, name: 'Burda', category: 'General', type: 'Group', venueType: 'STAGE', gender: 'Boy', maxParticipants: 5, duration: '20 min' },
    { id: 10, name: 'Chithra Thunnal', category: 'General', type: 'Group', venueType: 'OFF-STAGE', gender: 'Girl', maxParticipants: 2, duration: '20 min' },
    { id: 11, name: 'Coloring', category: 'Kiddies', type: 'Individual', venueType: 'OFF-STAGE', gender: 'Boy', maxParticipants: 10, duration: '30 min' },
    { id: 12, name: 'Conversation', category: 'Sub Junior', type: 'Group', venueType: 'STAGE', gender: 'Boy', maxParticipants: 4, duration: '4 min' },
  ];

  const [programs, setPrograms] = useState(initialPrograms);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Sub Junior',
    type: 'Individual',
    venueType: 'STAGE',
    gender: 'Boy',
    maxParticipants: 1,
    duration: '10 min',
  });

  // Unique lists for dropdown options
  const categoriesList = ['Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General', 'Kiddies'];
  const typesList = ['Individual', 'Group'];
  const gendersList = ['Boy', 'Girl', 'General'];

  // Filter logic
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    const matchesGender = selectedGender === 'All' || p.gender === selectedGender;
    return matchesSearch && matchesCategory && matchesType && matchesGender;
  });

  // Handle modal submit (Add / Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p))
      );
      setEditingId(null);
    } else {
      const newProgram = {
        id: Date.now(),
        ...formData,
      };
      setPrograms((prev) => [newProgram, ...prev]);
    }

    setFormData({
      name: '',
      category: 'Sub Junior',
      type: 'Individual',
      venueType: 'STAGE',
      gender: 'Boy',
      maxParticipants: 1,
      duration: '10 min',
    });
    setShowAddModal(false);
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

  const handleDelete = (id) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
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
                category: 'Sub Junior',
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
          <button className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV template
          </button>
          <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="All">All categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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

      {/* Programmes Card Grid */}
      {filteredPrograms.length === 0 ? (
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
              </div>
            </div>
          ))}
        </div>
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
