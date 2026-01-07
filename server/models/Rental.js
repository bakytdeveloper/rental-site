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
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'card', 'cash', 'other'],
        default: 'bank_transfer'
    },
    notes: {
        type: String,
        default: ''
    }
});

const RentalSchema = new mongoose.Schema({
    // Связь с пользователем
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Связь с сайтом
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true
    },

    // Контактная информация (дублируем из User для удобства)
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    clientPhone: {
        type: String,
        trim: true,
        default: ''
    },

    // Статус аренды
    status: {
        type: String,
        enum: ['pending', 'active', 'payment_due', 'cancelled'],
        default: 'pending'
    },

    // Даты аренды
    rentalStartDate: {
        type: Date,
        default: null
    },
    rentalEndDate: {
        type: Date,
        default: null
    },

    // Цена и оплата
    monthlyPrice: {
        type: Number,
        required: true
    },
    totalPaid: {
        type: Number,
        default: 0
    },

    // История платежей
    payments: [PaymentSchema],

    // Дата последнего платежа
    lastPaymentDate: {
        type: Date,
        default: null
    },

    // Дата следующего платежа
    nextPaymentDate: {
        type: Date,
        default: null
    },

    // Дополнительная информация
    notes: {
        type: String,
        default: ''
    },

    // Уведомления
    lastNotificationDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Метод для расчета оставшихся дней
RentalSchema.methods.getDaysRemaining = function() {
    if (!this.rentalEndDate) return null;
    const now = new Date();
    const end = new Date(this.rentalEndDate);
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Метод для проверки необходимости уведомления
RentalSchema.methods.needsNotification = function() {
    const daysRemaining = this.getDaysRemaining();
    return daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;
};

// Метод для проверки истечения аренды
RentalSchema.methods.checkAndUpdateExpiration = function() {
    const now = new Date();
    let updated = false;

    if (this.rentalEndDate && new Date(this.rentalEndDate) < now) {
        if (this.status === 'active') {
            this.status = 'payment_due';
            updated = true;
        }
    }
    return updated;
};

// Хук для проверки истечения аренды перед сохранением
RentalSchema.pre('save', async function() {
    const now = new Date();

    if (this.rentalEndDate && new Date(this.rentalEndDate) < now) {
        if (this.status === 'active') {
            this.status = 'payment_due';
        }
    }
});

export default mongoose.model('Rental', RentalSchema);