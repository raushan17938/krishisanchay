import mongoose from 'mongoose';

const sellerRequestSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['farmer', 'shopkeeper'],
            required: true
        },
        // Common fields
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        // Shopkeeper specific
        shopName: String,
        gstNumber: String,

        // Farmer specific
        landSize: String,
        cropTypes: [String],

        // Verification
        documentImage: {
            type: String, // URL to ID proof or Shop License
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        adminComments: String
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('SellerRequest', sellerRequestSchema);
