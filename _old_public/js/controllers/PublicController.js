/**
 * PublicController.js - Handles Public view events (filter selections, search inputs, scorecard modals)
 */

import { PublicView } from '../views/PublicView.js';
import { ModalView } from '../views/ModalView.js';

export class PublicController {
  constructor(appController) {
    this.app = appController;
    this.activeTab = 'scoreboard';
    this.filters = {
      categoryFilter: 'ALL',
      programFilter: 'ALL',
      searchQuery: ''
    };
  }

  render(container) {
    PublicView.render(container, this.app.dataStore, this.activeTab, this.filters);
    this.bindEvents(container);
  }

  bindEvents(container) {
    // Tabs
    const tabMarks = container.querySelector('#public-tab-marks');
    const tabLeaderboard = container.querySelector('#public-tab-leaderboard');
    const tabStages = container.querySelector('#public-tab-stages');

    if (tabMarks) {
      tabMarks.addEventListener('click', () => {
        this.activeTab = 'scoreboard';
        this.render(container);
      });
    }
    if (tabLeaderboard) {
      tabLeaderboard.addEventListener('click', () => {
        this.activeTab = 'leaderboard';
        this.render(container);
      });
    }
    if (tabStages) {
      tabStages.addEventListener('click', () => {
        this.activeTab = 'stages';
        this.render(container);
      });
    }

    // Filters
    const catSelect = container.querySelector('#filter-category');
    const progSelect = container.querySelector('#filter-program');
    const searchInput = container.querySelector('#search-input');

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.filters.categoryFilter = e.target.value;
        this.render(container);
      });
    }

    if (progSelect) {
      progSelect.addEventListener('change', (e) => {
        this.filters.programFilter = e.target.value;
        this.render(container);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.searchQuery = e.target.value;
        this.render(container);
      });
    }

    // Scorecard view buttons
    container.querySelectorAll('.view-scorecard-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chest = btn.getAttribute('data-chest');
        const prog = btn.getAttribute('data-program');
        ModalView.openScorecard(this.app.modalRoot, this.app.dataStore, chest, prog);
        this.app.bindModalEvents();
      });
    });
  }
}
