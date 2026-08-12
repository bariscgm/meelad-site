import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://muhammedbaris601_db_user:UOA3heSvk6hiAFHT@meeladpro.eg7lsk6.mongodb.net/meeladfest?retryWrites=true&w=majority').then(async () => {
  const Program = mongoose.model('Program', new mongoose.Schema({
    name: String,
    type: String,
    category: String,
    gender: String
  }));
  const programs = await Program.find({name: /Debate|Moulid|Mawlid|Moulood/i});
  console.log('Programs:', programs.map(p => ({_id: p._id, name: p.name, type: p.type, category: p.category, gender: p.gender})));

  const Candidate = mongoose.model('Candidate', new mongoose.Schema({
    name: String,
    programs: [String],
    category: String,
    gender: String,
    groupAssignments: { type: Map, of: String }
  }));
  
  if (programs.length > 0) {
    for (const prog of programs) {
      const cands = await Candidate.find({programs: prog.name});
      console.log(`\nCandidates for ${prog.name}:`, cands.length);
      if (cands.length > 0) {
        console.log('First candidate:', {
          name: cands[0].name,
          programs: cands[0].programs,
          groupAssignments: cands[0].groupAssignments
        });
      }
    }
  }

  process.exit(0);
});
