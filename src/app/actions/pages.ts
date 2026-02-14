"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPages() {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { lastModified: 'desc' }
        });
        return JSON.parse(JSON.stringify(pages));
    } catch (error) {
        console.error('[Pages] Fetch failed:', error);
        return [];
    }
}

export async function upsertPage(data: {
    id?: string;
    title: string;
    slug: string;
    content?: string;
    status?: string;
}) {
    try {
        const { id, ...rest } = data;

        let page;
        if (id) {
            page = await prisma.page.update({
                where: { id },
                data: rest
            });
        } else {
            page = await prisma.page.create({
                data: rest
            });
        }

        revalidatePath('/dashboard/website/pages');
        return { success: true, page: JSON.parse(JSON.stringify(page)) };
    } catch (error) {
        console.error('[Pages] Upsert failed:', error);
        return { success: false, error: 'Slug must be unique' };
    }
}

export async function deletePage(id: string) {
    try {
        await prisma.page.delete({
            where: { id }
        });
        revalidatePath('/dashboard/website/pages');
        return { success: true };
    } catch (error) {
        console.error('[Pages] Delete failed:', error);
        return { success: false };
    }
}
