import express from 'express';
import {
    createJob,
    getJobs,
    getJob,
    applyJob,
    getMyJobs,
    updateApplicationStatus,
    getAppliedJobs
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getJobs)
    .post(protect, createJob);

router.get('/my-jobs', protect, getMyJobs);
router.get('/applied-jobs', protect, getAppliedJobs);

router.route('/:id')
    .get(getJob);

router.post('/:id/apply', protect, applyJob);

router.put('/:id/applications/:userId', protect, updateApplicationStatus);

export default router;
