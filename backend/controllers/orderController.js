import Order from '../models/Order.js';
import EmailService from '../services/EmailService.js';
import Stripe from 'stripe';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (All roles)
export const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ success: false, message: 'No order items' });
            return;
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();

            // Send Confirmation Email
            try {
                await EmailService.sendEmail(
                    req.user.email,
                    `Order Confirmation #${createdOrder._id}`,
                    'order_confirmation',
                    {
                        name: req.user.name,
                        orderId: createdOrder._id,
                        orderDate: new Date().toLocaleDateString(),
                        items: orderItems.map(item => ({
                            productName: item.name,
                            quantity: item.qty,
                            price: item.price
                        })),
                        totalAmount: totalPrice,
                        orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/${createdOrder._id}`
                    }
                );
            } catch (emailError) {
                console.error('Order confirmation email failed:', emailError);
                // Continue execution, don't fail the order just because email failed
            }

            res.status(201).json({ success: true, data: createdOrder });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            // Allow Admin, Expert, or the Order Owner to view
            if (req.user.role === 'admin' || req.user.role === 'expert' || order.user._id.equals(req.user._id)) {
                res.json({ success: true, data: order });
            } else {
                res.status(403).json({ success: false, message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();
            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ success: false, message: 'Stripe key not configured' });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Amount in paise/cents
            currency: 'inr',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Expert
export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            const updatedOrder = await order.save();

            // Send Shipping Email
            try {
                await EmailService.sendEmail(
                    order.user.email,
                    `Order Shipped #${order._id}`,
                    'order_shipped',
                    {
                        name: order.user.name,
                        orderId: order._id,
                        trackingNumber: 'TRK-' + Math.floor(Math.random() * 100000000), // Mock tracking
                        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // +3 days
                        trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/${order._id}`
                    }
                );
            } catch (emailError) {
                console.error('Order shipped email failed:', emailError);
            }

            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin/Expert
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate Delivery OTP
// @route   POST /api/orders/:id/generate-otp
// @access  Private/Admin/Expert
export const generateDeliveryOtp = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before saving (for security, though simplistic here)
        // For simplicity in this demo, saving plain (or use crypto)
        // Let's save plain for ease of demo, production should hash
        order.deliveryOtp = otp;
        order.deliveryOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await order.save();

        // Send OTP Email to User
        try {
            await EmailService.sendEmail(
                order.user.email,
                `Delivery Verification OTP for Order #${order._id}`,
                'delivery_otp',
                {
                    name: order.user.name,
                    orderId: order._id,
                    otp: otp
                }
            );
        } catch (emailError) {
            console.error('OTP email failed:', emailError);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }

        res.json({ success: true, message: 'OTP sent to user email' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Delivery OTP
// @route   POST /api/orders/:id/verify-otp
// @access  Private/Admin/Expert
export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.deliveryOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (order.deliveryOtpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        // OTP Valid - Mark as Delivered
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.deliveryOtp = undefined;
        order.deliveryOtpExpire = undefined;

        await order.save();

        res.json({ success: true, message: 'Order verified and delivered', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
