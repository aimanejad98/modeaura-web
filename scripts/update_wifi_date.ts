import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const recurring = await prisma.recurringExpense.findFirst({
        where: { description: 'WIFI' }
    })

    if (recurring) {
        const nextDate = new Date('2026-03-10T12:00:00');
        await prisma.recurringExpense.update({
            where: { id: recurring.id },
            data: { nextDueDate: nextDate }
        })
        console.log(`Updated WIFI next due date to ${nextDate.toISOString()}`);
    } else {
        console.log('WIFI recurring expense not found');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
