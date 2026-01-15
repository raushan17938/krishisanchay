import axios from './axios';

// Submit Seller Verification Request
export const requestVerification = (data) => {
    return axios.post('/seller/request', data);
};

// Get My Seller Verification Request
export const getMySellerRequest = () => {
    return axios.get('/seller/my-request');
};
