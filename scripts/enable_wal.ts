
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // Enable WAL mode
        // This returns a result set, need to use queryRaw
        const result = await prisma.$queryRaw`PRAGMA journal_mode = WAL;`
        console.log('WAL Mode Result:', result)

        // Check if it worked
        const mode = await prisma.$queryRaw`PRAGMA journal_mode;`
        console.log('Current Journal Mode:', mode)

    } catch (error) {
        console.error('Error enabling WAL:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
