import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    generateDeliveryOtp,
    verifyDeliveryOtp,
    createCheckoutSession,
    checkoutSuccess,
    getFarmerOrders,
    getAvailableDeliveryOrders,
    updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /api/orders
router.route('/')
    .post(protect, addOrderItems) // Anyone can buy
    .get(protect, authorize('admin', 'expert'), getOrders); // Only Admin/Expert can see all orders

router.route('/myorders').get(protect, getMyOrders);
router.route('/farmer-orders').get(protect, getFarmerOrders);
router.route('/available-delivery').get(protect, getAvailableDeliveryOrders);

router.route('/create-checkout-session').post(protect, createCheckoutSession);
router.route('/checkout-success').post(protect, checkoutSuccess);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/pay')
    .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
    .put(protect, authorize('admin', 'expert'), updateOrderToDelivered);

router.route('/:id/generate-otp')
    .post(protect, generateDeliveryOtp);

router.route('/:id/verify-otp')
    .post(protect, verifyDeliveryOtp);

router.route('/:id/status')
    .put(protect, updateOrderStatus);



export default router;
