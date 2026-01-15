import SellerRequest from '../models/SellerRequest.js';
import User from '../models/User.js';
import EmailService from '../services/EmailService.js';
import { FRONTEND_URL } from '../utils/urlConfig.js';

// @desc    Submit verification request
// @route   POST /api/seller/request
// @access  Private
export const requestVerification = async (req, res) => {
    try {
        const existingRequest = await SellerRequest.findOne({ user: req.user.id, status: 'pending' });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'You already have a pending request' });
        }

        const requestData = {
            user: req.user.id,
            type: req.body.type,
            phone: req.body.phone,
            address: req.body.address,
            documentImage: req.body.documentImage || 'https://via.placeholder.com/150', // Mock if not provided
            // Optional based on type
            shopName: req.body.shopName,
            gstNumber: req.body.gstNumber,
            landSize: req.body.landSize,
            cropTypes: req.body.cropTypes
        };

        const request = await SellerRequest.create(requestData);

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get current user's request status
// @route   GET /api/seller/my-request
// @access  Private
export const getMyRequest = async (req, res) => {
    try {
        const request = await SellerRequest.findOne({ user: req.user.id }).sort({ createdAt: -1 }); // Get latest
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all verification requests
// @route   GET /api/seller/requests
// @access  Private/Admin
export const getAllRequests = async (req, res) => {
    try {
        const requests = await SellerRequest.find({ status: 'pending' }).populate('user', 'name email');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/seller/requests/:id
// @access  Private/Admin
export const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await SellerRequest.findById(req.params.id).populate('user', 'name email');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = status;
        request.adminComments = adminComments;
        await request.save();

        const user = request.user;
        let additionalInfo = '';

        // If approved, update User status
        if (status === 'approved') {
            if (user) {
                user.isVerifiedSeller = true;
                user.sellerType = request.type;
                await user.save();
                additionalInfo = 'You can now list products and manage your seller profile.';
            }
        } else {
            additionalInfo = adminComments ? `Reason: ${adminComments}` : 'Please contact support for more details.';
        }

        // Send Email
        if (user && user.email) {
            try {
                await EmailService.sendEmail(
                    user.email,
                    `Seller Application ${status.charAt(0).toUpperCase() + status.slice(1)} - Krishi Sanchay`,
                    'seller_status_update',
                    {
                        name: user.name,
                        status: status.toUpperCase(),
                        statusClass: status === 'approved' ? 'status-approved' : 'status-rejected',
                        message: status === 'approved' ? 'Congratulations! Your application has been approved.' : 'We regret to inform you that your application has been rejected.',
                        additionalInfo,
                        dashboardUrl: `${FRONTEND_URL}/dashboard`
                    }
                );
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
                // Continue execution, don't fail the request
            }
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
