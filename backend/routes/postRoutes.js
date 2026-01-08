import express from 'express';
import {
    getPosts,
    createPost,
    likePost,
    commentOnPost,
    deletePost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
    .get(getPosts)
    .post(protect, upload.single('image'), createPost);

router.route('/:id').delete(protect, deletePost);

router.route('/like/:id').put(protect, likePost);
router.route('/comment/:id').post(protect, commentOnPost);

export default router;
