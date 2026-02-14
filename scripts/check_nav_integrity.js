const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const categories = await prisma.category.findMany();
        const navItems = await prisma.navItem.findMany();

        console.log(`Categories: ${categories.length}`);
        console.log(`NavItems: ${navItems.length}`);

        // Check for loops in categories
        for (const cat of categories) {
            let current = cat;
            const seen = new Set([cat.id]);
            while (current.parentId) {
                if (seen.has(current.parentId)) {
                    console.error(`Loop found in category: ${cat.name} (${cat.id})`);
                    break;
                }
                seen.add(current.parentId);
                current = categories.find(c => c.id === current.parentId);
                if (!current) break;
            }
        }

        // Check for loops in nav items
        for (const item of navItems) {
            let current = item;
            const seen = new Set([item.id]);
            while (current.parentId) {
                if (seen.has(current.parentId)) {
                    console.error(`Loop found in nav item: ${item.label} (${item.id})`);
                    break;
                }
                seen.add(current.parentId);
                current = navItems.find(i => i.id === current.parentId);
                if (!current) break;
            }
        }

        console.log('Nav Item Hrefs:');
        navItems.forEach(i => console.log(`- ${i.label}: ${i.href}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
