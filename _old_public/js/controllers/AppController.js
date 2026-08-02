/**
 * AppController.js - Main Application Orchestrator
 */

import { DataStore } from '../models/DataStore.js';
import { StateManager } from '../models/StateManager.js';
import { HeaderView } from '../views/HeaderView.js';
import { ModalView } from '../views/ModalView.js';
import { AuthController } from './AuthController.js';
import { PublicController } from './PublicController.js';
import { AdminController } from './AdminController.js';
import { TeamController } from './TeamController.js';
import { JudgeController } from './JudgeController.js';
import { StageController } from './StageController.js';
import { Router } from '../router.js';

export class AppController {
  constructor() {
    this.dataStore = new DataStore();
    this.stateManager = new StateManager();

    this.headerRoot = document.getElementById('header-root');
    this.appRoot = document.getElementById('app-root');
    this.modalRoot = document.getElementById('modal-root');
    this.toastContainer = document.getElementById('toast-container');

    this.authController = new AuthController(this.dataStore, this.stateManager, (msg, type) => this.showToast(msg, type));
    this.publicController = new PublicController(this);
    this.adminController = new AdminController(this);
    this.teamController = new TeamController(this);
    this.judgeController = new JudgeController(this);
    this.stageController = new StageController(this);

    this.currentRoute = 'home';

    // Subscribe to DataStore reactive updates
    this.dataStore.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  init() {
    this.setupRouter();
    this.renderHeader();
  }

  setupRouter() {
    const routes = {
      'home': () => this.navigateTo('home'),
      'results': () => this.navigateTo('results'),
      'admin': () => this.navigateTo('admin'),
      'team': () => this.navigateTo('team'),
      'judge': () => this.navigateTo('judge'),
      'stage': () => this.navigateTo('stage'),
      'led': () => this.navigateTo('led')
    };

    this.router = new Router(routes);
    this.router.init();
  }

  navigateTo(route) {
    this.currentRoute = route;
    this.renderHeader();

    if (route === 'led') {
      this.headerRoot.style.display = 'none';
      this.stageController.renderLED(this.appRoot);
      return;
    } else {
      this.headerRoot.style.display = 'block';
    }

    switch (route) {
      case 'home':
        this.publicController.activeTab = 'scoreboard';
        this.publicController.render(this.appRoot);
        break;
      case 'results':
        this.publicController.activeTab = 'scoreboard';
        this.publicController.render(this.appRoot);
        break;
      case 'admin':
        this.adminController.render(this.appRoot);
        break;
      case 'team':
        this.teamController.render(this.appRoot);
        break;
      case 'judge':
        this.judgeController.render(this.appRoot);
        break;
      case 'stage':
        this.stageController.renderConsole(this.appRoot);
        break;
      default:
        this.publicController.render(this.appRoot);
        break;
    }
  }

  refreshCurrentView() {
    this.navigateTo(this.currentRoute);
  }

  renderHeader() {
    HeaderView.render(this.headerRoot, this.currentRoute, this.stateManager.session);
    const logoutBtn = this.headerRoot.querySelector('#nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authController.handleLogout();
        this.refreshCurrentView();
      });
    }
  }

  bindModalEvents() {
    this.modalRoot.onclick = (e) => {
      if (e.target === this.modalRoot || e.target.closest('.modal-close') || e.target.closest('.modal-close-btn')) {
        ModalView.closeModal(this.modalRoot);
      }
    };
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}
