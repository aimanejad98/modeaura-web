'use server'

import prisma from '@/lib/db'

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
    return await prisma.pattern.create({
        data: { name, categoryId }
    })
}

export async function deletePattern(id: string) {
    return await prisma.pattern.delete({
        where: { id }
    })
}
