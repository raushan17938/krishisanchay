import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        image: {
            type: String,
            default: 'no-photo.jpg',
        },
        countInStock: {
            type: Number,
            required: true,
            default: 0,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Product', productSchema);
