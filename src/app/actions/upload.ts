"use server";

import { uploadToGallery } from './media';

// Maintain compatibility with existing code while unifying storage
export async function uploadImage(formData: FormData): Promise<string> {
    const asset = await uploadToGallery(formData);
    return asset.url;
}

// Upload multiple images
export async function uploadImages(formData: FormData): Promise<string[]> {
    const urls: string[] = [];
    const files = formData.getAll('files') as File[];

    for (const file of files) {
        const singleFormData = new FormData();
        singleFormData.set('file', file);
        const url = await uploadImage(singleFormData);
        urls.push(url);
    }

    return urls;
}
