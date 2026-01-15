import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { FRONTEND_URL } from './utils/urlConfig.js';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import landRoutes from './routes/landRoutes.js';
import postRoutes from './routes/postRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/land', landRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/weather', weatherRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
