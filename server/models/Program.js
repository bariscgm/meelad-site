import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Individual', 'Group'],
    required: true,
  },
  venueType: {
    type: String,
    enum: ['STAGE', 'OFF-STAGE'],
    required: true,
  },
  gender: {
    type: String,
    enum: ['Boy', 'Girl', 'General'],
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
    default: 1,
  },
  duration: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Finished'],
    default: 'Pending',
  },
  assignedJudges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const Program = mongoose.model('Program', programSchema);

export default Program;
