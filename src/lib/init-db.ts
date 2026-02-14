import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function ensureDatabaseSeeded() {
    try {
        console.log('🔍 Checking database health...');

        // Check for Admin
        const admin = await prisma.customer.findFirst({
            where: { role: 'Admin' }
        });

        // Check for Nav
        const navCount = await prisma.navItem.count();

        if (admin && navCount > 0) {
            console.log('✅ Database is healthy and populated.');
            return;
        }

        console.log('⚠️ Database empty or incomplete. Starting Runtime Recovery...');

        // 1. Create Admin if missing
        if (!admin) {
            const hashedPassword = await hash('admin123', 12);

            // Create in Customer table
            await prisma.customer.upsert({
                where: { email: 'modeaura1@gmail.com' },
                update: {
                    password: hashedPassword,
                    role: 'Admin',
                    isVerified: true
                },
                create: {
                    name: 'Mode Aura Admin',
                    email: 'modeaura1@gmail.com',
                    password: hashedPassword,
                    role: 'Admin',
                    isVerified: true
                }
            });

            // Create in Staff table (for Dashboard access)
            await prisma.staff.upsert({
                where: { email: 'modeaura1@gmail.com' },
                update: {
                    password: hashedPassword,
                    role: 'Admin',
                },
                create: {
                    name: 'Mode Aura Admin',
                    email: 'modeaura1@gmail.com',
                    password: hashedPassword,
                    role: 'Admin',
                }
            });
            console.log('✅ Admin accounts recovered (Customer & Staff).');
        }

        // 2. Create Categories & Nav if missing
        if (navCount === 0) {
            // Re-create Categories
            const categories = [
                { name: 'Abayas', code: 'ABA', type: 'Product' },
                { name: 'Scarfs', code: 'SCR', type: 'Product' },
                { name: 'Shaylas', code: 'SHA', type: 'Product' },
                { name: 'Bags', code: 'BAG', type: 'Product' },
                { name: 'Accessories', code: 'ACC', type: 'Product' }
            ];

            const categoryMap: Record<string, string> = {};

            for (const cat of categories) {
                // Try find first to avoid duplicates if partial seed
                let c = await prisma.category.findFirst({ where: { name: cat.name } });
                if (!c) {
                    c = await prisma.category.create({ data: cat });
                }
                categoryMap[cat.name] = c.id;
            }

            // Create Nav Items
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
            console.log('✅ Navigation recovered.');

            // 3. Create Fallback Banners
            const bannerCount = await prisma.banner.count();
            if (bannerCount === 0) {
                await prisma.banner.createMany({
                    data: [
                        { title: 'Uncompromising Elegance', subtitle: 'The New Collection', image: '/login-visual.png', link: '/shop', active: true, order: 0 },
                        { title: 'Timeless Modesty', subtitle: 'Atelier Exclusives', image: '/register-visual.png', link: '/shop', active: true, order: 1 }
                    ]
                });
            }

            // 4. Products are intentionally left empty 
            // per user request for manual entry via Dashboard.
            console.log('✅ Navigation & Banners recovered. Products left empty for manual filling.');
        }

    } catch (error) {
        console.error('❌ Runtime Recovery Failed:', error);
    }
}
