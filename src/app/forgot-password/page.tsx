'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, ArrowRight, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { forgotPassword } from '@/app/actions/auth-reset';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await forgotPassword(email);
        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to send reset code');
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-64 pb-24 flex items-center justify-center">
                <div className="w-full max-w-lg bg-white p-12 lg:p-16 rounded-[4rem] border border-gray-100 shadow-2xl space-y-10 relative overflow-hidden">
                    {/* Decorative Background Aura */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                    <div className="relative z-10 space-y-4">
                        <Link href="/login" className="inline-flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-[var(--gold)] transition-colors mb-4 group">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                        </Link>
                        <h1 className="text-5xl font-display italic text-[#1B2936]">Identity Recovery</h1>
                        <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.4em] italic mb-8">Secure Password Reset</p>
                    </div>

                    {success ? (
                        <div className="relative z-10 space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-display italic text-[#1B2936]">Email Dispatched</h2>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                    A secure 6-digit recovery code has been sent to <span className="text-[#1B2936] font-bold">{email}</span>.
                                </p>
                            </div>
                            <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="inline-flex items-center gap-3 bg-[#1B2936] text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:shadow-[var(--gold)]/10">
                                Enter Recovery Code <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Enter the email associated with your atelier profile. We'll send you a secure code to reset your access.
                            </p>

                            {error && (
                                <div className="p-5 bg-red-50 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--gold)] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="atlier@luxury.com"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold text-[#1B2936] focus:outline-none focus:border-[var(--gold)] focus:bg-white transition-all placeholder:text-gray-200"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full bg-[#1B2936] text-white py-6 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Request Recovery Code'}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
