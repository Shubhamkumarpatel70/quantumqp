import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true
  },
  courseCategory: {
    type: String,
    enum: {
      values: ['btech', 'bca', 'mca', 'mba', 'other'],
      message: '{VALUE} is not a valid course category'
    },
    required: [true, 'Course category is required']
  },
   file: { type: String, default: null }, // File name
  link: { type: String, default: null },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
