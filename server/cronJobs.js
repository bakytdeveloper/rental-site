import cron from 'node-cron';
import Rental from './models/Rental.js';
import User from './models/User.js';
import Site from './models/Site.js';
import { sendEmailNotification } from './services/emailService.js';

// Проверка истекающих аренд каждый день в 9:00
export const setupRentalCronJobs = () => {
    // Проверка истекших аренд (каждый день в полночь)
    cron.schedule('0 0 * * *', async () => {
        console.log('🕛 Проверка истекших аренд...');

        try {
            const now = new Date();

            // Находим все активные аренды, которые закончились
            const expiredRentals = await Rental.find({
                status: 'active',
                rentalEndDate: { $lt: now }
            }).populate('siteId').populate('userId');

            console.log(`📧 Найдено ${expiredRentals.length} истекших аренд`);

            for (const rental of expiredRentals) {
                try {
                    // Обновляем статус на "ожидает оплаты"
                    rental.status = 'payment_due';
                    await rental.save();

                    console.log(`✅ Обновлен статус аренды для ${rental.clientEmail}`);

                    // Получаем информацию о сайте
                    const site = rental.siteId;
                    if (!site) {
                        console.log(`❌ Сайт не найден для аренды ${rental._id}`);
                        continue;
                    }

                    // Отправляем уведомление клиенту
                    if (rental.clientEmail) {
                        await sendEmailNotification('rentalExpired', {
                            name: rental.clientName,
                            email: rental.clientEmail,
                            rentalEndDate: rental.rentalEndDate,
                            totalPaid: rental.totalPaid,
                            siteTitle: site.title
                        }, site);
                        console.log(`📧 Отправлено письмо об истечении аренды клиенту ${rental.clientEmail}`);
                    }

                    // Отправляем уведомление админу
                    await sendEmailNotification('adminRentalExpired', {
                        name: rental.clientName,
                        email: rental.clientEmail,
                        rentalEndDate: rental.rentalEndDate,
                        totalPaid: rental.totalPaid,
                        _id: rental._id,
                        phone: rental.clientPhone,
                        siteTitle: site.title
                    }, site);
                    console.log(`📧 Отправлено уведомление админу об истечении аренды ${rental.clientEmail}`);

                } catch (error) {
                    console.error(`❌ Ошибка обработки аренды ${rental._id}:`, error);
                }
            }

            console.log('✅ Проверка истекших аренд завершена');

        } catch (error) {
            console.error('❌ Ошибка в cron-задаче проверки истекших аренд:', error);
        }
    });

    // Ежедневная проверка истекающих аренд (за 3 дня до окончания)
    cron.schedule('0 9 * * *', async () => {
        console.log('🕘 Проверка истекающих аренд...');

        try {
            const now = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            // Находим активные аренды, которые истекают в течение 3 дней
            const expiringRentals = await Rental.find({
                status: 'active',
                rentalEndDate: {
                    $lte: threeDaysFromNow,
                    $gte: now
                }
            }).populate('siteId').populate('userId');

            console.log(`📧 Найдено ${expiringRentals.length} истекающих аренд`);

            for (const rental of expiringRentals) {
                try {
                    const site = rental.siteId;
                    if (!site) {
                        console.log(`❌ Сайт не найден для аренды ${rental._id}`);
                        continue;
                    }

                    // Рассчитываем оставшиеся дни
                    const daysRemaining = Math.ceil((rental.rentalEndDate - now) / (1000 * 60 * 60 * 24));

                    // Проверяем, нужно ли отправлять уведомление (еще не отправляли или прошло больше суток)
                    const shouldNotify = !rental.lastNotificationDate ||
                        (new Date() - rental.lastNotificationDate) > (24 * 60 * 60 * 1000);

                    if (shouldNotify && daysRemaining <= 3 && daysRemaining >= 0) {
                        // Отправляем уведомление клиенту
                        if (rental.clientEmail) {
                            await sendEmailNotification('rentalExpiringSoon', {
                                name: rental.clientName,
                                email: rental.clientEmail,
                                rentalEndDate: rental.rentalEndDate,
                                daysRemaining: daysRemaining,
                                siteTitle: site.title
                            }, site);
                        }

                        // Отправляем уведомление админу
                        await sendEmailNotification('adminRentalExpiring', {
                            name: rental.clientName,
                            email: rental.clientEmail,
                            rentalEndDate: rental.rentalEndDate,
                            daysRemaining: daysRemaining,
                            _id: rental._id,
                            phone: rental.clientPhone,
                            siteTitle: site.title
                        }, site);

                        // Обновляем дату последнего уведомления
                        rental.lastNotificationDate = new Date();
                        await rental.save();

                        console.log(`✅ Отправлены напоминания для ${rental.clientEmail} (осталось ${daysRemaining} дней)`);
                    }

                } catch (emailError) {
                    console.error(`❌ Ошибка отправки напоминания для ${rental.clientEmail}:`, emailError);
                }
            }

            console.log('✅ Проверка истекающих аренд завершена');

        } catch (error) {
            console.error('❌ Ошибка в cron-задаче проверки истекающих аренд:', error);
        }
    });

    // Ежемесячная статистика (1 числа каждого месяца в 8:00)
    cron.schedule('0 8 1 * *', async () => {
        console.log('📊 Генерация ежемесячной статистики...');

        try {
            const now = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            // Получаем статистику за последний месяц
            const monthlyStats = await Rental.aggregate([
                {
                    $match: {
                        lastPaymentDate: { $gte: lastMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPayments: { $sum: 1 },
                        totalRevenue: { $sum: '$totalPaid' },
                        avgPayment: { $avg: '$totalPaid' }
                    }
                }
            ]);

            console.log('📈 Ежемесячная статистика:', monthlyStats[0] || 'Нет данных');

            // Можно отправить статистику админу на email
            // await sendEmailNotification('adminMonthlyStats', { stats: monthlyStats[0] || {} });

        } catch (error) {
            console.error('❌ Ошибка генерации статистики:', error);
        }
    });

    console.log('✅ Cron-задачи для аренд настроены');
};