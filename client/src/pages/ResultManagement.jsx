import { useState } from 'react';

export default function ResultManagement() {
  const initialResults = [
    {
      id: 1,
      programName: 'Arabic Song',
      category: 'Super Senior',
      type: 'Individual',
      status: 'Published',
      winners: [
        { rank: '1st', chestNo: '104', name: 'Muhammed Adil', team: 'Team Alpha', teamColor: '#0d9488', points: 10, grade: 'A' },
        { rank: '2nd', chestNo: '112', name: 'Fayiz Ahmed', team: 'Team Beta', teamColor: '#3b82f6', points: 7, grade: 'A' },
        { rank: '3rd', chestNo: '120', name: 'Salmanul Farisi', team: 'Team Gamma', teamColor: '#8b5cf6', points: 5, grade: 'B' },
      ],
    },
    {
      id: 2,
      programName: 'Andhakshary',
      category: 'General',
      type: 'Group',
      status: 'Submitted',
      winners: [
        { rank: '1st', chestNo: 'G-02', name: 'Team Beta Group A', team: 'Team Beta', teamColor: '#3b82f6', points: 15, grade: 'A' },
        { rank: '2nd', chestNo: 'G-05', name: 'Team Alpha Group B', team: 'Team Alpha', teamColor: '#0d9488', points: 10, grade: 'A' },
        { rank: '3rd', chestNo: 'G-01', name: 'Team Gamma Group A', team: 'Team Gamma', teamColor: '#8b5cf6', points: 7, grade: 'B' },
      ],
    },
    {
      id: 3,
      programName: 'Book Review',
      category: 'Senior',
      type: 'Individual',
      status: 'Published',
      winners: [
        { rank: '1st', chestNo: '205', name: 'Zayan K', team: 'Team Alpha', teamColor: '#0d9488', points: 10, grade: 'A' },
        { rank: '2nd', chestNo: '211', name: 'Bilal Hassan', team: 'Team Gamma', teamColor: '#8b5cf6', points: 7, grade: 'A' },
      ],
    },
  ];

  const [results, setResults] = useState(initialResults);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    programName: '',
    category: 'Sub Junior',
    type: 'Individual',
    status: 'Published',
    winner1Name: '', winner1Chest: '', winner1Team: 'Team Alpha', winner1Grade: 'A', winner1Points: 10,
    winner2Name: '', winner2Chest: '', winner2Team: 'Team Beta', winner2Grade: 'A', winner2Points: 7,
    winner3Name: '', winner3Chest: '', winner3Team: 'Team Gamma', winner3Grade: 'B', winner3Points: 5,
  });

  const categoriesList = ['Sub Junior', 'Junior', 'Senior', 'Super Senior', 'General', 'Kiddies'];

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.winners.some((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.team.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePublish = (id) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Published' ? 'Submitted' : 'Published' } : r
      )
    );
  };

  const handleDelete = (id) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.programName) return;

    const winnersList = [
      { rank: '1st', chestNo: formData.winner1Chest || '101', name: formData.winner1Name || 'Participant 1', team: formData.winner1Team, teamColor: '#0d9488', points: Number(formData.winner1Points), grade: formData.winner1Grade },
      { rank: '2nd', chestNo: formData.winner2Chest || '102', name: formData.winner2Name || 'Participant 2', team: formData.winner2Team, teamColor: '#3b82f6', points: Number(formData.winner2Points), grade: formData.winner2Grade },
      { rank: '3rd', chestNo: formData.winner3Chest || '103', name: formData.winner3Name || 'Participant 3', team: formData.winner3Team, teamColor: '#8b5cf6', points: Number(formData.winner3Points), grade: formData.winner3Grade },
    ].filter(w => w.name);

    if (editingId) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, programName: formData.programName, category: formData.category, type: formData.type, status: formData.status, winners: winnersList }
            : r
        )
      );
      setEditingId(null);
    } else {
      const newResult = {
        id: Date.now(),
        programName: formData.programName,
        category: formData.category,
        type: formData.type,
        status: formData.status,
        winners: winnersList,
      };
      setResults((prev) => [newResult, ...prev]);
    }

    setShowAddModal(false);
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    const w1 = r.winners[0] || {};
    const w2 = r.winners[1] || {};
    const w3 = r.winners[2] || {};
    setFormData({
      programName: r.programName,
      category: r.category,
      type: r.type,
      status: r.status,
      winner1Name: w1.name || '', winner1Chest: w1.chestNo || '', winner1Team: w1.team || 'Team Alpha', winner1Grade: w1.grade || 'A', winner1Points: w1.points || 10,
      winner2Name: w2.name || '', winner2Chest: w2.chestNo || '', winner2Team: w2.team || 'Team Beta', winner2Grade: w2.grade || 'A', winner2Points: w2.points || 7,
      winner3Name: w3.name || '', winner3Chest: w3.chestNo || '', winner3Team: w3.team || 'Team Gamma', winner3Grade: w3.grade || 'B', winner3Points: w3.points || 5,
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">Results Control</span>
          <h1 className="text-3xl font-bold text-slate-800">Results Management</h1>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              programName: '',
              category: 'Sub Junior',
              type: 'Individual',
              status: 'Published',
              winner1Name: '', winner1Chest: '', winner1Team: 'Team Alpha', winner1Grade: 'A', winner1Points: 10,
              winner2Name: '', winner2Chest: '', winner2Team: 'Team Beta', winner2Grade: 'A', winner2Points: 7,
              winner3Name: '', winner3Chest: '', winner3Team: 'Team Gamma', winner3Grade: 'B', winner3Points: 5,
            });
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Publish / Add Result
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20">
          <p className="text-xs uppercase font-bold text-emerald-600">Published Results</p>
          <p className="text-3xl font-extrabold text-emerald-800 mt-1">
            {results.filter((r) => r.status === 'Published').length}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-amber-100 bg-amber-50/20">
          <p className="text-xs uppercase font-bold text-amber-600">Pending Approvals</p>
          <p className="text-3xl font-extrabold text-amber-800 mt-1">
            {results.filter((r) => r.status === 'Submitted').length}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-blue-100 bg-blue-50/20">
          <p className="text-xs uppercase font-bold text-blue-600">Total Results Processed</p>
          <p className="text-3xl font-extrabold text-blue-800 mt-1">{results.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-1">
          <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search programme or winner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Submitted">Submitted (Pending)</option>
          </select>
        </div>
      </div>

      {/* Results Cards List */}
      {filteredResults.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center">
          <p className="text-slate-400 font-medium">No results found matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((r) => (
            <div key={r.id} className="glass p-6 rounded-3xl space-y-4 border border-slate-100 hover:border-teal-200 transition">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{r.programName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.category}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {r.status}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(r.id)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border text-slate-700 hover:bg-slate-100 transition"
                  >
                    {r.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Winners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {r.winners.map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/80 border border-slate-200/60 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                          w.rank === '1st'
                            ? 'bg-amber-400 text-amber-950'
                            : w.rank === '2nd'
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        {w.rank}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{w.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">#{w.chestNo}</span>
                          <span className="font-semibold text-slate-700">{w.team}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded">
                        Grade {w.grade}
                      </span>
                      <p className="text-xs font-bold text-slate-500 mt-1">{w.points} Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Programme Result' : 'Publish New Result'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Programme Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arabic Song"
                    value={formData.programName}
                    onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1st Place */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-3">
                <h4 className="font-bold text-amber-900 text-sm">🥇 1st Position</h4>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={formData.winner1Name}
                    onChange={(e) => setFormData({ ...formData, winner1Name: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Chest No."
                    value={formData.winner1Chest}
                    onChange={(e) => setFormData({ ...formData, winner1Chest: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <select
                    value={formData.winner1Team}
                    onChange={(e) => setFormData({ ...formData, winner1Team: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="Team Alpha">Team Alpha</option>
                    <option value="Team Beta">Team Beta</option>
                    <option value="Team Gamma">Team Gamma</option>
                  </select>
                </div>
              </div>

              {/* 2nd Place */}
              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">🥈 2nd Position</h4>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={formData.winner2Name}
                    onChange={(e) => setFormData({ ...formData, winner2Name: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Chest No."
                    value={formData.winner2Chest}
                    onChange={(e) => setFormData({ ...formData, winner2Chest: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <select
                    value={formData.winner2Team}
                    onChange={(e) => setFormData({ ...formData, winner2Team: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="Team Alpha">Team Alpha</option>
                    <option value="Team Beta">Team Beta</option>
                    <option value="Team Gamma">Team Gamma</option>
                  </select>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="p-4 bg-amber-900/5 border border-amber-900/20 rounded-2xl space-y-3">
                <h4 className="font-bold text-amber-950 text-sm">🥉 3rd Position</h4>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={formData.winner3Name}
                    onChange={(e) => setFormData({ ...formData, winner3Name: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Chest No."
                    value={formData.winner3Chest}
                    onChange={(e) => setFormData({ ...formData, winner3Chest: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <select
                    value={formData.winner3Team}
                    onChange={(e) => setFormData({ ...formData, winner3Team: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="Team Alpha">Team Alpha</option>
                    <option value="Team Beta">Team Beta</option>
                    <option value="Team Gamma">Team Gamma</option>
                  </select>
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-500/20 transition"
                >
                  {editingId ? 'Update Result' : 'Publish Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
