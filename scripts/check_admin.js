const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed per prisma/seed.js usage

async function main() {
    console.log('🔍 Checking Admin Staff...');

    try {
        const staff = await prisma.staff.findFirst({
            where: { email: 'admin@modeaura.ca' }
        });

        if (!staff) {
            console.error('❌ Staff user "admin@modeaura.ca" NOT FOUND in database!');
            console.log('➡️ Resolution: Please run "node prisma/seed.js" again.');
            return;
        }

        console.log('✅ Found Staff user:', staff.email);
        console.log('🔑 Role:', staff.role);
        console.log('🔐 Password Hash exists:', !!staff.password);

        if (staff.password) {
            console.log('Testing password "admin123"...');
            const isValid = await bcrypt.compare('admin123', staff.password);
            if (isValid) {
                console.log('✅ Password "admin123" is VALID for this hash!');
            } else {
                console.error('❌ Password "admin123" is INVALID for this hash!');
                console.log('➡️ Resolution: Run "node prisma/seed.js" to reset it.');
            }
        } else {
            console.error('❌ Password is null/empty!');
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
