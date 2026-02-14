import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import db from './db';

const SESSION_COOKIE_NAME = 'modeaura_session';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // In a real app, you'd store this in a session table or JWT
    // For now, we'll store the user ID in a signed cookie (simplified for this demo)
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;

    const user = await db.customer.findUnique({
        where: { id: session },
        select: { id: true, name: true, email: true, role: true }
    });

    return user;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
