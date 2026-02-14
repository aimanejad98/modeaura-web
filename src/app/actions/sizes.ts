"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSizes(categoryId?: string) {
    try {
        const where = categoryId ? { categoryId } : {}
        const sizes = await (prisma as any).size.findMany({
            where,
            orderBy: { name: 'asc' }
        })
        return JSON.parse(JSON.stringify(sizes))
    } catch (error) {
        console.error('[Sizes] Fetch failed:', error)
        return []
    }
}

export async function addSize(name: string, categoryId?: string) {
    try {
        const size = await (prisma as any).size.create({
            data: {
                name,
                categoryId: categoryId || null
            }
        })
        revalidatePath('/dashboard/filters')
        return JSON.parse(JSON.stringify(size))
    } catch (error) {
        console.error('[Sizes] Create failed:', error)
        throw error
    }
}

export async function deleteSize(id: string) {
    try {
        await (prisma as any).size.delete({
            where: { id }
        })
        revalidatePath('/dashboard/filters')
        return { success: true }
    } catch (error) {
        console.error('[Sizes] Delete failed:', error)
        return { success: false }
    }
}

// Auto-create size if it doesn't exist (called when adding products)
export async function ensureSizeExists(sizeName: string, categoryId?: string) {
    if (!sizeName) return null

    try {
        // Check if size exists for this specific category (or uncategorized)
        const existing = await (prisma as any).size.findFirst({
            where: {
                name: sizeName,
                categoryId: categoryId || null
            }
        })

        if (existing) return existing

        // Create new size linked to category
        const size = await (prisma as any).size.create({
            data: {
                name: sizeName,
                categoryId: categoryId || null
            }
        })
        revalidatePath('/dashboard/filters')
        return JSON.parse(JSON.stringify(size))
    } catch (error) {
        console.error('[Sizes] Ensure exists failed:', error)
        return null
    }
}
