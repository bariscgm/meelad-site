/**
 * TeamView.js - Renders Team Access Portal (Team Dashboard, Chest No Roster, Live Stage Tracking & Team Scorecards)
 */

export class TeamView {
  static render(container, dataStore, session) {
    if (session.role !== 'TEAM' || !session.user) {
      this.renderLoginForm(container, dataStore);
      return;
    }

    const team = dataStore.getTeamById(session.user.id || session.user.code);
    const allCandidates = dataStore.getCandidates().filter(c => c.teamId === team.id);
    const publishedMarks = dataStore.getMarks().filter(m => {
      const cand = allCandidates.find(c => c.chestNo === m.chestNo);
      return cand && m.published;
    });
    const stages = dataStore.getStages();

    container.innerHTML = `
      <!-- Team Banner -->
      <div class="hero-banner" style="padding: 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2));">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="hero-tag">👥 TEAM ACADEMY PORTAL</div>
            <h1 class="hero-title" style="font-size: 2.2rem; margin-bottom: 0.25rem;">${team.name}</h1>
            <p style="color: var(--text-muted);">${team.institution} • Team Code: <strong style="color: var(--primary);">${team.code}</strong></p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 2.5rem; font-weight: 900; color: var(--gold);">${team.points} Pts</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Total Championship Points</div>
          </div>
        </div>
      </div>

      <!-- Live Stage Tracker for Team Candidates -->
      <div class="card" style="margin-bottom: 2rem; border-left: 4px solid var(--accent);">
        <div class="card-header">
          <h2 class="card-title">🎙️ Live Stage Monitor - Your Team Candidates</h2>
          <div class="badge badge-stage">Real-time Sync</div>
        </div>
        <div class="grid-layout">
          ${stages.map(s => {
            const isTeamCandidatePerforming = allCandidates.some(c => c.chestNo === s.currentChestNo);
            const cand = dataStore.getCandidateByChest(s.currentChestNo);
            const prog = dataStore.getProgramById(s.currentProgramId);
            return `
              <div style="background: rgba(15,23,42,0.6); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid ${isTeamCandidatePerforming ? 'var(--primary)' : 'var(--border-color)'};">
                <div style="font-size: 0.85rem; color: var(--text-muted);">${s.name}</div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--gold);">${prog ? prog.name : 'No active item'}</div>
                <div style="margin-top: 0.75rem;">
                  <span style="font-size: 1.5rem; font-weight: 900; color: ${isTeamCandidatePerforming ? 'var(--primary)' : 'var(--text-main)'};">
                    ${s.currentChestNo || 'NONE'}
                  </span>
                  ${isTeamCandidatePerforming ? `<span class="badge badge-published" style="margin-left: 0.5rem;">YOUR TEAM</span>` : ''}
                </div>
                <div style="font-size: 0.9rem; font-weight: 600;">${cand ? cand.name : 'Stage Empty'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Team Candidate Roster & Enrolled Events -->
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h2 class="card-title">📜 Team Candidates Roster & Chest Numbers</h2>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge badge-published">${allCandidates.length} Registered Candidates</span>
            <button id="open-team-add-candidate-modal" class="btn btn-primary btn-sm">+ Register New Candidate</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Chest No</th>
                <th>Candidate Name</th>
                <th>Category</th>
                <th>Enrolled Program Items</th>
                <th>Published Scorecard</th>
              </tr>
            </thead>
            <tbody>
              ${allCandidates.map(c => {
                const candMarks = publishedMarks.filter(m => m.chestNo === c.chestNo);
                return `
                  <tr>
                    <td style="font-weight: 900; color: var(--gold); font-size: 1.1rem;">${c.chestNo}</td>
                    <td style="font-weight: 700;">${c.name}</td>
                    <td><span class="badge badge-stage">${c.category}</span></td>
                    <td style="font-size: 0.9rem; color: var(--text-muted);">${c.enrolledProgramIds.map(id => dataStore.getProgramById(id)?.name).join(', ')}</td>
                    <td>
                      ${candMarks.length > 0 ? `
                        ${candMarks.map(m => `
                          <span class="grade-pill grade-${m.grade}">${m.totalScore} pts (${m.grade})</span>
                        `).join(' ')}
                      ` : `<span style="color: var(--text-muted); font-size: 0.85rem;">Pending Mark Publishing</span>`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  static renderLoginForm(container, dataStore) {
    const teams = dataStore.getTeams();
    container.innerHTML = `
      <div style="max-width: 440px; margin: 3rem auto;" class="card">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem;">👥</div>
          <h2 style="font-weight: 800; font-size: 1.5rem; margin-top: 0.5rem;">Team Access Portal</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Select your team and enter your team security PIN.</p>
        </div>

        <form id="team-login-form">
          <div class="form-group">
            <label class="form-label">Select Team:</label>
            <select id="team-select-input" class="form-control" required>
              <option value="">-- Choose Team --</option>
              ${teams.map(t => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Team Security PIN / Passkey:</label>
            <input type="password" id="team-passkey-input" class="form-control" placeholder="Enter PIN (e.g., 1111, 2222)" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In to Team Dashboard</button>
        </form>
      </div>
    `;
  }
}
