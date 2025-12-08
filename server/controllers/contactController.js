import Contact from '../models/Contact.js';
import Site from '../models/Site.js';
import { sendEmailNotification } from '../services/emailService.js';

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
    try {
        console.log('📨 Received contact form data:', req.body);

        // Validate required fields
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required fields'
            });
        }

        // Если есть siteId, получим siteTitle из базы
        let siteTitle = req.body.siteTitle || '';
        if (req.body.siteId && !siteTitle) {
            try {
                const site = await Site.findById(req.body.siteId);
                if (site) {
                    siteTitle = site.title;
                    console.log('🏷️ Found site title:', siteTitle);
                }
            } catch (siteError) {
                console.error('❌ Error fetching site:', siteError);
                // Продолжаем без siteTitle
            }
        }

        // Create contact with validated data
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            phone: req.body.phone?.trim() || '',
            company: req.body.company?.trim() || '',
            subject: req.body.subject?.trim() || 'General Inquiry',
            siteId: req.body.siteId || null,
            siteTitle: siteTitle,
            status: 'new'
        };

        console.log('📝 Final contact data:', contactData);

        // Простая валидация email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(contactData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Создаем контакт
        console.log('🔄 Creating contact in database...');
        const contact = await Contact.create(contactData);
        console.log('✅ Contact saved to database:', contact._id);

        // Отправляем email уведомление (асинхронно, не блокируем ответ)
        setTimeout(async () => {
            try {
                if (req.body.siteId) {
                    const site = await Site.findById(req.body.siteId);
                    if (site) {
                        console.log('🌐 Sending rental inquiry email for site:', site.title);

                        const messageLower = req.body.message?.toLowerCase() || '';
                        const isUrgent = messageLower.includes('urgent') ||
                            messageLower.includes('asap') ||
                            messageLower.includes('immediately');

                        if (isUrgent) {
                            await sendEmailNotification('highPriorityAlert', contactData, site);
                        } else {
                            await sendEmailNotification('newRentalInquiry', contactData, site);
                        }
                    }
                } else {
                    console.log('📧 Sending general contact email');
                    await sendEmailNotification('newContactMessage', contactData);
                }
                console.log('✅ Email notification sent successfully');
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
            }
        }, 0);

        res.status(201).json({
            success: true,
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                message: contact.message,
                status: contact.status
            },
            message: 'Your message has been sent successfully! We will contact you soon.'
        });

    } catch (error) {
        console.error('❌ Create contact error:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Более детальные ошибки
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Contact with this email already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error creating contact: ' + error.message
        });
    }
};

// @desc    Get all contacts with filtering and pagination
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search in name, email, or message
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            contacts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating contact'
        });
    }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await Contact.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact'
        });
    }
};

// @desc    Get contact statistics
// @route   GET /api/contacts/stats/summary
// @access  Private
export const getContactStats = async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        const contacted = await Contact.countDocuments({ status: 'contacted' });
        const completed = await Contact.countDocuments({ status: 'completed' });

        // Recent contacts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            success: true,
            stats: {
                total,
                new: newContacts,
                contacted,
                completed,
                recent: recentContacts
            }
        });
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact statistics'
        });
    }
};



// @desc    Add payment to contact
// @route   POST /api/contacts/:id/payments
// @access  Private
export const addPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paymentMethod = 'bank_transfer', notes = '', periodMonths = 1 } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid payment amount is required'
            });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Получаем информацию о сайте для расчета цены
        let sitePrice = contact.monthlyPrice;
        if (!sitePrice && contact.siteId) {
            const site = await Site.findById(contact.siteId);
            if (site) {
                sitePrice = site.price;
                contact.monthlyPrice = sitePrice;
            }
        }

        if (!sitePrice || sitePrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Monthly price is not set for this contact'
            });
        }

        // Рассчитываем количество месяцев за оплаченную сумму
        const calculatedMonths = Math.floor(amount / sitePrice);
        const actualMonths = periodMonths || calculatedMonths || 1;

        // Создаем платеж
        const payment = {
            amount,
            paymentDate: new Date(),
            periodMonths: actualMonths,
            notes,
            paymentMethod
        };

        // Добавляем платеж к контакту
        contact.payments.push(payment);

        // Обновляем общую сумму оплат
        contact.totalPaid = (contact.totalPaid || 0) + amount;
        contact.lastPaymentDate = new Date();

        // Обновляем даты аренды
        const now = new Date();

        // Если аренда еще не начиналась
        if (!contact.rentalStartDate) {
            contact.rentalStartDate = now;
            contact.rentalStatus = 'active';
            console.log(`✅ Started new rental for ${contact.email}`);
        }

        // Если аренда была приостановлена или закончилась
        if (contact.rentalStatus === 'expired' || contact.rentalStatus === 'suspended') {
            contact.rentalStatus = 'active';
            console.log(`✅ Reactivated rental for ${contact.email}`);
        }

        // Если статус был payment_due, меняем обратно на active_rental
        if (contact.status === 'payment_due') {
            console.log(`🔄 Changing status from payment_due to active_rental for ${contact.email}`);
        }

        // ВСЕГДА устанавливаем статус active_rental при оплате
        contact.status = 'active_rental';

        // Обновляем дату окончания аренды
        if (!contact.rentalEndDate || contact.rentalEndDate < now) {
            contact.rentalEndDate = now;
        }

        // Добавляем оплаченные месяцы к дате окончания
        const newEndDate = new Date(contact.rentalEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + actualMonths);
        contact.rentalEndDate = newEndDate;

        // Рассчитываем следующую дату платежа (за 7 дней до окончания)
        const nextPaymentDate = new Date(newEndDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() - 7);
        contact.nextPaymentDate = nextPaymentDate;

        // Сбрасываем флаг уведомления
        contact.lastNotificationDate = null;

        // Также сбрасываем notificationSent, если оно существует
        if (contact.notificationSent !== undefined) {
            contact.notificationSent = false;
        }

        console.log(`💰 Payment processed for ${contact.email}: $${amount} for ${actualMonths} month(s)`);
        console.log(`📅 New rental end date: ${contact.rentalEndDate.toLocaleDateString()}`);

        await contact.save();

        // Отправляем уведомление клиенту (если указан email)
        // В функции addPayment в contactController.js, обновите часть отправки email:

// Отправляем уведомление клиенту (если указан email)
        if (contact.email) {
            const site = contact.siteId ? await Site.findById(contact.siteId) : null;

            setTimeout(async () => {
                try {
                    // Уведомление клиенту
                    await sendEmailNotification('paymentReceived', {
                        name: contact.name,
                        email: contact.email,
                        amount: amount,
                        months: actualMonths,
                        rentalEndDate: contact.rentalEndDate,
                        siteTitle: contact.siteTitle || (site ? site.title : 'Website')
                    }, site);

                    console.log('✅ Payment confirmation email sent to client');

                    // Уведомление админу
                    await sendEmailNotification('adminPaymentReceived', {
                        name: contact.name,
                        email: contact.email,
                        amount: amount,
                        months: actualMonths,
                        rentalEndDate: contact.rentalEndDate,
                        _id: contact._id,
                        phone: contact.phone,
                        siteTitle: contact.siteTitle || (site ? site.title : 'Website')
                    }, site);
                    
                    console.log('✅ Payment notification sent to admin');

                } catch (emailError) {
                    console.error('❌ Payment email failed:', emailError);
                }
            }, 0);
        }

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            payment,
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                status: contact.status,
                rentalStatus: contact.rentalStatus,
                totalPaid: contact.totalPaid,
                rentalEndDate: contact.rentalEndDate,
                monthsPaid: actualMonths,
                nextPaymentDate: contact.nextPaymentDate,
                siteTitle: contact.siteTitle
            }
        });

    } catch (error) {
        console.error('❌ Add payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding payment: ' + error.message
        });
    }
};
// @desc    Get contact payments
// @route   GET /api/contacts/:id/payments
// @access  Private
export const getPayments = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id).select('payments monthlyPrice');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            payments: contact.payments,
            monthlyPrice: contact.monthlyPrice,
            totalPayments: contact.payments.length,
            totalAmount: contact.payments.reduce((sum, payment) => sum + payment.amount, 0)
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
};

// @desc    Check expiring rentals
// @route   GET /api/contacts/rentals/expiring
// @access  Private
export const getExpiringRentals = async (req, res) => {
    try {
        const { days = 3 } = req.query;

        const contacts = await Contact.findExpiringRentals(parseInt(days));

        res.json({
            success: true,
            count: contacts.length,
            contacts: contacts.map(contact => ({
                id: contact._id,
                name: contact.name,
                email: contact.email,
                siteTitle: contact.siteTitle,
                monthlyPrice: contact.monthlyPrice,
                rentalEndDate: contact.rentalEndDate,
                daysRemaining: contact.getDaysRemaining(),
                phone: contact.phone,
                status: contact.status,
                rentalStatus: contact.rentalStatus
            }))
        });
    } catch (error) {
        console.error('Get expiring rentals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expiring rentals'
        });
    }
};

// @desc    Send rental reminders
// @route   POST /api/contacts/rentals/send-reminders
// @access  Private
export const sendRentalReminders = async (req, res) => {
    try {
        const contacts = await Contact.findExpiringRentals();
        let sentCount = 0;

        for (const contact of contacts) {
            try {
                const site = contact.siteId ? await Site.findById(contact.siteId) : null;
                const daysRemaining = contact.getDaysRemaining();

                // Отправляем уведомление клиенту
                if (contact.email) {
                    await sendEmailNotification('rentalExpiringSoon', {
                        name: contact.name,
                        email: contact.email,
                        rentalEndDate: contact.rentalEndDate,
                        daysRemaining: daysRemaining,
                        siteTitle: contact.siteTitle || (site ? site.title : 'Website')
                    }, site);
                }

                // Отправляем уведомление админу
                await sendEmailNotification('adminRentalExpiring', {
                    name: contact.name,
                    email: contact.email,
                    rentalEndDate: contact.rentalEndDate,
                    daysRemaining: daysRemaining,
                    _id: contact._id,
                    phone: contact.phone
                }, site);

                // Отмечаем, что уведомление отправлено
                contact.notificationSent = true;
                await contact.save();

                sentCount++;

            } catch (emailError) {
                console.error(`❌ Failed to send reminder for ${contact.email}:`, emailError);
            }
        }

        res.json({
            success: true,
            message: `Reminders sent to ${sentCount} contacts`,
            sentCount,
            totalContacts: contacts.length
        });

    } catch (error) {
        console.error('Send reminders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reminders: ' + error.message
        });
    }
};

// @desc    Get rental statistics
// @route   GET /api/contacts/rentals/stats
// @access  Private
export const getRentalStats = async (req, res) => {
    try {
        const totalActive = await Contact.countDocuments({ rentalStatus: 'active' });
        const totalExpired = await Contact.countDocuments({ rentalStatus: 'expired' });
        const expiringSoon = await Contact.countDocuments({
            rentalStatus: 'active',
            rentalEndDate: {
                $lte: new Date(new Date().setDate(new Date().getDate() + 7)),
                $gte: new Date()
            }
        });

        const totalRevenue = await Contact.aggregate([
            { $match: { rentalStatus: 'active' } },
            { $group: { _id: null, total: { $sum: '$totalPaid' } } }
        ]);

        const monthlyRevenue = await Contact.aggregate([
            {
                $match: {
                    rentalStatus: 'active',
                    lastPaymentDate: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPaid' } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalActive,
                totalExpired,
                expiringSoon,
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get rental stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching rental statistics'
        });
    }
};

// Добавьте новую функцию в contactController.js
// @desc    Check and update expired rentals
// @route   POST /api/contacts/rentals/check-expired
// @access  Private
export const checkAndUpdateExpiredRentals = async (req, res) => {
    try {
        const now = new Date();

        // Находим все активные аренды, которые закончились
        const expiredContacts = await Contact.find({
            rentalStatus: 'active',
            rentalEndDate: { $lt: now },
            status: 'active_rental'
        });

        let updatedCount = 0;
        let notificationsSent = 0;

        for (const contact of expiredContacts) {
            try {
                // Обновляем статусы
                contact.rentalStatus = 'expired';
                contact.status = 'payment_due';

                // Сохраняем изменения
                await contact.save();
                updatedCount++;

                // Получаем информацию о сайте для уведомления
                const site = contact.siteId ? await Site.findById(contact.siteId) : null;

                // Отправляем уведомление клиенту
                if (contact.email && site) {
                    await sendEmailNotification('rentalExpired', {
                        name: contact.name,
                        email: contact.email,
                        rentalEndDate: contact.rentalEndDate,
                        totalPaid: contact.totalPaid,
                        siteTitle: contact.siteTitle || (site ? site.title : 'Website')
                    }, site);
                }

                // Отправляем уведомление админу
                if (site) {
                    await sendEmailNotification('adminRentalExpired', {
                        name: contact.name,
                        email: contact.email,
                        rentalEndDate: contact.rentalEndDate,
                        totalPaid: contact.totalPaid,
                        _id: contact._id,
                        phone: contact.phone
                    }, site);
                }

                notificationsSent++;

            } catch (error) {
                console.error(`❌ Error processing contact ${contact._id}:`, error);
            }
        }

        res.json({
            success: true,
            message: `Updated ${updatedCount} expired rentals, sent ${notificationsSent} notifications`,
            stats: {
                updated: updatedCount,
                notificationsSent: notificationsSent,
                totalExpired: expiredContacts.length
            }
        });

    } catch (error) {
        console.error('❌ Check expired rentals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking expired rentals: ' + error.message
        });
    }
};

// @desc    Check rental status
// @route   GET /api/contacts/:id/rental-status
// @access  Private
export const checkRentalStatus = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Проверяем и обновляем статус аренды
        const needsUpdate = contact.checkAndUpdateExpiredRentals();

        if (needsUpdate) {
            await contact.save();
        }

        const daysRemaining = contact.getDaysRemaining();

        res.json({
            success: true,
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                status: contact.status,
                rentalStatus: contact.rentalStatus,
                rentalEndDate: contact.rentalEndDate,
                daysRemaining: daysRemaining,
                needsRenewal: daysRemaining !== null && daysRemaining <= 0
            }
        });
    } catch (error) {
        console.error('Check rental status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking rental status'
        });
    }
};
