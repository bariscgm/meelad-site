import { useState } from 'react';

export default function TeamManagement() {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team Alpha', code: 'ALPHA-01', color: '#0d9488', status: 'Enabled' },
    { id: 2, name: 'Team Beta', code: 'BETA-02', color: '#3b82f6', status: 'Enabled' },
    { id: 3, name: 'Team Gamma', code: 'GAMMA-03', color: '#8b5cf6', status: 'Disabled' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#0d9488',
  });

  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingId) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingId
            ? { ...team, name: formData.name, code: formData.code, color: formData.color }
            : team
        )
      );
      setEditingId(null);
    } else {
      const newTeam = {
        id: Date.now(),
        name: formData.name,
        code: formData.code,
        color: formData.color || '#0d9488',
        status: 'Enabled',
      };
      setTeams((prev) => [...prev, newTeam]);
    }

    setFormData({ name: '', code: '', color: '#0d9488' });
  };

  const handleEdit = (team) => {
    setEditingId(team.id);
    setFormData({ name: team.name, code: team.code, color: team.color });
  };

  const handleToggleStatus = (id) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === id
          ? { ...team, status: team.status === 'Enabled' ? 'Disabled' : 'Enabled' }
          : team
      )
    );
  };

  const handleDelete = (id) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({ name: '', code: '', color: '#0d9488' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', color: '#0d9488' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Team Management</h1>
        <p className="text-slate-500">Register new competition teams and manage existing teams.</p>
      </div>

      {/* Registration Form */}
      <div className="glass p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          {editingId ? 'Edit Team Details' : 'Team Registration Form'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Team Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Red Warriors"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
            />
          </div>

          {/* Team Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Team Code</label>
            <input
              type="text"
              name="code"
              placeholder="e.g. TEAM-RED"
              value={formData.code}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800 uppercase"
            />
          </div>

          {/* Team Color */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Team Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
              />
              <input
                type="text"
                name="color"
                placeholder="#0d9488"
                value={formData.color}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition text-slate-800"
              />
            </div>
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
              {editingId ? 'Update Team' : 'Add Team'}
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

      {/* Added Teams Section */}
      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Registered Teams ({teams.length})
          </h2>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">No teams registered yet. Use the form above to add a team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-4 px-4 font-semibold">Team Name</th>
                  <th className="py-4 px-4 font-semibold">Team Code</th>
                  <th className="py-4 px-4 font-semibold">Color Badge</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-bold text-slate-800">{team.name}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {team.code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-slate-300 shadow-sm"
                          style={{ backgroundColor: team.color }}
                        ></span>
                        <span className="text-xs text-slate-600 font-mono">{team.color}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          team.status === 'Enabled'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            team.status === 'Enabled' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        {team.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(team)}
                          className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                        >
                          Edit
                        </button>

                        {/* Enable / Disable Button */}
                        <button
                          onClick={() => handleToggleStatus(team.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                            team.status === 'Enabled'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {team.status === 'Enabled' ? 'Disable' : 'Enable'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(team.id)}
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
