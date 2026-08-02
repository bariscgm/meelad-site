/**
 * JudgeView.js - Renders Judge Scoring Interface with criteria sliders & score locking
 */

export class JudgeView {
  static render(container, dataStore, session, selectedProgramId = null, selectedChestNo = null) {
    if (session.role !== 'JUDGE' || !session.user) {
      this.renderLoginForm(container, dataStore);
      return;
    }

    const judge = dataStore.getJudgeByCode(session.user.code);
    const stage = dataStore.getStageById(judge.stageId);
    const programs = dataStore.getPrograms();
    const candidates = dataStore.getCandidates();
    const activeProgram = selectedProgramId ? dataStore.getProgramById(selectedProgramId) : (programs[0] || null);

    // Candidates enrolled in selected program
    const enrolledCandidates = activeProgram
      ? candidates.filter(c => c.enrolledProgramIds.includes(activeProgram.id))
      : candidates;

    const currentCandidate = selectedChestNo
      ? dataStore.getCandidateByChest(selectedChestNo)
      : (enrolledCandidates[0] || null);

    // Get existing mark if entered already
    const existingMark = (activeProgram && currentCandidate)
      ? dataStore.getMarks().find(m => m.programId === activeProgram.id && m.chestNo === currentCandidate.chestNo)
      : null;

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="hero-tag">⚖️ JUDGE EVALUATION CONSOLE</div>
          <h1 style="font-weight: 800; font-size: 1.8rem; margin-top: 0.25rem;">${judge.name}</h1>
          <p style="color: var(--text-muted);">Assigned Stage: <strong style="color: var(--primary);">${stage ? stage.name : 'All Stages'}</strong></p>
        </div>
        <button id="judge-logout-btn" class="btn btn-danger btn-sm">Logout Judge</button>
      </div>

      <div class="grid-layout" style="grid-template-columns: 1fr 2fr;">
        <!-- Program & Candidate Selection Sidebar -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📌 Session Selector</h2>
          </div>

          <div class="form-group">
            <label class="form-label">Active Competition Item:</label>
            <select id="judge-program-select" class="form-control">
              ${programs.map(p => `
                <option value="${p.id}" ${activeProgram && activeProgram.id === p.id ? 'selected' : ''}>
                  ${p.name} (${p.category})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Select Performer (Chest No):</label>
            <select id="judge-candidate-select" class="form-control">
              ${enrolledCandidates.map(c => `
                <option value="${c.chestNo}" ${currentCandidate && currentCandidate.chestNo === c.chestNo ? 'selected' : ''}>
                  ${c.chestNo} - ${c.name} (${dataStore.getTeamById(c.teamId)?.name})
                </option>
              `).join('')}
            </select>
          </div>

          ${currentCandidate ? `
            <div style="background: rgba(15,23,42,0.6); padding: 1.25rem; border-radius: var(--radius-sm); margin-top: 1rem; border: 1px solid var(--border-color);">
              <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Performing Candidate Info</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--gold);">${currentCandidate.chestNo}</div>
              <div style="font-weight: 700; font-size: 1.1rem;">${currentCandidate.name}</div>
              <div style="font-size: 0.9rem; color: var(--primary);">${dataStore.getTeamById(currentCandidate.teamId)?.name}</div>
            </div>
          ` : ''}
        </div>

        <!-- Digital Criteria Scoring Sheet -->
        <div class="card" style="border-top: 4px solid var(--gold);">
          <div class="card-header">
            <h2 class="card-title">📝 Criteria Scoring Sheet</h2>
            ${existingMark ? `<span class="badge badge-published">Locked & Saved</span>` : `<span class="badge badge-pending">Draft Entry</span>`}
          </div>

          ${activeProgram && currentCandidate ? `
            <form id="judge-scoring-form">
              <input type="hidden" id="judge-program-id" value="${activeProgram.id}">
              <input type="hidden" id="judge-chest-no" value="${currentCandidate.chestNo}">
              <input type="hidden" id="judge-id-hidden" value="${judge.id}">

              <div style="display: grid; gap: 1.25rem; margin-bottom: 2rem;">
                ${activeProgram.criteria.map((c, idx) => {
                  const val = existingMark?.criteriaScores[c.name] ?? Math.floor(c.max * 0.8);
                  return `
                    <div style="background: rgba(15,23,42,0.5); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <label class="form-label" style="margin-bottom:0; font-size: 1rem;">
                          ${idx + 1}. ${c.name} (Max: ${c.max})
                        </label>
                        <span id="criteria-val-display-${idx}" style="font-weight: 900; font-size: 1.2rem; color: var(--primary);">${val} / ${c.max}</span>
                      </div>
                      <input 
                        type="range" 
                        name="criteria_${c.name}" 
                        class="criteria-range-slider" 
                        data-display-id="criteria-val-display-${idx}"
                        min="0" 
                        max="${c.max}" 
                        value="${val}" 
                        style="width: 100%; accent-color: var(--primary);"
                      >
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Live Total Score Display -->
              <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(245,158,11,0.15)); padding: 1.5rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                <div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Calculated Total Score</div>
                  <div id="live-total-score" style="font-size: 2.5rem; font-weight: 900; color: var(--gold); line-height: 1;">
                    ${existingMark ? existingMark.totalScore : '0'} / ${activeProgram.maxMarks}
                  </div>
                </div>
                <div id="live-grade-preview">
                  <span class="grade-pill grade-${existingMark ? existingMark.grade : 'A'}" style="font-size: 1.1rem; padding: 0.5rem 1.25rem;">
                    ${existingMark ? existingMark.grade : 'A'} Grade
                  </span>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem; font-size: 1.1rem;">
                💾 Lock & Submit Scores for ${currentCandidate.chestNo}
              </button>
            </form>
          ` : `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
              Select a valid program and candidate to begin scoring.
            </div>
          `}
        </div>
      </div>
    `;
  }

  static renderLoginForm(container, dataStore) {
    const judges = dataStore.getJudges();
    container.innerHTML = `
      <div style="max-width: 440px; margin: 3rem auto;" class="card">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 3rem;">⚖️</div>
          <h2 style="font-weight: 800; font-size: 1.5rem; margin-top: 0.5rem;">Judge Access Authentication</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Select your judge credentials code and enter secret PIN.</p>
        </div>

        <form id="judge-login-form">
          <div class="form-group">
            <label class="form-label">Select Judge Evaluator:</label>
            <select id="judge-code-input" class="form-control" required>
              <option value="">-- Choose Judge Account --</option>
              ${judges.map(j => `<option value="${j.code}">${j.name} (${j.code})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Judge Secret PIN Passkey:</label>
            <input type="password" id="judge-passkey-input" class="form-control" placeholder="Enter PIN (e.g. 9999, 8888)" required>
          </div>

          <button type="submit" class="btn btn-gold" style="width: 100%;">Sign In to Judge Console</button>
        </form>
      </div>
    `;
  }
}
