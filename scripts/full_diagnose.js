const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- EXTENDED DIAGNOSIS ---');
    try {
        const prodCount = await prisma.product.count();
        console.log('Products:', prodCount);

        const catCount = await prisma.category.count();
        console.log('Categories:', catCount);

        const matCount = await prisma.material.count();
        console.log('Materials:', matCount);

        const colCount = await prisma.color.count();
        console.log('Colors:', colCount);

        const navCount = await prisma.navItem.count();
        console.log('NavItems:', navCount);

        const products = await prisma.product.findMany({
            include: { category: true }
        });

        products.forEach(p => {
            console.log(`P: ${p.id} | Name: ${p.name} | CatID: ${p.categoryId} | Cat: ${p.category ? p.category.name : 'MISSING'}`);
        });

    } catch (e) {
        console.error('DIAGNOSIS FAILED:', e);
    }
    process.exit(0);
}

diagnose();
