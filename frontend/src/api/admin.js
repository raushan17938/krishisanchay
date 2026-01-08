import axios from './axios';

// Get all users (Admin only)
export const getUsers = () => {
    return axios.get('/admin/users');
};

// Update user status
export const updateUserStatus = (id, status) => {
    return axios.put(`/admin/users/${id}/status`, { status });
};

// Get Dashboard Stats (Aggregated)
// If backend doesn't have a dedicated stats endpoint, we might have to aggregate on frontend
// or create a new endpoint. For now, frontend aggregation is fine as we are fetching all lists.
