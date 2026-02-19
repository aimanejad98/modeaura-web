"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStaffList() {
    try {
        const staff = await prisma.staff.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, role: true }
        });
        return JSON.parse(JSON.stringify(staff));
    } catch (error) {
        console.error('[POS] Staff fetch failed:', error);
        return [];
    }
}

export async function verifyAccess(staffId: string, password?: string) {
    try {
        const staff = await prisma.staff.findUnique({
            where: { id: staffId }
        });

        if (!staff) return { success: false, message: 'Staff not found' };

        // First try to verify PIN if it looks like a 4-digit PIN
        const bcrypt = require('bcryptjs');
        const staffRecord = staff as any;
        if (password && password.length === 4 && staffRecord.pin) {
            const isPinValid = await bcrypt.compare(password, staffRecord.pin);
            if (isPinValid) return { success: true };
        }

        if (!password || !staff.password) {
            return { success: false, message: 'Invalid password' };
        }

        // Use bcrypt to verify password against stored hash
        const isValid = await bcrypt.compare(password, staff.password);
        if (!isValid) {
            return { success: false, message: 'Invalid password' };
        }
        return { success: true };
    } catch (error) {
        console.error('[POS] Access verification failed:', error);
        return { success: false, message: 'Database error' };
    }
}

export async function getInventory() {
    try {
        console.log('📦 [POS] Fetching global inventory...');
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        console.log(`✅ [POS] Found ${products.length} products`);

        // Group by name and take the first one (representative variant)
        const uniqueProducts = [];
        const seenNames = new Set();

        for (const product of products) {
            if (!seenNames.has(product.name)) {
                seenNames.add(product.name);
                uniqueProducts.push(product);
            }
        }

        return JSON.parse(JSON.stringify(uniqueProducts));
    } catch (error) {
        console.error('[POS] Inventory fetch failed:', error);
        return [];
    }
}

export async function getProductBySku(sku: string) {
    try {
        // Find first product with this SKU (using findFirst as a safer alternative if findUnique is picky)
        const product = await prisma.product.findFirst({
            where: { sku } as any,
            include: { category: true }
        });
        return product ? JSON.parse(JSON.stringify(product)) : null;
    } catch (error) {
        console.error('[POS] SKU lookup failed:', error);
        return null;
    }
}

export async function getProductVariants(productName: string, categoryId: string) {
    try {
        // Find all products with the same name and category
        const variants = await prisma.product.findMany({
            where: {
                name: productName,
                categoryId: categoryId,
            },
            include: { category: true },
            orderBy: { size: 'asc' } as any // Cast to any to bypass potential out-of-sync Prisma type issues
        });
        return JSON.parse(JSON.stringify(variants));
    } catch (error) {
        console.error('[POS] Variants fetch failed:', error);
        return [];
    }
}
