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
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: { type: String, trim: true },
        company: { type: String, trim: true }
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    notifications: [{
        type: {
            type: String,
            enum: ['payment', 'rental_expiring', 'rental_expired', 'system']
        },
        message: String,
        rentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    settings: {
        emailNotifications: {
            rentalReminders: { type: Boolean, default: true },
            paymentConfirmations: { type: Boolean, default: true },
            systemUpdates: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// Хэширование пароля
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Сравнение паролей
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Обновление даты последнего входа
UserSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

// Добавление уведомления
UserSchema.methods.addNotification = function(notification) {
    this.notifications.unshift({
        ...notification,
        createdAt: new Date()
    });
    if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
    }
};

export default mongoose.model('User', UserSchema);