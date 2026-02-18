'use server'

import { stripe } from '@/lib/stripe';

export async function createTerminalPaymentIntent(amount: number) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'cad', // Assuming CAD based on context
            payment_method_types: ['card_present'],
            capture_method: 'manual',
        });

        return { success: true, clientSecret: paymentIntent.client_secret, id: paymentIntent.id };
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return { success: false, error: error.message };
    }
}

export async function captureTerminalPayment(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        return { success: true, status: paymentIntent.status };
    } catch (error: any) {
        console.error('Error capturing payment:', error);
        return { success: false, error: error.message };
    }
}
