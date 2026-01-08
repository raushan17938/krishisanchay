import api from './axios';

// Register User
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Login User
export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Logout User
export const logoutUser = async () => {
    try {
        await api.get('/auth/logout');
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        localStorage.removeItem('token');
    }
};

// Get Current User
export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

// Verify OTP (Password Reset)
export const verifyOtp = async (data) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
};

// Verify Email (Signup)
export const verifyEmail = async (data) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
};

// Reset Password
export const resetPassword = async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};

// Social Login
export const socialLogin = async (data) => {
    const response = await api.post('/auth/social-login', data);
    return response.data;
}

// Set Password (for social login users)
export const setPassword = async (data) => {
    const response = await api.post('/auth/set-password', data);
    return response.data;
}

// Update User Profile
// Update User Profile
export const updateProfile = async (userData) => {
    const isFormData = userData instanceof FormData;
    const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const response = await api.put('/auth/profile', userData, config);
    return response.data;
};
