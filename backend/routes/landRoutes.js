import express from 'express';
import {
    getLands,
    getLand,
    createLand,
    updateLand,
    deleteLand,
    requestLand,
    getLandRequests,
    updateRequestStatus,
    generateHandoverOtp,
    verifyHandoverOtp,

    getAllAllLandRequests,
    getMyLandApplications
} from '../controllers/landController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getLands)
    .post(protect, createLand);

router.route('/requests').get(protect, getLandRequests);
router.route('/my-applications').get(protect, getMyLandApplications);
router.route('/admin/requests').get(protect, admin, getAllAllLandRequests);

router.route('/requests/:id')
    .put(protect, updateRequestStatus);

router.route('/requests/:id/generate-otp')
    .post(protect, generateHandoverOtp);

router.route('/requests/:id/verify-otp')
    .post(protect, verifyHandoverOtp);

router.route('/:id')
    .get(getLand)
    .put(protect, updateLand)
    .delete(protect, deleteLand);

router.route('/:id/request')
    .post(protect, requestLand);

export default router;
