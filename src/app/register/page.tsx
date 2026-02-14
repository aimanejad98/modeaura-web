'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await register(formData);
            if (result.error) {
                setError(result.error);
            } else {
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#050505]">
            <div className="flex-grow flex flex-col lg:flex-row relative pt-24 lg:pt-32">
                {/* Left Section: Cinematic Visual */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0A0A] border-r border-white/5 min-h-[1100px]">
                    <img
                        src="/register-visual.png"
                        className="absolute inset-0 w-full h-full object-cover scale-110 animate-slow-zoom opacity-60"
                        alt="Premium Abaya Collection"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />

                    <div className="relative z-20 flex flex-col justify-end p-20 space-y-8 max-w-2xl h-full">
                        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h4 className="text-[var(--gold)] font-black uppercase tracking-[0.6em] text-[10px]">THE INNER CIRCLE</h4>
                            <h2 className="text-6xl font-display font-medium italic text-white leading-tight">
                                Crafting Your <br />
                                Unique Identity.
                            </h2>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed tracking-wide animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            Join our premier membership for exclusive access to bespoke drops, early-access events, and curated style recommendations tailored for the modern individual.
                        </p>
                    </div>
                </div>

                {/* Right Section: Premium Register Form */}
                <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-[#0a0a0a] relative z-20 min-h-[1100px]">
                    <div className="lg:hidden absolute inset-0 pointer-events-none">
                        <img
                            src="/register-visual.png"
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
                                <h2 className="text-3xl font-display italic text-white">Create Account</h2>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Join the elite Modest fashion community</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            <form action={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Sarah Mitchell"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 shadow-inner"
                                    />
                                </div>

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
                                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">PASSWORD</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 shadow-inner"
                                    />
                                </div>

                                <div className="flex items-center gap-4 px-2 py-4 group cursor-pointer">
                                    <div className="relative flex items-center">
                                        <input
                                            name="newsletter"
                                            type="checkbox"
                                            id="newsletter"
                                            className="peer appearance-none w-5 h-5 border border-white/10 rounded-lg bg-white/[0.03] checked:bg-[var(--gold)] checked:border-[var(--gold)] transition-all cursor-pointer"
                                        />
                                        <svg
                                            className="absolute w-3 h-3 text-white left-1 pointer-events-none hidden peer-checked:block"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <label htmlFor="newsletter" className="text-[10px] font-bold text-white/40 uppercase tracking-widest cursor-pointer group-hover:text-white/60 transition-colors">
                                        Subscribe to our elite atelier newsletter
                                    </label>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--gold)] hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-white/5"
                                >
                                    {loading ? 'Registering...' : 'Register Now'}
                                </button>
                            </form>

                            <div className="pt-8 text-center border-t border-white/5">
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
                                    Already a member? {' '}
                                    <Link href="/login" className="text-[var(--gold)] hover:text-white transition-colors ml-2">Sign In</Link>
                                </p>
                            </div>
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
}
