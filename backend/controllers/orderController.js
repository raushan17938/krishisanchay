import Order from '../models/Order.js';
import Product from '../models/Product.js';
import EmailService from '../services/EmailService.js';
import Stripe from 'stripe';
import { FRONTEND_URL } from '../utils/urlConfig.js';

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
                const itemsHtml = orderItems.map(item => `
                <div class="order-row">
                    <span>${item.name} (x${item.qty})</span>
                    <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
                `).join('');

                await EmailService.sendEmail(
                    req.user.email,
                    `Order Confirmation #${createdOrder._id}`,
                    'order_confirmation',
                    {
                        name: req.user.name,
                        orderId: createdOrder._id,
                        orderDate: new Date().toLocaleDateString('en-IN'),
                        itemsHtml: itemsHtml,
                        totalAmount: totalPrice.toLocaleString('en-IN'),
                        orderUrl: `${FRONTEND_URL}/order/${createdOrder._id}`
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
                        trackingUrl: `${FRONTEND_URL}/order/${order._id}`
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
        const orders = await Order.find({})
            .populate('user', 'id name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate Delivery OTP
// @route   POST /api/orders/:id/generate-otp
// @access  Private (Admin/Expert/Seller)
export const generateDeliveryOtp = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check authorization: Admin, Expert, or Seller of the product
        let isAuthorized = req.user.role === 'admin' || req.user.role === 'expert';
        if (!isAuthorized) {
            // Check if user is the seller of any item in the order
            // We need to fetch the products to check seller
            // Or assume we populate orderItems.product.seller... 
            // Better to query Product to check ownership like in getFarmerOrders
            // Optimize: Check if any order item's product is owned by req.user
            const productIds = order.orderItems.map(item => item.product);
            const products = await Product.find({ _id: { $in: productIds }, seller: req.user._id });
            if (products.length > 0) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to generate OTP for this order' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
// @access  Private (Admin/Expert/Seller)
export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check authorization
        let isAuthorized = req.user.role === 'admin' || req.user.role === 'expert';
        if (!isAuthorized) {
            const productIds = order.orderItems.map(item => item.product);
            const products = await Product.find({ _id: { $in: productIds }, seller: req.user._id });
            if (products.length > 0) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to verify OTP for this order' });
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
        order.orderStatus = 'Delivered';
        order.deliveryOtp = undefined;
        order.deliveryOtpExpire = undefined;

        await order.save();

        // Send Delivery Confirmation Email
        try {
            await EmailService.sendEmail(
                order.user.email,
                `Order Delivered #${order._id}`,
                'order_status_update',
                {
                    name: order.user.name,
                    orderId: order._id,
                    status: 'Delivered',
                    message: 'Your order has been verified and successfully delivered.',
                    orderUrl: `${FRONTEND_URL}/order/${order._id}`
                }
            );
        } catch (e) {
            console.error("Delivery confirmation email failed", e);
        }

        res.json({ success: true, message: 'Order verified and delivered', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get orders for products sold by the logged-in farmer
// @route   GET /api/orders/farmer-orders
// @access  Private (Farmers)
export const getFarmerOrders = async (req, res) => {
    try {
        console.log(`Fetching orders for seller: ${req.user._id}`);
        // 1. Find all products sold by this farmer
        const products = await Product.find({ seller: req.user._id });
        const productIds = products.map(p => p._id);

        console.log(`Found ${products.length} products for this seller.`);

        if (productIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 2. Find orders that contain any of these products
        const orders = await Order.find({
            'orderItems.product': { $in: productIds }
        }).populate('user', 'name email')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders matching seller products.`);

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error in getFarmerOrders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// -- New Stripe Session Implementation based on User Request --

export const createCheckoutSession = async (req, res) => {
    try {
        // Adapt request body to user's expected format if needed, or assume frontend sends 'products'
        const { products, shippingAddress } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "inr", // Changed to INR for Indian context
                    product_data: {
                        name: product.name,
                        images: product.image ? [product.image] : [],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        // AI Fraud Detection removed as requested

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY is missing in backend .env");
            return res.status(500).json({ error: "Server misconfiguration: Stripe key missing" });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Adjust Success URL to match React Router route
        // Use the origin of the request to determine where to redirect back
        const clientUrl = req.headers.origin || FRONTEND_URL;

        // Sanitize line items for Stripe because valid image URLs are required
        const safeLineItems = lineItems.map(item => {
            const newItem = { ...item };
            // Check if image is a valid URL, otherwise remove it
            if (newItem.price_data.product_data.images && newItem.price_data.product_data.images.length > 0) {
                const img = newItem.price_data.product_data.images[0];
                if (!img.startsWith('http')) {
                    newItem.price_data.product_data.images = [];
                }
            }
            return newItem;
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: safeLineItems,
            mode: "payment",
            success_url: `${clientUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/cart`,
            metadata: {
                userId: req.user._id.toString(),
                // Products removed to avoid 500 character limit
            },
        });

        // 2. Create the Order in DB immediately (Pending Payment)
        // This solves the metadata limit issue
        const newOrder = new Order({
            user: req.user._id,
            orderItems: products.map((product) => ({
                product: product._id || product.id, // Fixed: Handle both _id and id
                name: product.name,
                qty: product.quantity,
                image: product.image,
                price: product.price,
            })),
            shippingAddress: shippingAddress,
            paymentMethod: 'Stripe',
            itemsPrice: totalAmount / 100,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: totalAmount / 100,
            stripeSessionId: session.id,
            isPaid: false,
        });

        await newOrder.save();

        res.status(200).json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            // Find the pending order linked to this session
            const order = await Order.findOne({ stripeSessionId: sessionId });

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found for this session." });
            }

            if (order.isPaid) {
                return res.status(200).json({ success: true, message: "Order already processed", orderId: order._id });
            }

            // Update Order to Paid
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: session.payment_intent,
                status: session.payment_status,
                update_time: new Date().toISOString(),
                email_address: session.customer_details?.email
            };

            await order.save();

            // Send confirmation email
            try {
                const orderItems = order.orderItems;
                const itemsHtml = orderItems.map(item => `
                <div class="order-row">
                    <span>${item.name} (x${item.qty})</span>
                    <span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
                `).join('');

                await EmailService.sendEmail(
                    session.customer_details?.email || req.user.email,
                    `Order Confirmation #${order._id}`,
                    'order_confirmation',
                    {
                        name: session.customer_details?.name || 'Customer',
                        orderId: order._id,
                        orderDate: new Date().toLocaleDateString('en-IN'),
                        itemsHtml: itemsHtml,
                        totalAmount: order.totalPrice.toLocaleString('en-IN'),
                        orderUrl: `${FRONTEND_URL}/order/${order._id}`
                    }
                );
            } catch (emailError) {
                console.error('Order confirmation email failed:', emailError);
            }

            res.status(200).json({
                success: true,
                message: "Payment successful and order updated.",
                orderId: order._id,
                order: order
            });
        } else {
            res.status(400).json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
};

// @desc    Get all orders available for delivery (not delivered yet)
// @route   GET /api/orders/available-delivery
// @access  Private (Farmers/Experts)
export const getAvailableDeliveryOrders = async (req, res) => {
    try {
        // Find orders that are paid but not delivered
        // You might want to filter by location later
        const orders = await Order.find({
            isPaid: true,
            isDelivered: false
        }).populate('user', 'name location address');

        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Expert/Seller)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.orderStatus = status;

        // If delivered, set timestamps and isDelivered flag
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        // Send Email Notification
        try {
            let message = '';
            switch (status) {
                case 'Processing':
                    message = 'Your order is currently being processed by the seller.';
                    break;
                case 'Shipped':
                    message = 'Good news! Your order has been shipped and is on its way.';
                    break;
                case 'Out for Delivery':
                    message = 'Your order is out for delivery and will resolve shortly.';
                    break;
                case 'Delivered':
                    message = 'Your order has been successfully delivered. Thank you for shopping with us!';
                    break;
                case 'Cancelled':
                    message = 'Your order has been cancelled.';
                    break;
                default:
                    message = `Your order status is now: ${status}`;
            }

            await EmailService.sendEmail(
                order.user.email,
                `Order Status Update #${order._id}`,
                'order_status_update',
                {
                    name: order.user.name,
                    orderId: order._id,
                    status: status,
                    message: message,
                    orderUrl: `${FRONTEND_URL}/order/${order._id}`
                }
            );
        } catch (emailError) {
            console.error('Status update email failed:', emailError);
        }

        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
