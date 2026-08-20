import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://muhammedbaris601_db_user:UOA3heSvk6hiAFHT@meeladpro.eg7lsk6.mongodb.net/meeladfest?retryWrites=true&w=majority');
  
  const Team = (await import('./models/Team.js')).default;
  const Candidate = (await import('./models/Candidate.js')).default;
  const Result = (await import('./models/Result.js')).default;
  const Program = (await import('./models/Program.js')).default;

  const candidate = await Candidate.findOne({ chestNo: '411' });
  console.log('Candidate with 411:', candidate ? candidate.name : 'NOT FOUND');

  const mustafa = await Candidate.findOne({ name: { $regex: /mustafa/i } });
  if (mustafa) {
    console.log('Found Mustafa:', mustafa.name, 'Chest No:', mustafa.chestNo);
  }

  const publishedResults = await Result.find({ status: 'Published' }).populate('program');
  for (const r of publishedResults) {
    const winner = r.winners.find(w => w.name && w.name.toLowerCase().includes('mustafa'));
    if (winner) {
      console.log('Mustafa is a winner in:', r.program?.name, 'His chestNo in result:', winner.chestNo);
    }
  }

  process.exit(0);
}
run();
