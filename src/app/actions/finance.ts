"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Standard Expenses ---

export async function getExpenses() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        });
        return JSON.parse(JSON.stringify(expenses));
    } catch (error) {
        console.error('[Finance] Expenses fetch failed:', error);
        return [];
    }
}

export async function addExpense(data: {
    category: string;
    description: string;
    amount: number;
    date: string;
    isRecurring: boolean;
}) {
    try {
        let categoryRecord = await prisma.category.findFirst({
            where: { name: data.category, parentId: null }
        });

        if (!categoryRecord) {
            categoryRecord = await prisma.category.create({
                data: { name: data.category, type: 'Expense' }
            });
        }

        const expense = await prisma.expense.create({
            data: {
                categoryId: categoryRecord.id,
                description: data.description,
                amount: data.amount,
                date: data.date,
                isRecurring: data.isRecurring
            }
        });
        revalidatePath('/dashboard/finance');
        return JSON.parse(JSON.stringify(expense));
    } catch (error) {
        console.error('[Finance] Add expense failed:', error);
        throw error;
    }
}

// --- Recurring Expenses (Subscriptions) ---

export async function getRecurringExpenses() {
    try {
        // @ts-ignore - Schema might not be generated yet
        const expenses = await prisma.recurringExpense.findMany({
            orderBy: { nextDueDate: 'asc' },
            include: { category: true }
        });
        return JSON.parse(JSON.stringify(expenses));
    } catch (error) {
        // Fail silently if table doesn't exist yet
        return [];
    }
}

export async function addRecurringExpense(data: {
    category: string;
    description: string;
    amount: number;
    frequency: string;
    nextDueDate: string;
}) {
    try {
        let categoryRecord = await prisma.category.findFirst({
            where: { name: data.category, parentId: null }
        });

        if (!categoryRecord) {
            categoryRecord = await prisma.category.create({
                data: { name: data.category, type: 'Expense' }
            });
        }

        // @ts-ignore
        const expense = await prisma.recurringExpense.create({
            data: {
                categoryId: categoryRecord.id,
                description: data.description,
                amount: data.amount,
                frequency: data.frequency,
                nextDueDate: new Date(data.nextDueDate + 'T12:00:00'),
                active: true
            }
        });
        revalidatePath('/dashboard/finance');
        return JSON.parse(JSON.stringify(expense));
    } catch (error) {
        console.error('[Finance] Add recurring failed:', error);
        throw error;
    }
}

export async function deleteRecurringExpense(id: string) {
    try {
        // @ts-ignore
        await prisma.recurringExpense.delete({ where: { id } });
        revalidatePath('/dashboard/finance');
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function checkAndRenewExpenses() {
    try {
        const today = new Date();
        // @ts-ignore
        const dueExpenses = await prisma.recurringExpense.findMany({
            where: {
                active: true,
                nextDueDate: { lte: today }
            }
        });

        if (dueExpenses.length === 0) return { processed: 0 };

        let processed = 0;
        for (const exp of dueExpenses) {
            // 1. Create the actual expense record
            await prisma.expense.create({
                data: {
                    categoryId: exp.categoryId,
                    description: `${exp.description} (Auto-Renew)`,
                    amount: exp.amount,
                    date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
                    isRecurring: true
                }
            });

            // 2. Calculate next due date
            const nextDate = new Date(exp.nextDueDate);
            nextDate.setHours(12, 0, 0, 0); // Keep it at midday to avoid TZ shifts
            if (exp.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (exp.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (exp.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

            // 3. Update the recurring record
            // @ts-ignore
            await prisma.recurringExpense.update({
                where: { id: exp.id },
                data: { nextDueDate: nextDate }
            });
            processed++;
        }

        revalidatePath('/dashboard/finance');
        return { processed };
    } catch (error) {
        console.error('[Finance] Auto-renewal failed (likely schema mismatch):', error);
        return { processed: 0 };
    }
}

// --- Stats ---

export async function getDashboardStats() {
    try {
        console.log('📊 [Finance] Fetching dashboard stats...');
        const orders = await prisma.order.findMany();
        console.log(`✅ [Finance] Found ${orders.length} orders`);

        const staffMembers = await prisma.staff.findMany({
            include: { shifts: true }
        });
        console.log(`✅ [Finance] Found ${staffMembers.length} staff members`);

        const customers = await prisma.customer.count();
        console.log(`✅ [Finance] Counted ${customers} customers`);

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
        const totalSales = orders.length;
        const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Calculate total salaries from shifts
        let totalSalaries = 0;
        for (const staff of staffMembers) {
            const hoursWorked = staff.shifts.reduce((sum: number, shift: any) => sum + (shift.totalHours || 0), 0);
            totalSalaries += hoursWorked * (staff.hourlyRate || 0);
        }

        return {
            totalRevenue,
            totalSales,
            avgOrderValue,
            totalTraffic: customers,
            totalSalaries,
            staffCount: staffMembers.length
        };
    } catch (error) {
        console.error('[Finance] Stats fetch failed:', error);
        return {
            totalRevenue: 0,
            totalSales: 0,
            avgOrderValue: 0,
            totalTraffic: 0,
            totalSalaries: 0,
            staffCount: 0
        };
    }
}
