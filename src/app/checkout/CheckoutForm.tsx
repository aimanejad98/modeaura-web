'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
    total: number;
    onSuccess: (paymentIntentId: string) => Promise<void>;
}

export default function CheckoutForm({ total, onSuccess }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message || 'An error occurred');
                setProcessing(false);
                return;
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                setError(confirmError.message || 'Payment failed');
                setProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await onSuccess(paymentIntent.id);
                // Note: processing stays true while we finalize the order
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 bg-white border border-gray-100 rounded-[3rem] shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                    <ShieldCheck size={24} className="text-[#1B2936]" />
                    <span className="font-bold italic text-[#1B2936]">Secure Payment</span>
                </div>

                <PaymentElement options={{ layout: 'tabs' }} />

                {error && (
                    <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl">
                        {error}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-[#1B2936] text-white py-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <>Processing <Loader2 className="animate-spin" size={16} /></>
                ) : (
                    <>Pay Now <ShieldCheck size={16} /></>
                )}
            </button>
            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                Encrypted by Stripe & SSL
            </p>
        </form>
    );
}
