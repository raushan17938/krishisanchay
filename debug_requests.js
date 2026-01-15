
import mongoose from 'mongoose';
import SellerRequest from './backend/models/SellerRequest.js'; // Adjust path if needed
import dotenv from 'dotenv';

// dotenv.config({ path: './backend/.env' });
const MONGO_URI = "mongodb://localhost:27017/krishi_sanchay"; // Assuming local or I will guess.
// Actually, I can't guess easily. I will try to read server.js to see if it logs it or uses it.
// Better: I will use process.cwd() to help dotenv find the file.
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const requests = await SellerRequest.find({});
        console.log('All Seller Requests:', JSON.stringify(requests, null, 2));

        const pending = await SellerRequest.find({ status: 'pending' });
        console.log('Pending Requests:', pending.length);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

connectDB();
