import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  course: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
export default Course;