"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' }
        });
        return JSON.parse(JSON.stringify(customers));
    } catch (error) {
        console.error('[Customers] Fetch failed:', error);
        return [];
    }
}

export async function addCustomer(data: {
    name: string;
    phone?: string;
    email?: string;
    tags?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    password?: string | null;
}) {
    try {
        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                email: data.email || `pos_${Date.now()}@gmail.com`,
                phone: data.phone,
                tags: data.tags,
                address: data.address,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode,
                isVerified: true,
                password: null as any
            }
        });
        revalidatePath('/dashboard/customers');
        return JSON.parse(JSON.stringify(customer));
    } catch (error) {
        console.error('[Customers] Create failed:', error);
        throw error;
    }
}

export async function toggleVerifyCustomer(customerId: string, status: boolean) {
    try {
        await prisma.customer.update({
            where: { id: customerId },
            data: { isVerified: status }
        });
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (error) {
        console.error('[Customers] Toggle verification failed:', error);
        return { error: 'Failed to update verification status' };
    }
}

export async function resetCustomerPassword(customerId: string, newPassword: string) {
    try {
        const { hashPassword } = await import('@/lib/auth');
        const hashedPassword = await hashPassword(newPassword);

        await prisma.customer.update({
            where: { id: customerId },
            data: { password: hashedPassword }
        });

        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (error) {
        console.error('[Customers] Password reset failed:', error);
        return { error: 'Failed to reset password' };
    }
}

export async function updateCustomer(id: string, data: {
    name: string;
    email?: string;
    phone?: string;
    tags?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
}) {
    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                tags: data.tags,
                address: data.address,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode
            }
        });
        revalidatePath('/dashboard/customers');
        return JSON.parse(JSON.stringify(customer));
    } catch (error) {
        console.error('[Customers] Update failed:', error);
        throw error;
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({
            where: { id }
        });
        revalidatePath('/dashboard/customers');
        return { success: true };
    } catch (error) {
        console.error('[Customers] Delete failed:', error);
        throw error;
    }
}
