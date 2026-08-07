import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';

dotenv.config();

async function unassignJudges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update programs that are 'Assigned' back to 'Pending' and clear judges array
    const result = await Program.updateMany(
      {}, // apply to all programs, or maybe just { assignedJudges: { $exists: true, $not: { $size: 0 } } }
      { 
        $set: { assignedJudges: [] },
      }
    );

    // If status is 'Assigned', set it back to 'Pending'
    const statusResult = await Program.updateMany(
      { status: 'Assigned' },
      { $set: { status: 'Pending' } }
    );

    console.log(`Successfully cleared assignedJudges from ${result.modifiedCount} programs.`);
    console.log(`Successfully updated status from Assigned to Pending for ${statusResult.modifiedCount} programs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

unassignJudges();
