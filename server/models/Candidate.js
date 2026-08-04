import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Boy', 'Girl', 'General']
  },
  className: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  programs: [{
    type: String, // Storing program names for simplicity as in frontend
  }],
  status: {
    type: String,
    enum: ['Active', 'Hold'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
