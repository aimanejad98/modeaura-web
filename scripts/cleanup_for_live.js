const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Starting Deployment Cleanup...');

    try {
        // 1. Database Cleanup
        console.log('--- Cleaning Database ---');

        const deletedShifts = await prisma.shift.deleteMany({});
        console.log(`✅ Deleted ${deletedShifts.count} Shifts`);

        const deletedStaff = await prisma.staff.deleteMany({});
        console.log(`✅ Deleted ${deletedStaff.count} Staff accounts`);

        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`✅ Deleted ${deletedOrders.count} Orders`);

        const deletedProducts = await prisma.product.deleteMany({});
        console.log(`✅ Deleted ${deletedProducts.count} Products`);

        const deletedMaterials = await prisma.material.deleteMany({});
        console.log(`✅ Deleted ${deletedMaterials.count} Materials`);

        const deletedDiscountCodes = await prisma.discountCode.deleteMany({});
        console.log(`✅ Deleted ${deletedDiscountCodes.count} Discount Codes`);

        // Delete all customers EXCEPT Admin
        const deletedCustomers = await prisma.customer.deleteMany({
            where: {
                role: {
                    not: 'Admin'
                }
            }
        });
        console.log(`✅ Deleted ${deletedCustomers.count} Customer accounts (Preserved Admins)`);

        const deletedExpenses = await prisma.expense.deleteMany({});
        console.log(`✅ Deleted ${deletedExpenses.count} Expenses`);

        const deletedRecurringExpenses = await prisma.recurringExpense.deleteMany({});
        console.log(`✅ Deleted ${deletedRecurringExpenses.count} Recurring Expenses`);

        const deletedSubscribers = await prisma.subscriber.deleteMany({});
        console.log(`✅ Deleted ${deletedSubscribers.count} Subscribers`);

        const deletedTestimonials = await prisma.testimonial.deleteMany({});
        console.log(`✅ Deleted ${deletedTestimonials.count} Testimonials`);

        const deletedAssets = await prisma.businessAsset.deleteMany({});
        console.log(`✅ Deleted ${deletedAssets.count} Business Assets`);

        const deletedSkuCounters = await prisma.skuCounter.deleteMany({});
        console.log(`✅ Deleted ${deletedSkuCounters.count} SKU Counters`);

        // 2. File Cleanup (public/uploads)
        console.log('\n--- Cleaning Uploads Folder ---');
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedFilesCount = 0;

            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    deletedFilesCount++;
                }
            }
            console.log(`✅ Deleted ${deletedFilesCount} files from public/uploads`);
        } else {
            console.log('ℹ️ public/uploads directory does not exist.');
        }

        console.log('\n✨ Cleanup Complete! Navigation and Categories have been preserved.');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
