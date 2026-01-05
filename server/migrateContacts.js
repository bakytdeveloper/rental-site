import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Contact from './models/Contact.js';

dotenv.config();

const migrateContacts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Находим все контакты
        const contacts = await Contact.find({ userId: { $exists: false } });

        console.log(`📊 Found ${contacts.length} contacts to migrate`);

        let migratedCount = 0;

        for (const contact of contacts) {
            if (contact.email) {
                // Ищем пользователя с таким email
                const user = await User.findOne({
                    email: contact.email,
                    role: 'client'
                });

                if (user) {
                    // Привязываем контакт к пользователю
                    contact.userId = user._id;
                    await contact.save();

                    // Добавляем сайт в список арендованных пользователя
                    if (contact.siteId) {
                        user.addRentedSite({
                            siteId: contact.siteId,
                            contactId: contact._id,
                            rentalStartDate: contact.rentalStartDate || new Date(),
                            rentalEndDate: contact.rentalEndDate,
                            monthlyPrice: contact.monthlyPrice,
                            status: contact.rentalStatus === 'active' ? 'active' : 'expired'
                        });
                        await user.save();
                    }

                    migratedCount++;
                    console.log(`✅ Migrated contact for ${contact.email}`);
                }
            }
        }

        console.log(`🎉 Migration complete! Migrated ${migratedCount} contacts`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrateContacts();