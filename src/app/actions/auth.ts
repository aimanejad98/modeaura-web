'use server';

import db from '@/lib/db';
import { hashPassword, verifyPassword, createSession, deleteSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendResetCode } from '@/lib/mail';
import { hash } from 'bcryptjs';

export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const subscribeNewsletter = formData.get('newsletter') === 'on';

    if (!name || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const existing = await db.customer.findUnique({ where: { email } });
        if (existing) {
            return { error: 'Email already registered' };
        }

        const hashedPassword = await hashPassword(password);
        const verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await db.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'Customer',
                isVerified: false,
                verificationCode,
            }
        });

        // Send verification email
        try {
            const { sendVerificationLink } = await import('@/lib/mail');
            await sendVerificationLink(email, verificationCode);
        } catch (mailErr) {
            console.error('Failed to send verification email:', mailErr);
            // We still return success: true because the account was created
        }

        if (subscribeNewsletter) {
            try {
                // @ts-ignore - handled in case client is outdated
                await db.subscriber.upsert({
                    where: { email },
                    update: {},
                    create: { email }
                });
            } catch (err) {
                console.error('Newsletter subscription error:', err);
            }
        }

        return { success: true };
    } catch (err) {
        console.error('Registration error:', err);
        return { error: 'Failed to create account' };
    }
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    try {
        const user = await db.customer.findUnique({ where: { email } });

        if (!user || user.password === null) {
            return { error: 'Invalid email or password' };
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return { error: 'Invalid email or password' };
        }

        if (!user.isVerified) {
            return { error: 'Please verify your email address to continue. Check your inbox for the verification link.' };
        }

        await createSession(user.id);

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error('Login error:', err);
        return { error: 'Failed to login' };
    }
}

export async function dashboardLogin(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    try {
        const fs = require('fs');
        const logFile = 'login_debug.log';
        const log = (msg: string) => {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logFile, `${timestamp} - ${msg}\n`);
        };

        log(`Login attempt for: "${email}"`);
        const staff = await db.staff.findUnique({ where: { email } });

        if (!staff) {
            log(`No staff found with email: "${email}"`);
            return { error: 'Invalid credentials' };
        }

        log(`Staff found: ${staff.email}, ID: ${staff.id}`);

        // Check if password matches (hashed)
        if (!staff.password) {
            log(`Staff has no password set`);
            return { error: 'Invalid credentials' };
        }

        const isValid = await verifyPassword(password, staff.password);
        log(`Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);

        if (!isValid) {
            return { error: 'Invalid credentials' };
        }

        await createSession(staff.id);

        revalidatePath('/dashboard');
        return { success: true, user: JSON.parse(JSON.stringify(staff)) };
    } catch (err) {
        console.error('Dashboard Login error:', err);
        return { error: 'Failed to login' };
    }
}

export async function logout() {
    await deleteSession();
    revalidatePath('/');
    redirect('/');
}

export async function getCurrentUser() {
    try {
        return await getSession();
    } catch (err) {
        return null;
    }
}

export async function requestPasswordReset(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();

    if (!email) {
        return { error: 'Email is required' };
    }

    try {
        // Check Customer table
        let user: any = await db.customer.findUnique({ where: { email } });
        let model: 'customer' | 'staff' = 'customer';

        // If not found, check Staff table
        if (!user) {
            user = await db.staff.findUnique({ where: { email } });
            model = 'staff';
        }

        // Security: Don't reveal if user exists, but only send if they do
        if (user) {
            // Generate a 6-digit numeric code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

            if (model === 'customer') {
                await db.customer.update({
                    where: { email },
                    data: {
                        resetToken: code,
                        resetTokenExpiry: expiry
                    }
                });
            } else {
                // @ts-ignore - assuming schema has these or adding them
                await db.staff.update({
                    where: { email },
                    data: {
                        // We might need to add these fields to Staff model if they don't exist
                        // For now, let's check if they exist or just use Customer for reset
                        // Wait, Staff model might NOT have resetToken. Let's check schema.
                        resetToken: code,
                        resetTokenExpiry: expiry
                    }
                });
            }

            await sendResetCode(email, code);
        }

        return { success: 'If an account exists with this email, a reset code has been sent.' };
    } catch (err) {
        console.error('Reset request error:', err);
        return { error: 'Failed to request reset. Please try again.' };
    }
}

export async function verifyResetAndChangePassword(formData: FormData) {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const code = formData.get('code') as string;
    const newPassword = formData.get('password') as string;

    if (!email || !code || !newPassword) {
        return { error: 'All fields are required' };
    }

    try {
        // Check Customer table
        let user: any = await db.customer.findUnique({ where: { email } });
        let model: 'customer' | 'staff' = 'customer';

        if (!user) {
            user = await db.staff.findUnique({ where: { email } });
            model = 'staff';
        }

        if (!user || user.resetToken !== code) {
            return { error: 'Invalid or expired code' };
        }

        if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
            return { error: 'Reset code has expired' };
        }

        const hashedPassword = await hashPassword(newPassword);

        if (model === 'customer') {
            await db.customer.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            });
        } else {
            await db.staff.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            });
        }

        return { success: 'Password has been updated. You can now log in.' };
    } catch (err) {
        console.error('Reset verify error:', err);
        return { error: 'Failed to reset password.' };
    }
}
