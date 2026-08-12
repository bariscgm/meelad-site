const mongoose = require('mongoose');
const uri = 'mongodb+srv://muhammedbaris601_db_user:UOA3heSvk6hiAFHT@meeladpro.eg7lsk6.mongodb.net/meeladfest?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    const generalPrograms = await db.collection('programs').find({ category: 'GENERAL' }).toArray();
    console.log('Found GENERAL programs:', generalPrograms.length);

    if (generalPrograms.length > 0) {
      const p = generalPrograms[0];
      console.log('Testing for program:', p.name);

      const query = {
        programs: p.name,
        status: 'Active'
      };

      if (p.category && p.category.toLowerCase() !== 'general') {
        query.category = p.category;
      }
      if (p.gender && p.gender.toLowerCase() !== 'general') {
        query.gender = p.gender;
      }

      console.log('Query would be:', query);
      const candidates = await db.collection('candidates').find(query).toArray();
      console.log('Candidates found:', candidates.length);

      // Check how many actually have this program without any category/gender filter
      const allCandidatesForProg = await db.collection('candidates').find({ programs: p.name, status: 'Active' }).toArray();
      console.log('Candidates found with ONLY program name filter:', allCandidatesForProg.length);
      if (allCandidatesForProg.length > 0) {
        console.log('Categories of these candidates:', allCandidatesForProg.map(c => c.category));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
