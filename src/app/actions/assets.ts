"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAssets() {
    try {
        const assets = await (prisma as any).businessAsset.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Pull relevant expenses from Finance Hub
        const expenses = await prisma.expense.findMany({
            include: { category: true }
        });

        const assetCategories = ['Equipment', 'Furniture', 'Fixture', 'Tech', 'Machinery'];
        const expenseAssets = expenses.filter(exp =>
            exp.category && assetCategories.some(cat => exp.category?.name.includes(cat))
        ).map(exp => ({
            id: `exp_${exp.id}`,
            name: exp.description,
            type: exp.category?.name || 'Asset',
            value: exp.amount,
            dateAcquired: exp.date,
            isFromFinance: true
        }));

        return JSON.parse(JSON.stringify([...assets, ...expenseAssets]));
    } catch (error) {
        console.error('[Assets] Fetch failed:', error);
        return [];
    }
}

export async function addAsset(data: {
    name: string;
    description?: string;
    type: string;
    value: number;
    dateAcquired?: string;
}) {
    try {
        const asset = await (prisma as any).businessAsset.create({
            data: {
                name: data.name,
                description: data.description || null,
                type: data.type,
                value: Number(data.value),
                dateAcquired: data.dateAcquired || null
            }
        });
        revalidatePath('/dashboard/insurance');
        return JSON.parse(JSON.stringify(asset));
    } catch (error) {
        console.error('[Assets] Create failed:', error);
        throw error;
    }
}

export async function deleteAsset(id: string) {
    try {
        await (prisma as any).businessAsset.delete({ where: { id } });
        revalidatePath('/dashboard/insurance');
        return { success: true };
    } catch (error) {
        console.error('[Assets] Delete failed:', error);
        return { success: false };
    }
}

export async function getInsuranceStats() {
    try {
        const products = await prisma.product.findMany();
        const manualAssets = await (prisma as any).businessAsset.findMany();

        // Fetch expenses that are actually assets
        const expenses = await prisma.expense.findMany({
            include: { category: true }
        });

        const assetCategories = ['Equipment', 'Furniture', 'Fixture', 'Tech', 'Machinery'];
        const expenseAssets = expenses.filter(exp =>
            exp.category && assetCategories.some(cat => exp.category?.name.includes(cat))
        );

        const stockCost = products.reduce((sum: number, p: any) => sum + ((p.costPrice || 0) * p.stock), 0);

        const manualValue = manualAssets.reduce((sum: number, a: any) => sum + (a.value || 0), 0);
        const expenseValue = expenseAssets.reduce((sum: number, e: any) => sum + e.amount, 0);
        const assetsValue = manualValue + expenseValue;

        const equipmentValue = [
            ...manualAssets.filter((a: any) => a.type === 'Equipment' || a.type === 'Tech' || a.type === 'Machinery'),
            ...expenseAssets.filter((e: any) => e.category?.name.includes('Equipment') || e.category?.name.includes('Tech') || e.category?.name.includes('Machinery'))
        ].reduce((sum: number, item: any) => sum + (item.value || item.amount || 0), 0);

        const furnitureValue = [
            ...manualAssets.filter((a: any) => a.type === 'Furniture' || a.type === 'Fixture'),
            ...expenseAssets.filter((e: any) => e.category?.name.includes('Furniture') || e.category?.name.includes('Fixture'))
        ].reduce((sum: number, item: any) => sum + (item.value || item.amount || 0), 0);

        return {
            stockCost,
            assetsValue,
            equipmentValue,
            furnitureValue,
            totalContents: stockCost + assetsValue
        };
    } catch (error) {
        console.error('[Insurance] Stats failed:', error);
        return {
            stockCost: 0,
            assetsValue: 0,
            equipmentValue: 0,
            furnitureValue: 0,
            totalContents: 0
        };
    }
}
