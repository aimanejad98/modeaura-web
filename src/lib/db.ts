import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prismaClientSingleton = () => {
    // Vercel Hack: SQLite is read-only in the project folder. 
    // we must copy it to /tmp (writable) to allow the dashboard to work.
    let url = process.env.DATABASE_URL;

    // Vercel Hack: SQLite is read-only in the project folder. 
    // ONLY apply this if we are using SQLite (url starts with file:)
    if (process.env.NODE_ENV === 'production' && url?.startsWith('file:')) {
        const tmpDbPath = '/tmp/modeaura.db';
        const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        try {
            if (!fs.existsSync(tmpDbPath)) {
                if (fs.existsSync(sourceDbPath)) {
                    fs.copyFileSync(sourceDbPath, tmpDbPath);
                    console.log('✅ [DB] Database cloned to /tmp');
                } else {
                    console.error('⚠️ [DB] WARNING: Source database NOT FOUND at', sourceDbPath);
                    console.error('⚠️ [DB] Data will be lost on next restart/cold start if not persisted elsewhere.');
                }
            } else {
                console.log('ℹ️ [DB] Using existing database in /tmp');
            }
        } catch (error) {
            console.error('❌ [DB] Failed to manage database in /tmp:', error);
        }

        url = `file:${tmpDbPath}`;
        console.warn('⚠️ [DB] CAUTION: Running with ephemeral SQLite database. Changes will disappear on cold starts.');
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
