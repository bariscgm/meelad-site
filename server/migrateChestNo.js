import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const candidateSchema = new mongoose.Schema({
  name: String,
  category: String,
  chestNo: String,
  createdAt: Date
}, { strict: false });

const Candidate = mongoose.model('Candidate', candidateSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  // We want to process category by category to assign numbers
  const candidates = await Candidate.find({}).sort({ createdAt: 1 });
  
  const categoryCounts = {};
  let updatedCount = 0;
  
  for (const c of candidates) {
    if (!c.chestNo) {
      const category = c.category || 'General';
      const catLower = category.toLowerCase();
      
      let baseChestNo = 501;
      if (catLower.includes('sub junior') || catLower.includes('sub-junior')) baseChestNo = 101;
      else if (catLower.includes('super senior') || catLower.includes('super-senior')) baseChestNo = 401;
      else if (catLower.includes('junior')) baseChestNo = 201;
      else if (catLower.includes('senior')) baseChestNo = 301;
      
      if (categoryCounts[category] === undefined) {
        // Find existing max if any
        const existingCatCandidates = await Candidate.find({ category }).select('chestNo').lean();
        let maxNum = baseChestNo - 1;
        for (const ec of existingCatCandidates) {
          if (ec.chestNo) {
            const num = parseInt(ec.chestNo, 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
        categoryCounts[category] = maxNum;
      }
      
      categoryCounts[category]++;
      let nextChestNo = categoryCounts[category];
      
      // Ensure uniqueness
      let isUnique = false;
      while (!isUnique) {
        const existing = await Candidate.findOne({ chestNo: nextChestNo.toString() }).lean();
        if (existing) {
          nextChestNo++;
          categoryCounts[category] = nextChestNo;
        } else {
          isUnique = true;
        }
      }
      
      c.chestNo = nextChestNo.toString();
      await c.save();
      updatedCount++;
      console.log(`Assigned chestNo ${c.chestNo} to candidate ${c.name} (${c.category})`);
    }
  }
  
  console.log('Migration complete. Updated', updatedCount, 'candidates');
  process.exit(0);
}
migrate();
