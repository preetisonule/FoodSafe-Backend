import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import barcodeRoutes from './routes/barcodeRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",   // Alternative dev port
            process.env.FRONTEND_URL || "https://food-safe-frontend-v1.vercel.app"  // Production frontend URL (no trailing slash)
        ],
        credentials: true
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/barcode', barcodeRoutes);
app.use('/api/ocr', ocrRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FoodSafe API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodsafe';

        // Ensure database name is included in MongoDB URI
        if (mongoURI && (mongoURI.includes('mongodb+srv://') || mongoURI.includes('mongodb://'))) {
            // Remove trailing slash if present
            mongoURI = mongoURI.replace(/\/$/, '');
            // If URI doesn't have a database name after the last slash, add it
            const uriParts = mongoURI.split('/');
            const lastPart = uriParts[uriParts.length - 1];
            // Check if last part looks like a database name or has query params
            if (!lastPart || lastPart.includes('?') || lastPart === '') {
                mongoURI = mongoURI + '/foodsafe';
            }
        }

        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Don't exit on MongoDB connection error - allow server to run without DB
        console.warn('Warning: Server will continue without database connection. Some features may not work.');
    }
};

connectDB();

export default app;

