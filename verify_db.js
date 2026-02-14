const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.customer.findUnique({
        where: { email: 'admin@modeaura.ca' }
    });
    console.log('Admin found:', admin);

    const bannerCount = await prisma.banner.count();
    console.log('Banner count:', bannerCount);

    const navCount = await prisma.navItem.count();
    console.log('Nav item count:', navCount);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
