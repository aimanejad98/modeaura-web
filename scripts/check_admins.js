const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const admins = await prisma.customer.findMany({
            where: { role: 'Admin' },
            select: { email: true, name: true, role: true }
        });
        console.log('Registered Admin Users:');
        console.log(JSON.stringify(admins, null, 2));
    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
