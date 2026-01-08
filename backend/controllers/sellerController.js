import SellerRequest from '../models/SellerRequest.js';
import User from '../models/User.js';

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

        const request = await SellerRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = status;
        request.adminComments = adminComments;
        await request.save();

        // If approved, update User status
        if (status === 'approved') {
            const user = await User.findById(request.user);
            if (user) {
                user.isVerifiedSeller = true;
                user.sellerType = request.type;
                await user.save();
            }
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
