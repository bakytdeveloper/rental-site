import cron from 'node-cron';
import Contact from './models/Contact.js';
import Site from './models/Site.js';
import { sendEmailNotification } from './services/emailService.js';

// Проверка истекающих аренд каждый день в 9:00
export const setupRentalCronJobs = () => {
    // Проверка истекших аренд (каждый день в полночь)
    // cron.schedule('*/5 * * * *', async () => {
        cron.schedule('0 0 * * *', async () => {
        console.log('🕛 Running expired rentals check...');

        try {
            const now = new Date();

            // Находим все активные аренды, которые закончились
            const expiredContacts = await Contact.find({
                $or: [
                    { rentalStatus: 'active' },
                    { status: 'active_rental' }
                ],
                rentalEndDate: { $lt: now }
            });

            console.log(`📧 Found ${expiredContacts.length} expired rentals`);

            for (const contact of expiredContacts) {
                try {
                    // Обновляем статусы через метод модели
                    const needsUpdate = contact.checkAndUpdateExpiredRentals();

                    if (needsUpdate) {
                        await contact.save();
                        console.log(`✅ Updated expired rental for ${contact.email}`);

                        // Получаем информацию о сайте
                        const site = contact.siteId ? await Site.findById(contact.siteId) : null;

                        if (!site) {
                            console.log(`❌ Site not found for contact ${contact.email}`);
                            continue;
                        }

                        // Отправляем уведомление клиенту
                        if (contact.email) {
                            await sendEmailNotification('rentalExpired', {
                                name: contact.name,
                                email: contact.email,
                                rentalEndDate: contact.rentalEndDate,
                                totalPaid: contact.totalPaid,
                                siteTitle: contact.siteTitle || site.title
                            }, site);
                            console.log(`📧 Sent rental expired email to client ${contact.email}`);
                        }

                        // Отправляем уведомление админу
                        await sendEmailNotification('adminRentalExpired', {
                            name: contact.name,
                            email: contact.email,
                            rentalEndDate: contact.rentalEndDate,
                            totalPaid: contact.totalPaid,
                            _id: contact._id,
                            phone: contact.phone,
                            siteTitle: contact.siteTitle || site.title
                        }, site);
                        console.log(`📧 Sent admin notification for expired rental ${contact.email}`);
                    }

                } catch (error) {
                    console.error(`❌ Failed to process expired rental for ${contact.email}:`, error);
                }
            }

            console.log('✅ Expired rentals check completed');

        } catch (error) {
            console.error('❌ Error in expired rentals cron job:', error);
        }
    });

    // Ежедневная проверка истекающих аренд
    cron.schedule('0 9 * * *', async () => {
    // cron.schedule('*/5 * * * *', async () => {

        console.log('🕘 Running expiring rentals check...');

        try {
            const contacts = await Contact.findExpiringRentals(3);

            console.log(`📧 Found ${contacts.length} expiring rentals`);

            for (const contact of contacts) {
                try {
                    const site = contact.siteId ? await Site.findById(contact.siteId) : null;

                    if (!site) {
                        console.log(`❌ Site not found for contact ${contact.email}`);
                        continue;
                    }

                    const daysRemaining = contact.getDaysRemaining();

                    // Проверяем, нужно ли отправлять уведомление
                    if (contact.needsNotification()) {
                        // Отправляем уведомление клиенту
                        if (contact.email) {
                            await sendEmailNotification('rentalExpiringSoon', {
                                name: contact.name,
                                email: contact.email,
                                rentalEndDate: contact.rentalEndDate,
                                daysRemaining: daysRemaining,
                                siteTitle: contact.siteTitle || site.title
                            }, site);
                        }

                        // Отправляем уведомление админу
                        await sendEmailNotification('adminRentalExpiring', {
                            name: contact.name,
                            email: contact.email,
                            rentalEndDate: contact.rentalEndDate,
                            daysRemaining: daysRemaining,
                            _id: contact._id,
                            phone: contact.phone,
                            siteTitle: contact.siteTitle || site.title
                        }, site);

                        // Обновляем дату последнего уведомления
                        contact.lastNotificationDate = new Date();
                        await contact.save();

                        console.log(`✅ Sent reminders for ${contact.email}`);
                    }

                } catch (emailError) {
                    console.error(`❌ Failed to send reminder for ${contact.email}:`, emailError);
                }
            }

            console.log('✅ Expiring rentals check completed');

        } catch (error) {
            console.error('❌ Error in rental cron job:', error);
        }
    });

    console.log('✅ Rental cron jobs scheduled');
};