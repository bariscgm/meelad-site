import mongoose from 'mongoose';
import DeletedItem from '../models/DeletedItem.js';
import Program from '../models/Program.js';
import Result from '../models/Result.js';
import Category from '../models/Category.js';
import Candidate from '../models/Candidate.js';
import Team from '../models/Team.js';

const getModelByName = (name) => {
  switch (name) {
    case 'Program': return Program;
    case 'Result': return Result;
    case 'Category': return Category;
    case 'Candidate': return Candidate;
    case 'Team': return Team;
    default: return null;
  }
};

// @desc    Restore the most recently deleted item of a specific collection
// @route   POST /api/restore/:collectionName
// @access  Admin
export const restoreItem = async (req, res) => {
  try {
    const { collectionName } = req.params;
    
    const Model = getModelByName(collectionName);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    // Find the most recently deleted item for this collection
    const latestDeleted = await DeletedItem.findOne({ collectionName }).sort({ createdAt: -1 });

    if (!latestDeleted) {
      return res.status(404).json({ message: `No deleted items found to restore for ${collectionName}` });
    }

    // Re-insert into original collection
    const restoredDocument = new Model(latestDeleted.data);
    await restoredDocument.save();

    // Remove from DeletedItem collection
    await latestDeleted.deleteOne();

    res.status(200).json({ 
      message: `${collectionName} restored successfully`,
      restoredItem: restoredDocument
    });
  } catch (error) {
    res.status(500).json({ message: 'Restore Error: ' + error.message });
  }
};
