import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Site from '../models/Site.js';
import jwt from 'jsonwebtoken';

// Генерация JWT токена
const generateToken = (id, role = 'client') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Регистрация клиента
// @route   POST /api/client/register
// @access  Public
export const registerClient = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone } = req.body;

        // Валидация
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните все обязательные поля'
            });
        }

        // Проверяем, существует ли пользователь
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email или именем уже существует'
            });
        }

        // Создаем пользователя
        const user = await User.create({
            username,
            email,
            password,
            role: 'client',
            profile: {
                firstName,
                lastName,
                phone
            }
        });

        // Генерируем токен
        const token = generateToken(user._id, 'client');

        // Обновляем последний логин
        await user.updateLastLogin();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при регистрации: ' + error.message
        });
    }
};

// @desc    Вход клиента
// @route   POST /api/client/login
// @access  Public
export const loginClient = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, введите email и пароль'
            });
        }

        // Ищем пользователя
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем роль
        if (user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Доступ только для клиентов'
            });
        }

        // Проверяем пароль
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем активность аккаунта
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт деактивирован'
            });
        }

        // Генерируем токен
        const token = generateToken(user._id, user.role);

        // Обновляем последний логин
        await user.updateLastLogin();

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                hasRentals: user.rentedSites.length > 0
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе'
        });
    }
};

// @desc    Получить профиль клиента
// @route   GET /api/client/profile
// @access  Private/Client
export const getClientProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('rentedSites.siteId', 'title category price images demoUrl')
            .populate('rentedSites.contactId', 'status rentalStatus rentalEndDate monthlyPrice');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                settings: user.settings,
                rentedSites: user.rentedSites.map(site => ({
                    site: site.siteId,
                    contact: site.contactId,
                    rentalStartDate: site.rentalStartDate,
                    rentalEndDate: site.rentalEndDate,
                    monthlyPrice: site.monthlyPrice,
                    status: site.status,
                    daysRemaining: site.rentalEndDate ?
                        Math.ceil((new Date(site.rentalEndDate) - new Date()) / (1000 * 60 * 60 * 24)) :
                        null
                })),
                notifications: user.notifications.slice(0, 10), // Последние 10 уведомлений
                statistics: {
                    totalRentals: user.rentedSites.length,
                    activeRentals: user.getActiveRentals().length,
                    expiredRentals: user.rentedSites.filter(s => s.status === 'expired').length
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении профиля'
        });
    }
};

// @desc    Обновить профиль клиента
// @route   PUT /api/client/profile
// @access  Private/Client
export const updateClientProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, company, address, settings } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Обновляем профиль
        if (firstName || lastName || phone || company || address) {
            user.profile = {
                ...user.profile,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone }),
                ...(company && { company }),
                ...(address && { address })
            };
        }

        // Обновляем настройки
        if (settings) {
            user.settings = {
                ...user.settings,
                ...settings
            };
        }

        await user.save();

        res.json({
            success: true,
            message: 'Профиль успешно обновлен',
            user: {
                id: user._id,
                profile: user.profile,
                settings: user.settings
            }
        });

    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении профиля'
        });
    }
};

// @desc    Изменить пароль
// @route   PUT /api/client/password
// @access  Private/Client
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, введите текущий и новый пароль'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Проверяем текущий пароль
        const isPasswordCorrect = await user.comparePassword(currentPassword);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: 'Текущий пароль неверен'
            });
        }

        // Обновляем пароль
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });

    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при изменении пароля'
        });
    }
};

// @desc    Получить детали аренды сайта
// @route   GET /api/client/rental/:contactId
// @access  Private/Client
export const getRentalDetails = async (req, res) => {
    try {
        const { contactId } = req.params;

        // Проверяем, что контакт принадлежит пользователю
        const contact = await Contact.findOne({
            _id: contactId,
            userId: req.user.id
        }).populate('siteId', 'title category description images demoUrl technologies features');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена или у вас нет доступа'
            });
        }

        // Получаем платежи
        const payments = contact.payments || [];

        res.json({
            success: true,
            rental: {
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    company: contact.company
                },
                site: contact.siteId,
                rentalDetails: {
                    status: contact.status,
                    rentalStatus: contact.rentalStatus,
                    monthlyPrice: contact.monthlyPrice,
                    rentalStartDate: contact.rentalStartDate,
                    rentalEndDate: contact.rentalEndDate,
                    nextPaymentDate: contact.nextPaymentDate,
                    totalPaid: contact.totalPaid,
                    daysRemaining: contact.getDaysRemaining()
                },
                payments: payments.map(payment => ({
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    periodMonths: payment.periodMonths,
                    paymentMethod: payment.paymentMethod,
                    notes: payment.notes
                }))
            }
        });

    } catch (error) {
        console.error('Ошибка получения деталей аренды:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении деталей аренды'
        });
    }
};

// @desc    Связать существующий контакт с пользователем
// @route   POST /api/client/link-contact
// @access  Private/Client
export const linkContactToUser = async (req, res) => {
    try {
        const { contactId } = req.body;

        if (!contactId) {
            return res.status(400).json({
                success: false,
                message: 'ID контакта обязателен'
            });
        }

        // Находим контакт по email пользователя
        const user = await User.findById(req.user.id);
        const contact = await Contact.findOne({
            _id: contactId,
            email: user.email
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден или email не совпадает'
            });
        }

        // Проверяем, не привязан ли уже контакт
        if (contact.userId) {
            return res.status(400).json({
                success: false,
                message: 'Этот контакт уже привязан к другому пользователю'
            });
        }

        // Привязываем контакт к пользователю
        await contact.linkToUser(req.user.id);

        // Добавляем сайт в список арендованных пользователя
        if (contact.siteId) {
            user.addRentedSite({
                siteId: contact.siteId,
                contactId: contact._id,
                rentalStartDate: contact.rentalStartDate,
                rentalEndDate: contact.rentalEndDate,
                monthlyPrice: contact.monthlyPrice,
                status: contact.rentalStatus === 'active' ? 'active' : 'expired'
            });
            await user.save();
        }

        res.json({
            success: true,
            message: 'Контакт успешно привязан к вашему аккаунту',
            contact: {
                id: contact._id,
                siteTitle: contact.siteTitle,
                rentalEndDate: contact.rentalEndDate
            }
        });

    } catch (error) {
        console.error('Ошибка привязки контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при привязке контакта'
        });
    }
};

// @desc    Получить уведомления клиента
// @route   GET /api/client/notifications
// @access  Private/Client
export const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            notifications: user.notifications,
            unreadCount: user.notifications.filter(n => !n.read).length
        });

    } catch (error) {
        console.error('Ошибка получения уведомлений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении уведомлений'
        });
    }
};

// @desc    Отметить уведомления как прочитанные
// @route   PUT /api/client/notifications/read
// @access  Private/Client
export const markNotificationsAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        if (notificationIds && notificationIds.length > 0) {
            // Отмечаем конкретные уведомления как прочитанные
            user.notifications.forEach(notification => {
                if (notificationIds.includes(notification._id.toString())) {
                    notification.read = true;
                }
            });
        } else {
            // Отмечаем все уведомления как прочитанные
            user.notifications.forEach(notification => {
                notification.read = true;
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Уведомления отмечены как прочитанные'
        });

    } catch (error) {
        console.error('Ошибка отметки уведомлений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении уведомлений'
        });
    }
};