'use server';

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export async function updateProfile(data: {
    name: string;
    phone?: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        await prisma.customer.update({
            where: { id: user.id },
            data: {
                name: data.name,
                phone: data.phone || null,
            }
        });

        revalidatePath('/account');
        return { success: true };
    } catch (error) {
        console.error('[Profile] Update failed:', error);
        return { error: 'Failed to update profile' };
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const { verifyPassword, hashPassword } = await import('@/lib/auth');

        const customer = await prisma.customer.findUnique({ where: { id: user.id } });
        if (!customer?.password) return { error: 'Account has no password set' };

        const isValid = await verifyPassword(currentPassword, customer.password);
        if (!isValid) return { error: 'Current password is incorrect' };

        const hashedPassword = await hashPassword(newPassword);
        await prisma.customer.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('[Profile] Password change failed:', error);
        return { error: 'Failed to change password' };
    }
}

export async function updateAddress(data: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        await prisma.customer.update({
            where: { id: user.id },
            data: {
                address: data.address,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode,
            }
        });

        revalidatePath('/account');
        return { success: true };
    } catch (error) {
        console.error('[Profile] Address update failed:', error);
        return { error: 'Failed to update address' };
    }
}

export async function getProfile() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        const customer = await prisma.customer.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                address: true,
                city: true,
                province: true,
                postalCode: true,
                totalSpend: true,
                createdAt: true,
            }
        });

        return customer ? JSON.parse(JSON.stringify(customer)) : null;
    } catch (error) {
        console.error('[Profile] Fetch failed:', error);
        return null;
    }
}
