import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Payment amount must be at least 1']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    periodMonths: {
        type: Number,
        default: 1
    },
    notes: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'card', 'cash', 'other'],
        default: 'bank_transfer'
    }
});

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
    monthlyPrice: {
        type: Number,
        default: 0
    },
    payments: [PaymentSchema],
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed', 'spam', 'active_rental', 'payment_due'],
        default: 'new'
    },
    rentalStatus: {
        type: String,
        enum: ['not_started', 'active', 'expired', 'suspended'],
        default: 'not_started'
    },
    rentalStartDate: {
        type: Date,
        default: null
    },
    rentalEndDate: {
        type: Date,
        default: null
    },
    lastPaymentDate: {
        type: Date,
        default: null
    },
    nextPaymentDate: {
        type: Date,
        default: null
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Метод для расчета оставшихся дней
ContactSchema.methods.getDaysRemaining = function() {
    if (!this.rentalEndDate) return null;
    const now = new Date();
    const end = new Date(this.rentalEndDate);
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Метод для проверки необходимости уведомления
ContactSchema.methods.needsNotification = function() {
    const daysRemaining = this.getDaysRemaining();
    return daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0 && !this.notificationSent;
};

// Статический метод для поиска клиентов с истекающей арендой
ContactSchema.statics.findExpiringRentals = function(days = 3) {
    const now = new Date();
    const notificationDate = new Date();
    notificationDate.setDate(now.getDate() + days);

    return this.find({
        rentalStatus: 'active',
        rentalEndDate: {
            $lte: notificationDate,
            $gte: now
        },
        notificationSent: false
    });
};

export default mongoose.model('Contact', ContactSchema);