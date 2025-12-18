import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Routes
import siteRoutes from './routes/siteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { setupRentalCronJobs } from './cronJobs.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentalSite')
//     .then(() => console.log('✅ MongoDB connected successfully'))
//     .catch(err => console.log('❌ MongoDB connection error:', err));

// После подключения к MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentalSite')
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        // Запускаем cron jobs
        if (process.env.NODE_ENV !== 'test') {
            setupRentalCronJobs();
        }
    })
    .catch(err => console.log('❌ MongoDB connection error:', err));


app.use('/api/sites', siteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Rental Site API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Middleware для Express
const usedEndpoints = new Set();

app.use((req, res, next) => {
    usedEndpoints.add(`${req.method} ${req.route?.path || req.path}`);
    next();
});

// Позже выведите результат
console.log('Используемые эндпоинты:', Array.from(usedEndpoints));

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});