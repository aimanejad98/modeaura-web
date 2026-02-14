const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNav() {
    try {
        const navItems = await prisma.navItem.findMany();
        const categories = await prisma.category.findMany();

        console.log('--- NAV ITEMS ---');
        navItems.forEach(item => {
            console.log(`Label: ${item.label} | Href: ${item.href}`);
        });

        console.log('\n--- CATEGORIES ---');
        categories.forEach(cat => {
            console.log(`Name: ${cat.name} | ID: ${cat.id}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkNav();
