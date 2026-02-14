const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Find existing admin or create new one
        const admin = await prisma.customer.fields ? null : await prisma.customer.findFirst({
            where: { role: 'Admin' }
        });

        if (admin) {
            console.log(`Found existing admin: ${admin.email}. Updating to modeaura1@gmail.com...`);
            await prisma.customer.update({
                where: { email: admin.email },
                data: {
                    email: 'modeaura1@gmail.com',
                    password: hashedPassword,
                    name: 'Mode Aura Admin',
                    isVerified: true
                }
            });
            console.log('Admin updated successfully.');
        } else {
            console.log('No admin found. Creating new admin: modeaura1@gmail.com...');
            await prisma.customer.create({
                data: {
                    email: 'modeaura1@gmail.com',
                    password: hashedPassword,
                    name: 'Mode Aura Admin',
                    role: 'Admin',
                    isVerified: true
                }
            });
            console.log('Admin created successfully.');
        }
    } catch (error) {
        console.error('Error updating/creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
