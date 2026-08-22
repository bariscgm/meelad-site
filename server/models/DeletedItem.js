import mongoose from 'mongoose';

const deletedItemSchema = new mongoose.Schema({
  collectionName: {
    type: String,
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

const DeletedItem = mongoose.model('DeletedItem', deletedItemSchema);

export default DeletedItem;
