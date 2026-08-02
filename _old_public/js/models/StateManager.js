/**
 * StateManager.js - Manages Session Authentication & Route States
 */

export class StateManager {
  constructor() {
    this.sessionKey = 'meelad_session_v1';
    this.session = this.loadSession();
  }

  loadSession() {
    const saved = sessionStorage.getItem(this.sessionKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error reading session data', e);
      }
    }
    return {
      role: 'PUBLIC', // PUBLIC | ADMIN | TEAM | JUDGE | STAGE
      user: null
    };
  }

  setSession(role, user = null) {
    this.session = { role, user };
    sessionStorage.setItem(this.sessionKey, JSON.stringify(this.session));
  }

  clearSession() {
    this.session = { role: 'PUBLIC', user: null };
    sessionStorage.removeItem(this.sessionKey);
  }

  getRole() { return this.session.role; }
  getUser() { return this.session.user; }
  isAuthenticated() { return this.session.role !== 'PUBLIC'; }
}
