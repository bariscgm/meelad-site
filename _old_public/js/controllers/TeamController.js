/**
 * TeamController.js - Handles Team Portal login, candidate registration, and view interactions
 */

import { TeamView } from '../views/TeamView.js';
import { ModalView } from '../views/ModalView.js';

export class TeamController {
  constructor(appController) {
    this.app = appController;
  }

  render(container) {
    TeamView.render(container, this.app.dataStore, this.app.stateManager.session);
    this.bindEvents(container);
  }

  bindEvents(container) {
    const loginForm = container.querySelector('#team-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const teamId = container.querySelector('#team-select-input').value;
        const passkey = container.querySelector('#team-passkey-input').value;
        if (this.app.authController.handleTeamLogin(teamId, passkey)) {
          this.render(container);
          this.app.renderHeader();
        }
      });
      return;
    }

    const openCandBtn = container.querySelector('#open-team-add-candidate-modal');
    if (openCandBtn) {
      openCandBtn.addEventListener('click', () => {
        const user = this.app.stateManager.session.user;
        const team = this.app.dataStore.getTeamById(user.id || user.code);
        if (team) {
          ModalView.openAddCandidateModal(this.app.modalRoot, this.app.dataStore, team.id);
          this.bindAddCandidateForm(team.id);
        }
      });
    }
  }

  bindAddCandidateForm(teamId) {
    this.app.bindModalEvents();
    const form = this.app.modalRoot.querySelector('#modal-add-candidate-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const chestNo = this.app.modalRoot.querySelector('#cand-chest-input').value.trim();
        const name = this.app.modalRoot.querySelector('#cand-name-input').value;
        const category = this.app.modalRoot.querySelector('#cand-category-input').value;

        const checkboxes = this.app.modalRoot.querySelectorAll('input[name="cand_program"]:checked');
        const enrolledProgramIds = Array.from(checkboxes).map(cb => cb.value);

        const cand = this.app.dataStore.addCandidate({
          chestNo,
          name,
          teamId,
          category,
          enrolledProgramIds
        });

        this.app.showToast(`Candidate ${cand.name} (${cand.chestNo}) registered successfully for your team!`, 'success');
        ModalView.closeModal(this.app.modalRoot);
        this.render(this.app.appRoot);
      });
    }
  }
}
