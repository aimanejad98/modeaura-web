"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMaterials() {
    try {
        const materials = await prisma.material.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        return JSON.parse(JSON.stringify(materials));
    } catch (error) {
        console.error('[Materials] Fetch failed:', error);
        return [];
    }
}

export async function addMaterial(name: string, categoryId?: string) {
    try {
        const material = await prisma.material.create({
            data: {
                name,
                categoryId: categoryId || null
            }
        });
        revalidatePath('/dashboard/filters');
        revalidatePath('/shop');
        return JSON.parse(JSON.stringify(material));
    } catch (error) {
        console.error('[Materials] Create failed:', error);
        throw error;
    }
}

export async function deleteMaterial(id: string) {
    try {
        await prisma.material.delete({
            where: { id }
        });
        revalidatePath('/dashboard/filters');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Materials] Delete failed:', error);
        return { success: false, message: 'Delete failed' };
    }
}
