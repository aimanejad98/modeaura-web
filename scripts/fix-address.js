const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAddress() {
    console.log('🔄 Connecting to database...');

    try {
        const settings = await prisma.storeSetting.findFirst();

        if (!settings) {
            console.log('⚠️ No settings found. Creating default...');
            await prisma.storeSetting.create({
                data: {
                    storeName: 'Mode AURA',
                    tagline: 'Luxury Modest Fashion',
                    address: 'Mode Aura Boutique', // Generic
                    city: 'Windsor',
                    province: 'ON',
                    postalCode: 'N8X 2S2',
                    phone: '', // Clear phone
                    email: 'modeaura1@gmail.com',
                }
            });
            console.log('✅ Created default settings with safe address.');
        } else {
            console.log(`Found settings. Current address: ${settings.address}`);

            // Update
            await prisma.storeSetting.update({
                where: { id: settings.id },
                data: {
                    address: 'Mode Aura Boutique',
                    city: 'Windsor',
                    province: 'ON',
                    postalCode: 'N8X 2S2',
                    phone: '', // Clear phone
                }
            });
            console.log('✅ Updated settings to remove private address.');
        }

    } catch (e) {
        console.error('❌ Error updating settings:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixAddress();
