import GeminiService from '../services/GeminiService.js';

// @desc    Chat with AI Advisor
// @route   POST /api/ai/chat
// @access  Public (or Private if you want to restrict)
export const chatWithAI = async (req, res) => {
    try {
        const { history, message, language } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // history is optional, default to empty array
        const chatHistory = history || [];

        // Pass language to service (default to 'en' if not provided)
        const reply = await GeminiService.chat(chatHistory, message, language || 'en');

        res.json({
            success: true,
            reply
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get AI response' });
    }
};

// @desc    Analyze Crop Image
// @route   POST /api/ai/analyze
// @access  Public
export const analyzeCrop = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        const language = req.body.language || 'en';

        const analysis = await GeminiService.analyzeImage(imageBuffer, mimeType, language);

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Crop Analysis Error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze crop' });
    }
};
