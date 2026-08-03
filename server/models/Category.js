import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  classFrom: {
    type: Number,
    required: [true, 'Starting class is required'],
    min: 1,
    max: 12
  },
  classTo: {
    type: Number,
    required: [true, 'Ending class is required'],
    min: 1,
    max: 12
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
