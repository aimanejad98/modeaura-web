const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function syncAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const email = 'modeaura1@gmail.com';

        console.log(`Syncing admin for ${email}...`);

        // Update/Create in Customer table
        await prisma.customer.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'Admin',
                isVerified: true
            },
            create: {
                name: 'Mode Aura Admin',
                email,
                password: hashedPassword,
                role: 'Admin',
                isVerified: true
            }
        });

        // Update/Create in Staff table
        await prisma.staff.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'Admin'
            },
            create: {
                name: 'Mode Aura Admin',
                email,
                password: hashedPassword,
                role: 'Admin'
            }
        });

        console.log('Admin sync complete for both tables.');
    } catch (error) {
        console.error('Error syncing admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncAdmin();
