import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed'],
        default: 'new'
    }
}, {
    timestamps: true
});

export default mongoose.model('Contact', ContactSchema);