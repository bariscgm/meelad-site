import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Program from './models/Program.js';

async function updatePrograms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update all matching programs
    const result = await Program.updateMany(
      { gender: 'Boy', venueType: 'STAGE' },
      { $set: { duration: '5 min' } }
    );
    
    console.log(`Matched ${result.matchedCount} programs.`);
    console.log(`Updated ${result.modifiedCount} programs.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updatePrograms();
