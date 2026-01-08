import api from './axios';

// Upload an image
export const uploadImage = async (fileRaw) => {
    const formData = new FormData();
    formData.append('image', fileRaw);

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const response = await api.post('/upload', formData, config);
    return response.data;
};
