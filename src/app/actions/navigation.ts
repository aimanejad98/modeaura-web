'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNavItems() {
    try {
        const items = await prisma.navItem.findMany({
            where: { parentId: null },
            include: {
                children: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });
        return items;
    } catch (error) {
        console.error('Failed to get nav items:', error);
        return [];
    }
}

export async function getAllNavItems() {
    try {
        const items = await prisma.navItem.findMany({
            orderBy: { order: 'asc' }
        });
        return items;
    } catch (error) {
        console.error('Failed to get all nav items:', error);
        return [];
    }
}

export async function addNavItem(data: { label: string; href: string; parentId?: string; order?: number }) {
    try {
        const item = await prisma.navItem.create({
            data: {
                label: data.label,
                href: data.href,
                parentId: data.parentId || null,
                order: data.order || 0,
            }
        });
        revalidatePath('/');
        return item;
    } catch (error) {
        console.error('Failed to add nav item:', error);
        throw error;
    }
}

export async function updateNavItem(id: string, data: { label: string; href: string; parentId?: string; order?: number; active?: boolean }) {
    try {
        const item = await prisma.navItem.update({
            where: { id },
            data: {
                label: data.label,
                href: data.href,
                parentId: data.parentId || null,
                order: data.order || 0,
                active: data.active
            }
        });
        revalidatePath('/');
        return item;
    } catch (error) {
        console.error('Failed to update nav item:', error);
        throw error;
    }
}

export async function deleteNavItem(id: string) {
    try {
        // Find if it has children and delete them first or handle gracefully
        await prisma.navItem.deleteMany({
            where: { parentId: id }
        });
        await prisma.navItem.delete({
            where: { id }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete nav item:', error);
        throw error;
    }
}
