import express from 'express';
import { register, login, getMe, updateProfile, logout, googleAuth, googleCallback, githubAuth, githubCallback, setPassword, forgotPassword, verifyOtp, resetPassword, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
// Google
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// GitHub
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.post('/set-password', protect, setPassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put('/profile', protect, upload.single('avatar'), updateProfile); // Add profile update route
router.get('/logout', logout);

export default router;
