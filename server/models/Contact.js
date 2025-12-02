import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    subject: {
        type: String,
        trim: true,
        default: 'General Inquiry'
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        default: null
    },
    siteTitle: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed', 'spam'],
        default: 'new'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Убираем ВСЕ pre-save хуки для начала
// Мы добавим эту логику позже в контроллере

export default mongoose.model('Contact', ContactSchema);