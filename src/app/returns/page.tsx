'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { RotateCcw, ShieldCheck, RefreshCw, MessageSquare } from 'lucide-react';

export default function ReturnsPage() {
    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Header & Breadcrumbs */}
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Return Policy</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.5em] text-[10px]">Atelier Assurance</h5>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Returns & Exchanges</h1>
                        <p className="text-[#374151] text-sm max-w-lg mx-auto leading-relaxed italic font-medium">
                            Your satisfaction is our primary silhouette. If a piece doesn't perfectly resonate, we are here to assist.
                        </p>
                    </div>
                </div>

                {/* Return Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <RotateCcw size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">14-Day Window</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Requests for returns must be initiated within 14 days of receiving your order.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <ShieldCheck size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Pristine Condition</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Items must be unworn, unwashed, and in their original packaging with tags attached.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <RefreshCw size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Simple Exchanges</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Love the style but need a different size? Exchanges are handled with atelier priority.
                        </p>
                    </div>
                </div>

                {/* Detailed Process */}
                <div className="max-w-4xl mx-auto space-y-16 py-12">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-display text-center italic text-[#1B2936]">How to Return</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            {[
                                { step: "01", title: "Contact Support", desc: "Email our team at modeaura1@gmail.com with your order number and reason for return." },
                                { step: "02", title: "Secure Packaging", desc: "Place the items in their original garment bag and shipping box to ensure safe transit." },
                                { step: "03", title: "Dispatch", desc: "Ship the items back to our Windsor Atelier using a tracked courier service of your choice." },
                                { step: "04", title: "Refund Processing", desc: "Once inspected, your refund will be processed back to your original payment method within 5-7 business days." }
                            ].map((s, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <span className="text-[#D4AF37] font-black text-xs tracking-tighter">{s.step}</span>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-[#1B2936]">{s.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-12 bg-[#1B2936] rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 text-white">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="text-[#D4AF37]" size={32} strokeWidth={1} />
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <h3 className="text-xl font-display italic">Need Personal Guidance?</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Our Mode AURA team is available to assist you with any questions regarding your return or finding the perfect fit for an exchange.
                            </p>
                            <Link href="mailto:modeaura1@gmail.com" className="inline-block text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37] pb-1">
                                Contact Our Team
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
