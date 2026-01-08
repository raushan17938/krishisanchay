import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Please add post content'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        image: {
            type: String,
        },
        tags: [String],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: {
                    type: String,
                    required: true,
                },
                name: String,
                avatar: String,
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Post', postSchema);
