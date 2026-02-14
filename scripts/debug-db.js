const { PrismaClient } = require('@prisma/client');

async function checkDb(url) {
    console.log(`Checking DB at ${url}...`);
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: `file:${url}`
            }
        }
    });
    try {
        const banners = await prisma.banner.findMany();
        console.log(`Found ${banners.length} banners:`, JSON.stringify(banners, null, 2));
    } catch (err) {
        console.error(`Error checking ${url}:`, err.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await checkDb('D:/Websites/modeaura/modeaura-web/prisma/dev.db');
    await checkDb('D:/Websites/modeaura/modeaura-web/dev.db');
}

main();
