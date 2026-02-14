"use server";

import db from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendResetCode } from "@/lib/mail";

export async function forgotPassword(email: string) {
    if (!email) return { error: "Email is required" };

    try {
        const customer = await db.customer.findUnique({
            where: { email }
        });

        if (!customer) {
            // Secret safety: don't reveal if email exists, but we'll return success anyway 
            return { success: true };
        }

        // Generate a 6-digit numeric code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.customer.update({
            where: { id: customer.id },
            data: {
                resetToken: code,
                resetTokenExpiry: expiry
            }
        });

        await sendResetCode(email, code);

        return { success: true };
    } catch (error) {
        console.error('[ForgotPwd] Error:', error);
        return { error: "An unexpected error occurred" };
    }
}

export async function resetPassword(email: string, code: string, newPassword: string) {
    if (!email || !code || !newPassword) return { error: "Missing required fields" };

    try {
        const customer = await db.customer.findUnique({
            where: { email }
        });

        if (!customer || !customer.resetToken || !customer.resetTokenExpiry) {
            return { error: "Invalid or expired recovery session" };
        }

        if (customer.resetToken !== code) {
            return { error: "Invalid recovery code" };
        }

        if (new Date() > new Date(customer.resetTokenExpiry)) {
            return { error: "Recovery code has expired" };
        }

        const hashedPassword = await hashPassword(newPassword);

        await db.customer.update({
            where: { id: customer.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return { success: true };
    } catch (error) {
        console.error('[ResetPwd] Error:', error);
        return { error: "Failed to update security credentials" };
    }
}
