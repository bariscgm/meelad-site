/**
 * JudgeController.js - Handles Judge Portal scoring inputs, slider calculation & locking
 */

import { JudgeView } from '../views/JudgeView.js';

export class JudgeController {
  constructor(appController) {
    this.app = appController;
    this.selectedProgramId = null;
    this.selectedChestNo = null;
  }

  render(container) {
    JudgeView.render(container, this.app.dataStore, this.app.stateManager.session, this.selectedProgramId, this.selectedChestNo);
    this.bindEvents(container);
  }

  bindEvents(container) {
    // Judge Login Form
    const loginForm = container.querySelector('#judge-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = container.querySelector('#judge-code-input').value;
        const passkey = container.querySelector('#judge-passkey-input').value;
        if (this.app.authController.handleJudgeLogin(code, passkey)) {
          this.render(container);
          this.app.renderHeader();
        }
      });
      return;
    }

    // Logout
    const logoutBtn = container.querySelector('#judge-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.app.authController.handleLogout();
        this.render(container);
        this.app.renderHeader();
      });
    }

    // Session Program & Candidate Selectors
    const progSelect = container.querySelector('#judge-program-select');
    const candSelect = container.querySelector('#judge-candidate-select');

    if (progSelect) {
      progSelect.addEventListener('change', (e) => {
        this.selectedProgramId = e.target.value;
        this.selectedChestNo = null; // reset candidate selection
        this.render(container);
      });
    }

    if (candSelect) {
      candSelect.addEventListener('change', (e) => {
        this.selectedChestNo = e.target.value;
        this.render(container);
      });
    }

    // Sliders Live Update Listener
    const sliders = container.querySelectorAll('.criteria-range-slider');
    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        const displayId = slider.getAttribute('data-display-id');
        const max = slider.getAttribute('max');
        const disp = container.querySelector(`#${displayId}`);
        if (disp) disp.textContent = `${slider.value} / ${max}`;
        this.calculateLiveTotal(container);
      });
    });

    // Scoring Form Submit
    const scoringForm = container.querySelector('#judge-scoring-form');
    if (scoringForm) {
      scoringForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const programId = container.querySelector('#judge-program-id').value;
        const chestNo = container.querySelector('#judge-chest-no').value;
        const judgeId = container.querySelector('#judge-id-hidden').value;

        const criteriaScores = {};
        container.querySelectorAll('.criteria-range-slider').forEach(s => {
          const key = s.name.replace('criteria_', '');
          criteriaScores[key] = Number(s.value);
        });

        this.app.dataStore.saveJudgeMark({
          programId,
          chestNo,
          judgeId,
          criteriaScores
        });

        this.app.showToast(`Locked & Saved scores for ${chestNo}!`, 'success');
        this.render(container);
      });
    }
  }

  calculateLiveTotal(container) {
    let total = 0;
    container.querySelectorAll('.criteria-range-slider').forEach(s => {
      total += Number(s.value);
    });

    const totalDisp = container.querySelector('#live-total-score');
    if (totalDisp) {
      const maxText = totalDisp.textContent.split('/')[1] || '100';
      totalDisp.textContent = `${total} /${maxText}`;
    }

    const gradeDisp = container.querySelector('#live-grade-preview');
    if (gradeDisp) {
      let grade = 'C';
      if (total >= 85) grade = 'A';
      else if (total >= 65) grade = 'B';

      gradeDisp.innerHTML = `
        <span class="grade-pill grade-${grade}" style="font-size: 1.1rem; padding: 0.5rem 1.25rem;">
          ${grade} Grade
        </span>
      `;
    }
  }
}
