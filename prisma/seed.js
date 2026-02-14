const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Seeding Mode AURA database...');

    // 1. Clean up existing data
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.recurringExpense.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.navItem.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.category.deleteMany({});
    // We don't delete Staff/Customer to preserve existing accounts if any, but we will upsert Admin

    // 2. Create Categories
    const categories = [
        { name: 'Abayas', code: 'ABA', type: 'Product' },
        { name: 'Scarfs', code: 'SCR', type: 'Product' },
        { name: 'Shaylas', code: 'SHA', type: 'Product' },
        { name: 'Bags', code: 'BAG', type: 'Product' },
        { name: 'Accessories', code: 'ACC', type: 'Product' } // Fixed typo
    ];

    const categoryMap = {};

    for (const cat of categories) {
        const created = await prisma.category.create({
            data: cat
        });
        categoryMap[cat.name] = created.id;
        console.log(`✅ Category created: ${cat.name}`);
    }

    // 3. Create Navigation Items (Fixes "No Nav" issue)
    const navItems = [
        { label: 'New Arrivals', href: '/shop?filter=new', order: 0 },
        { label: 'Abayas', href: `/shop?category=${categoryMap['Abayas']}`, order: 1 },
        { label: 'Scarfs', href: `/shop?category=${categoryMap['Scarfs']}`, order: 2 },
        { label: 'Bags', href: `/shop?category=${categoryMap['Bags']}`, order: 3 },
        { label: 'Accessories', href: `/shop?category=${categoryMap['Accessories']}`, order: 4 },
        { label: 'Sale', href: '/shop?filter=sale', order: 5 }
    ];

    for (const item of navItems) {
        await prisma.navItem.create({ data: item });
    }
    console.log('✅ Navigation items created');

    // 4. Create Banners (Restored per user request)
    await prisma.banner.createMany({
        data: [
            {
                title: 'Uncompromising Elegance',
                subtitle: 'The New Collection',
                image: '/login-visual.png',
                link: '/shop',
                active: true,
                order: 0
            },
            {
                title: 'Timeless Modesty',
                subtitle: 'Atelier Exclusives',
                image: '/register-visual.png',
                link: '/shop',
                active: true,
                order: 1
            }
        ]
    });
    console.log('✅ Banners created');

    // 5. Create Admin Customer (for shopping)
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await prisma.customer.upsert({
        where: { email: 'admin@modeaura.ca' },
        update: {
            password: hashedPassword,
            role: 'Admin',
            isVerified: true
        },
        create: {
            name: 'Mode Aura Admin',
            email: 'admin@modeaura.ca',
            password: hashedPassword,
            role: 'Admin',
            isVerified: true
        }
    });

    // 6. Create Admin STAFF (for dashboard access)
    await prisma.staff.upsert({
        where: { email: 'admin@modeaura.ca' },
        update: {
            password: hashedPassword, // Uses same hash
            role: 'Admin',
            status: 'Clocked In'
        },
        create: {
            name: 'Mode Aura Administrator',
            email: 'admin@modeaura.ca',
            password: hashedPassword,
            role: 'Admin',
            phone: '555-0123',
            hourlyRate: 0,
            status: 'Clocked In'
        }
    });

    console.log('✅ Admin Customer & Staff accounts ready: admin@modeaura.ca / admin123');
    console.log('✅ Database reset to Clean Slate (Categories + Nav + Admin only). Ready for manual entry.');

}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
