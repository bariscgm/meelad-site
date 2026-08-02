/**
 * PublicView.js - Renders Public Home Page & Live Mark Publishing Scoreboard
 */

export class PublicView {
  static render(container, dataStore, activeTab = 'scoreboard', filters = {}) {
    const { categoryFilter = 'ALL', programFilter = 'ALL', searchQuery = '' } = filters;
    const systemConfig = dataStore.getSystemConfig();
    const programs = dataStore.getPrograms();
    const teams = dataStore.getTeams().sort((a, b) => b.points - a.points);
    const publishedPrograms = programs.filter(p => p.published);
    const stages = dataStore.getStages();

    // Collect published marks
    let allPublishedMarks = [];
    publishedPrograms.forEach(program => {
      const pMarks = dataStore.getPublishedMarksForProgram(program.id);
      pMarks.sort((a, b) => b.totalScore - a.totalScore);
      pMarks.forEach((m, idx) => {
        const candidate = dataStore.getCandidateByChest(m.chestNo);
        const team = candidate ? dataStore.getTeamById(candidate.teamId) : null;
        allPublishedMarks.push({
          ...m,
          rank: idx + 1,
          programName: program.name,
          category: program.category,
          candidateName: candidate ? candidate.name : 'Unknown',
          teamName: team ? team.name : 'Individual'
        });
      });
    });

    // Apply UI Filters
    let filteredMarks = allPublishedMarks;
    if (categoryFilter !== 'ALL') {
      filteredMarks = filteredMarks.filter(m => m.category === categoryFilter);
    }
    if (programFilter !== 'ALL') {
      filteredMarks = filteredMarks.filter(m => m.programId === programFilter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filteredMarks = filteredMarks.filter(m =>
        m.chestNo.toLowerCase().includes(q) ||
        m.candidateName.toLowerCase().includes(q) ||
        m.teamName.toLowerCase().includes(q) ||
        m.programName.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag">✨ ${systemConfig.eventName} • LIVE PORTAL</div>
          <h1 class="hero-title">${systemConfig.subtitle}</h1>
          <p class="hero-desc">
            Welcome to the official digital hub for Meelad Fest. Explore live stage performances, 
            verified published marks, team points leaderboard, and individual candidate scorecards.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="#results" class="btn btn-primary">🏆 View Live Scoreboard</a>
            <a href="#led" target="_blank" class="btn btn-gold">📺 Stage LED Display Screen</a>
          </div>

          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-value">${publishedPrograms.length} / ${programs.length}</div>
              <div class="stat-label">Published Items</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${teams.length}</div>
              <div class="stat-label">Competing Teams</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${dataStore.getCandidates().length}</div>
              <div class="stat-label">Candidates</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stages.length}</div>
              <div class="stat-label">Active Stages</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button id="public-tab-marks" class="btn ${activeTab === 'scoreboard' ? 'btn-primary' : 'btn-secondary'}">
          🏆 Published Marks & Results (${allPublishedMarks.length})
        </button>
        <button id="public-tab-leaderboard" class="btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}">
          🥇 Team Championship Leaderboard
        </button>
        <button id="public-tab-stages" class="btn ${activeTab === 'stages' ? 'btn-primary' : 'btn-secondary'}">
          🎙️ Live Stage Status
        </button>
      </div>

      ${activeTab === 'scoreboard' ? `
        <!-- Filter Toolbar -->
        <div class="toolbar">
          <div class="toolbar-group">
            <label class="form-label" style="margin-bottom:0;">Category:</label>
            <select id="filter-category" class="form-control">
              <option value="ALL">All Categories</option>
              ${dataStore.state.categories.map(c => `<option value="${c}" ${categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>

            <label class="form-label" style="margin-bottom:0;">Program Item:</label>
            <select id="filter-program" class="form-control">
              <option value="ALL">All Published Programs</option>
              ${publishedPrograms.map(p => `<option value="${p.id}" ${programFilter === p.id ? 'selected' : ''}>${p.name} (${p.category})</option>`).join('')}
            </select>
          </div>

          <div class="toolbar-group">
            <input type="text" id="search-input" class="form-control" placeholder="🔍 Search Chest No, Name, Team..." value="${searchQuery}">
          </div>
        </div>

        <!-- Marks Results Table -->
        ${filteredMarks.length > 0 ? `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Chest No</th>
                  <th>Candidate Name</th>
                  <th>Team</th>
                  <th>Program Item</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${filteredMarks.map(m => `
                  <tr>
                    <td>
                      <span class="rank-badge rank-${m.rank}">${m.rank}</span>
                    </td>
                    <td style="font-weight: 800; color: var(--primary);">${m.chestNo}</td>
                    <td style="font-weight: 700;">${m.candidateName}</td>
                    <td><span class="user-badge" style="background: rgba(255,255,255,0.05); color: var(--text-main);">${m.teamName}</span></td>
                    <td>${m.programName}</td>
                    <td><span class="badge badge-stage">${m.category}</span></td>
                    <td style="font-weight: 900; font-size: 1.1rem; color: var(--gold);">${m.totalScore} pts</td>
                    <td><span class="grade-pill grade-${m.grade}">${m.grade} Grade</span></td>
                    <td>
                      <button class="btn btn-secondary btn-sm view-scorecard-btn" data-chest="${m.chestNo}" data-program="${m.programId}">
                        📜 Scorecard
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📜</div>
            <h3>No Published Marks Found</h3>
            <p style="color: var(--text-muted); max-width: 450px; margin: 0.5rem auto 1.5rem auto;">
              No results match your selected filter, or marks have not been published by the Admin tabulator yet.
            </p>
          </div>
        `}
      ` : ''}

      ${activeTab === 'leaderboard' ? `
        <!-- Team Championship Points Table -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <h2 class="card-title">🥇 Team Overall Championship Standings</h2>
            <div class="badge badge-published">Live Tabulated</div>
          </div>
          
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Code</th>
                  <th>Team / Academy Name</th>
                  <th>Institution / Campus</th>
                  <th>Total Championship Points</th>
                </tr>
              </thead>
              <tbody>
                ${teams.map((t, idx) => `
                  <tr>
                    <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                    <td style="font-weight: 800; color: var(--primary);">${t.code}</td>
                    <td style="font-weight: 700; font-size: 1.05rem;">${t.name}</td>
                    <td style="color: var(--text-muted);">${t.institution}</td>
                    <td style="font-weight: 900; font-size: 1.3rem; color: var(--gold);">${t.points} Pts</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${activeTab === 'stages' ? `
        <!-- Live Stage Monitor -->
        <div class="grid-layout">
          ${stages.map(s => {
            const prog = dataStore.getProgramById(s.currentProgramId);
            const cand = dataStore.getCandidateByChest(s.currentChestNo);
            const team = cand ? dataStore.getTeamById(cand.teamId) : null;
            return `
              <div class="card" style="border-top: 4px solid var(--primary);">
                <div class="card-header">
                  <div class="card-title">${s.name}</div>
                  <span class="badge ${s.status === 'LIVE' ? 'badge-published' : 'badge-pending'}">${s.status}</span>
                </div>

                <div style="margin-bottom: 1rem;">
                  <div style="font-size: 0.85rem; color: var(--text-muted);">Current Program Item:</div>
                  <div style="font-weight: 700; font-size: 1.1rem; color: var(--gold);">${prog ? prog.name : 'None'}</div>
                </div>

                <div style="background: rgba(15,23,42,0.6); padding: 1.25rem; border-radius: var(--radius-sm); text-align: center;">
                  <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Performing Now</div>
                  <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary); line-height: 1.2;">
                    ${s.currentChestNo || 'NONE'}
                  </div>
                  <div style="font-weight: 700; font-size: 1.1rem;">${cand ? cand.name : 'No candidate on stage'}</div>
                  <div style="font-size: 0.9rem; color: var(--text-muted);">${team ? team.name : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    `;
  }
}
