import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: false, // Changed to false for social-only users
            minlength: 6,
            select: false,
        },
        authMethods: {
            type: [String],
            enum: ['email', 'google', 'github'],
            default: ['email']
        },
        googleId: {
            type: String,
            sparse: true,
            select: false
        },
        githubId: {
            type: String,
            sparse: true,
            select: false
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        verificationOtp: {
            type: String,
            select: false
        },
        verificationOtpExpire: {
            type: Date,
            select: false
        },
        resetPasswordOtp: {
            type: String,
            select: false
        },
        resetPasswordExpire: {
            type: Date,
            select: false
        },
        role: {
            type: String,
            enum: ['farmer', 'buyer', 'expert', 'admin'],
            default: 'farmer',
        },
        avatar: {
            type: String,
            default: 'no-photo.jpg',
        },
        mobile: {
            type: String,
        },
        location: {
            village: String,
            district: String,
            state: String,
            pincode: String,
            // Keeping old fields just in case, though likely unused now
            address: String,
            city: String,
            zip: String,
        },
        skills: {
            experience: String,
            specialization: String,
            landSize: String, // String or Number, keeping simple
        },
        bio: String,
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        isVerifiedSeller: {
            type: Boolean,
            default: false,
        },
        sellerType: {
            type: String,
            enum: ['farmer', 'shopkeeper', 'none'],
            default: 'none',
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
