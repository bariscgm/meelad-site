import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.map(cat => ({ ...cat, id: cat._id })));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    classFrom: 1,
    classTo: 4,
  });

  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'classFrom' || name === 'classTo' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setCategories((prev) =>
            prev.map((cat) => (cat.id === editingId ? { ...updated, id: updated._id } : cat))
          );
          Toast.fire({ icon: 'success', title: 'Category updated successfully' });
        }
        setEditingId(null);
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const created = await res.json();
          setCategories((prev) => [...prev, { ...created, id: created._id }]);
          Toast.fire({ icon: 'success', title: 'Category added successfully' });
        } else {
          const err = await res.json();
          Toast.fire({ icon: 'error', title: err.message || 'Failed to add category' });
        }
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      Toast.fire({ icon: 'error', title: 'Error saving category' });
    }

    setFormData({ name: '', classFrom: 1, classTo: 4 });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      classFrom: category.classFrom,
      classTo: category.classTo,
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setCategories((prev) => prev.filter((cat) => cat.id !== id));
          if (editingId === id) {
            setEditingId(null);
            setFormData({ name: '', classFrom: 1, classTo: 4 });
          }
          Toast.fire({ icon: 'success', title: 'Category deleted' });
        } else {
          Toast.fire({ icon: 'error', title: 'Failed to delete' });
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
        Toast.fire({ icon: 'error', title: 'Error deleting category' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', classFrom: 1, classTo: 4 });
  };

  // Generate numbers 1 to 12
  const classOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Category Management</h1>
        <p className="text-slate-500">Add and manage student competition categories based on class ranges.</p>
      </div>

      {/* Registration Form */}
      <div className="glass p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          {editingId ? 'Edit Category' : 'Category Registration Form'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Junior / Sub-Junior"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
            />
          </div>

          {/* Class From */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class From (1-12)</label>
            <select
              name="classFrom"
              value={formData.classFrom}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
            >
              {classOptions.map((num) => (
                <option key={num} value={num}>
                  Class {num}
                </option>
              ))}
            </select>
          </div>

          {/* Class To */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class To (1-12)</label>
            <select
              name="classTo"
              value={formData.classTo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
            >
              {classOptions.map((num) => (
                <option key={num} value={num}>
                  Class {num}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-3 flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {editingId ? 'Update Category' : 'Add Category'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Added Category List */}
      <div className="glass p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Added Categories List ({categories.length})
        </h2>

        {categories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">No categories added yet. Fill out the form above to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-4 px-4 font-semibold">Category Name</th>
                  <th className="py-4 px-4 font-semibold">Class Range</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-bold text-slate-800">{cat.name}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold">
                        Class {cat.classFrom} - Class {cat.classTo}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                        >
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
