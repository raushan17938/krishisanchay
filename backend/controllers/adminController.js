import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'sellerrequests',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'sellerRequests'
                }
            },
            {
                $addFields: {
                    sellerDetails: {
                        $let: {
                            vars: {
                                approvedRequest: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$sellerRequests",
                                                as: "req",
                                                cond: { $eq: ["$$req.status", "approved"] }
                                            }
                                        }, 0
                                    ]
                                }
                            },
                            in: "$$approvedRequest"
                        }
                    },
                    verificationDoc: {
                        $let: {
                            vars: {
                                approvedRequest: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$sellerRequests",
                                                as: "req",
                                                cond: { $eq: ["$$req.status", "approved"] }
                                            }
                                        }, 0
                                    ]
                                }
                            },
                            in: "$$approvedRequest.documentImage"
                        }
                    }
                }
            },
            { $project: { password: 0, sellerRequests: 0 } }
        ]);

        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from suspending themselves (though middleware should block non-admins)
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot change your own status' });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
