import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft',
  },
  winners: [{
    position: { type: Number },
    chestNo: { type: String },
    name: { type: String },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    points: { type: Number, default: 0 },
    grade: { type: String },
  }],
}, {
  timestamps: true,
});

const Result = mongoose.model('Result', resultSchema);

export default Result;
