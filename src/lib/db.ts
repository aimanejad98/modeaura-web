import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prismaClientSingleton = () => {
    // Vercel Hack: SQLite is read-only in the project folder. 
    // we must copy it to /tmp (writable) to allow the dashboard to work.
    let url = process.env.DATABASE_URL;

    if (process.env.NODE_ENV === 'production') {
        const tmpDbPath = '/tmp/modeaura.db';
        const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        try {
            if (!fs.existsSync(tmpDbPath)) {
                // Copy the pre-filled database to the writable folder
                if (fs.existsSync(sourceDbPath)) {
                    fs.copyFileSync(sourceDbPath, tmpDbPath);
                    console.log('✅ Database cloned to /tmp');
                } else {
                    console.error('⚠️ Source database not found at:', sourceDbPath);
                }
            }
        } catch (error) {
            console.error('❌ Failed to copy database:', error);
        }

        url = `file:${tmpDbPath}`;
    }

    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
        log: ['error', 'warn'],
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
