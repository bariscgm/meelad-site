import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import DeletedItem from './models/DeletedItem.js';
import Program from './models/Program.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const deletedItems = await DeletedItem.find({ collectionName: 'Program' }).sort({ createdAt: -1 });
    
    let targetItem = null;
    for (const item of deletedItems) {
      if (item.data && item.data.name && item.data.name.toLowerCase().includes('hifl')) {
        targetItem = item;
        break;
      }
    }

    if (!targetItem) {
      console.log('Hifl program not found in DeletedItem collection');
      process.exit(0);
    }

    console.log('Found Hifl program:', targetItem.data.name);

    const program = new Program(targetItem.data);
    await program.save();
    console.log('Program saved to collection');

    await targetItem.deleteOne();
    console.log('Deleted from DeletedItem collection');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
