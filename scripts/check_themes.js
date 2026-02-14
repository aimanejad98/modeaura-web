const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const themes = await prisma.theme.findMany();
        console.log('Themes:', JSON.stringify(themes, null, 2));

        const activeTheme = themes.find(t => t.isActive);
        console.log('Active Theme:', activeTheme ? activeTheme.name : 'NONE');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
