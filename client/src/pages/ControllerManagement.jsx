import { useState } from 'react';

export default function ControllerManagement() {
  const [activeTab, setActiveTab] = useState('Limits');

  // --- Limits State ---
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [categoryLimits, setCategoryLimits] = useState([
    { category: 'Junior', stage: 3, offstage: 4 },
    { category: 'Kiddies', stage: 4, offstage: 10 },
    { category: 'Senior', stage: 3, offstage: 3 },
    { category: 'Sub Junior', stage: 3, offstage: 4 },
    { category: 'Super Senior', stage: 3, offstage: 3 },
  ]);
  const [generalLimits, setGeneralLimits] = useState({
    stageIndividual: 4,
    stageGroup: 4,
    offstageIndividual: 4,
    offstageGroup: 4,
  });

  // --- Users State ---
  const [users, setUsers] = useState([
    { id: 1, name: 'Team Alpha Leader', username: 'teama', role: 'Team Leader', team: 'Team Alpha', status: 'Active' },
    { id: 2, name: 'Team Beta Leader', username: 'teamb', role: 'Team Leader', team: 'Team Beta', status: 'Active' },
    { id: 3, name: 'Ilmul Rasool Admin', username: 'admin', role: 'Admin', team: 'No team', status: 'Active' },
    { id: 4, name: 'Judge One', username: 'judge1', role: 'Judge', team: 'No team', status: 'Active' },
    { id: 5, name: 'Stage Manager', username: 'stage1', role: 'Stage Manager', team: 'No team', status: 'Active' },
  ]);
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Team Leader',
    team: 'Team Alpha',
  });

  // --- Announcements State ---
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Welcome to Meelad Fest 2026', description: 'Registrations are now open for all categories.', status: 'Published' },
    { id: 2, title: 'Stage Schedule Update', description: 'Stage 1 schedule has been updated. Check downloads section.', status: 'Published' },
  ]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    description: '',
    status: 'Published',
  });

  // --- Downloads State ---
  const [downloads, setDownloads] = useState([
    { id: 1, title: 'Meelad Rulebook 2026', category: 'Rules', url: 'https://example.com/rulebook.pdf' },
    { id: 2, title: 'Stage Schedule PDF', category: 'Schedule', url: 'https://example.com/schedule.pdf' },
  ]);
  const [downloadForm, setDownloadForm] = useState({
    title: '',
    category: 'Schedule',
    url: '',
  });

  // --- Danger Zone State ---
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Handlers
  const handleSaveLimits = (e) => {
    e.preventDefault();
    alert('System control limits saved successfully!');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.username) return;
    const newUser = {
      id: Date.now(),
      name: userForm.name,
      username: userForm.username,
      role: userForm.role,
      team: userForm.team,
      status: 'Active',
    };
    setUsers([...users, newUser]);
    setUserForm({ name: '', username: '', password: '', role: 'Team Leader', team: 'Team Alpha' });
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.title) return;
    setAnnouncements([{ id: Date.now(), ...announcementForm }, ...announcements]);
    setAnnouncementForm({ title: '', description: '', status: 'Published' });
  };

  const handleAddDownload = (e) => {
    e.preventDefault();
    if (!downloadForm.title || !downloadForm.url) return;
    setDownloads([{ id: Date.now(), ...downloadForm }, ...downloads]);
    setDownloadForm({ title: '', category: 'Schedule', url: '' });
  };

  const handleResetData = (e) => {
    e.preventDefault();
    if (resetConfirmText === 'RESET ILMUL RASOOL') {
      setResetSuccessMessage('Event data cleared successfully. System has been reset.');
      setResetConfirmText('');
    } else {
      alert('Please type "RESET ILMUL RASOOL" exactly to confirm.');
    }
  };

  const tabs = [
    { name: 'Limits', icon: '🎛️' },
    { name: 'Users', icon: '👤' },
    { name: 'Announcements', icon: '📢' },
    { name: 'Downloads', icon: '📥' },
    { name: 'Danger zone', icon: '⚠️', isDanger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-600">System Control</span>
        <h1 className="text-3xl font-bold text-slate-800">Controls</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="glass p-2 rounded-2xl flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === tab.name
                ? tab.isDanger
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : tab.isDanger
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* --- TAB 1: LIMITS --- */}
      {activeTab === 'Limits' && (
        <form onSubmit={handleSaveLimits} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Registration Status */}
          <div className="glass p-6 rounded-3xl space-y-4 lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-slate-800">Registration status</h2>
            <p className="text-slate-500 text-xs">Allow team leaders to create and edit registrations.</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${registrationOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {registrationOpen ? 'OPEN' : 'CLOSED'}
              </span>
              <button
                type="button"
                onClick={() => setRegistrationOpen(!registrationOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${registrationOpen ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                {registrationOpen ? 'Close Registration' : 'Open Registration'}
              </button>
            </div>
          </div>

          {/* Right: Limits Settings */}
          <div className="glass p-6 rounded-3xl space-y-6 lg:col-span-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Category-wise programme limits</h2>
              <div className="space-y-3">
                {categoryLimits.map((item, index) => (
                  <div key={item.category} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-800 text-sm w-32">{item.category}</span>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stage</label>
                        <input
                          type="number"
                          value={item.stage}
                          onChange={(e) => {
                            const newLimits = [...categoryLimits];
                            newLimits[index].stage = Number(e.target.value);
                            setCategoryLimits(newLimits);
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 text-center font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Off-stage</label>
                        <input
                          type="number"
                          value={item.offstage}
                          onChange={(e) => {
                            const newLimits = [...categoryLimits];
                            newLimits[index].offstage = Number(e.target.value);
                            setCategoryLimits(newLimits);
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 text-center font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">General programme limits</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stage individual</label>
                  <input
                    type="number"
                    value={generalLimits.stageIndividual}
                    onChange={(e) => setGeneralLimits({ ...generalLimits, stageIndividual: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stage group</label>
                  <input
                    type="number"
                    value={generalLimits.stageGroup}
                    onChange={(e) => setGeneralLimits({ ...generalLimits, stageGroup: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Off-stage individual</label>
                  <input
                    type="number"
                    value={generalLimits.offstageIndividual}
                    onChange={(e) => setGeneralLimits({ ...generalLimits, offstageIndividual: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Off-stage group</label>
                  <input
                    type="number"
                    value={generalLimits.offstageGroup}
                    onChange={(e) => setGeneralLimits({ ...generalLimits, offstageGroup: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
            >
              💾 Save controls
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: USERS --- */}
      {activeTab === 'Users' && (
        <div className="space-y-6">
          {/* Create login user form */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Create login user</h2>
            <p className="text-slate-500 text-xs">Users can sign in without an email address.</p>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
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
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  + Create user
                </button>
              </div>
            </form>
          </div>

          {/* List of Users */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{u.name}</h4>
                    <p className="text-xs text-slate-500">@{u.username} • <span className="font-semibold text-purple-600">{u.role}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                    Edit
                  </button>
                  <button className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg">
                    Disable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: ANNOUNCEMENTS --- */}
      {activeTab === 'Announcements' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Add announcement</h2>
            <p className="text-slate-500 text-xs">Published announcements appear on the public home page.</p>

            <form onSubmit={handleAddAnnouncement} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Change"
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
                  + Add
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{a.description || 'No description provided.'}</p>
                </div>
                <button
                  onClick={() => setAnnouncements(announcements.filter((item) => item.id !== a.id))}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: DOWNLOADS --- */}
      {activeTab === 'Downloads' && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Add download link</h2>
            <p className="text-slate-500 text-xs">Use a public Google Drive or direct PDF link.</p>

            <form onSubmit={handleAddDownload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule PDF"
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
                  + Add
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {downloads.map((d) => (
              <div key={d.id} className="glass p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">{d.title}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{d.category}</span>
                  </div>
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                    {d.url}
                  </a>
                </div>
                <button
                  onClick={() => setDownloads(downloads.filter((item) => item.id !== d.id))}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: DANGER ZONE --- */}
      {activeTab === 'Danger zone' && (
        <div className="glass p-8 rounded-3xl border border-rose-200 bg-rose-50/20 space-y-6">
          <div className="flex items-start gap-4">
            <span className="p-3 bg-rose-100 text-rose-600 rounded-2xl text-xl">⚠️</span>
            <div>
              <h2 className="text-xl font-bold text-rose-900">Clear test and event data</h2>
              <p className="text-rose-700 text-sm mt-1">
                This permanently deletes students, programmes, programme selections, code-letter assignments, results and saved schedules.
              </p>
              <p className="text-xs font-bold text-rose-800 mt-2">Teams, categories, users and limits will remain.</p>
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
              🗑️ Clear event data
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
