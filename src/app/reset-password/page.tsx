'use client';

import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, ArrowRight, CheckCircle2, ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/actions/auth-reset';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userEmail = searchParams.get('email') || '';

    const [email, setEmail] = useState(userEmail);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Safety requirement: Minimum 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await resetPassword(email, code, newPassword);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } else {
            setError(result.error || 'Identity verification failed');
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-lg bg-white p-12 lg:p-16 rounded-[4rem] border border-gray-100 shadow-2xl space-y-10 relative overflow-hidden animate-in fade-in duration-700">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--gold)]/5 blur-[100px] -ml-32 -mt-32 rounded-full"></div>

            <div className="relative z-10 space-y-4 text-center md:text-left">
                <Link href="/forgot-password" className="inline-flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-[var(--gold)] transition-colors mb-4 group">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Recovery
                </Link>
                <h1 className="text-5xl font-display italic text-[#1B2936]">Define Access</h1>
                <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.4em] italic">Renew Identity Credentials</p>
            </div>

            {success ? (
                <div className="relative z-10 py-12 text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-2xl">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-display italic text-[#1B2936]">Identity Renewed</h2>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Aura profile updated successfully</p>
                    </div>
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em] pt-4 italic">Transitioning to login...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    {error && (
                        <div className="p-5 bg-red-50 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Registered Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 px-8 text-sm font-bold text-[#1B2936] focus:outline-none focus:border-[var(--gold)] transition-all"
                                placeholder="YOUR REGISTERED EMAIL"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Recovery Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="6-DIGIT CODE"
                                className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 px-8 text-center text-2xl font-black tracking-[0.5em] text-[#1B2936] focus:outline-none focus:border-[var(--gold)] transition-all placeholder:text-[10px] placeholder:tracking-widest"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">New Secret Word</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="MINIMUM 6 CHARACTERS"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 px-8 text-sm font-bold text-[#1B2936] focus:outline-none focus:border-[var(--gold)] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[var(--gold)] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Confirm Secret Word</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 px-8 text-sm font-bold text-[#1B2936] focus:outline-none focus:border-[var(--gold)] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full bg-[#1B2936] text-white py-6 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Finalize Credentials'}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-64 pb-24 flex items-center justify-center">
                <Suspense fallback={<div className="text-[10px] font-black uppercase tracking-widest text-[#ccc]">Initializing Recovery Engine...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
