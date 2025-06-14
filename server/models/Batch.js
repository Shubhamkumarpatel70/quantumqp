import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  batch: { type: String, required: true, unique: true }
});

export default mongoose.model('Batch', BatchSchema); 