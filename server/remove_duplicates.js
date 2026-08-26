import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import Result from './models/Result.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meelad_site';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const findDuplicates = async () => {
  await connectDB();
  
  const results = await Result.find().sort({ createdAt: -1 });
  const programMap = new Map();
  const duplicates = [];

  results.forEach(res => {
    const progId = res.program.toString();
    if (programMap.has(progId)) {
      duplicates.push(res);
    } else {
      programMap.set(progId, res);
    }
  });

  console.log(`Total results: ${results.length}`);
  console.log(`Unique programs with results: ${programMap.size}`);
  console.log(`Duplicates to remove: ${duplicates.length}`);

  if (duplicates.length > 0) {
    const duplicateIds = duplicates.map(d => d._id);
    await Result.deleteMany({ _id: { $in: duplicateIds } });
    console.log(`Removed ${duplicateIds.length} duplicate results.`);
  }

  process.exit(0);
};

findDuplicates();
