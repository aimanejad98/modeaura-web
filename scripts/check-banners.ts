import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const banners = await prisma.banner.findMany()
    console.log(JSON.stringify(banners, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
