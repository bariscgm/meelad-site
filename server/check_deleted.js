import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import DeletedItem from './models/DeletedItem.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const deletedItems = await DeletedItem.find({});
    
    console.log('DeletedItems:', deletedItems.map(item => ({
      collectionName: item.collectionName,
      data: item.data
    })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
