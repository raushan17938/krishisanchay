import api from './axios';

// Chat with AI
export const chatWithAI = async (message, history = [], language = 'en') => {
    const response = await api.post('/ai/chat', { message, history, language });
    return response.data;
};

// Analyze Crop Image
export const analyzeCrop = async (imageFile, language = 'en') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('language', language);

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const response = await api.post('/ai/analyze', formData, config);
    return response.data;
};
