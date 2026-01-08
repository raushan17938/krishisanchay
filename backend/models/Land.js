import mongoose from 'mongoose';

const landSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        location: {
            type: String,
            required: [true, 'Please add location'],
        },
        size: {
            type: String, // e.g., "5 acres"
            required: [true, 'Please add size'],
        },
        price: {
            type: Number,
            required: [true, 'Please add price'],
        },
        description: String,
        image: {
            type: String,
            default: 'no-photo.jpg',
        },
        imagePublicId: {
            type: String
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['rent', 'sell', 'lease'],
            default: 'rent'
        },
        lat: Number,
        lng: Number,
        soilType: String,
        waterSource: String,
        crops: String // Storing as comma-separated string or you could use [String]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Land', landSchema);
