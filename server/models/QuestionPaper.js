import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  file: { type: String, required: true }, // PDF file name
  createdAt: { type: Date, default: Date.now }
});

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
export default QuestionPaper; 