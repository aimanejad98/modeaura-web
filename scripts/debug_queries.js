const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing raw query...');
        const products = await prisma.$queryRawUnsafe(`
        SELECT p.*, c.name as "categoryName", pc.name as "parentCategoryName", s.name as "saleName", s.value as "saleValue", s.type as "saleType"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "Category" pc ON c."parentId" = pc.id
        LEFT JOIN "Sale" s ON p."saleId" = s.id
        ORDER BY p."createdAt" DESC
    `);
        console.log(`Success: Found ${products.length} products with raw query.`);
    } catch (e) {
        console.error('Raw query FAILED:', e.message);
        try {
            console.log('Falling back to Prisma findMany...');
            const products = await prisma.product.findMany({
                include: {
                    category: { include: { parent: true } },
                    sale: true
                },
                orderBy: { createdAt: 'desc' }
            });
            console.log(`Success: Found ${products.length} products with findMany.`);
        } catch (e2) {
            console.error('findMany also FAILED:', e2.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
