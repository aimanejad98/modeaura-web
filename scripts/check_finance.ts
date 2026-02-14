import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const recurring = await prisma.recurringExpense.findMany()
    for (const r of recurring) {
        console.log(`ID: ${r.id}`)
        console.log(`Desc: ${r.description}`)
        console.log(`Next: ${r.nextDueDate.toISOString()}`)
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
