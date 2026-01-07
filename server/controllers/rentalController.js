import Rental from '../models/Rental.js';
import User from '../models/User.js';
import Site from '../models/Site.js';
import { sendEmailNotification } from '../services/emailService.js';

// @desc    Создать заявку на аренду
// @route   POST /api/rentals/request
// @access  Public
export const requestRental = async (req, res) => {
    try {
        const {
            siteId,
            name,
            email,
            phone,
            message,
            userId
        } = req.body;

        // Проверяем обязательные поля
        if (!siteId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните все обязательные поля'
            });
        }

        // Проверяем существование сайта
        const site = await Site.findById(siteId);
        if (!site || !site.isAvailable) {
            return res.status(404).json({
                success: false,
                message: 'Сайт не найден или недоступен для аренды'
            });
        }

        // Проверяем пользователя, если userId указан
        let user = null;
        if (userId) {
            user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
        }

        // Создаем заявку на аренду
        const rental = await Rental.create({
            userId: userId || null,
            siteId,
            clientName: name,
            clientEmail: email,
            clientPhone: phone || '',
            monthlyPrice: site.price,
            status: 'pending',
            notes: message || ''
        });

        // Если пользователь зарегистрирован, добавляем уведомление
        if (user) {
            user.addNotification({
                type: 'system',
                message: `Вы подали заявку на аренду сайта "${site.title}"`,
                rentalId: rental._id
            });
            await user.save();
        }

        // Отправляем email уведомление админу
        setTimeout(async () => {
            try {
                await sendEmailNotification('newRentalInquiry', {
                    name,
                    email,
                    phone: phone || '',
                    message: message || 'Запрос на аренду сайта'
                }, site);
            } catch (emailError) {
                console.error('Ошибка отправки email:', emailError);
            }
        }, 0);

        res.status(201).json({
            success: true,
            message: 'Заявка на аренду успешно отправлена!',
            rental: {
                id: rental._id,
                site: site.title,
                status: rental.status,
                price: rental.monthlyPrice
            }
        });

    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании заявки на аренду'
        });
    }
};

// @desc    Получить все аренды (для админа)
// @route   GET /api/rentals
// @access  Private/Admin
export const getAllRentals = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let query = {};

        // Фильтр по статусу
        if (status && status !== 'all') {
            query.status = status;
        }

        // Поиск
        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { clientEmail: { $regex: search, $options: 'i' } },
                { 'siteData.title': { $regex: search, $options: 'i' } }
            ];
        }

        // Сортировка
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const rentals = await Rental.find(query)
            .populate('siteId', 'title category price images demoUrl')
            .populate('userId', 'username email profile')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Rental.countDocuments(query);

        res.json({
            success: true,
            rentals,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Ошибка получения аренд:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении списка аренд'
        });
    }
};

// @desc    Получить детали аренды
// @route   GET /api/rentals/:id
// @access  Private
export const getRentalById = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('siteId', 'title description category price images demoUrl technologies features')
            .populate('userId', 'username email profile phone');

        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена'
            });
        }

        // Проверяем доступ (админ или владелец)
        const isAdmin = req.user.id === process.env.ADMIN_USERNAME;
        const isOwner = rental.userId && rental.userId._id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этой аренде'
            });
        }

        res.json({
            success: true,
            rental
        });
    } catch (error) {
        console.error('Ошибка получения аренды:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении деталей аренды'
        });
    }
};

// @desc    Обновить статус аренды
// @route   PUT /api/rentals/:id/status
// @access  Private/Admin
export const updateRentalStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'active', 'payment_due', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный статус'
            });
        }

        const rental = await Rental.findById(req.params.id)
            .populate('siteId', 'title price')
            .populate('userId', 'username email');

        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена'
            });
        }

        const oldStatus = rental.status;
        rental.status = status;

        // Если активируем аренду, устанавливаем даты
        if (status === 'active' && oldStatus !== 'active') {
            rental.rentalStartDate = new Date();

            // Если дата окончания не установлена, ставим через месяц
            if (!rental.rentalEndDate) {
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);
                rental.rentalEndDate = endDate;
            }
        }

        await rental.save();

        // Отправляем уведомление пользователю, если он зарегистрирован
        if (rental.userId) {
            const user = await User.findById(rental.userId._id);
            if (user) {
                user.addNotification({
                    type: 'system',
                    message: `Статус вашей аренды "${rental.siteId.title}" изменен на "${getStatusText(status)}"`,
                    rentalId: rental._id
                });
                await user.save();

                // Отправляем email при активации аренды
                if (status === 'active') {
                    setTimeout(async () => {
                        try {
                            await sendEmailNotification('clientRentalStarted', {
                                name: user.profile?.firstName || user.username,
                                email: user.email
                            }, rental.siteId);
                        } catch (emailError) {
                            console.error('Ошибка отправки email:', emailError);
                        }
                    }, 0);
                }
            }
        }

        res.json({
            success: true,
            message: `Статус аренды обновлен на "${getStatusText(status)}"`,
            rental
        });

    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении статуса аренды'
        });
    }
};

// @desc    Добавить платеж к аренде
// @route   POST /api/rentals/:id/payments
// @access  Private/Admin
export const addPayment = async (req, res) => {
    try {
        const { amount, paymentMethod = 'bank_transfer', notes = '', periodMonths = 1 } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Некорректная сумма платежа'
            });
        }

        const rental = await Rental.findById(req.params.id)
            .populate('siteId', 'title price')
            .populate('userId', 'username email profile');

        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена'
            });
        }

        // Рассчитываем количество месяцев
        const sitePrice = rental.monthlyPrice;
        const calculatedMonths = Math.floor(amount / sitePrice);
        const actualMonths = periodMonths || calculatedMonths || 1;

        // Создаем платеж
        const payment = {
            amount,
            paymentDate: new Date(),
            periodMonths: actualMonths,
            paymentMethod,
            notes
        };

        // Добавляем платеж
        rental.payments.push(payment);
        rental.totalPaid = (rental.totalPaid || 0) + amount;
        rental.lastPaymentDate = new Date();

        // Если аренда еще не начиналась
        if (!rental.rentalStartDate) {
            rental.rentalStartDate = new Date();
        }

        // Обновляем статус на активный
        if (rental.status !== 'active') {
            rental.status = 'active';
        }

        // Обновляем дату окончания
        let newEndDate;
        if (!rental.rentalEndDate || rental.rentalEndDate < new Date()) {
            newEndDate = new Date();
        } else {
            newEndDate = new Date(rental.rentalEndDate);
        }
        newEndDate.setMonth(newEndDate.getMonth() + actualMonths);
        rental.rentalEndDate = newEndDate;

        // Рассчитываем следующую дату платежа
        const nextPaymentDate = new Date(newEndDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() - 7);
        rental.nextPaymentDate = nextPaymentDate;

        // Сбрасываем дату последнего уведомления
        rental.lastNotificationDate = null;

        await rental.save();

        // Отправляем уведомление клиенту
        if (rental.userId) {
            const user = await User.findById(rental.userId._id);
            if (user) {
                user.addNotification({
                    type: 'payment',
                    message: `Получен платеж ${amount}₸ за аренду "${rental.siteId.title}"`,
                    rentalId: rental._id
                });
                await user.save();

                // Отправляем email подтверждение
                setTimeout(async () => {
                    try {
                        await sendEmailNotification('paymentReceived', {
                            name: user.profile?.firstName || user.username,
                            email: user.email,
                            amount: amount,
                            months: actualMonths,
                            rentalEndDate: rental.rentalEndDate
                        }, rental.siteId);
                    } catch (emailError) {
                        console.error('Ошибка отправки email:', emailError);
                    }
                }, 0);
            }
        }

        // Отправляем email админу
        setTimeout(async () => {
            try {
                await sendEmailNotification('adminPaymentReceived', {
                    name: rental.clientName,
                    email: rental.clientEmail,
                    amount: amount,
                    months: actualMonths,
                    rentalEndDate: rental.rentalEndDate,
                    _id: rental._id,
                    phone: rental.clientPhone
                }, rental.siteId);
            } catch (emailError) {
                console.error('Ошибка отправки email:', emailError);
            }
        }, 0);

        res.json({
            success: true,
            message: 'Платеж успешно добавлен',
            payment,
            rental: {
                id: rental._id,
                status: rental.status,
                totalPaid: rental.totalPaid,
                rentalEndDate: rental.rentalEndDate,
                monthsPaid: actualMonths
            }
        });

    } catch (error) {
        console.error('Ошибка добавления платежа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при добавлении платежа'
        });
    }
};

// @desc    Получить статистику по арендам
// @route   GET /api/rentals/stats/overview
// @access  Private/Admin
export const getRentalStats = async (req, res) => {
    try {
        const totalRentals = await Rental.countDocuments();
        const pendingRentals = await Rental.countDocuments({ status: 'pending' });
        const activeRentals = await Rental.countDocuments({ status: 'active' });
        const paymentDueRentals = await Rental.countDocuments({ status: 'payment_due' });

        // Общая выручка
        const revenueResult = await Rental.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPaid' } } }
        ]);

        // Ежемесячная выручка
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

        const monthlyRevenueResult = await Rental.aggregate([
            {
                $match: {
                    lastPaymentDate: { $gte: oneMonthAgo }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPaid' } } }
        ]);

        // Аренды, истекающие в течение недели
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const expiringSoon = await Rental.countDocuments({
            status: 'active',
            rentalEndDate: {
                $lte: weekFromNow,
                $gte: new Date()
            }
        });

        res.json({
            success: true,
            stats: {
                total: totalRentals,
                pending: pendingRentals,
                active: activeRentals,
                paymentDue: paymentDueRentals,
                expiringSoon: expiringSoon,
                totalRevenue: revenueResult[0]?.total || 0,
                monthlyRevenue: monthlyRevenueResult[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении статистики аренд'
        });
    }
};

// @desc    Получить аренды клиента
// @route   GET /api/rentals/client/my-rentals
// @access  Private/Client
export const getMyRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ userId: req.user._id })
            .populate('siteId', 'title category price images demoUrl')
            .sort({ createdAt: -1 });

        const activeRentals = rentals.filter(r => r.status === 'active');
        const pendingRentals = rentals.filter(r => r.status === 'pending');
        const paymentDueRentals = rentals.filter(r => r.status === 'payment_due');

        res.json({
            success: true,
            rentals,
            stats: {
                total: rentals.length,
                active: activeRentals.length,
                pending: pendingRentals.length,
                paymentDue: paymentDueRentals.length
            }
        });

    } catch (error) {
        console.error('Ошибка получения аренд клиента:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении списка аренд'
        });
    }
};

// @desc    Обновить даты аренды
// @route   PUT /api/rentals/:id/dates
// @access  Private/Admin
export const updateRentalDates = async (req, res) => {
    try {
        const { rentalStartDate, rentalEndDate } = req.body;

        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({
                success: false,
                message: 'Аренда не найдена'
            });
        }

        if (rentalStartDate) {
            rental.rentalStartDate = new Date(rentalStartDate);
        }

        if (rentalEndDate) {
            rental.rentalEndDate = new Date(rentalEndDate);
        }

        await rental.save();

        res.json({
            success: true,
            message: 'Даты аренды обновлены',
            rental
        });

    } catch (error) {
        console.error('Ошибка обновления дат:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении дат аренды'
        });
    }
};

// Вспомогательная функция для получения текста статуса
const getStatusText = (status) => {
    const statusMap = {
        'pending': 'В ожидании',
        'active': 'В активной аренде',
        'payment_due': 'В ожидании оплаты',
        'cancelled': 'Отменена'
    };
    return statusMap[status] || status;
};