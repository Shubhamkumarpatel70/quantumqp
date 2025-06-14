import multer from 'multer';
import path from 'path';
import express from 'express';
import Post from '../models/Post.js';
import { authenticateToken } from '../middleware/auth.js';

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

// POST: Create a new post with optional file and link
router.post('/', upload.single('file'), async (req, res) => {
  const { title, content, courseCategory, link } = req.body;

  if (!title || !content || !courseCategory) {
    return res.status(400).json({ error: 'Title, content, and course category are required' });
  }

  try {
    const newPost = new Post({
      title,
      content,
      courseCategory,
      file: req.file ? req.file.filename : null, // Save file name if uploaded
      link: link || null // Save link if provided
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET: Fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET: Fetch liked posts for the authenticated user
router.get('/liked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ likedBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching liked posts:', err);
    res.status(500).json({ error: 'Failed to fetch liked posts' });
  }
});

// GET: Fetch a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// PUT: Like/unlike a post
router.put('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    const { like } = req.body;

    if (like) {
      // Add like if user hasn't liked before
      if (!post.likedBy.includes(userId)) {
        post.likes += 1;
        post.likedBy.push(userId);
      }
    } else {
      // Remove like if user has liked before
      if (post.likedBy.includes(userId)) {
        post.likes = Math.max(0, post.likes - 1);
        post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
      }
    }

    await post.save();

    // Emit socket event to all connected clients
    if (req.io) {
      req.io.emit('postUpdated', post);
    }

    res.status(200).json(post);
  } catch (err) {
    console.error('Error updating like:', err);
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// DELETE: Delete a post by ID
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Emit socket event to notify clients about the deleted post
    req.io.emit('postDeleted', { id: req.params.id });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;