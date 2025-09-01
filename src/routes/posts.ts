import express from 'express';
import {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment
} from '../controllers/postController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getAllPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);

export default router;