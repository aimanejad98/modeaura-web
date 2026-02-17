'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';

const LoginContent = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('registered')) {
            setSuccess('Registration successful. Your account is pending admin approval.');
        }
    }, [searchParams]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await login(formData);
            if (result.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Barcode Scanner Listener
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = async (e: KeyboardEvent) => {
            const currentTime = Date.now();

            // Scanners are fast. If time between keys is > 50ms, it's probably a human
            if (currentTime - lastKeyTime > 50) {
                buffer = '';
            }

            lastKeyTime = currentTime;

            if (e.key === 'Enter') {
                if (buffer.startsWith('AL|')) {
                    const [, email, password] = buffer.split('|');
                    if (email && password) {
                        const formData = new FormData();
                        formData.set('email', email);
                        formData.set('password', password);
                        setLoading(true);
                        setSuccess('AUTHENTICATING VIA SECURE VAULT SCAN...');
                        await handleSubmit(formData);
                    }
                }
                buffer = '';
            } else if (e.key && e.key.length === 1) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#050505]">
            <div className="flex-grow flex flex-col lg:flex-row relative pt-24 lg:pt-32">
                {/* Left Section: Cinematic Visual */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A0A] border-r border-white/5 min-h-[1100px]">
                    <img
                        src="/login-visual.png"
                        className="absolute inset-0 w-full h-full object-cover scale-110 animate-slow-zoom opacity-60"
                        alt="Mode Aura Atelier"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />

                    <div className="relative z-20 flex flex-col justify-end p-20 space-y-8 max-w-2xl h-full">
                        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h4 className="text-[var(--gold)] font-black uppercase tracking-[0.6em] text-[10px]">THE ATELIER CIRCLE</h4>
                            <h2 className="text-6xl font-display font-medium italic text-white leading-tight">
                                Uncompromising Elegance, <br />
                                Timeless Sophistication.
                            </h2>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed tracking-wide animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            Step into a world where modern design meets traditional modesty. Members receive priority access to our limited-run atelier collections and bespoke seasonal previews.
                        </p>
                    </div>
                </div>

                {/* Right Section: Premium Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-[#0a0a0a] relative z-20 min-h-[1100px]">
                    <div className="lg:hidden absolute inset-0 pointer-events-none">
                        <img
                            src="/login-visual.png"
                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                            alt="Mobile Background"
                        />
                    </div>
                    <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

                    <div className="w-full max-w-md space-y-12 relative z-30 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <div className="flex flex-col items-center lg:items-start space-y-6">
                            <Link href="/" className="inline-block relative group">
                                <span className="sr-only">Mode Aura Home</span>
                            </Link>

                            <div className="text-center lg:text-left">
                                <img src="/images/auth-logo.png" alt="Mode Aura" className="h-32 object-contain" />
                                <p className="text-[var(--gold)]/60 text-[8px] font-bold uppercase tracking-[0.4em] mt-2">
                                    Where Fashion Meets Accessories
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-display italic text-white">Welcome Back</h2>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Enter your credentials to enter the atelier</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
                                    {success}
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="name@email.com"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 shadow-inner"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">PASSWORD</label>
                                        <Link href="/forgot-password" title="Recover Password" className="text-[9px] text-[var(--gold)]/60 hover:text-[var(--gold)] uppercase tracking-[0.2em] transition-colors">Forgot?</Link>
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 shadow-inner"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--gold)] hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-white/5"
                                >
                                    {loading ? 'Validating Authenticity...' : 'Sign In'}
                                </button>
                            </form>


                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style jsx global>{`
                @keyframes slow-zoom {
                    from { transform: scale(1.05); }
                    to { transform: scale(1.15); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s infinite alternate ease-in-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s forwards cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <LoginContent />
        </Suspense>
    );
}
