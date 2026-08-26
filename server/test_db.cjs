const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/meelad_db').then(async () => {
  const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
  const Result = mongoose.model('Result', new mongoose.Schema({}, { strict: false }));
  
  const results = await Result.find({}).lean();
  console.log('Sample Group Result winners:', JSON.stringify(results.filter(r => r.program?.type === 'Group' || r.program?.name?.includes('Group')).map(r => r.winners).flat().slice(0, 5), null, 2));

  const cands = await Candidate.find({'groupAssignments': {$exists: true, $ne: {}}}).lean();
  console.log('Sample Candidate with groupAssignments:', JSON.stringify(cands.slice(0, 2).map(c => ({ name: c.name, team: c.team, groupAssignments: c.groupAssignments, programCodes: c.programCodes })), null, 2));

  process.exit();
});
