import axios from './axios';

// Get all users (Admin only)
export const getUsers = () => {
    return axios.get('/admin/users');
};

// Update user status
export const updateUserStatus = (id, status) => {
    return axios.put(`/admin/users/${id}/status`, { status });
};


// Get Seller Requests
export const getSellerRequests = () => {
    return axios.get('/seller/requests');
};

// Update Request Status
export const updateRequestStatus = (id, status, adminComments = '') => {
    return axios.put(`/seller/requests/${id}`, { status, adminComments });
};

// Get All Land Requests (Admin)
export const getAllLandRequests = () => {
    return axios.get('/land/admin/requests');
};
