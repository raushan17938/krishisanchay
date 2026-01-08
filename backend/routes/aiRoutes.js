import express from 'express';
import multer from 'multer';
import { chatWithAI, analyzeCrop } from '../controllers/aiController.js';

const router = express.Router();

// Multer setup for in-memory file storage (Gemini needs buffer or file path, buffer is cleaner for cloud functions)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Chat route
router.post('/chat', chatWithAI);

// Image analysis route
// Field name in frontend must be 'image'
router.post('/analyze', upload.single('image'), analyzeCrop);

export default router;
