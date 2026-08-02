/**
 * AuthController.js - Handles Login, Passcode Checks, and Logout for Admin, Team, Judge roles
 */

export class AuthController {
  constructor(dataStore, stateManager, showToast) {
    this.dataStore = dataStore;
    this.stateManager = stateManager;
    this.showToast = showToast;
  }

  handleAdminLogin(passcode) {
    const config = this.dataStore.getSystemConfig();
    if (passcode === config.adminPasscode) {
      this.stateManager.setSession('ADMIN', { name: 'System Administrator' });
      this.showToast('Logged in as Admin successfully!', 'success');
      return true;
    } else {
      this.showToast('Invalid Admin Passcode!', 'error');
      return false;
    }
  }

  handleTeamLogin(teamId, passkey) {
    const team = this.dataStore.getTeamById(teamId);
    if (team && team.passkey === passkey) {
      this.stateManager.setSession('TEAM', { id: team.id, code: team.code, name: team.name });
      this.showToast(`Logged in to Team Portal: ${team.name}`, 'success');
      return true;
    } else {
      this.showToast('Invalid Team Security PIN!', 'error');
      return false;
    }
  }

  handleJudgeLogin(judgeCode, passkey) {
    const judge = this.dataStore.getJudgeByCode(judgeCode);
    if (judge && judge.passkey === passkey) {
      this.stateManager.setSession('JUDGE', { id: judge.id, code: judge.code, name: judge.name });
      this.showToast(`Logged in as Judge: ${judge.name}`, 'success');
      return true;
    } else {
      this.showToast('Invalid Judge PIN Passkey!', 'error');
      return false;
    }
  }

  handleLogout() {
    this.stateManager.clearSession();
    this.showToast('Logged out successfully.', 'info');
  }
}
