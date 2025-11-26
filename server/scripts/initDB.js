import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Site from '../models/Site.js';

dotenv.config();

const initDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - for development)
        // await User.deleteMany({});
        // await Site.deleteMany({});

        // Create admin user if doesn't exist
        const adminExists = await User.findOne({ email: 'admin@rentalsite.com' });
        if (!adminExists) {
            const adminUser = new User({
                username: 'admin',
                email: 'admin@rentalsite.com',
                password: 'admin123', // Will be hashed by the model
                role: 'admin'
            });
            await adminUser.save();
            console.log('👑 Admin user created:', {
                email: 'admin@rentalsite.com',
                password: 'admin123'
            });
        }

        // Create sample sites if none exist
        const siteCount = await Site.countDocuments();
        if (siteCount === 0) {
            const sampleSites = [
                {
                    title: 'Modern Business Landing',
                    shortDescription: 'Professional landing page for businesses with lead generation forms and analytics integration.',
                    description: 'A sleek and modern landing page designed specifically for businesses looking to generate leads and showcase their services. Features include contact forms, service sections, testimonials, and integration with popular analytics tools.',
                    price: 99,
                    category: 'Landing Page',
                    technologies: ['React', 'Bootstrap', 'Node.js', 'MongoDB'],
                    features: ['Responsive Design', 'Contact Forms', 'SEO Optimized', 'Fast Loading'],
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 1
                },
                {
                    title: 'E-Commerce Store',
                    shortDescription: 'Full-featured online store with product management, cart, and payment processing.',
                    description: 'Complete e-commerce solution with product catalog, shopping cart, user authentication, and payment gateway integration. Perfect for businesses looking to sell products online with minimal setup time.',
                    price: 199,
                    category: 'E-commerce',
                    technologies: ['React', 'Express.js', 'MongoDB', 'Stripe'],
                    features: ['Product Management', 'Shopping Cart', 'Payment Processing', 'Order Tracking'],
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 2
                },
                {
                    title: 'Creative Portfolio',
                    shortDescription: 'Elegant portfolio website for artists, designers, and creative professionals.',
                    description: 'Showcase your creative work with this beautiful portfolio website. Features include project galleries, client testimonials, blog integration, and social media links. Perfect for designers, photographers, and artists.',
                    price: 79,
                    category: 'Portfolio',
                    technologies: ['React', 'CSS3', 'Node.js'],
                    features: ['Project Gallery', 'Blog Integration', 'Contact Forms', 'Social Media Links'],
                    isFeatured: false,
                    isActive: true,
                    sortOrder: 3
                },
                {
                    title: 'Corporate Website',
                    shortDescription: 'Professional corporate website with multiple pages and team management.',
                    description: 'Comprehensive corporate website featuring about pages, team sections, services overview, and contact information. Ideal for established businesses looking to maintain a professional online presence.',
                    price: 149,
                    category: 'Corporate Website',
                    technologies: ['React', 'Bootstrap', 'Express.js', 'MongoDB'],
                    features: ['Multi-page Layout', 'Team Management', 'Service Pages', 'Contact Forms'],
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 4
                }
            ];

            await Site.insertMany(sampleSites);
            console.log('🎨 Sample websites created');
        }

        console.log('✅ Database initialization completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();