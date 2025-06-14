import express from 'express';
import Year from '../models/Year.js';
import Semester from '../models/Semester.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import College from '../models/College.js';
import Specialization from '../models/Specialization.js';
import Batch from '../models/Batch.js';
import Branch from '../models/Branch.js';

const router = express.Router();

// Year routes
router.get('/years', async (req, res) => {
  try {
    const years = await Year.find().sort({ year: 1 });
    res.status(200).json(years);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

router.post('/years', async (req, res) => {
  const { year } = req.body;
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  try {
    const newYear = new Year({ year });
    await newYear.save();
    res.status(201).json(newYear);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Year already exists' });
    }
    res.status(500).json({ error: 'Failed to add year' });
  }
});

router.delete('/years/:id', async (req, res) => {
  try {
    await Year.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Year deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete year' });
  }
});

// Semester routes
router.get('/semesters', async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ semester: 1 });
    res.status(200).json(semesters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
});

router.post('/semesters', async (req, res) => {
  const { semester } = req.body;
  if (!semester) {
    return res.status(400).json({ error: 'Semester is required' });
  }
  try {
    const newSemester = new Semester({ semester });
    await newSemester.save();
    res.status(201).json(newSemester);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Semester already exists' });
    }
    res.status(500).json({ error: 'Failed to add semester' });
  }
});

router.delete('/semesters/:id', async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Semester deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete semester' });
  }
});

// Course routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ course: 1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.post('/courses', async (req, res) => {
  const { course } = req.body;
  if (!course) {
    return res.status(400).json({ error: 'Course is required' });
  }
  try {
    const newCourse = new Course({ course });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Course already exists' });
    }
    res.status(500).json({ error: 'Failed to add course' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Subject routes
router.get('/subjects', async (req, res) => {
  try {
    const { course, semester } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    
    const subjects = await Subject.find(filter).sort({ subject: 1 });
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', async (req, res) => {
  const { subject, course, semester } = req.body;
  if (!subject || !course || !semester) {
    return res.status(400).json({ error: 'Subject, course, and semester are required' });
  }
  try {
    const newSubject = new Subject({ subject, course, semester });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Subject already exists for this course and semester' });
    }
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// College routes
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

router.post('/colleges', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'College name is required' });
  }
  try {
    const newCollege = new College({ name });
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'College already exists' });
    }
    res.status(500).json({ error: 'Failed to add college' });
  }
});

router.delete('/colleges/:id', async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete college' });
  }
});

// Specialization routes
router.get('/specializations', async (req, res) => {
  try {
    const specs = await Specialization.find().sort({ name: 1 });
    res.status(200).json(specs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

router.post('/specializations', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Specialization name is required' });
  }
  try {
    const newSpec = new Specialization({ name });
    await newSpec.save();
    res.status(201).json(newSpec);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Specialization already exists' });
    }
    res.status(500).json({ error: 'Failed to add specialization' });
  }
});

router.delete('/specializations/:id', async (req, res) => {
  try {
    await Specialization.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Specialization deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete specialization' });
  }
});

// Batch routes
router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ batch: 1 });
    res.status(200).json(batches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

router.post('/batches', async (req, res) => {
  const { batch } = req.body;
  if (!batch) {
    return res.status(400).json({ error: 'Batch is required' });
  }
  try {
    const newBatch = new Batch({ batch });
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Batch already exists' });
    }
    res.status(500).json({ error: 'Failed to add batch' });
  }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

// Branch routes
router.get('/branches', async (req, res) => {
  try {
    const branches = await Branch.find().sort({ branch: 1 });
    res.status(200).json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

router.post('/branches', async (req, res) => {
  const { branch } = req.body;
  if (!branch) {
    return res.status(400).json({ error: 'Branch is required' });
  }
  try {
    const newBranch = new Branch({ branch });
    await newBranch.save();
    res.status(201).json(newBranch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Branch already exists' });
    }
    res.status(500).json({ error: 'Failed to add branch' });
  }
});

router.delete('/branches/:id', async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

export default router;