'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');
const THUMB_DIR = path.join(UPLOAD_DIR, 'thumbs');

async function ensureDirs() {
    try { await fs.access(UPLOAD_DIR); } catch { await fs.mkdir(UPLOAD_DIR, { recursive: true }); }
    try { await fs.access(THUMB_DIR); } catch { await fs.mkdir(THUMB_DIR, { recursive: true }); }
}

export async function getMediaAssets() {
    try {
        const assets = await (prisma as any).mediaAsset.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return JSON.parse(JSON.stringify(assets));
    } catch (error) {
        console.error('[Media] Fetch failed:', error);
        return [];
    }
}

export async function uploadToGallery(formData: FormData) {
    try {
        await ensureDirs();
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = path.extname(file.name);
        const baseName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const uniqueName = `${baseName}${ext}`;
        const thumbName = `${baseName}-thumb.webp`;

        const filePath = path.join(UPLOAD_DIR, uniqueName);
        const thumbPath = path.join(THUMB_DIR, thumbName);

        // Save original
        await fs.writeFile(filePath, buffer);

        // Recommended Step: Image Optimization / Thumbnail Generation
        // We create a smaller, lightweight WebP thumbnail for the Gallery view
        try {
            await sharp(buffer)
                .resize(400, 400, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(thumbPath);
        } catch (sharpError) {
            console.warn('[Media] Thumb generation failed, falling back to original:', sharpError);
        }

        const asset = await (prisma as any).mediaAsset.create({
            data: {
                url: `/uploads/gallery/${uniqueName}`,
                // We'll use the thumb in the dashboard to save memory
                // But keep the original URL available for products
                filename: file.name,
                type: file.type || 'image',
                size: file.size
            }
        });

        revalidatePath('/dashboard/gallery');
        return JSON.parse(JSON.stringify(asset));
    } catch (error) {
        console.error('[Media] Upload failed:', error);
        throw error;
    }
}

export async function deleteFromGallery(id: string) {
    try {
        const asset = await (prisma as any).mediaAsset.findUnique({ where: { id } });
        if (!asset) throw new Error('Asset not found');

        const fileName = path.basename(asset.url);
        const baseName = fileName.split('.')[0];

        const filePath = path.join(process.cwd(), 'public', asset.url);
        const thumbPath = path.join(THUMB_DIR, `${baseName}-thumb.webp`);

        // Delete original and thumb
        await fs.unlink(filePath).catch(() => { });
        await fs.unlink(thumbPath).catch(() => { });

        await (prisma as any).mediaAsset.delete({ where: { id } });

        revalidatePath('/dashboard/gallery');
        return { success: true };
    } catch (error) {
        console.error('[Media] Delete failed:', error);
        return { success: false };
    }
}
