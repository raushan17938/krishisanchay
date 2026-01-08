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
    createPaymentIntent
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /api/orders
router.route('/')
    .post(protect, addOrderItems) // Anyone can buy
    .get(protect, authorize('admin', 'expert'), getOrders); // Only Admin/Expert can see all orders

router.route('/myorders').get(protect, getMyOrders);
router.route('/create-payment-intent').post(protect, createPaymentIntent);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/pay')
    .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
    .put(protect, authorize('admin', 'expert'), updateOrderToDelivered);

router.route('/:id/generate-otp')
    .post(protect, authorize('admin', 'expert'), generateDeliveryOtp);

router.route('/:id/verify-otp')
    .post(protect, authorize('admin', 'expert'), verifyDeliveryOtp);

export default router;
