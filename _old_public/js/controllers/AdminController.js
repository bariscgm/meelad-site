/**
 * AdminController.js - Handles Admin management actions and Mark Publishing controls
 */

import { AdminView } from '../views/AdminView.js';
import { ModalView } from '../views/ModalView.js';

export class AdminController {
  constructor(appController) {
    this.app = appController;
    this.activeTab = 'publishing';
  }

  render(container) {
    AdminView.render(container, this.app.dataStore, this.app.stateManager.session, this.activeTab);
    this.bindEvents(container);
  }

  bindEvents(container) {
    // Admin Login Form
    const loginForm = container.querySelector('#admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = container.querySelector('#admin-passcode-input').value;
        if (this.app.authController.handleAdminLogin(code)) {
          this.render(container);
          this.app.renderHeader();
        }
      });
      return;
    }

    // Admin Logout
    const logoutBtn = container.querySelector('#admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.app.authController.handleLogout();
        this.render(container);
        this.app.renderHeader();
      });
    }

    // Clear All Data
    const clearBtn = container.querySelector('#admin-clear-data-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL teams, candidates, programs, and marks? This will give you a completely clean state for live event use.')) {
          this.app.dataStore.clearAllData();
          this.app.showToast('All dummy data cleared! Ready for live event.', 'success');
          this.render(container);
        }
      });
    }

    // Load Demo Data
    const demoBtn = container.querySelector('#admin-demo-data-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (confirm('Load sample demo data for testing?')) {
          this.app.dataStore.loadDemoData();
          this.app.showToast('Loaded sample demo data.', 'info');
          this.render(container);
        }
      });
    }

    // Navigation Tabs
    const tabPublishing = container.querySelector('#admin-tab-publishing');
    const tabPrograms = container.querySelector('#admin-tab-programs');
    const tabTeams = container.querySelector('#admin-tab-teams');
    const tabJudges = container.querySelector('#admin-tab-judges');

    if (tabPublishing) tabPublishing.addEventListener('click', () => { this.activeTab = 'publishing'; this.render(container); });
    if (tabPrograms) tabPrograms.addEventListener('click', () => { this.activeTab = 'programs'; this.render(container); });
    if (tabTeams) tabTeams.addEventListener('click', () => { this.activeTab = 'teams'; this.render(container); });
    if (tabJudges) tabJudges.addEventListener('click', () => { this.activeTab = 'judges'; this.render(container); });

    // Mark Publishing Toggles
    container.querySelectorAll('.toggle-publish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-program-id');
        const prog = this.app.dataStore.getProgramById(progId);
        const newState = !prog.published;
        this.app.dataStore.toggleProgramPublishing(progId, newState);
        this.app.showToast(
          newState ? `Marks for ${prog.name} are now PUBLISHED!` : `Marks for ${prog.name} UNPUBLISHED.`,
          newState ? 'success' : 'warning'
        );
        this.render(container);
      });
    });

    // View Tabulation Sheet
    container.querySelectorAll('.view-tabulation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const progId = btn.getAttribute('data-program-id');
        ModalView.openTabulationModal(this.app.modalRoot, this.app.dataStore, progId);
        this.app.bindModalEvents();
      });
    });

    // Open Modals
    const openProgBtn = container.querySelector('#open-add-program-modal');
    if (openProgBtn) {
      openProgBtn.addEventListener('click', () => {
        ModalView.openAddProgramModal(this.app.modalRoot, this.app.dataStore);
        this.bindAddProgramForm();
      });
    }

    const openTeamBtn = container.querySelector('#open-add-team-modal');
    if (openTeamBtn) {
      openTeamBtn.addEventListener('click', () => {
        ModalView.openAddTeamModal(this.app.modalRoot);
        this.bindAddTeamForm();
      });
    }

    const openCandBtn = container.querySelector('#open-add-candidate-modal');
    if (openCandBtn) {
      openCandBtn.addEventListener('click', () => {
        ModalView.openAddCandidateModal(this.app.modalRoot, this.app.dataStore);
        this.bindAddCandidateForm();
      });
    }
  }

  bindAddProgramForm() {
    this.app.bindModalEvents();
    const form = this.app.modalRoot.querySelector('#modal-add-program-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = this.app.modalRoot.querySelector('#prog-title-input').value;
        const category = this.app.modalRoot.querySelector('#prog-category-input').value;
        const stageId = this.app.modalRoot.querySelector('#prog-stage-input').value;
        const maxMarks = Number(this.app.modalRoot.querySelector('#prog-max-marks-input').value);

        this.app.dataStore.addProgram({
          name: title,
          category: category,
          stageId: stageId,
          maxMarks: maxMarks,
          criteria: [
            { name: 'Performance & Skill', max: Math.round(maxMarks * 0.4) },
            { name: 'Diction & Quality', max: Math.round(maxMarks * 0.3) },
            { name: 'Presentation', max: Math.round(maxMarks * 0.3) }
          ]
        });

        this.app.showToast(`Program "${title}" added successfully!`, 'success');
        ModalView.closeModal(this.app.modalRoot);
        this.render(this.app.appRoot);
      });
    }
  }

  bindAddTeamForm() {
    this.app.bindModalEvents();
    const form = this.app.modalRoot.querySelector('#modal-add-team-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = this.app.modalRoot.querySelector('#team-code-input').value.toUpperCase().trim();
        const name = this.app.modalRoot.querySelector('#team-name-input').value;
        const institution = this.app.modalRoot.querySelector('#team-institution-input').value;
        const passkey = this.app.modalRoot.querySelector('#team-passkey-create-input').value;

        this.app.dataStore.addTeam({ code, name, institution, passkey });
        this.app.showToast(`Team "${name}" registered successfully!`, 'success');
        ModalView.closeModal(this.app.modalRoot);
        this.render(this.app.appRoot);
      });
    }
  }

  bindAddCandidateForm() {
    this.app.bindModalEvents();
    const form = this.app.modalRoot.querySelector('#modal-add-candidate-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const chestNo = this.app.modalRoot.querySelector('#cand-chest-input').value.trim();
        const name = this.app.modalRoot.querySelector('#cand-name-input').value;
        const teamSelect = this.app.modalRoot.querySelector('#cand-team-input');
        const teamHidden = this.app.modalRoot.querySelector('#cand-team-hidden');
        const teamId = teamHidden ? teamHidden.value : teamSelect.value;
        const category = this.app.modalRoot.querySelector('#cand-category-input').value;

        const checkboxes = this.app.modalRoot.querySelectorAll('input[name="cand_program"]:checked');
        const enrolledProgramIds = Array.from(checkboxes).map(cb => cb.value);

        const cand = this.app.dataStore.addCandidate({ chestNo, name, teamId, category, enrolledProgramIds });
        this.app.showToast(`Candidate ${cand.name} (${cand.chestNo}) registered!`, 'success');
        ModalView.closeModal(this.app.modalRoot);
        this.render(this.app.appRoot);
      });
    }
  }
}
