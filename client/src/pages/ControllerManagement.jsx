import { useState, useEffect } from 'react';
import { controllerDB } from '../services/controllerDB';
import Swal from 'sweetalert2';
import { API_URL } from '../config/api.js';

export default function ControllerManagement() {
  const [activeTab, setActiveTab] = useState('Limits');

  // DB Sync State
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Team Leader',
    team: '',
  });

  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
    status: 'Published',
  });

  const [downloads, setDownloads] = useState([]);
  const [downloadForm, setDownloadForm] = useState({
    title: '',
    category: 'Schedule',
    url: '',
  });

  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [statusNotification, setStatusNotification] = useState('');

  // Load Data from DB Connection on Mount
  useEffect(() => {
    loadDatabaseData();
    fetchUsers();
    fetchTeams();
    fetchPrograms();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/controller/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data.map(u => ({ ...u, id: u._id })));
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to fetch teams', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Failed to fetch programs', error);
    }
  };

  const handleUpdateProgramStatus = async (programId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPrograms(programs.map(p => p._id === programId ? { ...p, status: newStatus } : p));
        showNotification('Program status updated successfully!');
      } else {
        const err = await res.json();
        console.error('Failed to update program status', err);
      }
    } catch (error) {
      console.error('Failed to update program status', error);
    }
  };

  const loadDatabaseData = () => {
    const limits = controllerDB.getLimits();
    if (limits) {
      setRegistrationOpen(limits.registrationOpen ?? true);
      
      let catLimits = limits.categoryLimits ? [...limits.categoryLimits] : [];
      
      const oldCategories = ['Total Programs', 'For person', 'Stage Individual', 'Stage Group', 'Off-Stage Individual', 'Off-Stage Group'];
      catLimits = catLimits.filter(c => !oldCategories.includes(c.category));
      
      const defaultLimits = [
        { category: 'Kiddies', count: 4 },
        { category: 'Sub Junior', count: 4 },
        { category: 'Junior', count: 4 },
        { category: 'Senior', count: 4 },
        { category: 'Super Senior', count: 4 },
        { category: 'General', count: 2 }
      ];

      defaultLimits.forEach(dl => {
        if (!catLimits.find(c => c.category === dl.category)) {
          catLimits.push(dl);
        }
      });
      
      // Sort to match defaultLimits order
      catLimits.sort((a, b) => {
        const idxA = defaultLimits.findIndex(dl => dl.category === a.category);
        const idxB = defaultLimits.findIndex(dl => dl.category === b.category);
        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
      });
      
      setCategoryLimits(catLimits);
      setHasUnsavedChanges(false);
    }

    setAnnouncements(controllerDB.getAnnouncements());
    setDownloads(controllerDB.getDownloads());
  };

  const showNotification = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 3000);
  };

  // --- Handlers ---
  const handleSaveLimits = (e) => {
    e.preventDefault();
    const limitsData = {
      registrationOpen,
      categoryLimits,
    };
    controllerDB.saveLimits(limitsData);
    setHasUnsavedChanges(false);
    showNotification('System control limits saved successfully to database!');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.username) return;
    
    try {
      if (editingUserId) {
        const res = await fetch(`${API_URL}/api/controller/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });
        if (res.ok) {
          const updated = await res.json();
          setUsers(users.map(u => u.id === editingUserId ? { ...updated.data, id: updated.data._id } : u));
          showNotification(`User @${updated.data.username} updated in DB!`);
          setEditingUserId(null);
        }
      } else {
        const res = await fetch(`${API_URL}/api/controller/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });
        if (res.ok) {
          const created = await res.json();
          setUsers([{ ...created.data, id: created.data._id }, ...users]);
          showNotification(`User @${created.data.username} created and saved to DB!`);
        }
      }
      setUserForm({ name: '', username: '', password: '', role: 'Team Leader', team: '' });
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const handleEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      name: u.name,
      username: u.username,
      password: '',
      role: u.role,
      team: u.team || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API_URL}/api/controller/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        showNotification('User status updated in DB.');
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/controller/users/${userId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== userId));
          if (editingUserId === userId) {
            setEditingUserId(null);
            setUserForm({ name: '', username: '', password: '', role: 'Team Leader', team: '' });
          }
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
        }
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.title) return;
    const res = controllerDB.addAnnouncement(announcementForm);
    if (res.success) {
      setAnnouncements(res.announcements);
      setAnnouncementForm({ title: '', description: '', status: 'Published' });
      showNotification('Announcement saved & published to DB!');
    }
  };

  const handleDeleteAnnouncement = (annId) => {
    const res = controllerDB.deleteAnnouncement(annId);
    if (res.success) {
      setAnnouncements(res.announcements);
      showNotification('Announcement deleted from DB.');
    }
  };

  const handleAddDownload = (e) => {
    e.preventDefault();
    if (!downloadForm.title || !downloadForm.url) return;
    const res = controllerDB.addDownload(downloadForm);
    if (res.success) {
      setDownloads(res.downloads);
      setDownloadForm({ title: '', category: 'Schedule', url: '' });
      showNotification('Download link saved to DB!');
    }
  };

  const handleDeleteDownload = (downId) => {
    const res = controllerDB.deleteDownload(downId);
    if (res.success) {
      setDownloads(res.downloads);
      showNotification('Download link removed from DB.');
    }
  };

  const handleResetData = (e) => {
    e.preventDefault();
    if (resetConfirmText === 'RESET ILMUL RASOOL') {
      const res = controllerDB.resetAllDatabaseData();
      if (res.success) {
        setResetSuccessMessage('All database data cleared. Event system reset successfully.');
        setResetConfirmText('');
        loadDatabaseData();
      }
    } else {
      alert('Please type "RESET ILMUL RASOOL" exactly to confirm database wipe.');
    }
  };

  const tabs = [
    { name: 'Limits', icon: '🎛️' },
    { name: 'Users', icon: '👤' },
    { name: 'Announcements', icon: '📢' },
    { name: 'Downloads', icon: '📥' },
    { name: 'Status', icon: '📊' },
    { name: 'Danger zone', icon: '⚠️', isDanger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin System Controls</h1>
        <p className="text-slate-500 text-sm">Manage database limits, users, announcements, downloads and system reset.</p>
      </div>

      {/* Database Status Toast Notification */}
      {statusNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <span>✅ {statusNotification}</span>
          <span className="text-xs text-emerald-600 font-mono">DB Synced</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2.5 font-semibold text-sm rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                isActive
                  ? tab.isDanger
                    ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                    : 'border-purple-600 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: LIMITS --- */}
      {activeTab === 'Limits' && (
        <form onSubmit={handleSaveLimits} className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            {/* Registration Status */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Candidate registration</h2>
                <p className="text-slate-500 text-xs mt-0.5">Control whether team leaders can submit new registrations.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRegistrationOpen(!registrationOpen);
                  setHasUnsavedChanges(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  registrationOpen ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${registrationOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {registrationOpen ? 'OPEN FOR REGISTRATION' : 'REGISTRATION CLOSED'}
              </button>
            </div>

            {/* Category Limits */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Student programme limits</h2>
              <div className="space-y-3">
                {categoryLimits.map((cat, idx) => (
                  <div key={cat.category} className="p-4 rounded-2xl bg-white/60 border border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-sm">{cat.category}</span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Count:</span>
                        <input
                          type="number"
                          value={cat.count === '' ? '' : (cat.count ?? 0)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryLimits(prev => prev.map((item, i) => 
                              i === idx ? { ...item, count: val === '' ? '' : Number(val) } : item
                            ));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-16 px-2.5 py-1 rounded-xl border border-slate-200 text-center font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!hasUnsavedChanges}
              className={`px-6 py-3 font-semibold rounded-xl transition flex items-center gap-2 ${
                hasUnsavedChanges 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              💾 Save controls to Database
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: USERS --- */}
      {activeTab === 'Users' && (
        <div className="space-y-6">
          {/* Create login user form */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editingUserId ? 'Edit User' : 'Create login user'}</h2>
            <p className="text-slate-500 text-xs">Manage user accounts directly in the database.</p>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="teama, judge1"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{editingUserId ? 'New password (optional)' : 'Temporary password'}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  required={!editingUserId}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Team Leader">Team Leader</option>
                  <option value="Judge">Judge</option>
                  <option value="Stage Manager">Stage Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {userForm.role === 'Team Leader' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Team</label>
                  <select
                    value={userForm.team}
                    onChange={(e) => setUserForm({ ...userForm, team: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  {editingUserId ? 'Update User' : '+ Add User'}
                </button>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ name: '', username: '', password: '', role: 'Team Leader', team: '' });
                    }}
                    className="w-full mt-2 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Users */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white/50 rounded-2xl text-slate-400 text-sm">
                No users found in database. Create one above!
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{u.name}</h4>
                      <p className="text-xs text-slate-500">
                        @{u.username} • <span className="font-semibold text-purple-600">{u.role}</span>
                        {u.role === 'Team Leader' && u.team && <span> • {u.team}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {u.status}
                    </button>
                    {u.username !== 'admin' && (
                      <>
                        <button
                          onClick={() => handleEditUser(u)}
                          className="px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: ANNOUNCEMENTS --- */}
      {activeTab === 'Announcements' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Add announcement</h2>
            <p className="text-slate-500 text-xs">Announcements are stored in database and shown on the public site.</p>

            <form onSubmit={handleAddAnnouncement} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stage Schedule Updated"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Detailed announcement notes..."
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  + Add to DB
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-8 text-center bg-white/50 rounded-2xl text-slate-400 text-sm">
                No active announcements in database.
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base">{a.title}</h4>
                      {a.date && <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full">{a.date}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{a.description || 'No description provided.'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: DOWNLOADS --- */}
      {activeTab === 'Downloads' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Add download link</h2>
            <p className="text-slate-500 text-xs">Save downloadable PDFs and rules directly into database.</p>

            <form onSubmit={handleAddDownload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Meelad Rulebook 2026"
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={downloadForm.category}
                  onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Schedule">Schedule</option>
                  <option value="Rules">Rules</option>
                  <option value="Results">Results</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Public file URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={downloadForm.url}
                  onChange={(e) => setDownloadForm({ ...downloadForm, url: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  + Save to DB
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {downloads.length === 0 ? (
              <div className="p-8 text-center bg-white/50 rounded-2xl text-slate-400 text-sm">
                No download files found in database.
              </div>
            ) : (
              downloads.map((d) => (
                <div key={d.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base">{d.title}</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{d.category}</span>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block font-mono">
                      {d.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteDownload(d.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: STATUS --- */}
      {activeTab === 'Status' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Program Status Management</h2>
            <p className="text-slate-500 text-xs">Manage the current status of all programs.</p>
            
            <div className="space-y-3">
              {programs.length === 0 ? (
                <div className="p-8 text-center bg-white/50 rounded-2xl text-slate-400 text-sm">
                  No programs found in database.
                </div>
              ) : (
                programs.map((p) => (
                  <div key={p._id} className="glass p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{p.category} - {p.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={p.status || 'Pending'}
                        onChange={(e) => handleUpdateProgramStatus(p._id, e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
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
        </div>
      )}

      {/* --- TAB 6: DANGER ZONE --- */}
      {activeTab === 'Danger zone' && (
        <div className="glass p-8 rounded-3xl border border-rose-200 bg-rose-50/20 space-y-6">
          <div className="flex items-start gap-4">
            <span className="p-3 bg-rose-100 text-rose-600 rounded-2xl text-xl">⚠️</span>
            <div>
              <h2 className="text-xl font-bold text-rose-900">Clear Database & Reset Event Data</h2>
              <p className="text-rose-700 text-sm mt-1">
                This operation will clear all database collections, user entries, announcements, downloadable files, and limits.
              </p>
            </div>
          </div>

          {resetSuccessMessage && (
            <div className="p-4 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-sm font-semibold">
              {resetSuccessMessage}
            </div>
          )}

          <form onSubmit={handleResetData} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type <span className="font-mono text-rose-700">RESET ILMUL RASOOL</span> to confirm
              </label>
              <input
                type="text"
                placeholder="RESET ILMUL RASOOL"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-300 bg-white font-mono text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-500/25 transition flex items-center gap-2"
            >
              🗑️ Clear Database Data
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
