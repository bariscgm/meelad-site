import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function ResultManagement() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const categoriesList = ['All', ...new Set(results.map(r => r.program?.category).filter(Boolean))];

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.program?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.winners?.some((w) => w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || w.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || r.program?.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePublish = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await fetch(`${API_URL}/api/results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchResults();
      } else {
        Swal.fire('Error', 'Failed to update result status', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/results/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchResults();
          Swal.fire('Deleted!', 'Result has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error', 'Server connection failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">Results Control</span>
          <h1 className="text-3xl font-bold text-slate-800">Results Management</h1>
        </div>
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
          <p className="text-xs uppercase font-bold text-amber-600">Draft Results</p>
          <p className="text-3xl font-extrabold text-amber-800 mt-1">
            {results.filter((r) => r.status === 'Draft').length}
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border border-blue-100 bg-blue-50/20">
          <p className="text-xs uppercase font-bold text-blue-600">Total Results Processed</p>
          <p className="text-3xl font-extrabold text-blue-800 mt-1">{results.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-sm text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Draft (Pending)</option>
          </select>
        </div>
      </div>

      {/* Results Cards List */}
      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading results...</p>
      ) : filteredResults.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center">
          <p className="text-slate-400 font-medium">No results found matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((r) => (
            <div key={r._id} className="glass p-6 rounded-3xl space-y-4 border border-slate-100 hover:border-teal-200 transition">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{r.program?.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.category}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {r.program?.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Judge: {r.judge?.name}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                    r.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {r.status === 'Published' ? 'Published' : 'Draft'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(r._id, r.status)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title={r.status === 'Published' ? 'Unpublish' : 'Publish'}
                    >
                      {r.status === 'Published' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Result"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Winners List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {r.winners?.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: w.team?.color ? `${w.team.color}15` : '#f1f5f9', color: w.team?.color || '#64748b' }}>
                      {w.position}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{w.name} <span className="text-slate-400 text-xs">({w.chestNo})</span></p>
                      <p className="text-xs font-semibold" style={{ color: w.team?.color || '#64748b' }}>{w.team?.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-1.5 py-0.5 rounded">
                          Grade {w.grade}
                        </span>
                        <span className="inline-block bg-slate-200 text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded">
                          {w.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
