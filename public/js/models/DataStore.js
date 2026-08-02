/**
 * DataStore.js - Model Data Store for Meelad Fest
 * Implements state management, seed data initialization, and local persistence.
 */

export class DataStore {
  constructor() {
    this.storageKey = 'meelad_fest_store_clean_v1';
    this.listeners = [];
    this.state = this.loadState();
  }

  // Load from localStorage or initialize with clean state
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, resetting to defaults.', e);
      }
    }
    return this.getInitialSeedData();
  }

  // Save current state to localStorage and notify observers
  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notify();
  }

  // Register state change listener (Reactive MVC pattern)
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Reset to clean production data
  resetToDefaults() {
    this.state = this.getInitialSeedData();
    this.saveState();
  }

  // Clear all event data
  clearAllData() {
    this.state = this.getInitialSeedData();
    this.saveState();
  }

  // Load sample demo data if needed
  loadDemoData() {
    this.state = this.getDemoSeedData();
    this.saveState();
  }

  // Clean Production Seed Data Generator (No dummy teams, candidates, programs or marks)
  getInitialSeedData() {
    return {
      systemConfig: {
        eventName: 'Meelad Fest 2026',
        subtitle: 'State Level Arts & Cultural Grand Competition',
        adminPasscode: 'admin123',
        publishingEnabled: true,
        lastUpdated: new Date().toISOString()
      },
      categories: ['Sub-Junior', 'Junior', 'Senior', 'General'],
      stages: [
        { id: 'S1', name: 'Stage 1 - Main Auditorium', currentProgramId: null, currentChestNo: null, status: 'IDLE' },
        { id: 'S2', name: 'Stage 2 - Conference Hall', currentProgramId: null, currentChestNo: null, status: 'IDLE' },
        { id: 'S3', name: 'Stage 3 - Open Pavilion', currentProgramId: null, currentChestNo: null, status: 'IDLE' }
      ],
      programs: [],
      teams: [],
      candidates: [],
      judges: [],
      marks: []
    };
  }

  // Demo Sample Seed Data Generator (Optional for testing)
  getDemoSeedData() {
    return {
      systemConfig: {
        eventName: 'Meelad Fest 2026',
        subtitle: 'State Level Arts & Cultural Grand Competition',
        adminPasscode: 'admin123',
        publishingEnabled: true,
        lastUpdated: new Date().toISOString()
      },
      categories: ['Sub-Junior', 'Junior', 'Senior', 'General'],
      stages: [
        { id: 'S1', name: 'Stage 1 - Main Auditorium', currentProgramId: 'P101', currentChestNo: 'C-102', status: 'LIVE' },
        { id: 'S2', name: 'Stage 2 - Conference Hall', currentProgramId: 'P102', currentChestNo: 'C-105', status: 'LIVE' },
        { id: 'S3', name: 'Stage 3 - Open Pavilion', currentProgramId: 'P103', currentChestNo: 'C-108', status: 'IDLE' }
      ],
      programs: [
        {
          id: 'P101',
          name: 'Quran Recitation (Qirat)',
          category: 'Senior',
          stageId: 'S1',
          maxMarks: 100,
          criteria: [
            { name: 'Tajweed & Rules', max: 40 },
            { name: 'Tone & Melody', max: 30 },
            { name: 'Voice & Pitch', max: 20 },
            { name: 'Presentation', max: 10 }
          ],
          published: true,
          status: 'COMPLETED'
        },
        {
          id: 'P102',
          name: 'Arabic Speech / Elocution',
          category: 'Senior',
          stageId: 'S2',
          maxMarks: 100,
          criteria: [
            { name: 'Content & Facts', max: 35 },
            { name: 'Diction & Fluency', max: 35 },
            { name: 'Body Language', max: 20 },
            { name: 'Time Management', max: 10 }
          ],
          published: true,
          status: 'IN_PROGRESS'
        }
      ],
      teams: [
        { id: 'T1', code: 'ALHUDA', name: 'Al-Huda Academy', institution: 'Calicut Campus', passkey: '1111', points: 42 },
        { id: 'T2', code: 'ANNOOR', name: 'An-Noor Institute', institution: 'Malappuram Campus', passkey: '2222', points: 35 }
      ],
      candidates: [
        { chestNo: 'C-101', name: 'Muhammed Yaseen', teamId: 'T1', category: 'Senior', enrolledProgramIds: ['P101', 'P102'] },
        { chestNo: 'C-102', name: 'Ahammed Bilal', teamId: 'T2', category: 'Senior', enrolledProgramIds: ['P101'] }
      ],
      judges: [
        { id: 'J1', code: 'J-101', name: 'Ustad Abdul Rahiman', stageId: 'S1', passkey: '9999' }
      ],
      marks: []
    };
  }

  // --- GETTER METHODS ---
  getSystemConfig() { return this.state.systemConfig; }
  getPrograms() { return this.state.programs; }
  getProgramById(id) { return this.state.programs.find(p => p.id === id); }
  getTeams() { return this.state.teams; }
  getTeamById(id) { return this.state.teams.find(t => t.id === id || t.code === id); }
  getCandidates() { return this.state.candidates; }
  getCandidateByChest(chestNo) { return this.state.candidates.find(c => c.chestNo === chestNo); }
  getJudges() { return this.state.judges; }
  getJudgeByCode(code) { return this.state.judges.find(j => j.code === code); }
  getStages() { return this.state.stages; }
  getStageById(id) { return this.state.stages.find(s => s.id === id); }
  getMarks() { return this.state.marks; }

  getPublishedMarksForProgram(programId) {
    return this.state.marks.filter(m => m.programId === programId && m.published);
  }

  // --- MUTATION METHODS ---
  addProgram(program) {
    program.id = 'P' + (Date.now() % 10000);
    program.published = false;
    program.status = 'UPCOMING';
    this.state.programs.push(program);
    this.saveState();
    return program;
  }

  toggleProgramPublishing(programId, publishState) {
    const program = this.getProgramById(programId);
    if (program) {
      program.published = publishState !== undefined ? publishState : !program.published;
      // update all associated marks
      this.state.marks.forEach(m => {
        if (m.programId === programId) {
          m.published = program.published;
        }
      });
      this.recalculateTeamPoints();
      this.saveState();
    }
  }

  addTeam(team) {
    team.id = 'T' + (this.state.teams.length + 1);
    team.points = 0;
    this.state.teams.push(team);
    this.saveState();
    return team;
  }

  addCandidate(candidate) {
    if (!candidate.chestNo) {
      candidate.chestNo = 'C-' + (100 + this.state.candidates.length + 1);
    }
    this.state.candidates.push(candidate);
    this.saveState();
    return candidate;
  }

  saveJudgeMark(markData) {
    const existingIndex = this.state.marks.findIndex(
      m => m.programId === markData.programId && m.chestNo === markData.chestNo
    );

    const score = Object.values(markData.criteriaScores).reduce((a, b) => Number(a) + Number(b), 0);
    let grade = 'C';
    if (score >= 85) grade = 'A';
    else if (score >= 65) grade = 'B';

    const program = this.getProgramById(markData.programId);
    const published = program ? program.published : false;

    const newMark = {
      id: markData.id || 'M' + Date.now(),
      programId: markData.programId,
      chestNo: markData.chestNo,
      judgeId: markData.judgeId,
      criteriaScores: markData.criteriaScores,
      totalScore: score,
      grade: grade,
      status: 'LOCKED',
      published: published
    };

    if (existingIndex >= 0) {
      this.state.marks[existingIndex] = newMark;
    } else {
      this.state.marks.push(newMark);
    }

    this.recalculateTeamPoints();
    this.saveState();
    return newMark;
  }

  updateStageCurrentPerformer(stageId, chestNo, programId) {
    const stage = this.getStageById(stageId);
    if (stage) {
      stage.currentChestNo = chestNo;
      if (programId) stage.currentProgramId = programId;
      stage.status = chestNo ? 'LIVE' : 'IDLE';
      this.saveState();
    }
  }

  recalculateTeamPoints() {
    // Reset points
    this.state.teams.forEach(t => t.points = 0);

    // Group published marks by program to rank candidates
    const publishedPrograms = this.state.programs.filter(p => p.published);
    
    publishedPrograms.forEach(program => {
      const pMarks = this.state.marks
        .filter(m => m.programId === program.id && m.published)
        .sort((a, b) => b.totalScore - a.totalScore);

      pMarks.forEach((m, idx) => {
        const candidate = this.getCandidateByChest(m.chestNo);
        if (!candidate) return;
        const team = this.state.teams.find(t => t.id === candidate.teamId);
        if (!team) return;

        // Points structure: 1st = 10pts, 2nd = 7pts, 3rd = 5pts
        let placePts = 0;
        if (idx === 0) placePts = 10;
        else if (idx === 1) placePts = 7;
        else if (idx === 2) placePts = 5;

        // Grade bonus: A = 3pts, B = 1pt
        let gradePts = 0;
        if (m.grade === 'A') gradePts = 3;
        else if (m.grade === 'B') gradePts = 1;

        team.points += (placePts + gradePts);
      });
    });
  }
}
