"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function getStaff() {
    try {
        console.log('🤵 [Staff] Fetching staff members...');
        const staff = await prisma.staff.findMany({
            include: { shifts: true },
            orderBy: { name: 'asc' }
        });
        console.log(`✅ [Staff] Found ${staff.length} staff members`);
        return JSON.parse(JSON.stringify(staff));
    } catch (error: any) {
        console.error('[Staff] Fetch failed:', error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export async function addStaff(data: any) {
    try {
        // Hash password before storing
        if (data.password && !data.password.startsWith('$2')) {
            data.password = await hash(data.password, 12);
        }
        // Hash PIN before storing (ensure it's a 4-digit PIN)
        if (data.pin && data.pin.length === 4 && !isNaN(Number(data.pin))) {
            data.pin = await hash(data.pin, 12);
        }
        const staff = await prisma.staff.create({
            data: {
                ...data,
                hourlyRate: data.hourlyRate || 0,
            }
        });
        revalidatePath('/dashboard/staff');
        return JSON.parse(JSON.stringify(staff));
    } catch (error) {
        console.error('[Staff] Create failed:', error);
        throw error;
    }
}

export async function updateStaff(id: string, data: any) {
    try {
        // Hash password before storing (skip if already hashed or empty)
        if (data.password && !data.password.startsWith('$2')) {
            data.password = await hash(data.password, 12);
        } else if (!data.password) {
            // Don't overwrite password with empty string
            delete data.password;
        }

        // Hash PIN before storing (ensure it's a 4-digit PIN and not already hashed)
        if (data.pin && data.pin.length === 4 && !isNaN(Number(data.pin))) {
            data.pin = await hash(data.pin, 12);
        } else if (data.pin === '') {
            data.pin = null; // Clear PIN if empty
        } else if (data.pin && data.pin.startsWith('$2')) {
            // Already hashed, keep as is
        } else if (data.pin) {
            // Invalid PIN format but not empty, ignore or handle as needed
            delete data.pin;
        }

        const staff = await prisma.staff.update({
            where: { id },
            data
        });
        revalidatePath('/dashboard/staff');
        return JSON.parse(JSON.stringify(staff));
    } catch (error) {
        console.error('[Staff] Update failed:', error);
        throw error;
    }
}

export async function deleteStaff(id: string) {
    try {
        await prisma.staff.delete({
            where: { id }
        });
        revalidatePath('/dashboard/staff');
        return { success: true };
    } catch (error) {
        console.error('[Staff] Delete failed:', error);
        return { success: false };
    }
}

export async function clockIn(id: string) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        await prisma.staff.update({
            where: { id },
            data: { status: 'Clocked In' }
        });

        await prisma.shift.create({
            data: {
                staffId: id,
                date: dateStr,
                startTime: timeStr
            }
        });

        revalidatePath('/dashboard/staff');
        return { success: true };
    } catch (error) {
        console.error('[Staff] Clock in failed:', error);
        return { success: false };
    }
}

export async function clockOut(id: string) {
    try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Find the latest open shift for this staff
        const openShift = await prisma.shift.findFirst({
            where: { staffId: id, endTime: null },
            orderBy: { createdAt: 'desc' }
        });

        if (openShift) {
            // Calculate hours worked
            const start = new Date(`2000-01-01 ${openShift.startTime}`);
            const end = new Date(`2000-01-01 ${timeStr}`);
            const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

            await prisma.shift.update({
                where: { id: openShift.id },
                data: { endTime: timeStr, totalHours: Math.max(0, hoursWorked) }
            });
        }

        await prisma.staff.update({
            where: { id },
            data: { status: 'Clocked Out' }
        });

        revalidatePath('/dashboard/staff');
        return { success: true };
    } catch (error) {
        console.error('[Staff] Clock out failed:', error);
        return { success: false };
    }
}

