'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getDiscountCodes() {
    try {
        const codes = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return JSON.parse(JSON.stringify(codes))
    } catch (error) {
        console.error('[Discounts] Get failed:', error)
        return []
    }
}

export async function createDiscountCode(data: {
    code: string
    type: 'Percentage' | 'Fixed'
    value: number
    minOrderAmount?: number
    maxUses?: number
    expiresAt?: string
}) {
    try {
        const code = await prisma.discountCode.create({
            data: {
                ...data,
                code: data.code.toUpperCase(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                minOrderAmount: data.minOrderAmount || 0
            }
        })
        revalidatePath('/dashboard/discounts')
        return { success: true, code }
    } catch (error: any) {
        console.error('[Discounts] Create failed:', error)
        // If it's a Prisma error, we might be able to give a better message
        if (error.code === 'P2002') {
            return { success: false, error: 'A discount code with this name already exists.' }
        }
        return { success: false, error: `Failed to create discount code: ${error.message || 'Unknown error. Check server logs.'}` }
    }
}

export async function toggleDiscountCode(id: string, active: boolean) {
    try {
        await prisma.discountCode.update({
            where: { id },
            data: { active }
        })
        revalidatePath('/dashboard/discounts')
        return { success: true }
    } catch (error) {
        console.error('[Discounts] Toggle failed:', error)
        return { success: false }
    }
}

export async function deleteDiscountCode(id: string) {
    try {
        await prisma.discountCode.delete({
            where: { id }
        })
        revalidatePath('/dashboard/discounts')
        return { success: true }
    } catch (error) {
        console.error('[Discounts] Delete failed:', error)
        return { success: false }
    }
}

export async function validateDiscountCode(codeText: string, cartTotal: number) {
    try {
        const code = await prisma.discountCode.findUnique({
            where: { code: codeText.toUpperCase() }
        })

        if (!code) return { success: false, error: 'Invalid discount code' }
        if (!code.active) return { success: false, error: 'This code is no longer active' }

        if (code.expiresAt && new Date() > new Date(code.expiresAt)) {
            return { success: false, error: 'This code has expired' }
        }

        if (code.maxUses && code.uses >= code.maxUses) {
            return { success: false, error: 'This code has reached its usage limit' }
        }

        if (cartTotal < code.minOrderAmount) {
            return { success: false, error: `Minimum order amount of $${code.minOrderAmount} required` }
        }

        let discountAmount = 0
        if (code.type === 'Percentage') {
            discountAmount = (cartTotal * code.value) / 100
        } else {
            discountAmount = code.value
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal)

        return {
            success: true,
            discount: {
                code: code.code,
                type: code.type as 'Percentage' | 'Fixed',
                value: code.value,
                amount: discountAmount
            }
        }
    } catch (error) {
        console.error('[Discounts] Validation failed:', error)
        return { success: false, error: 'Failed to validate code' }
    }
}

export async function incrementDiscountUses(codeText: string) {
    try {
        await prisma.discountCode.update({
            where: { code: codeText.toUpperCase() },
            data: { uses: { increment: 1 } }
        })
        return { success: true }
    } catch (error) {
        console.error('[Discounts] Increment failed:', error)
        return { success: false }
    }
}
