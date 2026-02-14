import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/init-db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        console.log('🔄 Manual Setup Triggered via API...');

        await ensureDatabaseSeeded();

        // Verification checks
        const admin = await prisma.customer.findUnique({ where: { email: 'modeaura1@gmail.com' } });
        const navCount = await prisma.navItem.count();
        const productCount = await prisma.product.count();

        return NextResponse.json({
            status: 'success',
            message: 'Database successfully initialized.',
            checks: {
                adminExists: !!admin,
                navItems: navCount,
                products: productCount,
                adminEmail: 'modeaura1@gmail.com'
            }
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: 'Setup failed',
            error: String(error)
        }, { status: 500 });
    }
}
