/**
 * AdminView.js - Renders Admin Access Portal (Programs, Teams, Judges, Mark Tabulation & Publishing Control)
 */

export class AdminView {
  static render(container, dataStore, session, activeTab = 'publishing') {
    if (session.role !== 'ADMIN') {
      this.renderLoginForm(container);
      return;
    }

    const programs = dataStore.getPrograms();
    const teams = dataStore.getTeams();
    const candidates = dataStore.getCandidates();
    const judges = dataStore.getJudges();
    const marks = dataStore.getMarks();

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-weight: 800; font-size: 2rem;">🔐 Admin Control Center</h1>
          <p style="color: var(--text-muted);">Manage programs, candidates, judge credentials, tabulate scores, and control public mark publishing.</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="admin-clear-data-btn" class="btn btn-danger btn-sm">🗑️ Clear All Data</button>
          <button id="admin-demo-data-btn" class="btn btn-secondary btn-sm">🔄 Load Sample Demo Data</button>
          <button id="admin-logout-btn" class="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button id="admin-tab-publishing" class="btn ${activeTab === 'publishing' ? 'btn-primary' : 'btn-secondary'}">
          📢 Mark Review & Publishing (${programs.filter(p=>p.published).length}/${programs.length})
        </button>
        <button id="admin-tab-programs" class="btn ${activeTab === 'programs' ? 'btn-primary' : 'btn-secondary'}">
          📋 Programs & Items (${programs.length})
        </button>
        <button id="admin-tab-teams" class="btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}">
          👥 Teams (${teams.length}) & Candidates (${candidates.length})
        </button>
        <button id="admin-tab-judges" class="btn ${activeTab === 'judges' ? 'btn-primary' : 'btn-secondary'}">
          ⚖️ Judge Access Keys (${judges.length})
        </button>
      </div>

      ${activeTab === 'publishing' ? `
        <!-- MARK PUBLISHING & TABULATION HUB -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <h2 class="card-title">📢 Program-Wise Mark Publishing & Approval</h2>
            <div style="color: var(--text-muted); font-size: 0.9rem;">Toggle switches to publish live marks on the Public Scoreboard</div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Category</th>
                  <th>Stage</th>
                  <th>Scores Entered</th>
                  <th>Status</th>
                  <th>Public Publishing</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${programs.map(p => {
                  const pMarks = marks.filter(m => m.programId === p.id);
                  const stage = dataStore.getStageById(p.stageId);
                  return `
                    <tr>
                      <td style="font-weight: 700; font-size: 1.05rem;">${p.name}</td>
                      <td><span class="badge badge-stage">${p.category}</span></td>
                      <td>${stage ? stage.name : 'Unassigned'}</td>
                      <td style="font-weight: 800; color: var(--gold);">${pMarks.length} Candidates Judged</td>
                      <td>
                        <span class="badge ${p.published ? 'badge-published' : 'badge-pending'}">
                          ${p.published ? 'PUBLISHED' : 'DRAFT / UNPUBLISHED'}
                        </span>
                      </td>
                      <td>
                        <button class="btn ${p.published ? 'btn-danger' : 'btn-primary'} btn-sm toggle-publish-btn" data-program-id="${p.id}">
                          ${p.published ? 'Unpublish Marks' : 'Publish Marks Now'}
                        </button>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm view-tabulation-btn" data-program-id="${p.id}">
                          🔍 Tabulation Sheet
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${activeTab === 'programs' ? `
        <!-- PROGRAMS MANAGEMENT -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📋 Competition Programs</h2>
            <button id="open-add-program-modal" class="btn btn-primary btn-sm">+ Add New Program</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Program Code</th>
                  <th>Program Title</th>
                  <th>Category</th>
                  <th>Stage</th>
                  <th>Max Marks</th>
                  <th>Evaluation Criteria Breakdown</th>
                </tr>
              </thead>
              <tbody>
                ${programs.map(p => `
                  <tr>
                    <td style="font-weight: 800; color: var(--primary);">${p.id}</td>
                    <td style="font-weight: 700;">${p.name}</td>
                    <td><span class="badge badge-stage">${p.category}</span></td>
                    <td>${dataStore.getStageById(p.stageId)?.name || 'N/A'}</td>
                    <td style="font-weight: 800;">${p.maxMarks}</td>
                    <td>
                      <div style="font-size: 0.85rem; color: var(--text-muted);">
                        ${p.criteria.map(c => `${c.name} (${c.max}m)`).join(' • ')}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${activeTab === 'teams' ? `
        <!-- TEAMS & CANDIDATES -->
        <div class="grid-layout" style="grid-template-columns: 1fr 2fr;">
          <!-- Teams Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">👥 Participating Teams</h2>
              <button id="open-add-team-modal" class="btn btn-primary btn-sm">+ Add Team</button>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Team Name</th>
                    <th>Passkey</th>
                  </tr>
                </thead>
                <tbody>
                  ${teams.map(t => `
                    <tr>
                      <td style="font-weight: 800; color: var(--primary);">${t.code}</td>
                      <td style="font-weight: 700;">${t.name}</td>
                      <td><code>${t.passkey}</code></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Candidates Card -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">📜 Registered Candidates & Chest Numbers</h2>
              <button id="open-add-candidate-modal" class="btn btn-primary btn-sm">+ Register Candidate</button>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Chest No</th>
                    <th>Candidate Name</th>
                    <th>Team</th>
                    <th>Category</th>
                    <th>Enrolled Programs</th>
                  </tr>
                </thead>
                <tbody>
                  ${candidates.map(c => {
                    const team = dataStore.getTeamById(c.teamId);
                    return `
                      <tr>
                        <td style="font-weight: 900; color: var(--gold); font-size: 1.05rem;">${c.chestNo}</td>
                        <td style="font-weight: 700;">${c.name}</td>
                        <td>${team ? team.name : 'Independent'}</td>
                        <td><span class="badge badge-stage">${c.category}</span></td>
                        <td style="font-size: 0.85rem;">${c.enrolledProgramIds.join(', ')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}

      ${activeTab === 'judges' ? `
        <!-- JUDGES MANAGEMENT -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">⚖️ Judge Access Credentials</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Share Judge Code & PIN with evaluators on stage</div>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Judge Code</th>
                  <th>Evaluator Name</th>
                  <th>Assigned Stage</th>
                  <th>Judge Passkey PIN</th>
                </tr>
              </thead>
              <tbody>
                ${judges.map(j => `
                  <tr>
                    <td style="font-weight: 800; color: var(--primary);">${j.code}</td>
                    <td style="font-weight: 700;">${j.name}</td>
                    <td>${dataStore.getStageById(j.stageId)?.name || 'All Stages'}</td>
                    <td><code>${j.passkey}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
  }

  static renderLoginForm(container) {
    container.innerHTML = `
      <div style="max-width: 420px; margin: 3rem auto;" class="card">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem;">🔐</div>
          <h2 style="font-weight: 800; font-size: 1.5rem; margin-top: 0.5rem;">Admin Access Authentication</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Enter the administrative passcode to access control center.</p>
        </div>

        <form id="admin-login-form">
          <div class="form-group">
            <label class="form-label">Admin Passcode:</label>
            <input type="password" id="admin-passcode-input" class="form-control" placeholder="Enter admin passcode (Default: admin123)" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Authenticate & Access</button>
        </form>
      </div>
    `;
  }
}
