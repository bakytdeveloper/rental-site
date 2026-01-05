import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'client'],
        default: 'client' // Изменено по умолчанию на client
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    // Дополнительные поля для клиентов
    profile: {
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        company: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            country: String,
            postalCode: String
        }
    },
    // Список сайтов, которые клиент арендует
    rentedSites: [{
        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site'
        },
        contactId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact'
        },
        rentalStartDate: Date,
        rentalEndDate: Date,
        monthlyPrice: Number,
        status: {
            type: String,
            enum: ['active', 'expired', 'suspended', 'pending'],
            default: 'active'
        }
    }],
    notifications: [{
        type: {
            type: String,
            enum: ['payment', 'rental_expiring', 'rental_expired', 'system']
        },
        message: String,
        data: mongoose.Schema.Types.Mixed,
        read: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        emailNotifications: {
            rentalReminders: {
                type: Boolean,
                default: true
            },
            paymentConfirmations: {
                type: Boolean,
                default: true
            },
            systemUpdates: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login on successful login
UserSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

// Метод для добавления арендованного сайта
UserSchema.methods.addRentedSite = function(siteData) {
    this.rentedSites.push({
        siteId: siteData.siteId,
        contactId: siteData.contactId,
        rentalStartDate: siteData.rentalStartDate || new Date(),
        rentalEndDate: siteData.rentalEndDate,
        monthlyPrice: siteData.monthlyPrice,
        status: siteData.status || 'active'
    });
};

// Метод для получения активных аренд
UserSchema.methods.getActiveRentals = function() {
    return this.rentedSites.filter(site =>
        site.status === 'active' &&
        new Date(site.rentalEndDate) > new Date()
    );
};

// Метод для добавления уведомления
UserSchema.methods.addNotification = function(notification) {
    this.notifications.unshift({
        ...notification,
        createdAt: new Date()
    });
    // Ограничиваем количество уведомлений до 50
    if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
    }
};

export default mongoose.model('User', UserSchema);