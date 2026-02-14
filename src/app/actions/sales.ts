'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSales() {
    try {
        const sales = await prisma.sale.findMany({
            orderBy: { name: 'desc' },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return JSON.parse(JSON.stringify(sales))
    } catch (error) {
        console.error('[Sales] Fetch failed:', error)
        return []
    }
}

export async function addSale(name: string, type: string, value: number, startDate: string, endDate: string, description?: string) {
    try {
        const sale = await prisma.sale.create({
            data: {
                name,
                type,
                value,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                active: true
            }
        })
        revalidatePath('/dashboard/sales')
        return JSON.parse(JSON.stringify(sale))
    } catch (error) {
        console.error('[Sales] Create failed:', error)
        throw error
    }
}

export async function updateSale(id: string, data: { name?: string, type?: string, value?: number, startDate?: string, endDate?: string, active?: boolean, description?: string }) {
    try {
        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.type !== undefined) updateData.type = data.type
        if (data.value !== undefined) updateData.value = data.value
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
        if (data.active !== undefined) updateData.active = data.active
        if (data.description !== undefined) updateData.description = data.description

        const sale = await prisma.sale.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/dashboard/sales')
        return JSON.parse(JSON.stringify(sale))
    } catch (error) {
        console.error('[Sales] Update failed:', error)
        throw error
    }
}

export async function deleteSale(id: string) {
    try {
        // First, remove sale reference from all products
        await prisma.product.updateMany({
            where: { saleId: id },
            data: { saleId: null }
        })

        // Then delete the sale
        await prisma.sale.delete({
            where: { id }
        })
        revalidatePath('/dashboard/sales')
    } catch (error) {
        console.error('[Sales] Delete failed:', error)
        throw error
    }
}
