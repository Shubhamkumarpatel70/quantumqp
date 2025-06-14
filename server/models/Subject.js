import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index to ensure unique subject per course-semester combination
subjectSchema.index({ subject: 1, course: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;