import mongoose from 'mongoose';

const landRequestSchema = mongoose.Schema(
    {
        land: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Land',
        },
        user: { // The person requesting the land (Renter/Buyer)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        owner: { // The owner of the land
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'handover_in_progress', 'completed'],
            default: 'pending',
        },
        requestMessage: {
            type: String,
        },
        duration: { // For rent
            type: String,
        },
        handoverOtp: {
            type: String,
        },
        handoverOtpExpire: {
            type: Date,
        },
        handoverDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('LandRequest', landRequestSchema);
