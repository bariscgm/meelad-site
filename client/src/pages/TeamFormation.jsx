import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export default function TeamFormation() {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/programs`);
      if (response.ok) {
        const data = await response.json();
        // Filter only Group programs
        const groupPrograms = data.filter(p => p.type === 'Group');
        setPrograms(groupPrograms);

        // Extract unique categories
        const uniqueCategories = [...new Set(groupPrograms.map(p => p.category))];
        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="glass p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Team Formation</h1>
          <p className="text-slate-500 mt-1">Manage and view group programs for different categories.</p>
        </div>
      </div>

      <div className="glass p-6 sm:p-8 rounded-3xl space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded w-1/4"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-6">
              <label htmlFor="category" className="font-semibold text-slate-700 whitespace-nowrap">Select Category:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  <option value="">No categories found</option>
                )}
              </select>
            </div>

            {/* Programs List */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Group Programs in {selectedCategory || 'Selected Category'}
              </h2>
              
              {filteredPrograms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrograms.map((program) => (
                    <div 
                      key={program._id} 
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 group-hover:text-teal-700 transition">
                          {program.name}
                        </h3>
                        {program.gender !== 'General' && (
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            program.gender === 'Boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {program.gender}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-500 flex flex-col gap-1">
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                          Max {program.maxParticipants} Participants
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {program.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                  <p>No group programs found for this category.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
