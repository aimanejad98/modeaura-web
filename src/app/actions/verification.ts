"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyEmail(token: string) {
    if (!token) return { error: "Missing verification token" };

    try {
        const user = await db.customer.findFirst({
            where: { verificationCode: token }
        });

        if (!user) {
            return { error: "Invalid or expired verification link" };
        }

        if (user.isVerified) {
            return { success: true, message: "Email already verified" };
        }

        await db.customer.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null // Clear token after success
            }
        });

        revalidatePath('/account');
        return { success: true, message: "Email verified successfully" };
    } catch (error) {
        console.error('[VerifyEmail] Error:', error);
        return { error: "An error occurred during verification" };
    }
}

export async function resendVerification(email: string) {
    if (!email) return { error: "Missing email" };

    try {
        const user = await db.customer.findUnique({
            where: { email }
        });

        if (!user) return { error: "Account not found" };
        if (user.isVerified) return { error: "Email already verified" };

        let token = user.verificationCode;
        if (!token) {
            token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await db.customer.update({
                where: { id: user.id },
                data: { verificationCode: token }
            });
        }

        const { sendVerificationLink } = await import('@/lib/mail');
        await sendVerificationLink(email, token);

        return { success: true };
    } catch (error) {
        console.error('[ResendVerify] Error:', error);
        return { error: "Failed to resend verification email" };
    }
}
