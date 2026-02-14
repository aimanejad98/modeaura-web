const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const settings = await prisma.storeSetting.findFirst();
        const theme = await prisma.theme.findFirst({ where: { isActive: true } });
        const products = await prisma.product.count();
        const categories = await prisma.category.count();
        const navItems = await prisma.navItem.count();
        const banners = await prisma.banner.count();

        console.log('--- SYSTEM CHECK ---');
        console.log('Settings:', settings ? 'FOUND' : 'MISSING');
        console.log('Active Theme:', theme ? theme.name : 'NONE');
        console.log('Products:', products);
        console.log('Categories:', categories);
        console.log('Nav Items:', navItems);
        console.log('Banners:', banners);

        if (settings) {
            console.log('Logo Path:', settings.logo);
        }
    } catch (e) {
        console.error('System check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
