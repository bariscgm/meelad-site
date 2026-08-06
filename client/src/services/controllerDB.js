/**
 * controllerDB.js - MongoDB Atlas & Local Persistent Connection Service for Controller Management
 * Connects directly to MongoDB Atlas cluster (meeladpro.eg7lsk6.mongodb.net) via Express API
 */

const API_BASE_URL = '/api/controller';

const STORAGE_KEYS = {
  LIMITS: 'ilmul_rasool_db_limits',
  USERS: 'ilmul_rasool_db_users',
  ANNOUNCEMENTS: 'ilmul_rasool_db_announcements',
  DOWNLOADS: 'ilmul_rasool_db_downloads',
};

const DEFAULT_LIMITS = {
  registrationOpen: true,
  categoryLimits: [
    { category: 'For person', count: 3 },
    { category: 'General', count: 2 },
  ],
};

const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Ilmul Rasool Admin', username: 'admin', role: 'Admin', team: 'All Teams', status: 'Active', createdAt: new Date().toISOString() }
];

export const controllerDB = {
  // --- LIMITS ---
  getLimits: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIMITS);
      return data ? JSON.parse(data) : DEFAULT_LIMITS;
    } catch (e) {
      return DEFAULT_LIMITS;
    }
  },

  saveLimits: (limitsData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(limitsData));
      // Sync to MongoDB Server
      fetch(`${API_BASE_URL}/limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limitsData),
      }).catch(() => {});
      return { success: true, limits: limitsData };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // --- USERS ---
  getUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  addUser: (userObj) => {
    try {
      const currentUsers = controllerDB.getUsers();
      const newUser = {
        id: `usr-${Date.now()}`,
        name: userObj.name,
        username: userObj.username.toLowerCase().trim(),
        password: userObj.password,
        role: userObj.role || 'Team Leader',
        team: userObj.team || 'Unassigned',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };
      const updated = [newUser, ...currentUsers];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

      // Sync to MongoDB Server
      fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch(() => {});

      return { success: true, user: newUser, users: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  toggleUserStatus: (userId) => {
    try {
      const currentUsers = controllerDB.getUsers();
      const updated = currentUsers.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } : u
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      return { success: true, users: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  deleteUser: (userId) => {
    try {
      const currentUsers = controllerDB.getUsers();
      const updated = currentUsers.filter((u) => u.id !== userId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

      fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' }).catch(() => {});

      return { success: true, users: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addAnnouncement: (announcementObj) => {
    try {
      const current = controllerDB.getAnnouncements();
      const newAnn = {
        id: `ann-${Date.now()}`,
        title: announcementObj.title,
        description: announcementObj.description,
        status: announcementObj.status || 'Published',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updated = [newAnn, ...current];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));

      fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn),
      }).catch(() => {});

      return { success: true, announcement: newAnn, announcements: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  deleteAnnouncement: (annId) => {
    try {
      const current = controllerDB.getAnnouncements();
      const updated = current.filter((a) => a.id !== annId);
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));

      fetch(`${API_BASE_URL}/announcements/${annId}`, { method: 'DELETE' }).catch(() => {});

      return { success: true, announcements: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // --- DOWNLOADS ---
  getDownloads: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addDownload: (downloadObj) => {
    try {
      const current = controllerDB.getDownloads();
      const newDown = {
        id: `down-${Date.now()}`,
        title: downloadObj.title,
        category: downloadObj.category || 'Rules',
        url: downloadObj.url,
        uploadedAt: new Date().toLocaleDateString(),
      };
      const updated = [newDown, ...current];
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(updated));

      fetch(`${API_BASE_URL}/downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDown),
      }).catch(() => {});

      return { success: true, download: newDown, downloads: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  deleteDownload: (downId) => {
    try {
      const current = controllerDB.getDownloads();
      const updated = current.filter((d) => d.id !== downId);
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(updated));

      fetch(`${API_BASE_URL}/downloads/${downId}`, { method: 'DELETE' }).catch(() => {});

      return { success: true, downloads: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // --- RESET DB ---
  resetAllDatabaseData: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(DEFAULT_LIMITS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));

      fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'RESET ILMUL RASOOL' }),
      }).catch(() => {});

      return { success: true, message: 'All controller database records have been reset.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};
