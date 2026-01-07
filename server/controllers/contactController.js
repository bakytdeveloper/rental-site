import Contact from '../models/Contact.js'; // Если оставляем старую модель для общих контактов
import { sendEmailNotification } from '../services/emailService.js';

// @desc    Создать контакт (для общих вопросов, не связанных с арендой)
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
    try {
        console.log('📨 Получены данные контактной формы:', req.body);

        const { name, email, message, subject = 'Общий вопрос' } = req.body;

        // Валидация
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Имя, email и сообщение являются обязательными полями'
            });
        }

        // Простая валидация email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, введите корректный email адрес'
            });
        }

        // Создаем контакт
        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            subject: subject.trim(),
            status: 'new'
        });

        console.log('✅ Контакт сохранен в базу данных:', contact._id);

        // Отправляем email уведомление админу
        setTimeout(async () => {
            try {
                await sendEmailNotification('newContactMessage', {
                    name: contact.name,
                    email: contact.email,
                    message: contact.message,
                    subject: contact.subject
                });
                console.log('✅ Email уведомление отправлено');
            } catch (emailError) {
                console.error('❌ Ошибка отправки email:', emailError);
            }
        }, 0);

        res.status(201).json({
            success: true,
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                status: contact.status
            },
            message: 'Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
        });

    } catch (error) {
        console.error('❌ Ошибка создания контакта:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Контакт с таким email уже существует'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Ошибка при создании контакта: ' + error.message
        });
    }
};

// @desc    Получить все контакты
// @route   GET /api/contacts
// @access  Private/Admin
export const getContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        let query = {};

        // Фильтр по статусу
        if (status && status !== 'all') {
            query.status = status;
        }

        // Поиск
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
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
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Ошибка получения контактов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении контактов'
        });
    }
};

// @desc    Получить контакт по ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
export const getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Ошибка получения контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении контакта'
        });
    }
};

// @desc    Обновить контакт
// @route   PUT /api/contacts/:id
// @access  Private/Admin
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
                message: 'Контакт не найден'
            });
        }

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Ошибка обновления контакта:', error);
        res.status(400).json({
            success: false,
            message: 'Ошибка при обновлении контакта'
        });
    }
};

// @desc    Удалить контакт
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        await Contact.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Контакт успешно удален'
        });
    } catch (error) {
        console.error('Ошибка удаления контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении контакта'
        });
    }
};

// @desc    Получить статистику контактов
// @route   GET /api/contacts/stats/summary
// @access  Private/Admin
export const getContactStats = async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        const contacted = await Contact.countDocuments({ status: 'contacted' });
        const completed = await Contact.countDocuments({ status: 'completed' });

        // Недавние контакты (последние 7 дней)
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
        console.error('Ошибка получения статистики контактов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении статистики контактов'
        });
    }
};