const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const products = await prisma.product.findMany();
    console.log(`Total Products in DB: ${products.length}`);
    products.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id}, show: ${p.showOnWebsite})`);
    });
    process.exit(0);
}

check();
