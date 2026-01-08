import api from './axios';

// Get all lands (public/filtered)
export const getLands = async (filters = {}) => {
    const response = await api.get('/land', { params: filters });
    return response.data;
};

// Get single land details
export const getLand = async (id) => {
    const response = await api.get(`/land/${id}`);
    return response.data;
};

// Create new land listing
export const createLand = async (landData) => {
    // Determine if we need to send as FormData (for files) or JSON
    // If landData is already FormData, use it, else assume JSON
    const config = {
        headers: {
            'Content-Type': landData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    const response = await api.post('/land', landData, config);
    return response.data;
};

// Update land listing
export const updateLand = async (id, landData) => {
    const config = {
        headers: {
            'Content-Type': landData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    const response = await api.put(`/land/${id}`, landData, config);
    return response.data;
};

// Delete land listing
export const deleteLand = async (id) => {
    const response = await api.delete(`/land/${id}`);
    return response.data;
};

// Request land (for renting)
export const requestLand = async (id, requestData) => {
    const response = await api.post(`/land/${id}/request`, requestData);
    return response.data;
};

// Get requests for my lands
export const getLandRequests = async () => {
    const response = await api.get('/land/requests');
    return response.data;
};

// Update request status (approve/reject)
export const updateRequestStatus = async (requestId, status) => {
    const response = await api.put(`/land/requests/${requestId}`, { status });
    return response.data;
};
