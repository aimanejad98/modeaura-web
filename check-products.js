const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.$queryRawUnsafe('SELECT id, name, isKids, isNewArrival, createdAt FROM Product ORDER BY createdAt DESC LIMIT 10');
        console.log('--- RECENT PRODUCTS ---');
        console.log(JSON.stringify(products, null, 2));
    } catch (e) {
        console.error('Diagnostic failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
