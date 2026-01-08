import User from '../models/User.js';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import Land from '../models/Land.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;
        let stats = {};

        switch (role) {
            case 'admin':
                stats = {
                    totalUsers: await User.countDocuments(),
                    totalProducts: await Product.countDocuments(),
                    totalPosts: await Post.countDocuments(),
                    totalLands: await Land.countDocuments(),
                    recentUsers: await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
                };
                break;

            case 'farmer':
                stats = {
                    myProducts: await Product.countDocuments({ seller: req.user.id }),
                    myLands: await Land.countDocuments({ owner: req.user.id }),
                    myPosts: await Post.countDocuments({ author: req.user.id }),
                    // Mock weather data as we don't have a real API key yet
                    weather: {
                        temp: 24,
                        condition: 'Sunny',
                        humidity: 60
                    }
                };
                break;

            case 'buyer':
                // Mock orders for now
                stats = {
                    totalOrders: 12, // Placeholder
                    activeOrders: 2,
                    savedProducts: 5,
                    recommendedProducts: await Product.find().limit(3)
                };
                break;

            case 'expert':
                // Mock queries for now
                stats = {
                    pendingQueries: 5,
                    answeredQueries: 120,
                    rating: 4.8,
                    recentQuestions: [
                        { id: 1, title: 'Wheat leaf yellowing', asker: 'Ram Kumar', date: '2024-03-20' },
                        { id: 2, title: 'Best fertilizer for rice', asker: 'Shyam Singh', date: '2024-03-19' }
                    ]
                };
                break;

            default:
                return res.status(400).json({ success: false, message: 'Unknown role' });
        }

        res.status(200).json({
            success: true,
            role,
            data: stats
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
