import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const candidateSchema = new mongoose.Schema({
  team: mongoose.Schema.Types.ObjectId, 
}, { strict: false });

const Candidate = mongoose.model('Candidate', candidateSchema);

const userSchema = new mongoose.Schema({
  team: String,
});
const User = mongoose.model('User', userSchema);

const teamSchema = new mongoose.Schema({
  name: String,
});
const Team = mongoose.model('Team', teamSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const candidates = await Candidate.find();
  const users = await User.find();
  const teams = await Team.find();
  
  let updatedCount = 0;
  for (const c of candidates) {
    const candidateTeamIdStr = c.team?.toString();
    
    // Check if this ID belongs to a User
    const userMatched = users.find(u => u._id.toString() === candidateTeamIdStr);
    
    if (userMatched) {
      // Find the corresponding Team document
      const teamDoc = teams.find(t => t.name === userMatched.team);
      if (teamDoc) {
        c.team = teamDoc._id;
        await c.save();
        updatedCount++;
        console.log('Migrated candidate', c._id, 'to team', teamDoc.name);
      }
    }
  }
  
  console.log('Migration complete. Updated', updatedCount, 'candidates');
  process.exit(0);
}
migrate();
