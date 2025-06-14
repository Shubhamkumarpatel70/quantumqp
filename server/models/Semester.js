import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  semester: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;