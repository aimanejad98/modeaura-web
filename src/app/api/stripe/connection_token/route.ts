import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
    try {
        // Create a Connection Token for the Terminal SDK
        const connectionToken = await stripe.terminal.connectionTokens.create();

        return NextResponse.json({ secret: connectionToken.secret });
    } catch (error: any) {
        console.error('Error creating Key/Token:', error);
        return NextResponse.json(
            { error: 'Failed to create connection token', details: error.message },
            { status: 500 }
        );
    }
}
