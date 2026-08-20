const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meelad');
  const Candidate = (await import('./models/Candidate.js')).default;
  const Result = (await import('./models/Result.js')).default;
  
  const c = await Candidate.findOne({ chestNo: "411" });
  console.log("Candidate 411:", c.name);
  const results = await Result.find({ status: 'Published' }).populate('program');
  for (const r of results) {
    console.log("Result:", r.program.name);
    const winner = r.winners.find(w => w.name === c.name || w.chestNo === c.chestNo);
    console.log("Winner found?", !!winner, winner);
  }
  process.exit();
};
test();
