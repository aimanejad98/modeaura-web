'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getBanners() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: 'asc' }
        })
        return JSON.parse(JSON.stringify(banners))
    } catch (error) {
        console.error('[Banners] Fetch failed:', error)
        return []
    }
}

export async function addBanner(data: {
    title: string
    subtitle?: string
    image: string
    link?: string
    textColor?: string
    subtitleColor?: string
    designLayout?: string
    order?: number
    active?: boolean
}) {
    try {
        const banner = await prisma.banner.create({ data: data as any })
        try { revalidatePath('/dashboard/website/banners'); revalidatePath('/'); } catch (e) { }
        return JSON.parse(JSON.stringify(banner))
    } catch (error) {
        console.error('[Banners] Create failed:', error)
        throw error
    }
}

export async function updateBanner(id: string, data: {
    title?: string
    subtitle?: string
    image?: string
    link?: string
    textColor?: string
    subtitleColor?: string
    designLayout?: string
    order?: number
    active?: boolean
}) {
    try {
        await prisma.banner.update({
            where: { id },
            data
        })
        try { revalidatePath('/dashboard/website/banners'); revalidatePath('/'); } catch (e) { }
        return { success: true }
    } catch (error) {
        console.error('[Banners] Update failed:', error)
        return { success: false }
    }
}

export async function deleteBanner(id: string) {
    try {
        await prisma.banner.delete({
            where: { id }
        })
        try { revalidatePath('/dashboard/website/banners'); revalidatePath('/'); } catch (e) { }
        return { success: true }
    } catch (error) {
        console.error('[Banners] Delete failed:', error)
        return { success: false }
    }
}
