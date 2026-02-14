'use server'

import prisma from '@/lib/db'

export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { products: [], staff: [], orders: [], customers: [] }

    const searchTerm = query.toLowerCase()

    try {
        // Search products
        const products = await prisma.product.findMany({
            where: {
                name: { contains: searchTerm }
            },
            take: 5,
            select: { id: true, name: true, sku: true, price: true }
        })

        // Search staff
        const staff = await prisma.staff.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { email: { contains: searchTerm } }
                ]
            },
            take: 5,
            select: { id: true, name: true, email: true, role: true }
        })

        // Search orders
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { orderId: { contains: searchTerm } },
                    { customer: { contains: searchTerm } }
                ]
            },
            take: 5,
            select: { id: true, orderId: true, customer: true, total: true, date: true }
        })

        // Search customers
        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { phone: { contains: searchTerm } },
                    { email: { contains: searchTerm } }
                ]
            },
            take: 5,
            select: { id: true, name: true, phone: true, email: true }
        })

        // Search categories
        const categories = await prisma.category.findMany({
            where: {
                name: { contains: searchTerm }
            },
            take: 5,
            select: { id: true, name: true, parentId: true }
        })

        return {
            products: JSON.parse(JSON.stringify(products)),
            staff: JSON.parse(JSON.stringify(staff)),
            orders: JSON.parse(JSON.stringify(orders)),
            customers: JSON.parse(JSON.stringify(customers)),
            categories: JSON.parse(JSON.stringify(categories))
        }
    } catch (error) {
        console.error('[Search] Failed:', error)
        return { products: [], staff: [], orders: [], customers: [], categories: [] }
    }
}
