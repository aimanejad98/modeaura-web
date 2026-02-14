const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLoops() {
    console.log('--- CATEGORY LOOP CHECK ---');
    const categories = await prisma.category.findMany();
    const catMap = new Map(categories.map(c => [c.id, c]));

    for (const cat of categories) {
        let current = cat;
        const visited = new Set();
        while (current.parentId) {
            if (visited.has(current.id)) {
                console.error(`LOOP DETECTED: Category ${cat.name} (${cat.id}) forms a loop!`);
                process.exit(1);
            }
            visited.add(current.id);
            current = catMap.get(current.parentId);
            if (!current) break;
        }
    }
    console.log('No loops detected.');
    process.exit(0);
}

checkLoops();
