import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const order = await prisma.order.findUnique({
        where: { orderId: 'MA-562995' }
    });
    console.log(JSON.stringify(order, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
