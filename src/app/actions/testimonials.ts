'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTestimonials() {
    try {
        // @ts-ignore
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return JSON.parse(JSON.stringify(testimonials))
    } catch (error) {
        console.error('[Testimonials] Fetch failed:', error)
        return []
    }
}

export async function getActiveTestimonials() {
    try {
        // @ts-ignore
        const testimonials = await prisma.testimonial.findMany({
            where: { showOnHome: true },
            orderBy: { createdAt: 'desc' }
        })
        return JSON.parse(JSON.stringify(testimonials))
    } catch (error) {
        console.error('[Testimonials] Fetch active failed:', error)
        return []
    }
}

export async function getPendingTestimonials() {
    try {
        // @ts-ignore
        const testimonials = await prisma.testimonial.findMany({
            where: { isVerified: false },
            orderBy: { createdAt: 'desc' }
        })
        return JSON.parse(JSON.stringify(testimonials))
    } catch (error) {
        console.error('[Testimonials] Fetch pending failed:', error)
        return []
    }
}

export async function addTestimonial(data: {
    name: string
    content: string
    email?: string
    title?: string
    location?: string
    rating?: number
    showOnHome?: boolean
    isVerified?: boolean
}) {
    try {
        let testimonial;
        try {
            // @ts-ignore
            testimonial = await prisma.testimonial.create({
                data: {
                    name: data.name,
                    content: data.content,
                    email: data.email || null,
                    title: data.title || null,
                    location: data.location || 'Verified Client',
                    rating: data.rating || 5,
                    showOnHome: data.showOnHome || false,
                    isVerified: data.isVerified || false
                }
            })
        } catch (e) {
            console.warn('[Testimonials] Prisma create failed, falling back to raw SQL')
            const name = data.name.replace(/'/g, "''");
            const content = data.content.replace(/'/g, "''");
            const email = data.email ? `'${data.email.replace(/'/g, "''")}'` : 'NULL';
            const title = data.title ? `'${data.title.replace(/'/g, "''")}'` : 'NULL';
            const location = (data.location || 'Verified Client').replace(/'/g, "''");
            const rating = data.rating || 5;
            const showOnHome = data.showOnHome ? 1 : 0;
            const isVerified = data.isVerified ? 1 : 0;
            const id = `test_${Date.now()}`;

            await prisma.$executeRawUnsafe(
                `INSERT INTO "Testimonial" (id, name, email, title, content, location, rating, "showOnHome", "isVerified", "createdAt") 
                 VALUES ('${id}', '${name}', ${email}, ${title}, '${content}', '${location}', ${rating}, ${showOnHome}, ${isVerified}, CURRENT_TIMESTAMP)`
            );
            testimonial = { id, ...data };
        }

        revalidatePath('/dashboard/testimonials')
        revalidatePath('/')
        return { success: true, testimonial }
    } catch (error) {
        console.error('[Testimonials] Create failed:', error)
        return { success: false, error: 'Failed to add testimonial' }
    }
}

export async function toggleTestimonialHome(id: string, status: boolean) {
    try {
        try {
            // @ts-ignore
            await prisma.testimonial.update({
                where: { id },
                data: { showOnHome: status }
            })
        } catch (e) {
            await prisma.$executeRawUnsafe(
                `UPDATE "Testimonial" SET "showOnHome" = ${status ? 1 : 0} WHERE id = '${id}'`
            );
        }
        revalidatePath('/dashboard/testimonials')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('[Testimonials] Toggle failed:', error)
        return { error: 'Failed to update visibility' }
    }
}

export async function verifyTestimonial(id: string) {
    try {
        try {
            // @ts-ignore
            await prisma.testimonial.update({
                where: { id },
                data: { isVerified: true }
            })
        } catch (e) {
            await prisma.$executeRawUnsafe(
                `UPDATE "Testimonial" SET "isVerified" = 1 WHERE id = '${id}'`
            );
        }
        revalidatePath('/dashboard/testimonials')
        return { success: true }
    } catch (error) {
        console.error('[Testimonials] Verify failed:', error)
        return { error: 'Failed to verify' }
    }
}

export async function deleteTestimonial(id: string) {
    try {
        try {
            // @ts-ignore
            await prisma.testimonial.delete({ where: { id } })
        } catch (e) {
            await prisma.$executeRawUnsafe(`DELETE FROM "Testimonial" WHERE id = '${id}'`);
        }

        revalidatePath('/dashboard/testimonials')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('[Testimonials] Delete failed:', error)
        return { error: 'Failed to delete' }
    }
}
