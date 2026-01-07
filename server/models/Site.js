import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        maxLength: 2000
    },
    shortDescription: {
        type: String,
        required: true,
        maxLength: 200
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Лендинг', 'Корпоративный сайт', 'Интернет-магазин', 'Портфолио', 'Веб-приложение']
    },
    technologies: [{
        type: String,
        trim: true
    }],
    features: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String
    }],
    demoUrl: {
        type: String,
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Индекс для быстрого поиска
SiteSchema.index({ category: 1, isAvailable: 1, sortOrder: -1 });

export default mongoose.model('Site', SiteSchema);