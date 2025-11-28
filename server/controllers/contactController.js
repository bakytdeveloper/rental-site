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
            siteTitle: siteTitle, // Используем полученный siteTitle
            status: 'new',
            priority: 'medium'
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
        const { page = 1, limit = 10, status, priority, search } = req.query;

        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by priority
        if (priority && priority !== 'all') {
            query.priority = priority;
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

// @desc    Test email configuration
// @route   POST /api/contacts/test-email
// @access  Private
export const testEmailConfiguration = async (req, res) => {
    try {
        const { testEmailConfig } = await import('../services/emailService.js');
        const result = await testEmailConfig();

        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Test email configuration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing email configuration'
        });
    }
};