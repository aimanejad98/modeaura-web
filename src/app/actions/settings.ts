'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Get store settings
export async function getStoreSettings() {
    try {
        console.log('🌐 [Settings] Fetching store settings...');
        let settings = await prisma.storeSetting.findFirst();
        console.log(`✅ [Settings] Found settings: ${settings?.storeName || 'Default'}`);
        if (!settings) {
            // Create default settings
            settings = await prisma.storeSetting.create({
                data: {
                    storeName: 'Mode AURA',
                    tagline: 'Luxury Modest Fashion',
                    address: 'Windsor, ON, Canada',
                    phone: '',
                    email: 'modeaura1@gmail.com',
                    instagram: '',
                    facebook: '',
                    website: '',
                    taxRate: 13,
                    currency: 'CAD',
                }
            })
        }
        return JSON.parse(JSON.stringify(settings))
    } catch (error) {
        console.error('[Settings] Get failed:', error)
        return null
    }
}

// Update store settings
export async function updateStoreSettings(data: {
    storeName?: string
    tagline?: string
    address?: string
    phone?: string
    email?: string
    instagram?: string
    facebook?: string
    website?: string
    taxRate?: number
    currency?: string
    logo?: string
    favicon?: string
    announcement?: string
    seoTitle?: string
    seoDescription?: string
    ogImage?: string
    receiptNote?: string
}) {
    try {
        const existing = await prisma.storeSetting.findFirst()
        if (existing) {
            await prisma.storeSetting.update({
                where: { id: existing.id },
                data
            })
        } else {
            await prisma.storeSetting.create({ data })
        }
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error('[Settings] Update failed:', error)
        return { success: false }
    }
}

// Update staff password
export async function updateStaffPassword(staffId: string, currentPassword: string, newPassword: string) {
    try {
        const staff = await prisma.staff.findUnique({ where: { id: staffId } })
        if (!staff) {
            return { success: false, error: 'Staff not found' }
        }
        if (!staff.password) {
            return { success: false, error: 'No password set' }
        }

        // Use bcrypt to verify the current password against the stored hash
        const bcrypt = require('bcryptjs')
        const isValid = await bcrypt.compare(currentPassword, staff.password)
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' }
        }

        // Hash the new password before storing
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await prisma.staff.update({
            where: { id: staffId },
            data: { password: hashedPassword }
        })
        return { success: true }
    } catch (error) {
        console.error('[Settings] Password update failed:', error)
        return { success: false, error: 'Update failed' }
    }
}

// Update staff info
export async function updateStaffInfo(staffId: string, data: { name?: string; phone?: string }) {
    try {
        await prisma.staff.update({
            where: { id: staffId },
            data
        })
        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error) {
        console.error('[Settings] Info update failed:', error)
        return { success: false }
    }
    // Test Email Connection
    export async function testEmailConnection(email: string) {
        try {
            const { sendMailWithFallback } = await import('@/lib/mail');
            console.log(`[Settings] Testing email connection to ${email}...`);

            const result = await sendMailWithFallback({
                to: email,
                from: process.env.SMTP_USER,
                subject: 'Test Email from Dashboard Settings',
                text: 'This is a test email from your Mode Aura Dashboard. If you received this, your email configuration is working correctly!'
            }, "TEST EMAIL");

            return result;
        } catch (error: any) {
            console.error('[Settings] Test email failed:', error);
            return { success: false, error: error.message || String(error) };
        }
    }
