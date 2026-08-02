/**
 * HeaderView.js - Renders Top Navigation Bar with active tab indicators and auth state
 */

export class HeaderView {
  static render(container, activeRoute, session) {
    const role = session.role;
    const user = session.user;

    container.innerHTML = `
      <div class="nav-wrapper">
        <a href="#home" class="brand-logo">
          <div class="logo-badge">MF</div>
          <div>
            <div>Meelad Fest 2026</div>
            <div style="font-size: 0.72rem; font-weight: 500; color: var(--text-muted);">Cultural Competition Portal</div>
          </div>
        </a>

        <ul class="nav-links">
          <li>
            <a href="#home" class="nav-link ${activeRoute === 'home' || activeRoute === '' ? 'active' : ''}">
              🏠 Home
            </a>
          </li>
          <li>
            <a href="#results" class="nav-link ${activeRoute === 'results' ? 'active' : ''}">
              🏆 Live Scoreboard
            </a>
          </li>

          <!-- Role-Based Navigation Links -->
          <li>
            <a href="#admin" class="nav-link ${activeRoute === 'admin' ? 'active' : ''}">
              🔐 Admin Portal
            </a>
          </li>
          <li>
            <a href="#team" class="nav-link ${activeRoute === 'team' ? 'active' : ''}">
              👥 Team Portal
            </a>
          </li>
          <li>
            <a href="#judge" class="nav-link ${activeRoute === 'judge' ? 'active' : ''}">
              ⚖️ Judge Portal
            </a>
          </li>
          <li>
            <a href="#stage" class="nav-link ${activeRoute === 'stage' ? 'active' : ''}">
              🎙️ Stage Access
            </a>
          </li>
          <li>
            <a href="#led" target="_blank" class="nav-link" style="color: var(--gold); border: 1px dashed rgba(245, 158, 11, 0.4);">
              📺 LED Screen Mode
            </a>
          </li>
        </ul>

        <div class="nav-auth-info">
          ${role !== 'PUBLIC' ? `
            <div class="user-badge">
              <span>●</span> ${role}: ${user ? (user.name || user.code) : 'Active'}
            </div>
            <button id="nav-logout-btn" class="btn btn-secondary btn-sm">Logout</button>
          ` : `
            <a href="#admin" class="btn btn-primary btn-sm">Sign In</a>
          `}
        </div>
      </div>
    `;
  }
}
