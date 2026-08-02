/**
 * app.js - Main Application Entrypoint Bootstrap
 */

import { AppController } from './controllers/AppController.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
  window.meeladApp = app; // Expose globally for debugging
});
