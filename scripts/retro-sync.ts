const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function retroSync() {
    console.log("--- Starting Retro-Sync ---");

    // 1. Ensure all subcategories have patterns
    const subCategories = await prisma.category.findMany({
        where: { parentId: { not: null } }
    });

    for (const sub of subCategories) {
        const existingPattern = await prisma.pattern.findFirst({
            where: { name: sub.name, categoryId: sub.parentId }
        });
        if (!existingPattern) {
            console.log(`Creating missing Pattern for subcategory: ${sub.name}`);
            await prisma.pattern.create({
                data: { name: sub.name, categoryId: sub.parentId }
            });
        }
    }

    // 2. Ensure all patterns have subcategories
    const patterns = await prisma.pattern.findMany();
    for (const pat of patterns) {
        const existingSub = await prisma.category.findFirst({
            where: { name: pat.name, parentId: pat.categoryId }
        });
        if (!existingSub) {
            console.log(`Creating missing subcategory for Pattern: ${pat.name}`);
            const code = pat.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'SUB';
            await (prisma.category as any).create({
                data: {
                    name: pat.name,
                    code,
                    parentId: pat.categoryId,
                    type: 'Product',
                    fields: 'size,color,material'
                }
            });
        }
    }

    console.log("--- Retro-Sync Complete ---");
}

retroSync().finally(() => prisma.$disconnect());
