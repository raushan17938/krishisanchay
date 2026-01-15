import Land from '../models/Land.js';
import LandRequest from '../models/LandRequest.js';
import EmailService from '../services/EmailService.js';

// @desc    Get all lands
// @route   GET /api/land
// @access  Public
export const getLands = async (req, res) => {
    try {
        const lands = await Land.find().populate('owner', 'name email avatar');
        res.status(200).json({ success: true, count: lands.length, data: lands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single land
// @route   GET /api/land/:id
// @access  Public
export const getLand = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id).populate('owner', 'name email avatar');

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land listing not found' });
        }

        res.status(200).json({ success: true, data: land });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new land listing
// @route   POST /api/land
// @access  Private
export const createLand = async (req, res) => {
    try {
        req.body.owner = req.user.id;

        const land = await Land.create(req.body);

        res.status(201).json({ success: true, data: land });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update land listing
// @route   PUT /api/land/:id
// @access  Private
export const updateLand = async (req, res) => {
    try {
        let land = await Land.findById(req.params.id);

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land listing not found' });
        }

        // Make sure user is owner or admin
        if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this listing' });
        }

        land = await Land.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: land });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete land listing
// @route   DELETE /api/land/:id
// @access  Private
export const deleteLand = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land listing not found' });
        }

        // Make sure user is owner or admin
        if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
        }

        // Delete image from Cloudinary if exists
        if (land.imagePublicId) {
            await cloudinary.uploader.destroy(land.imagePublicId);
        }

        await land.deleteOne();

        res.status(200).json({ success: true, message: 'Land listing removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Request to rent/buy land
// @route   POST /api/land/:id/request
// @access  Private
export const requestLand = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);

        if (!land) {
            return res.status(404).json({ success: false, message: 'Land not found' });
        }

        // Check if user is owner
        if (land.owner.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Owner cannot request their own land' });
        }

        const request = await LandRequest.create({
            land: land._id,
            user: req.user._id,
            owner: land.owner,
            requestMessage: req.body.message,
            duration: req.body.duration
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get requests for my lands (Owner view)
// @route   GET /api/land/requests
// @access  Private
export const getLandRequests = async (req, res) => {
    try {
        // Find requests where I am the owner
        const requests = await LandRequest.find({ owner: req.user._id })
            .populate('user', 'name email phone')
            .populate('land', 'title location');

        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get my sent land applications
// @route   GET /api/land/my-applications
// @access  Private
export const getMyLandApplications = async (req, res) => {
    try {
        const applications = await LandRequest.find({ user: req.user._id })
            .populate('land', 'title location image price')
            .populate('owner', 'name email phone mobile');

        res.json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Get ALL land requests (Admin view)
// @route   GET /api/land/admin/requests
// @access  Private (Admin)
export const getAllAllLandRequests = async (req, res) => {
    try {
        const requests = await LandRequest.find({})
            .populate('user', 'name email')
            .populate('owner', 'name email')
            .populate('land', 'title location');

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/land/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await LandRequest.findById(req.params.id)
            .populate('user', 'name email')
            .populate('owner', 'name phone mobile')
            .populate('land', 'title');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        const year = new Date().getFullYear();

        // Enforce Single Approval Logic
        if (status === 'approved') {
            // 1. Reject all other PENDING requests for this SAME land
            await LandRequest.updateMany(
                {
                    land: request.land._id,
                    _id: { $ne: request._id }, // Not this request
                    status: 'pending'
                },
                {
                    status: 'rejected'
                }
            );

            // Send Approval Email
            try {
                await EmailService.sendEmail(
                    request.user.email,
                    'Land Request Approved',
                    'request_approved',
                    {
                        name: request.user.name,
                        landTitle: request.land.title,
                        ownerName: request.owner.name,
                        ownerPhone: request.owner.phone || request.owner.mobile || 'N/A',
                        year
                    }
                );
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }

        } else if (status === 'rejected') {
            // Send Rejection Email
            try {
                await EmailService.sendEmail(
                    request.user.email,
                    'Land Request Update',
                    'request_rejected',
                    {
                        name: request.user.name,
                        landTitle: request.land.title,
                        year
                    }
                );
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
            }
        }

        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Generate Handover OTP
// @route   POST /api/land/requests/:id/generate-otp
// @access  Private (Owner)
export const generateHandoverOtp = async (req, res) => {
    try {
        const request = await LandRequest.findById(req.params.id).populate('user', 'name email');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (request.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Request must be approved first' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        request.handoverOtp = otp;
        request.handoverOtpExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        request.status = 'handover_in_progress';

        await request.save();

        // Send OTP to Renter/Buyer
        try {
            await EmailService.sendEmail(
                request.user.email,
                `Land Handover Verification OTP`,
                'land_handover_otp',
                {
                    name: request.user.name,
                    landTitle: 'Land Handover',
                    otp: otp
                }
            );
        } catch (emailError) {
            console.error('OTP email failed:', emailError);
            // Return success anyway as OTP is generated
        }

        res.json({ success: true, message: 'OTP sent to renter/buyer' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Verify Handover OTP
// @route   POST /api/land/requests/:id/verify-otp
// @access  Private (Owner)
export const verifyHandoverOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const request = await LandRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (request.handoverOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (request.handoverOtpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        // OTP Valid - Mark as Handed Over/Completed
        request.status = 'completed';
        request.handoverDate = Date.now();
        request.handoverOtp = undefined;
        request.handoverOtpExpire = undefined;

        await request.save();

        // Optionally update Land status to 'rented' or 'sold' if needed
        // await Land.findByIdAndUpdate(request.land, { status: 'occupied' });

        res.json({ success: true, message: 'Handover verified successfully', data: request });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
