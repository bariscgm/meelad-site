/**
 * ModalView.js - Renders Dynamic Modals (Scorecards, Add Program, Add Team, Candidate Registration, Tabulation)
 */

export class ModalView {
  static openScorecard(container, dataStore, chestNo, programId) {
    const candidate = dataStore.getCandidateByChest(chestNo);
    const program = dataStore.getProgramById(programId);
    const team = candidate ? dataStore.getTeamById(candidate.teamId) : null;
    const mark = dataStore.getMarks().find(m => m.chestNo === chestNo && m.programId === programId);

    container.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 style="font-weight: 800; font-size: 1.35rem;">📜 Candidate Official Scorecard</h2>
          <button class="modal-close">&times;</button>
        </div>

        <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15)); padding: 1.5rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
          <div style="font-size: 2.2rem; font-weight: 900; color: var(--gold);">${candidate ? candidate.chestNo : chestNo}</div>
          <div style="font-size: 1.4rem; font-weight: 800;">${candidate ? candidate.name : 'Unknown Candidate'}</div>
          <div style="font-size: 1rem; color: var(--primary); font-weight: 600;">${team ? team.name : ''}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Program: <strong>${program ? program.name : ''}</strong> (${program ? program.category : ''})</div>
        </div>

        ${mark ? `
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">Criteria Evaluation Breakdown:</h3>
          <div style="display: grid; gap: 0.75rem; margin-bottom: 1.5rem;">
            ${Object.entries(mark.criteriaScores).map(([crit, val]) => `
              <div style="display: flex; justify-content: space-between; background: rgba(15,23,42,0.5); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <span>${crit}</span>
                <strong style="color: var(--primary);">${val} Marks</strong>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(30,41,59,0.9); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--gold);">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total Score Awarded</div>
              <div style="font-size: 2rem; font-weight: 900; color: var(--gold); line-height: 1;">${mark.totalScore} / ${program ? program.maxMarks : 100}</div>
            </div>
            <div>
              <span class="grade-pill grade-${mark.grade}" style="font-size: 1.1rem; padding: 0.5rem 1.25rem;">${mark.grade} Grade Certificate</span>
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No evaluated mark recorded yet for this candidate.
          </div>
        `}

        <div style="margin-top: 1.5rem; text-align: right;">
          <button class="btn btn-secondary modal-close-btn">Close</button>
        </div>
      </div>
    `;
    container.hidden = false;
  }

  static openAddProgramModal(container, dataStore) {
    const stages = dataStore.getStages();
    const categories = dataStore.state.categories;

    container.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 style="font-weight: 800;">📋 Add New Competition Program</h2>
          <button class="modal-close">&times;</button>
        </div>

        <form id="modal-add-program-form">
          <div class="form-group">
            <label class="form-label">Program Name / Title:</label>
            <input type="text" id="prog-title-input" class="form-control" placeholder="e.g., Elocution, Qawwali, Quiz" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category:</label>
              <select id="prog-category-input" class="form-control" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Assigned Stage:</label>
              <select id="prog-stage-input" class="form-control" required>
                ${stages.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Total Maximum Marks:</label>
            <input type="number" id="prog-max-marks-input" class="form-control" value="100" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Add Program</button>
          </div>
        </form>
      </div>
    `;
    container.hidden = false;
  }

  static openAddTeamModal(container) {
    container.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 style="font-weight: 800;">👥 Register New Competing Team</h2>
          <button class="modal-close">&times;</button>
        </div>

        <form id="modal-add-team-form">
          <div class="form-group">
            <label class="form-label">Team Code (Short Unique Identifier):</label>
            <input type="text" id="team-code-input" class="form-control" placeholder="e.g. ALHUDA, ALNOOR" required>
          </div>

          <div class="form-group">
            <label class="form-label">Team Full Name:</label>
            <input type="text" id="team-name-input" class="form-control" placeholder="e.g. Al-Huda Arts Academy" required>
          </div>

          <div class="form-group">
            <label class="form-label">Campus / Institution:</label>
            <input type="text" id="team-institution-input" class="form-control" placeholder="e.g. Calicut Campus" required>
          </div>

          <div class="form-group">
            <label class="form-label">Team Access Security PIN:</label>
            <input type="password" id="team-passkey-create-input" class="form-control" placeholder="e.g. 1111" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Team Account</button>
          </div>
        </form>
      </div>
    `;
    container.hidden = false;
  }

  static openAddCandidateModal(container, dataStore, lockedTeamId = null) {
    const teams = dataStore.getTeams();
    const categories = dataStore.state.categories;
    const programs = dataStore.getPrograms();

    container.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 style="font-weight: 800;">📜 Register Candidate</h2>
          <button class="modal-close">&times;</button>
        </div>

        <form id="modal-add-candidate-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Chest Number (Leave blank to auto-generate):</label>
              <input type="text" id="cand-chest-input" class="form-control" placeholder="e.g. C-110">
            </div>

            <div class="form-group">
              <label class="form-label">Candidate Name:</label>
              <input type="text" id="cand-name-input" class="form-control" placeholder="Enter Full Name" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Team:</label>
              <select id="cand-team-input" class="form-control" required ${lockedTeamId ? 'disabled' : ''}>
                ${teams.map(t => `<option value="${t.id}" ${lockedTeamId === t.id ? 'selected' : ''}>${t.name} (${t.code})</option>`).join('')}
              </select>
              ${lockedTeamId ? `<input type="hidden" id="cand-team-hidden" value="${lockedTeamId}">` : ''}
            </div>

            <div class="form-group">
              <label class="form-label">Category:</label>
              <select id="cand-category-input" class="form-control" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Enroll in Programs:</label>
            <div style="max-height: 150px; overflow-y: auto; background: rgba(15,23,42,0.5); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              ${programs.map(p => `
                <label style="display: block; margin-bottom: 0.4rem; cursor: pointer;">
                  <input type="checkbox" name="cand_program" value="${p.id}"> ${p.name} (${p.category})
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Register Candidate</button>
          </div>
        </form>
      </div>
    `;
    container.hidden = false;
  }

  static openTabulationModal(container, dataStore, programId) {
    const program = dataStore.getProgramById(programId);
    const marks = dataStore.getMarks().filter(m => m.programId === programId);

    container.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h2 style="font-weight: 800;">🔍 Official Tabulation Sheet - ${program ? program.name : ''}</h2>
          <button class="modal-close">&times;</button>
        </div>

        <div class="table-responsive" style="margin-bottom: 1.5rem;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Chest No</th>
                <th>Candidate Name</th>
                <th>Team</th>
                <th>Criteria Breakdown</th>
                <th>Total Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${marks.map(m => {
                const candidate = dataStore.getCandidateByChest(m.chestNo);
                const team = candidate ? dataStore.getTeamById(candidate.teamId) : null;
                return `
                  <tr>
                    <td style="font-weight: 900; color: var(--gold);">${m.chestNo}</td>
                    <td style="font-weight: 700;">${candidate ? candidate.name : 'Unknown'}</td>
                    <td>${team ? team.name : ''}</td>
                    <td style="font-size: 0.85rem;">
                      ${Object.entries(m.criteriaScores).map(([k, v]) => `${k}: <strong>${v}</strong>`).join(' • ')}
                    </td>
                    <td style="font-weight: 900; font-size: 1.1rem; color: var(--primary);">${m.totalScore}</td>
                    <td><span class="grade-pill grade-${m.grade}">${m.grade}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="text-align: right;">
          <button class="btn btn-secondary modal-close-btn">Close Sheet</button>
        </div>
      </div>
    `;
    container.hidden = false;
  }

  static closeModal(container) {
    container.hidden = true;
    container.innerHTML = '';
  }
}
