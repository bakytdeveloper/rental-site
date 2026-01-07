import User from '../models/User.js';
import Rental from '../models/Rental.js';
import Site from '../models/Site.js';
import jwt from 'jsonwebtoken';
import { sendEmailNotification } from '../services/emailService.js';

// Генерация JWT токена для клиента
const generateClientToken = (id) => {
    return jwt.sign({
        id,
        role: 'client'
    }, process.env.JWT_SECRET, {
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

        // Проверяем существование пользователя
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
            profile: {
                firstName,
                lastName,
                phone
            }
        });

        // Генерируем токен
        const token = generateClientToken(user._id);

        // Обновляем последний логин
        await user.updateLastLogin();

        // Отправляем приветственное письмо
        setTimeout(async () => {
            try {
                await sendEmailNotification('clientWelcome', {
                    username: user.username,
                    email: user.email,
                    profile: user.profile
                });
            } catch (emailError) {
                console.error('Ошибка отправки приветственного письма:', emailError);
            }
        }, 0);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
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
        const token = generateClientToken(user._id);

        // Обновляем последний логин
        await user.updateLastLogin();

        // Получаем количество аренд
        const rentalCount = await Rental.countDocuments({ userId: user._id });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                hasRentals: rentalCount > 0
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
        const user = await User.findById(req.user._id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Получаем аренды пользователя
        const rentals = await Rental.find({ userId: user._id })
            .populate('siteId', 'title category price images demoUrl')
            .sort({ createdAt: -1 });

        const activeRentals = rentals.filter(r => r.status === 'active');
        const pendingRentals = rentals.filter(r => r.status === 'pending');
        const paymentDueRentals = rentals.filter(r => r.status === 'payment_due');

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                settings: user.settings,
                lastLogin: user.lastLogin
            },
            rentals: rentals.map(rental => ({
                id: rental._id,
                site: rental.siteId,
                status: rental.status,
                monthlyPrice: rental.monthlyPrice,
                rentalStartDate: rental.rentalStartDate,
                rentalEndDate: rental.rentalEndDate,
                daysRemaining: rental.getDaysRemaining ? rental.getDaysRemaining() : null,
                totalPaid: rental.totalPaid,
                lastPaymentDate: rental.lastPaymentDate
            })),
            statistics: {
                totalRentals: rentals.length,
                activeRentals: activeRentals.length,
                pendingRentals: pendingRentals.length,
                paymentDueRentals: paymentDueRentals.length,
                totalSpent: rentals.reduce((sum, rental) => sum + (rental.totalPaid || 0), 0)
            },
            notifications: user.notifications.slice(0, 10)
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
        const { firstName, lastName, phone, company, settings } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Обновляем профиль
        if (firstName || lastName || phone || company) {
            user.profile = {
                ...user.profile,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone }),
                ...(company && { company })
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
                username: user.username,
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

        const user = await User.findById(req.user._id).select('+password');

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

        // Добавляем уведомление
        user.addNotification({
            type: 'system',
            message: 'Пароль успешно изменен'
        });
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

// @desc    Связать существующую заявку с пользователем
// @route   POST /api/client/link-rental
// @access  Private/Client
export const linkRentalToUser = async (req, res) => {
    try {
        const { rentalId } = req.body;

        if (!rentalId) {
            return res.status(400).json({
                success: false,
                message: 'ID аренды обязателен'
            });
        }

        // Находим аренду по email пользователя
        const user = await User.findById(req.user._id);
        const rental = await Rental.findOne({
            _id: rentalId,
            clientEmail: user.email
        }).populate('siteId', 'title category price');

        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена или email не совпадает'
            });
        }

        // Проверяем, не привязана ли уже аренда к пользователю
        if (rental.userId) {
            return res.status(400).json({
                success: false,
                message: 'Эта аренда уже привязана к другому пользователю'
            });
        }

        // Привязываем аренду к пользователю
        rental.userId = user._id;
        await rental.save();

        // Добавляем уведомление пользователю
        user.addNotification({
            type: 'system',
            message: `Вы связали аренду сайта "${rental.siteId.title}" с вашим аккаунтом`,
            rentalId: rental._id
        });
        await user.save();

        res.json({
            success: true,
            message: 'Аренда успешно привязана к вашему аккаунту',
            rental: {
                id: rental._id,
                site: rental.siteId.title,
                status: rental.status,
                rentalEndDate: rental.rentalEndDate
            }
        });

    } catch (error) {
        console.error('Ошибка привязки аренды:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при привязке аренды'
        });
    }
};

// @desc    Получить уведомления клиента
// @route   GET /api/client/notifications
// @access  Private/Client
export const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const unreadCount = user.notifications.filter(n => !n.read).length;

        res.json({
            success: true,
            notifications: user.notifications.slice(0, 20), // Последние 20 уведомлений
            unreadCount
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

        const user = await User.findById(req.user._id);

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