import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export default mongoose.model('College', CollegeSchema); 