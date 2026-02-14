'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardLogin } from '@/app/actions/auth';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function secretPortal() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await dashboardLogin(formData);
            if (result.error) {
                setError(result.error);
            } else {
                // Success - Save user info locally for UI (dashboard layout uses this)
                localStorage.setItem('dashboard_user', JSON.stringify(result.user));
                router.push('/dashboard');
            }
        } catch (err) {
            setError('System authentication failure. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--gold)]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-30" />
            </div>

            <div className="w-full max-w-xl relative z-10 space-y-12">
                {/* Brand Identity */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-4 group transition-all duration-700 hover:border-[var(--gold)] hover:shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                        <ShieldCheck size={40} className="text-[var(--gold)] group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-display italic text-white tracking-tight">Atelier Portal</h1>
                        <div className="flex items-center justify-center gap-4">
                            <span className="h-px w-12 bg-white/10" />
                            <span className="text-[10px] font-black uppercase text-[var(--gold)] tracking-[0.6em]">Management Access v7.0</span>
                            <span className="h-px w-12 bg-white/10" />
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[3.5rem] p-12 lg:p-16 shadow-2xl relative group overflow-hidden">
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                    <form action={handleSubmit} className="space-y-8 relative z-10 text-left">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-4 flex items-center gap-2">
                                <User size={10} /> Email Identifier
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="modeaura1@gmail.com"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.06] transition-all placeholder:text-white/5"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                    <Lock size={10} /> Secure Key
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[9px] text-[var(--gold)]/60 hover:text-[var(--gold)] uppercase tracking-[0.2em] transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••••••"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.06] transition-all placeholder:text-white/5"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-6 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--gold)] hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            {loading ? (
                                <span className="animate-pulse">Authorizing...</span>
                            ) : (
                                <>
                                    Enter Atelier Control
                                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="text-center space-y-4">
                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                        This endpoint is encrypted and monitored. Unauthorized access attempts are logged.
                    </p>
                    <div className="flex justify-center gap-8">
                        <Link href="/" className="text-[9px] text-white/40 hover:text-white transition-colors uppercase tracking-widest font-black">← Back to Storefront</Link>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .font-display {
                    font-family: var(--font-editorial, serif);
                }
            `}</style>
        </div>
    );
}
