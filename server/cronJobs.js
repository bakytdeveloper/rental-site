import cron from 'node-cron';
import Contact from './models/Contact.js';
import Site from './models/Site.js';
import { sendEmailNotification } from './services/emailService.js';

// Проверка истекающих аренд каждый день в 9:00
export const setupRentalCronJobs = () => {
    // Ежедневная проверка в 9:00 утра
    cron.schedule('*/5 * * * *', async () => {
        // cron.schedule('0 9 * * *', async () => {
        console.log('🕘 Running daily rental check...');

        try {
            const contacts = await Contact.findExpiringRentals(3); // За 3 дня

            console.log(`📧 Found ${contacts.length} expiring rentals`);

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

                    console.log(`✅ Sent reminder for ${contact.email}`);

                } catch (emailError) {
                    console.error(`❌ Failed to send reminder for ${contact.email}:`, emailError);
                }
            }

            console.log('✅ Daily rental check completed');

        } catch (error) {
            console.error('❌ Error in rental cron job:', error);
        }
    });

    console.log('✅ Rental cron jobs scheduled');
};