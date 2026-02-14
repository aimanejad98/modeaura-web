const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧐 Verifying Cleanup Results...');

    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const customerCount = await prisma.customer.count();
    const adminCount = await prisma.customer.count({ where: { role: 'Admin' } });
    const staffCount = await prisma.staff.count();
    const shiftCount = await prisma.shift.count();

    console.log(`Categories: ${categoryCount} (Should be > 0)`);
    console.log(`Products: ${productCount} (Should be 0)`);
    console.log(`Orders: ${orderCount} (Should be 0)`);
    console.log(`All Customers: ${customerCount} (Should be at least Admin count)`);
    console.log(`Admin Customers: ${adminCount} (Should be > 0)`);
    console.log(`Staff: ${staffCount} (Should be 0)`);
    console.log(`Shifts: ${shiftCount} (Should be 0)`);

    if (categoryCount > 0 && adminCount > 0 && productCount === 0 && orderCount === 0) {
        console.log('\n✅ VERIFICATION SUCCESSFUL!');
    } else {
        console.log('\n❌ VERIFICATION FAILED!');
    }

    await prisma.$disconnect();
}

main();
