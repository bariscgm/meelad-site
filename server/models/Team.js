import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    default: '#0d9488',
  },
  status: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Enabled',
  }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

export default Team;
