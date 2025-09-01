import express from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;