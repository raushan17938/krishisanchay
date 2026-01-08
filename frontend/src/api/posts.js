import axios from './axios';

// Note: Base URL in axios.js is '/api', so we remove '/api' from here to avoid double prefix
// unless axios.js has changed. I'll stick to '/posts' assuming axios base is ending in /api

export const getPosts = (query = '') => {
    return axios.get(`/posts${query}`);
};

export const createPost = (postData) => {
    const config = {
        headers: {
            'Content-Type': postData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    return axios.post('/posts', postData, config);
};

export const likePost = (id) => {
    return axios.put(`/posts/like/${id}`);
};

export const commentOnPost = (id, commentData) => {
    return axios.post(`/posts/comment/${id}`, commentData);
};

export const deletePost = (id) => {
    return axios.delete(`/posts/${id}`);
};
