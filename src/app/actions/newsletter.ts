"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function subscribe(email: string) {
    try {
        // Basic security validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return { success: false, error: 'Please enter a valid email address.' };
        }
        // @ts-ignore - handled in case client is outdated
        const subscriber = await prisma.subscriber.create({
            data: { email }
        });
        revalidatePath('/dashboard/newsletter');
        return { success: true, subscriber: JSON.parse(JSON.stringify(subscriber)) };
    } catch (error) {
        console.error('[Newsletter] Subscribe failed:', error);
        // Special check for property existence to provide better error
        // @ts-ignore
        if (!prisma.subscriber) {
            return { success: false, error: 'Database update in progress. Please try again in 1 minute.' };
        }
        return { success: false, error: 'Email already subscribed' };
    }
}

export async function getSubscribers() {
    try {
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return JSON.parse(JSON.stringify(subscribers));
    } catch (error) {
        console.error('[Newsletter] Fetch failed:', error);
        return [];
    }
}

export async function deleteSubscriber(id: string) {
    try {
        await prisma.subscriber.delete({
            where: { id }
        });
        revalidatePath('/dashboard/newsletter');
        return { success: true };
    } catch (error) {
        console.error('[Newsletter] Delete failed:', error);
        return { success: false };
    }
}
