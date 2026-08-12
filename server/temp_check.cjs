const mongoose = require('mongoose');
const uri = 'mongodb+srv://muhammedbaris601_db_user:UOA3heSvk6hiAFHT@meeladpro.eg7lsk6.mongodb.net/meeladfest?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const cats = await db.collection('programs').distinct('category');
    console.log('Categories:', cats);
    const pg = await db.collection('programs').find({ category: { $regex: /general/i } }).toArray();
    console.log('General Programs (case insensitive):', pg.map(p => ({name: p.name, category: p.category})));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
