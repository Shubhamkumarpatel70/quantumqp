import mongoose from 'mongoose';

const SpecializationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export default mongoose.model('Specialization', SpecializationSchema); 