import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Please add company/farm name']
    },
    recruiter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: [true, 'Please add location']
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pay: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        type: {
            type: String,
            enum: ['per day', 'per month', 'per hour', 'per task'],
            default: 'per day'
        }
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Seasonal', 'Contract'],
        default: 'Full-time'
    },
    duration: String, // e.g. "2 months"
    workingHours: String, // e.g. "9 AM - 5 PM"
    startDate: Date,
    endDate: Date,
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    requirements: String,
    responsibilities: String,
    benefits: String,
    skills: [String],

    // Additional Perks
    accommodationProvided: { type: Boolean, default: false },
    transportationProvided: { type: Boolean, default: false },
    mealsProvided: { type: Boolean, default: false },

    // Contact Info
    contactName: { type: String, required: true },
    designation: String,
    phone: { type: String, required: true },
    whatsapp: String,

    applicants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'rejected', 'hired'],
            default: 'applied'
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Job', jobSchema);
