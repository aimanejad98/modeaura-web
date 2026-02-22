"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureSizeExists } from "./sizes";

// Generate SKU based on category hierarchy
async function generateSku(categoryId: string): Promise<string> {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { parent: true }
    });

    if (!category) return `MA-XXX-${Date.now().toString().slice(-4)}`;

    let prefix = 'MA';
    if (category.parent) {
        prefix += `-${category.parent.code}-${category.code}`;
    } else {
        prefix += `-${category.code}`;
    }

    let counter = await prisma.skuCounter.findUnique({ where: { prefix } });
    if (!counter) {
        counter = await prisma.skuCounter.create({ data: { prefix, counter: 0 } });
    }

    const updated = await prisma.skuCounter.update({
        where: { prefix },
        data: { counter: counter.counter + 1 }
    });

    return `${prefix}-${updated.counter.toString().padStart(5, '0')}`;
}

export async function getProducts() {
    try {
        console.log('🧥 [Inventory] Fetching products...');
        const products = await prisma.product.findMany({
            include: { category: true, sale: true },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`✅ [Inventory] Found ${products.length} products`);

        // Ensure data is serializable for server components
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error('[Inventory] Fetch failed:', error);
        return [];
    }
}

export async function addProduct(data: {
    name: string;
    categoryId: string;
    price: number;
    costPrice?: number;
    stock: number;
    size?: string;
    color?: string;
    material?: string;
    images?: string;
    isNewArrival?: boolean;
    isKids?: boolean;
    discountPrice?: number;
    saleId?: string;
}) {
    try {
        // Diagnostic: Check if category exists to prevent FK violation from stale frontend IDs
        const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!categoryExists) {
            console.error(`[Inventory] Add failed: Category ID ${data.categoryId} not found in DB.`);
            throw new Error(`Category not found. Your dashboard may have stale data. Please refresh the page (F5) and try again.`);
        }

        // Auto-save size if provided
        if (data.size) {
            await ensureSizeExists(data.size);
        }

        const sku = await generateSku(data.categoryId);

        let product;
        try {
            // Attempt with all fields
            product = await (prisma.product as any).create({
                data: {
                    sku,
                    name: data.name,
                    categoryId: data.categoryId,
                    price: Number(data.price),
                    costPrice: Number(data.costPrice || 0),
                    stock: Number(data.stock),
                    size: data.size || null,
                    color: data.color || null,
                    material: data.material || null,
                    images: data.images || '',
                    isNewArrival: data.isNewArrival || false,
                    isKids: data.isKids || false,
                    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
                    saleId: data.saleId || null,
                }
            });
        } catch (firstError) {
            console.warn('[Inventory] Create with new fields failed, retrying with core fields...', firstError);
            // Fallback for when Prisma client is out of sync
            product = await (prisma.product as any).create({
                data: {
                    sku,
                    name: data.name,
                    categoryId: data.categoryId,
                    price: Number(data.price),
                    costPrice: Number(data.costPrice || 0),
                    stock: Number(data.stock),
                    size: data.size || null,
                    color: data.color || null,
                    material: data.material || null,
                    images: data.images || '',
                }
            });

            // Try raw updates for the new features if we have them but client is out of sync
            if (data.isNewArrival !== undefined || data.isKids !== undefined) {
                try {
                    const updates = [];
                    if (data.isNewArrival !== undefined) updates.push(`"isNewArrival" = ${data.isNewArrival ? 'true' : 'false'}`);
                    if (data.isKids !== undefined) updates.push(`"isKids" = ${data.isKids ? 'true' : 'false'}`);

                    if (updates.length > 0) {
                        await (prisma as any).$executeRawUnsafe(
                            `UPDATE "Product" SET ${updates.join(', ')} WHERE id = '${(product as any).id}'`
                        );
                    }
                } catch (rawError) {
                    console.error('[Inventory] Raw update for flags failed:', rawError);
                }
            }
        }

        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/pos');
        revalidatePath('/shop');
        return JSON.parse(JSON.stringify(product));
    } catch (error) {
        console.error('[Inventory] Create failed:', error);
        throw error;
    }
}

// Bulk import products from CSV data
export async function bulkImportProducts(products: Array<{
    name: string;
    categoryName: string;
    subcategoryName?: string;
    price: number;
    costPrice?: number;
    stock: number;
    size?: string;
    color?: string;
    material?: string;
    images?: string;
    isNewArrival?: boolean;
    isKids?: boolean;
}>) {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const product of products) {
        try {
            // Find category
            let category;
            if (product.subcategoryName) {
                // Find subcategory
                const parent = await prisma.category.findFirst({
                    where: { name: product.categoryName, parentId: null }
                });
                if (parent) {
                    category = await prisma.category.findFirst({
                        where: { name: product.subcategoryName, parentId: parent.id }
                    });
                }
            } else {
                // Find main category
                category = await prisma.category.findFirst({
                    where: { name: product.categoryName, parentId: null }
                });
            }

            if (!category) {
                results.failed++;
                results.errors.push(`Category not found: ${product.categoryName}${product.subcategoryName ? ' > ' + product.subcategoryName : ''}`);
                continue;
            }

            // Generate SKU and create product
            const sku = await generateSku(category.id);

            try {
                // Attempt with all fields
                const newProd = await (prisma.product as any).create({
                    data: {
                        sku,
                        name: product.name,
                        categoryId: category.id,
                        price: Number(product.price),
                        costPrice: Number(product.costPrice || 0),
                        stock: Number(product.stock),
                        size: product.size || null,
                        color: product.color || null,
                        material: product.material || null,
                        images: product.images || '',
                        isNewArrival: product.isNewArrival || false,
                        isKids: product.isKids || false,
                    }
                });
            } catch (innerError) {
                console.warn('[Inventory] Bulk create failed, using fallback for:', product.name);
                // Fallback for missing fields (old schema in Prisma client)
                const fallbackProd = await (prisma.product as any).create({
                    data: {
                        sku,
                        name: product.name,
                        categoryId: category.id,
                        price: Number(product.price),
                        costPrice: Number(product.costPrice || 0),
                        stock: Number(product.stock),
                        size: product.size || null,
                        color: product.color || null,
                        material: product.material || null,
                        images: product.images || '',
                    }
                });

                // Raw update for flags if needed
                if (product.isNewArrival !== undefined || product.isKids !== undefined) {
                    try {
                        const updates = [];
                        if (product.isNewArrival !== undefined) updates.push(`"isNewArrival" = ${product.isNewArrival ? 'true' : 'false'}`);
                        if (product.isKids !== undefined) updates.push(`"isKids" = ${product.isKids ? 'true' : 'false'}`);

                        if (updates.length > 0) {
                            await (prisma as any).$executeRawUnsafe(
                                `UPDATE "Product" SET ${updates.join(', ')} WHERE id = '${fallbackProd.id}'`
                            );
                        }
                    } catch (rawError) {
                        console.error('[Inventory] Bulk raw flag update failed:', rawError);
                    }
                }
            }

            results.success++;
        } catch (error: any) {
            results.failed++;
            results.errors.push(`${product.name}: ${error.message}`);
        }
    }

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/pos');
    return results;
}

export async function getCategories(type: 'Product' | 'Expense' = 'Product') {
    return await prisma.category.findMany({
        where: { type },
        include: { parent: true, children: true }
    });
}

// This part of getProductsByCategory was already modified but let's check the whole function
export async function getProductsByCategory(categoryName: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                category: {
                    name: categoryName
                }
            },
            include: {
                category: true,
                sale: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error('[Inventory] Fetch by category failed:', error);
        return [];
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        // Auto-save size if provided in update
        if (data.size) {
            await ensureSizeExists(data.size);
        }
        let product;
        try {
            // Attempt with all fields
            product = await (prisma.product as any).update({
                where: { id },
                data: {
                    ...data,
                    price: data.price !== undefined ? Number(data.price) : undefined,
                    costPrice: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
                    stock: data.stock !== undefined ? Number(data.stock) : undefined,
                    discountPrice: data.discountPrice !== undefined ? (data.discountPrice ? Number(data.discountPrice) : null) : undefined,
                    saleId: data.saleId !== undefined ? (data.saleId || null) : undefined,
                }
            });
        } catch (firstError) {
            console.warn('[Inventory] Update with new fields failed, retrying with core fields...', firstError);

            // Strip out potential new fields that might be causing client mismatch
            const { isNewArrival, isKids, featured, showOnWebsite, ...fallbackData } = data;

            product = await (prisma.product as any).update({
                where: { id },
                data: {
                    ...fallbackData,
                    price: data.price !== undefined ? Number(data.price) : undefined,
                    costPrice: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
                    stock: data.stock !== undefined ? Number(data.stock) : undefined,
                }
            });

            // Try raw updates for flags
            if (isNewArrival !== undefined || isKids !== undefined) {
                try {
                    const updates = [];
                    if (isNewArrival !== undefined) updates.push(`"isNewArrival" = ${isNewArrival ? 'true' : 'false'}`);
                    if (isKids !== undefined) updates.push(`"isKids" = ${isKids ? 'true' : 'false'}`);

                    if (updates.length > 0) {
                        await (prisma as any).$executeRawUnsafe(
                            `UPDATE "Product" SET ${updates.join(', ')} WHERE id = '${id}'`
                        );
                    }
                } catch (rawError) {
                    console.error('[Inventory] Raw update for flags failed:', rawError);
                }
            }
        }

        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/pos');
        revalidatePath('/cashier');
        revalidatePath('/shop');
        return JSON.parse(JSON.stringify(product));
    } catch (error) {
        console.error('[Inventory] Update failed:', error);
        throw error;
    }
}

export async function updateStock(id: string, newStock: number) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { stock: newStock }
        });
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/pos');
        revalidatePath('/cashier');
        return true;
    } catch (error) {
        console.error('[Inventory] Stock update failed:', error);
        return false;
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id }
        });
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/pos');
        revalidatePath('/cashier');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Delete failed:', error);
        return { success: false };
    }
}


export async function toggleGroupNewArrival(productName: string, isNewArrival: boolean) {
    try {
        await (prisma as any).$executeRawUnsafe(
            `UPDATE "Product" SET "isNewArrival" = ${isNewArrival ? 'true' : 'false'} WHERE name = '${productName}'`
        );
        revalidatePath('/dashboard/inventory');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Toggle new arrival failed:', error);
        return { success: false };
    }
}

export async function toggleGroupKids(productName: string, isKids: boolean) {
    try {
        await (prisma as any).$executeRawUnsafe(
            `UPDATE "Product" SET "isKids" = ${isKids ? 'true' : 'false'} WHERE name = '${productName}'`
        );
        revalidatePath('/dashboard/inventory');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Toggle kids failed:', error);
        return { success: false };
    }
}

export async function bulkDeleteProducts(ids: string[]) {
    try {
        await prisma.product.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/pos');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Bulk delete failed:', error);
        return { success: false };
    }
}

export async function bulkApplySale(ids: string[], saleId: string) {
    try {
        await prisma.product.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                saleId: saleId
            }
        });
        revalidatePath('/dashboard/inventory');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Bulk apply sale failed:', error);
        return { success: false };
    }
}

export async function bulkRemoveSale(ids: string[]) {
    try {
        await prisma.product.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                saleId: null
            }
        });
        revalidatePath('/dashboard/inventory');
        revalidatePath('/shop');
        return { success: true };
    } catch (error) {
        console.error('[Inventory] Bulk remove sale failed:', error);
        return { success: false };
    }
}
export async function getProductSku(productId: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { sku: true }
        });
        return product?.sku || null;
    } catch (error) {
        console.error('[Inventory] SKU lookup failed:', error);
        return null;
    }
}
