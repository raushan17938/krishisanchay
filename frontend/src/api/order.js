import api from './axios';

// Create new order
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

// Get order details
export const getOrder = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

// Pay for order
export const payOrder = async (id, paymentResult) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
};

// Create Payment Intent (Stripe)
export const createPaymentIntent = async (amount) => {
    const response = await api.post('/orders/create-payment-intent', { amount });
    return response.data;
};

// Get my orders
export const getMyOrders = async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
};

// New Stripe Session API
export const createCheckoutSession = async (orderData) => {
    const response = await api.post('/orders/create-checkout-session', orderData);
    return response.data;
};

export const confirmCheckoutSession = async (sessionId) => {
    const response = await api.post('/orders/checkout-success', { sessionId });
    return response.data;
};

// Get orders for the farmer's products
export const getFarmerOrders = async () => {
    const response = await api.get('/orders/farmer-orders');
    return response.data;
};

export const getAvailableDeliveryOrders = async () => {
    const response = await api.get('/orders/available-delivery');
    return response.data;
};

// Get all orders (Admin)
export const getAllOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};
// Update order status
export const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
};

// Generate Delivery OTP
export const generateDeliveryOtp = async (orderId) => {
    const response = await api.post(`/orders/${orderId}/generate-otp`);
    return response.data;
};

// Verify Delivery OTP
export const verifyDeliveryOtp = async (orderId, otp) => {
    const response = await api.post(`/orders/${orderId}/verify-otp`, { otp });
    return response.data;
};
