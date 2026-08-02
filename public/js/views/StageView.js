/**
 * StageView.js - Renders Stage Manager Control Console & Stage LED Screen Mode
 */

export class StageView {
  static renderConsole(container, dataStore, activeStageId = 'S1') {
    const stages = dataStore.getStages();
    const stage = dataStore.getStageById(activeStageId) || stages[0];
    const programs = dataStore.getPrograms();
    const candidates = dataStore.getCandidates();
    const currentProg = dataStore.getProgramById(stage.currentProgramId);
    const currentCand = dataStore.getCandidateByChest(stage.currentChestNo);

    const progCandidates = currentProg
      ? candidates.filter(c => c.enrolledProgramIds.includes(currentProg.id))
      : candidates;

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="hero-tag">🎙️ STAGE CONTROL CENTER</div>
          <h1 style="font-weight: 800; font-size: 1.8rem; margin-top: 0.25rem;">Stage Management Console</h1>
          <p style="color: var(--text-muted);">Manage performer call queue and update stage status for live spectators & LED screens.</p>
        </div>
        <a href="#led" target="_blank" class="btn btn-gold">📺 Launch LED Fullscreen Mode</a>
      </div>

      <!-- Stage Selector Tabs -->
      <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        ${stages.map(s => `
          <button class="btn ${s.id === stage.id ? 'btn-primary' : 'btn-secondary'} stage-select-btn" data-stage-id="${s.id}">
            🎙️ ${s.name} ${s.currentChestNo ? `(${s.currentChestNo})` : ''}
          </button>
        `).join('')}
      </div>

      <div class="grid-layout" style="grid-template-columns: 1fr 1fr;">
        <!-- Current Performer Call Control Card -->
        <div class="card" style="border-top: 4px solid var(--primary);">
          <div class="card-header">
            <h2 class="card-title">📣 Active Stage Call - ${stage.name}</h2>
            <span class="badge ${stage.status === 'LIVE' ? 'badge-published' : 'badge-pending'}">${stage.status}</span>
          </div>

          <div style="background: rgba(15,23,42,0.6); padding: 2rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">ON STAGE PERFORMING NOW</div>
            <div style="font-size: 3.5rem; font-weight: 900; color: var(--primary); line-height: 1.1;">
              ${stage.currentChestNo || 'NONE'}
            </div>
            <div style="font-size: 1.4rem; font-weight: 800; margin-top: 0.5rem; color: var(--gold);">
              ${currentCand ? currentCand.name : 'No candidate called'}
            </div>
            <div style="font-size: 1rem; color: var(--text-muted);">
              ${currentCand ? dataStore.getTeamById(currentCand.teamId)?.name : ''}
            </div>
          </div>

          <!-- Stage Call Actions -->
          <div class="form-group">
            <label class="form-label">Call Chest Number to Stage:</label>
            <div style="display: flex; gap: 0.75rem;">
              <select id="call-candidate-select" class="form-control" style="flex: 1;">
                <option value="">-- Choose Candidate Chest No --</option>
                ${progCandidates.map(c => `
                  <option value="${c.chestNo}" ${stage.currentChestNo === c.chestNo ? 'selected' : ''}>
                    ${c.chestNo} - ${c.name} (${dataStore.getTeamById(c.teamId)?.name})
                  </option>
                `).join('')}
              </select>
              <button id="call-to-stage-btn" class="btn btn-primary" data-stage-id="${stage.id}">
                Call to Stage
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button id="clear-stage-btn" class="btn btn-secondary" style="flex: 1;" data-stage-id="${stage.id}">
              ⏸️ Clear Stage
            </button>
          </div>
        </div>

        <!-- Stage Queue & Program Selector -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📋 Program Queue</h2>
          </div>

          <div class="form-group">
            <label class="form-label">Stage Program Item:</label>
            <select id="stage-program-select" class="form-control" data-stage-id="${stage.id}">
              ${programs.map(p => `
                <option value="${p.id}" ${currentProg && currentProg.id === p.id ? 'selected' : ''}>
                  ${p.name} (${p.category})
                </option>
              `).join('')}
            </select>
          </div>

          <div style="margin-top: 1.5rem;">
            <label class="form-label">Performers List in Program:</label>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Chest No</th>
                    <th>Name</th>
                    <th>Team</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${progCandidates.map(c => `
                    <tr>
                      <td style="font-weight: 800; color: var(--gold);">${c.chestNo}</td>
                      <td>${c.name}</td>
                      <td style="font-size: 0.85rem;">${dataStore.getTeamById(c.teamId)?.name}</td>
                      <td>
                        <button class="btn btn-primary btn-sm quick-call-btn" data-stage-id="${stage.id}" data-chest="${c.chestNo}">
                          Call
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static renderLED(container, dataStore) {
    const stages = dataStore.getStages();
    const liveStage = stages.find(s => s.status === 'LIVE') || stages[0];
    const program = dataStore.getProgramById(liveStage.currentProgramId);
    const candidate = dataStore.getCandidateByChest(liveStage.currentChestNo);
    const team = candidate ? dataStore.getTeamById(candidate.teamId) : null;

    container.innerHTML = `
      <div class="led-mode-container">
        <div class="led-header">
          <div class="led-stage-name">${liveStage.name}</div>
          <div class="led-program-name">${program ? program.name : 'MEELAD FEST 2026'} (${program ? program.category : 'General'})</div>
        </div>

        <div class="led-performer-box">
          <div style="font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 800; margin-bottom: 0.5rem;">
            ● ON STAGE PERFORMING NOW
          </div>
          <div class="led-chest-no">${liveStage.currentChestNo || '---'}</div>
          <div class="led-candidate-name">${candidate ? candidate.name : 'Waiting for Performer'}</div>
          <div class="led-team-name">${team ? team.name : ''}</div>
        </div>

        <div class="led-queue-box">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 700; font-size: 1.2rem; color: var(--gold);">
              ✨ State Level Arts & Cultural Competition
            </div>
            <div style="font-size: 1rem; color: var(--text-muted);">
              Refreshed Automatically • Meelad Fest 2026
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
