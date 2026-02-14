"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getColors() {
    try {
        const colors = await (prisma as any).color.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        return JSON.parse(JSON.stringify(colors));
    } catch (error) {
        console.error('[Colors] Fetch failed:', error);
        return [];
    }
}

export async function addColor(name: string, hex?: string, categoryId?: string) {
    try {
        const color = await (prisma as any).color.create({
            data: {
                name,
                hex: hex || null,
                categoryId: categoryId || null
            }
        });
        revalidatePath('/dashboard/filters');
        revalidatePath('/shop');
        return JSON.parse(JSON.stringify(color));
    } catch (error) {
        console.error('[Colors] Create failed:', error);
        throw error;
    }
}

export async function updateColor(id: string, categoryId: string | null) {
    try {
        const color = await (prisma as any).color.update({
            where: { id },
            data: { categoryId }
        });
        revalidatePath('/dashboard/filters');
        revalidatePath('/shop');
        return JSON.parse(JSON.stringify(color));
    } catch (error) {
        console.error('[Colors] Update failed:', error);
        throw error;
    }
}

export async function deleteColor(id: string) {
    try {
        await (prisma as any).color.delete({
            where: { id }
        });
        revalidatePath('/dashboard/filters');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Colors] Delete failed:', error);
        return { success: false, message: 'Delete failed' };
    }
}
