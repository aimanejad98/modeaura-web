'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail, resendVerification } from '@/app/actions/verification';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        async function doVerify() {
            const result = await verifyEmail(token!);
            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Identity verified.');
                // Auto redirect after 5s
                setTimeout(() => router.push('/account'), 5000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Verification failed.');
            }
        }
        doVerify();
    }, [token, router]);

    return (
        <div className="max-w-md mx-auto bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
            {status === 'loading' && (
                <div className="space-y-6 py-12">
                    <Loader2 className="w-16 h-16 text-[var(--gold)] animate-spin mx-auto" />
                    <h1 className="text-3xl font-display italic text-[#1B2936]">Authenticating...</h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">Verifying your atelier credentials</p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-display italic text-[#1B2936]">Welcome Back</h1>
                        <p className="text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.3em] italic">Identity Confirmed</p>
                    </div>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{message}</p>
                    <div className="pt-4">
                        <Link href="/account" className="inline-flex items-center gap-2 bg-[#1B2936] text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                            Enter the Atelier <ArrowRight size={14} />
                        </Link>
                        <p className="text-[9px] text-gray-300 mt-6 uppercase font-black tracking-widest">Redirecting in 5 seconds...</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                        <XCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-display italic text-[#1B2936]">Verification Error</h1>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed">{message}</p>

                    <div className="pt-6 space-y-4">
                        <Link href="/register" className="block text-[10px] font-black text-[var(--gold)] uppercase tracking-widest hover:text-black transition-colors">
                            Try Registering Again
                        </Link>
                        <div className="border-t border-gray-50 pt-6">
                            <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mb-4">Link expired? Request a new one:</p>
                            <input
                                type="email"
                                id="resend-email"
                                placeholder="ENTER YOUR EMAIL"
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black tracking-widest focus:outline-none focus:border-[var(--gold)] mb-3 text-center"
                            />
                            <button
                                onClick={async () => {
                                    const email = (document.getElementById('resend-email') as HTMLInputElement).value;
                                    if (!email) return;
                                    setResending(true);
                                    const res = await resendVerification(email);
                                    setResending(false);
                                    setResendStatus(res.success ? 'Verification sent!' : (res.error || 'Failed'));
                                }}
                                disabled={resending}
                                className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all border border-gray-100"
                            >
                                {resending ? 'Sending...' : 'Resend Link'}
                            </button>
                            {resendStatus && <p className="text-[9px] font-black uppercase tracking-widest mt-3 text-[var(--gold)]">{resendStatus}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="pt-64 pb-24 px-6">
                <Suspense fallback={<div className="text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">Preparing verification engine...</div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}
