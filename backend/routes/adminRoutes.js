import express from 'express';
import { getUsers, updateUserStatus } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
