import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Land from './models/Land.js';
import Job from './models/Job.js';
import Post from './models/Post.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const products = [
    {
        name: 'Organic Wheat Seeds (High Yield)',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1000',
        description: 'Premium organic wheat seeds suitable for all soil types. High resistance to diseases and drought.',
        category: 'Seeds',
        price: 1200,
        countInStock: 50,
        rating: 4.5,
        numReviews: 12,
    },
    {
        name: 'NPK 19-19-19 Fertilizer',
        image: 'https://images.unsplash.com/photo-1627920769842-832af6d31b01?auto=format&fit=crop&q=80&w=1000',
        description: 'Balanced water-soluble fertilizer for vegetative growth. Provides Nitrogen, Phosphorus, and Potassium in equal ratio.',
        category: 'Fertilizers',
        price: 850,
        countInStock: 100,
        rating: 4.0,
        numReviews: 8,
    },
    {
        name: 'Heavy Duty Tractor',
        image: 'https://images.unsplash.com/photo-1595117326841-f703566735c3?auto=format&fit=crop&q=80&w=1000',
        description: '50 HP Tractor for heavy field work. Fuel efficient and low maintenance.',
        category: 'Machinery',
        price: 650000,
        countInStock: 3,
        rating: 4.8,
        numReviews: 4,
    },
    {
        name: 'Pesticide Sprayer Pump',
        image: 'https://images.unsplash.com/photo-1622383563227-0440113a8627?auto=format&fit=crop&q=80&w=1000',
        description: '16L capacity battery operated sprayer. Comfortable back strap and high pressure nozzle.',
        category: 'Equipment',
        price: 3200,
        countInStock: 30,
        rating: 4.6,
        numReviews: 15,
    },
    {
        name: 'Hybrid Tomato Seeds',
        image: 'https://images.unsplash.com/photo-1561136594-8f906f976160?auto=format&fit=crop&q=80&w=1000',
        description: 'Disease resistant hybrid tomato seeds. Produces firm and juicy tomatoes suitable for long transport.',
        category: 'Seeds',
        price: 450,
        countInStock: 80,
        rating: 4.3,
        numReviews: 6,
    },
    {
        name: 'Drip Irrigation Kit',
        image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=1000',
        description: 'Complete drip irrigation kit for 1 acre land. Saves water and ensures uniform growth.',
        category: 'Equipment',
        price: 15000,
        countInStock: 20,
        rating: 4.2,
        numReviews: 10,
    }
];

const lands = [
    {
        title: 'Fertile Agricultural Land for Rent',
        location: 'Punjab, India',
        size: '5 Acres',
        price: 25000,
        description: 'Highly fertile land with canal water access. Suitable for Wheat and Paddy.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
        type: 'rent',
        soilType: 'Alluvial',
        waterSource: 'Canal + Tube well',
        crops: 'Wheat, Paddy, Sugarcane',
        lat: 30.7333,
        lng: 76.7794
    },
    {
        title: 'Organic Farm for Lease',
        location: 'Kerala, India',
        size: '2 Acres',
        price: 15000,
        description: 'Certified organic farm available for long term lease. Ideal for spices and fruits.',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000',
        type: 'lease',
        soilType: 'Red Loam',
        waterSource: 'Rainfed + Well',
        crops: 'Pepper, Cardamom, Banana',
        lat: 10.8505,
        lng: 76.2711
    },
    {
        title: 'Orchard Land for Sale',
        location: 'Himachal Pradesh, India',
        size: '10 Bigha',
        price: 4500000,
        description: 'Beautiful apple orchard land with mountain view. Road access available.',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000',
        type: 'sell',
        soilType: 'Mountain Soil',
        waterSource: 'Spring',
        crops: 'Apple, Cherry',
        lat: 31.1048,
        lng: 77.1734
    }
];

const jobs = [
    {
        title: 'Farm Manager',
        company: 'Green Valley Farms',
        location: 'Nasik, Maharashtra',
        state: 'Maharashtra',
        city: 'Nasik',
        pay: { min: 25000, max: 40000, type: 'per month' },
        jobType: 'Full-time',
        duration: 'Permanent',
        workingHours: '8 AM - 5 PM',
        description: 'Looking for an experienced Farm Manager to oversee daily operations of a 50-acre vineyard.',
        requirements: 'B.Sc Agriculture, 3+ years experience in vineyard management.',
        skills: ['Team Management', 'Grape Cultivation', 'Inventory Management'],
        contactName: 'Ramesh Patil',
        phone: '9876543210'
    },
    {
        title: 'Tractor Driver',
        company: 'Singh Brothers Agriculture',
        location: 'Amritsar, Punjab',
        state: 'Punjab',
        city: 'Amritsar',
        pay: { min: 800, max: 1200, type: 'per day' },
        jobType: 'Seasonal',
        duration: '2 Months',
        workingHours: '6 AM - 4 PM',
        description: 'Experienced driver needed for wheat harvesting season.',
        requirements: 'Valid Heavy Vehicle License, Experience with Harvester.',
        skills: ['Driving', 'Machine Maintenance'],
        contactName: 'Gurpreet Singh',
        phone: '9876543211',
        accommodationProvided: true,
        mealsProvided: true
    },
    {
        title: 'Cotton Picker',
        company: 'Laxmi Agro',
        location: 'Warangal, Telangana',
        state: 'Telangana',
        city: 'Warangal',
        pay: { min: 500, max: 800, type: 'per day' },
        jobType: 'Contract',
        duration: '1 Month',
        workingHours: '7 AM - 3 PM',
        description: 'Manual cotton picking labor required.',
        requirements: 'Previous experience preferred.',
        skills: ['Harvesting'],
        contactName: 'Reddy',
        phone: '9876543212'
    }
];

const posts = [
    {
        content: 'Just harvested my first batch of organic turmeric! The yield is amazing this year thanks to the new drip irrigation system. #OrganicFarming #Harvest',
        image: 'https://images.unsplash.com/photo-1615485500704-8e99099928d3?auto=format&fit=crop&q=80&w=1000',
        tags: ['Organic', 'Success', 'Turmeric'],
    },
    {
        content: 'Is anyone facing issues with Fall Armyworm in maize? Looking for organic control methods. Please suggest.',
        tags: ['PestControl', 'Maize', 'Help'],
    },
    {
        content: 'Attended the Krishi Vigyan Kendra workshop today. Learned a lot about soil health management. Highly recommended for young farmers.',
        image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=1000',
        tags: ['Learning', 'SoilHealth', 'KVK'],
    }
];

const importData = async () => {
    try {
        const users = await User.find({});

        if (users.length === 0) {
            console.error('No users found. Please register at least one user first.');
            process.exit(1);
        }

        const adminUser = users[0]._id; // Assign first user as owner/creator

        // Prepare data with user ID
        const sampleProducts = products.map(p => ({ ...p, seller: adminUser }));
        const sampleLands = lands.map(l => ({ ...l, owner: adminUser }));
        const sampleJobs = jobs.map(j => ({ ...j, recruiter: adminUser }));
        const samplePosts = posts.map(p => ({ ...p, author: adminUser }));

        // Clear existing data
        await Product.deleteMany();
        await Land.deleteMany();
        await Job.deleteMany();
        await Post.deleteMany();
        console.log('Old Data Removed...');

        // Insert new data
        await Product.insertMany(sampleProducts);
        await Land.insertMany(sampleLands);
        await Job.insertMany(sampleJobs);
        await Post.insertMany(samplePosts);

        console.log('Full Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();
        await Land.deleteMany();
        await Job.deleteMany();
        await Post.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
