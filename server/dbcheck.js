import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/meelad');
  const Program = mongoose.model('Program', new mongoose.Schema({}, { strict: false }));
  const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
  
  const debateProg = await Program.find({ name: /debate/i });
  console.log('Debate Programs:', debateProg);
  
  const cands = await Candidate.find({ programs: /debate/i });
  console.log('Debate Candidates:', cands.map(c => ({ name: c.name, category: c.category, programs: c.programs, gender: c.gender })));
  
  process.exit();
}
run().catch(console.error);
