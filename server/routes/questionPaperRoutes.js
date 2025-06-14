import express from 'express';
import multer from 'multer';
import path from 'path';
import QuestionPaper from '../models/QuestionPaper.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST: Upload a new question paper
router.post('/', upload.single('file'), async (req, res) => {
  const { branch, semester, course, subject } = req.body;
  if (!branch || !semester || !course || !subject || !req.file) {
    return res.status(400).json({ error: 'All fields and file are required' });
  }
  try {
    const newPaper = new QuestionPaper({
      branch,
      semester,
      course,
      subject,
      file: req.file.filename
    });
    await newPaper.save();
    res.status(201).json(newPaper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload question paper' });
  }
});

// GET: Fetch question papers by filters
router.get('/', async (req, res) => {
  const { year, semester, course, subject } = req.query;
  const filter = {};
  if (year) filter.year = year;
  if (semester) filter.semester = semester;
  if (course) filter.course = course;
  if (subject) filter.subject = subject;
  try {
    const papers = await QuestionPaper.find(filter).sort({ createdAt: -1 });
    res.status(200).json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question papers' });
  }
});

export default router; 