const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repair() {
    console.log('--- REPAIRING NAVIGATION LINKS ---');
    const categories = await prisma.category.findMany();
    const catMap = {};
    categories.forEach(c => {
        catMap[c.name] = c.id;
        console.log(`Mapping: ${c.name} -> ${c.id}`);
    });

    const navItems = await prisma.navItem.findMany();
    for (const item of navItems) {
        let newHref = item.href;

        // Fix category links
        if (catMap[item.label]) {
            newHref = `/shop?category=${catMap[item.label]}`;
        } else if (item.label === 'New Arrivals') {
            newHref = '/shop?filter=new';
        } else if (item.label === 'Sale') {
            newHref = '/shop?filter=sale';
        } else if (item.label === 'Home') {
            newHref = '/';
        }

        if (newHref !== item.href) {
            console.log(`Updating ${item.label}: ${item.href} -> ${newHref}`);
            await prisma.navItem.update({
                where: { id: item.id },
                data: { href: newHref }
            });
        }
    }
    console.log('--- REPAIR COMPLETE ---');
    process.exit(0);
}

repair();
