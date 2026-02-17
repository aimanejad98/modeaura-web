'use server'

import prisma from '@/lib/db'

import { revalidatePath } from 'next/cache'

export async function getPatterns() {
    return await prisma.pattern.findMany({
        include: { category: true },
        orderBy: { name: 'asc' }
    })
}

export async function getPatternsByCategory(categoryId: string) {
    return await prisma.pattern.findMany({
        where: { categoryId },
        orderBy: { name: 'asc' }
    })
}

export async function addPattern(name: string, categoryId: string) {
    // 1. Create the pattern
    const pattern = await prisma.pattern.create({
        data: { name, categoryId }
    })

    // 2. Check if a subcategory with this name already exists under this category
    const existingSub = await prisma.category.findFirst({
        where: { name, parentId: categoryId }
    })

    if (!existingSub) {
        // 3. Create a matching subcategory
        // Generate a 3-letter code from the name
        const code = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'SUB'

        await (prisma.category as any).create({
            data: {
                name,
                code,
                parentId: categoryId,
                type: 'Product',
                fields: 'size,color,material'
            }
        })
        revalidatePath('/dashboard/categories')
    }

    revalidatePath('/dashboard/filters')
    return JSON.parse(JSON.stringify(pattern))
}

export async function deletePattern(id: string) {
    try {
        const pattern = await prisma.pattern.findUnique({ where: { id } })
        if (pattern) {
            // Check if subcategory has products before deleting matching subcategory
            const subCat = await prisma.category.findFirst({
                where: { name: pattern.name, parentId: pattern.categoryId }
            })

            if (subCat) {
                const productCount = await prisma.product.count({ where: { categoryId: subCat.id } })
                if (productCount === 0) {
                    await prisma.category.delete({ where: { id: subCat.id } })
                    revalidatePath('/dashboard/categories')
                } else {
                    console.warn(`[Patterns] Could not delete matching subcategory ${subCat.name}: Has products`)
                }
            }
        }

        const result = await prisma.pattern.delete({
            where: { id }
        })
        revalidatePath('/dashboard/filters')
        return JSON.parse(JSON.stringify(result))
    } catch (error) {
        console.error('[Patterns] Delete failed:', error)
        throw error;
    }
}
