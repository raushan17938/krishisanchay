import axios from './axios';

export const getJobs = (filters = {}) => {
    // Convert filters to query string if needed, or pass as params
    // filters: search, location, type, state
    return axios.get('/jobs', { params: filters });
};

export const getJob = (id) => {
    return axios.get(`/jobs/${id}`);
};

export const createJob = (jobData) => {
    return axios.post('/jobs', jobData);
};

export const applyJob = (id) => {
    return axios.post(`/jobs/${id}/apply`);
};

export const getMyJobs = () => {
    return axios.get('/jobs/my-jobs');
};
