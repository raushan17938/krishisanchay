import express from 'express';
import { requestVerification, getAllRequests, updateRequestStatus, getMyRequest } from '../controllers/sellerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, requestVerification);
router.get('/my-request', protect, getMyRequest);
router.get('/requests', protect, authorize('admin'), getAllRequests);
router.put('/requests/:id', protect, authorize('admin'), updateRequestStatus);

export default router;
