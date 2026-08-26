export const calculatePoints = (type, position, grade) => {
  let pts = 0;
  const pos = Number(position);
  if (type === 'Individual') {
    if (pos === 1) pts += 5;
    else if (pos === 2) pts += 3;
    else if (pos === 3) pts += 1;
    if (grade === 'A') pts += 5;
    else if (grade === 'B') pts += 3;
    else if (grade === 'C') pts += 1;
  } else if (type === 'Group') {
    if (pos === 1) pts += 10;
    else if (pos === 2) pts += 5;
    else if (pos === 3) pts += 3;
    if (grade === 'A') pts += 10;
    else if (grade === 'B') pts += 5;
    else if (grade === 'C') pts += 3;
  }
  return pts;
};

export const getGroupMembers = (program, winner, candidates) => {
  if (program?.type !== 'Group') return [];
  
  // If the winner refers to a candidate that is explicitly a group (has members)
  const groupCandidate = candidates.find(c => c.name === winner.name && c.isGroup);
  if (groupCandidate && groupCandidate.members && groupCandidate.members.length > 0) {
    return groupCandidate.members;
  }
  
  return candidates.filter(c => {
    if (program.category && program.category !== 'General' && c.category?.toLowerCase() !== program.category.toLowerCase()) return false;
    if (program.gender && program.gender !== 'General' && c.gender?.toLowerCase() !== program.gender.toLowerCase()) return false;
    
    const progId = program._id;
    const progName = program.name;
    
    // 1. Match by programCode (chestNo) if the group has a chest code assigned
    if (winner.chestNo && winner.chestNo !== 'N/A' && c.programCodes?.[progId] === winner.chestNo) return true;
    
    const wTeamId = winner.team?._id || winner.team;
    const cTeamId = c.team?._id || c.team;
    
    // Helper to compare IDs which might be objects or strings
    const teamsMatch = wTeamId && cTeamId && wTeamId.toString() === cTeamId.toString();

    // 2. Match by groupAssignments (e.g. winner.name is "Group 1" and candidate's assignment for this program is "Group 1")
    const assignedGroup = c.groupAssignments?.[progId] || c.groupAssignments?.[progName];
    if (assignedGroup && assignedGroup === winner.name && teamsMatch) return true;
    
    // 3. Match by Team and Name (if winner.name is the team name and candidate is in that team and program)
    const wTeamName = winner.team?.name;
    
    if (winner.name === wTeamName && teamsMatch && c.programs?.includes(progName)) return true;
    
    return false;
  });
};
