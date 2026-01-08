import 'dotenv/config'; // Load env vars
import mongoose from 'mongoose';
import User from '../models/User.js'; // Adjust path if needed

const normalizeEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking for normalization...`);

        let updatedCount = 0;

        for (const user of users) {
            const lowerEmail = user.email.toLowerCase();
            if (user.email !== lowerEmail) {
                console.log(`Normalizing: ${user.email} -> ${lowerEmail}`);
                user.email = lowerEmail;
                try {
                    await user.save();
                    updatedCount++;
                } catch (err) {
                    console.error(`Failed to update ${user.email}:`, err.message);
                }
            }
        }

        console.log(`Normalization Complete. Updated ${updatedCount} users.`);
        process.exit();

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

normalizeEmails();
