'use client';

import { useState } from 'react';
import { subscribe } from '@/app/actions/newsletter';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const result = await subscribe(email);
            if (result.success) {
                setStatus('success');
                setMessage('Welcome to the AURA inner circle.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(result.error || 'Subscription failed.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in py-6">
                <CheckCircle2 className="text-[var(--gold)] w-12 h-12" />
                <p className="text-white font-display italic text-2xl">{message}</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-[10px] text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                >
                    Subscribe another email
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto shadow-2xl relative">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="bg-zinc-900/80 border border-white/20 flex-1 text-white px-8 py-6 focus:ring-1 focus:ring-[var(--gold)] focus:bg-zinc-900/95 transition-all outline-none text-xs font-bold tracking-widest placeholder:text-white/60"
            />
            <button
                type="submit"
                disabled={loading}
                className="gold-btn !rounded-none px-12 py-6 text-[10px] !bg-white !text-black hover:!bg-[var(--gold)] hover:!text-white flex items-center justify-center gap-2 min-w-[160px] transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        PROCESSING
                    </>
                ) : (
                    'JOIN NOW'
                )}
            </button>

            {status === 'error' && (
                <div className="absolute -bottom-10 left-0 right-0 text-center">
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{message}</p>
                </div>
            )}
        </form>
    );
}
