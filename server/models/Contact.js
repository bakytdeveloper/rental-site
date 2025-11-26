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
        trim: true,
        lowercase: true
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
    siteTitle: {
        type: String
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed', 'spam'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-populate siteTitle before save if siteId is provided
ContactSchema.pre('save', async function(next) {
    if (this.siteId && !this.siteTitle) {
        try {
            const Site = mongoose.model('Site');
            const site = await Site.findById(this.siteId);
            if (site) {
                this.siteTitle = site.title;
            }
        } catch (error) {
            // Continue without site title if error
        }
    }
    next();
});

export default mongoose.model('Contact', ContactSchema);