import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const today = new Date();
    console.log('Current Time:', today.toISOString());

    const due = await prisma.recurringExpense.findMany({
        where: { active: true, nextDueDate: { lte: today } }
    })

    console.log(`Found ${due.length} due expenses.`);

    for (const exp of due) {
        console.log(`Processing: ${exp.description} (Due: ${exp.nextDueDate.toISOString()})`);

        // Create expense
        await prisma.expense.create({
            data: {
                categoryId: exp.categoryId,
                description: `${exp.description} (Auto-Renew)`,
                amount: exp.amount,
                date: today.toISOString().split('T')[0],
                isRecurring: true
            }
        })

        // Update next date
        const nextDate = new Date(exp.nextDueDate);
        nextDate.setHours(12, 0, 0, 0);
        if (exp.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);

        await prisma.recurringExpense.update({
            where: { id: exp.id },
            data: { nextDueDate: nextDate }
        })

        console.log(`Next due set to: ${nextDate.toISOString()}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
