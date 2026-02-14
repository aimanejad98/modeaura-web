'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getThemes() {
    try {
        return await (prisma as any).theme.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('[Themes] Failed to fetch themes:', error)
        return []
    }
}

export async function getActiveTheme() {
    try {
        return await (prisma as any).theme.findFirst({
            where: { isActive: true }
        })
    } catch (error) {
        console.error('[Themes] Failed to fetch active theme:', error)
        return null
    }
}

export async function createTheme(data: any) {
    try {
        const theme = await (prisma as any).theme.create({
            data: {
                ...data,
                isActive: false
            }
        })
        revalidatePath('/dashboard/themes')
        return { success: true, theme }
    } catch (error: any) {
        console.error('[Themes] Failed to create theme:', error)
        return { success: false, error: error.message }
    }
}

export async function activateTheme(id: string) {
    try {
        // Deactivate all
        await (prisma as any).theme.updateMany({
            data: { isActive: false }
        })

        // If it's not 'standard', activate the target
        if (id !== 'standard') {
            await (prisma as any).theme.update({
                where: { id },
                data: { isActive: true }
            })
        }

        revalidatePath('/')
        revalidatePath('/dashboard/themes')
        return { success: true }
    } catch (error) {
        console.error('[Themes] Failed to activate theme:', error)
        return { success: false }
    }
}

export async function deleteTheme(id: string) {
    try {
        await (prisma as any).theme.delete({
            where: { id }
        })
        revalidatePath('/dashboard/themes')
        return { success: true }
    } catch (error) {
        console.error('[Themes] Failed to delete theme:', error)
        return { success: false }
    }
}

export async function seedThemes() {
    const curatedThemes = [
        {
            name: 'Ramadan Nights',
            primaryColor: '#FFD700',
            secondaryColor: '#1a1a2e',
            backgroundColor: '#0f0f1e',
            accentColor: '#9d4edd',
            announcement: '🌙 Ramadan Kareem • Blessed nights, peaceful moments • Late hours until 2 AM',
            auraColor: 'radial-gradient(circle at 50% 50%, rgba(157, 78, 221, 0.15) 0%, rgba(255, 215, 0, 0.08) 50%, transparent 100%)',
            fontFamily: 'var(--font-cormorant)',
            customCss: `
                body { background: linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 100%); }
                h1, h2 { color: #FFD700; text-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
                .nav-seasonal { background: rgba(15, 15, 30, 0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 215, 0, 0.2); }
            `
        },
        {
            name: 'Autumn Harvest',
            primaryColor: '#D35400',
            secondaryColor: '#3E2723',
            backgroundColor: '#FFF8E7',
            accentColor: '#8B4513',
            announcement: '🍂 Autumn Collection • Cozy layers, warm tones • 25% off fall favorites',
            auraColor: 'radial-gradient(circle at 70% 30%, rgba(211, 84, 0, 0.12) 0%, rgba(139, 69, 19, 0.08) 50%, transparent 100%)',
            fontFamily: 'var(--font-inter)',
            customCss: `
                body { background: linear-gradient(180deg, #FFF8E7 0%, #FFE4B5 100%); }
                .nav-seasonal { background: rgba(255, 248, 231, 0.95); backdrop-filter: blur(15px); border-bottom: 2px solid #D35400; }
                .primary-btn { background: linear-gradient(135deg, #D35400 0%, #8B4513 100%); box-shadow: 0 4px 20px rgba(211, 84, 0, 0.3); }
            `
        },
        {
            name: 'Spring Garden',
            primaryColor: '#FF69B4',
            secondaryColor: '#2E7D32',
            backgroundColor: '#FFFEF7',
            accentColor: '#87CEEB',
            announcement: '🌸 Spring Bloom • Fresh arrivals, new beginnings • Free shipping on orders $75+',
            auraColor: 'radial-gradient(circle at 40% 60%, rgba(255, 105, 180, 0.1) 0%, rgba(135, 206, 235, 0.08) 50%, transparent 100%)',
            fontFamily: 'var(--font-inter)',
            customCss: `
                body { background: linear-gradient(180deg, #FFFEF7 0%, #F0F8FF 100%); }
                .nav-seasonal { background: rgba(255, 254, 247, 0.95); backdrop-filter: blur(15px); border-bottom: 2px solid #FF69B4; }
                .primary-btn { background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%); box-shadow: 0 4px 20px rgba(255, 105, 180, 0.3); }
            `
        },
        {
            name: 'Eid Celebration',
            primaryColor: '#10B981',
            secondaryColor: '#064E3B',
            backgroundColor: '#FFFFFF',
            accentColor: '#FFD700',
            announcement: '✨ Eid Mubarak! • Celebrate in style • Exclusive gifts with purchase',
            auraColor: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)',
            fontFamily: 'var(--font-inter)',
            customCss: `
                body { background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%); }
                h1, h2 { color: #10B981; font-weight: 800; }
                .nav-seasonal { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-bottom: 2px solid #10B981; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1); }
                .primary-btn { background: linear-gradient(135deg, #10B981 0%, #FFD700 100%); color: white; font-weight: 900; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); }
            `
        }
    ]

    try {
        // Delete all existing themes to ensure fresh icons
        await (prisma as any).theme.deleteMany({})

        for (const themeData of curatedThemes) {
            // First attempt: Full Cinematic Seed
            try {
                await (prisma as any).theme.upsert({
                    where: { name: themeData.name },
                    update: themeData,
                    create: { ...themeData, isActive: false }
                })
            } catch (innerError) {
                // Second attempt: Safe Fallback (Basic fields only)
                console.warn('[Themes] Cinematic seed failed, falling back to basic fields:', themeData.name);
                const { auraColor, fontFamily, ...basicData } = themeData;
                await (prisma as any).theme.upsert({
                    where: { name: themeData.name },
                    update: basicData,
                    create: { ...basicData, isActive: false }
                })
            }
        }
        revalidatePath('/dashboard/themes')
        return { success: true }
    } catch (error: any) {
        console.error('[Themes] Seeding failed completely:', error)
        return { success: false, error: error.message }
    }
}
