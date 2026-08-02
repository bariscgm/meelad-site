import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Schedule', 'Rules', 'Results'],
    default: 'Rules',
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: String,
    default: () => new Date().toLocaleDateString(),
  },
}, { timestamps: true });

const Download = mongoose.model('Download', downloadSchema);
export default Download;
