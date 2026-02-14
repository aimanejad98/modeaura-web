const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
    console.log(`Checking ${products.length} products:`);
    products.forEach(p => {
        console.log(`- ${p.name}: ${p.images?.slice(0, 50)}...`);
    });
    process.exit(0);
}

check();
