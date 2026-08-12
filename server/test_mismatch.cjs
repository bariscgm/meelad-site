const mongoose = require('mongoose');
const uri = 'mongodb+srv://muhammedbaris601_db_user:UOA3heSvk6hiAFHT@meeladpro.eg7lsk6.mongodb.net/meeladfest?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const progs = await db.collection('programs').find({ category: 'GENERAL' }).toArray();
    for (const p of progs) {
      const query = { programs: p.name, status: 'Active' };
      if (p.category && p.category.toLowerCase() !== 'general') query.category = p.category;
      if (p.gender && p.gender.toLowerCase() !== 'general') query.gender = p.gender;
      
      const cands = await db.collection('candidates').find(query).toArray();
      const allCands = await db.collection('candidates').find({programs: p.name}).toArray();
      
      if (cands.length !== allCands.length) {
        console.log(`Mismatch in ${p.name} (${p.gender}): Query found ${cands.length}, but total registered is ${allCands.length}`);
      } else {
        console.log(`OK: ${p.name} (${p.gender}) -> ${cands.length} candidates`);
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
