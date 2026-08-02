/**
 * router.js - Lightweight SPA Hash Router
 */

export class Router {
  constructor(routes) {
    this.routes = routes;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const routeHandler = this.routes[hash] || this.routes['home'];
    if (routeHandler) {
      routeHandler(hash);
    }
  }
}
