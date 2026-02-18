"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get all categories with hierarchy
export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: { type: 'Product' },
            include: {
                children: true,
                parent: true,
            },
            orderBy: { name: 'asc' }
        });
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        console.error('[Categories] Fetch failed:', error);
        return [];
    }
}

// Get main categories only (no parent)
export async function getMainCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: { type: 'Product', parentId: null },
            include: { children: true, sizes: true },
            orderBy: { name: 'asc' }
        });
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        console.error('[Categories] Fetch main failed:', error);
        return [];
    }
}

// Add category
export async function addCategory(data: {
    name: string;
    code: string;
    parentId?: string;
    fields?: string;
    image?: string;
    addToNav?: boolean;
}) {
    try {
        const categoryCode = data.code.toUpperCase().slice(0, 3);
        const category = await (prisma.category as any).create({
            data: {
                name: data.name,
                code: categoryCode,
                type: 'Product',
                ...(data.parentId && {
                    parent: {
                        connect: { id: data.parentId }
                    }
                }),
                fields: data.fields || 'size,color,material',
                // image field temporarily disabled until schema migration completes
                // image: data.image || null,
            }
        });

        // If addToNav is true, create a navigation item
        if (data.addToNav) {
            // Find max order to append to end
            const lastItem = await prisma.navItem.findFirst({
                orderBy: { order: 'desc' }
            });
            const newOrder = (lastItem?.order || 0) + 1;

            await prisma.navItem.create({
                data: {
                    label: data.name,
                    href: `/shop?category=${categoryCode}`,
                    order: newOrder,
                    active: true
                }
            });
        }

        // If this is a subcategory, create a matching Pattern for the parent category
        if (data.parentId) {
            await prisma.pattern.create({
                data: {
                    name: data.name,
                    categoryId: data.parentId
                }
            });
            revalidatePath('/dashboard/filters');
        }

        revalidatePath('/dashboard/categories');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/'); // Refresh homepage category grid
        revalidatePath('/shop'); // Refresh shop page
        return JSON.parse(JSON.stringify(category));
    } catch (error) {
        console.error('[Categories] Create failed:', error);
        throw error;
    }
}

// Update category
export async function updateCategory(id: string, data: { name?: string; code?: string; fields?: string; image?: string }) {
    try {
        const oldCategory = await prisma.category.findUnique({ where: { id } });

        const category = await (prisma.category as any).update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.code && { code: data.code.toUpperCase().slice(0, 3) }),
                ...(data.fields !== undefined && { fields: data.fields }),
                ...(data.image !== undefined && { image: data.image }),
            }
        });

        // If subcategory name changed, update matching Pattern
        if (data.name && oldCategory?.parentId) {
            await prisma.pattern.updateMany({
                where: {
                    name: oldCategory.name,
                    categoryId: oldCategory.parentId
                },
                data: { name: data.name }
            });
            revalidatePath('/dashboard/filters');
        }

        revalidatePath('/dashboard/categories');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/'); // Refresh homepage category grid
        revalidatePath('/shop'); // Refresh shop page
        return JSON.parse(JSON.stringify(category));
    } catch (error) {
        console.error('[Categories] Update failed:', error);
        throw error;
    }
}

// Delete category (only if no products)
export async function deleteCategory(id: string) {
    try {
        // Find category info first
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) return { success: false, message: 'Category not found' };

        // Check for products
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return { success: false, message: `Cannot delete: ${productCount} products in this category` };
        }

        // Check for subcategories
        const childCount = await prisma.category.count({ where: { parentId: id } });
        if (childCount > 0) {
            return { success: false, message: `Cannot delete: ${childCount} subcategories exist` };
        }

        // If it's a subcategory, delete matching pattern
        if (category.parentId) {
            await prisma.pattern.deleteMany({
                where: {
                    name: category.name,
                    categoryId: category.parentId
                }
            });
            revalidatePath('/dashboard/filters');
        }

        await prisma.category.delete({ where: { id } });
        revalidatePath('/dashboard/categories');
        return { success: true };
    } catch (error) {
        console.error('[Categories] Delete failed:', error);
        return { success: false, message: 'Delete failed' };
    }
}
