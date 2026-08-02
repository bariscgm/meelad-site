/**
 * StageController.js - Handles Stage Manager actions and Big Screen LED Mode
 */

import { StageView } from '../views/StageView.js';

export class StageController {
  constructor(appController) {
    this.app = appController;
    this.activeStageId = 'S1';
  }

  renderConsole(container) {
    StageView.renderConsole(container, this.app.dataStore, this.activeStageId);
    this.bindConsoleEvents(container);
  }

  renderLED(container) {
    StageView.renderLED(container, this.app.dataStore);
  }

  bindConsoleEvents(container) {
    // Stage Selector Tabs
    container.querySelectorAll('.stage-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStageId = btn.getAttribute('data-stage-id');
        this.renderConsole(container);
      });
    });

    // Call to stage button
    const callBtn = container.querySelector('#call-to-stage-btn');
    if (callBtn) {
      callBtn.addEventListener('click', () => {
        const stageId = callBtn.getAttribute('data-stage-id');
        const chestNo = container.querySelector('#call-candidate-select').value;
        if (!chestNo) {
          this.app.showToast('Please select a candidate chest number first!', 'warning');
          return;
        }
        this.app.dataStore.updateStageCurrentPerformer(stageId, chestNo);
        this.app.showToast(`Called candidate ${chestNo} to Stage!`, 'success');
        this.renderConsole(container);
      });
    }

    // Quick call buttons in table
    container.querySelectorAll('.quick-call-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stageId = btn.getAttribute('data-stage-id');
        const chestNo = btn.getAttribute('data-chest');
        this.app.dataStore.updateStageCurrentPerformer(stageId, chestNo);
        this.app.showToast(`Called candidate ${chestNo} to Stage!`, 'success');
        this.renderConsole(container);
      });
    });

    // Clear stage button
    const clearBtn = container.querySelector('#clear-stage-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const stageId = clearBtn.getAttribute('data-stage-id');
        this.app.dataStore.updateStageCurrentPerformer(stageId, null);
        this.app.showToast('Stage cleared.', 'info');
        this.renderConsole(container);
      });
    }

    // Stage Program select
    const progSelect = container.querySelector('#stage-program-select');
    if (progSelect) {
      progSelect.addEventListener('change', (e) => {
        const stageId = progSelect.getAttribute('data-stage-id');
        const programId = e.target.value;
        const stage = this.app.dataStore.getStageById(stageId);
        if (stage) {
          stage.currentProgramId = programId;
          this.app.dataStore.saveState();
          this.renderConsole(container);
        }
      });
    }
  }
}
