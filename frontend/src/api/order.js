import api from './axios';

// Create new order
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

// Get order details
export const getOrderDetails = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

// Pay for order (Simulate or Stripe Intent)
export const payOrder = async (orderId, paymentResult) => {
    const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
    return response.data;
};

// Get My Orders
export const getMyOrders = async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
};

// Create Stripe Payment Intent
export const createPaymentIntent = async (amount) => {
    const response = await api.post('/orders/create-payment-intent', { amount });
    return response.data;
};
