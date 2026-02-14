'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';

export default function ShippingPage() {
    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Header & Breadcrumbs */}
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Delivery Information</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.5em] text-[10px]">Logistics of Elegance</h5>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Delivery Information</h1>
                        <p className="text-[#374151] text-sm max-w-lg mx-auto leading-relaxed italic font-medium">
                            Ensuring your Mode AURA pieces reach you with the same care and precision they were crafted with.
                        </p>
                    </div>
                </div>

                {/* Shipping Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Windsor Local Delivery */}
                    <div className="bg-[#D4AF37]/5 p-12 rounded-[2.5rem] border-2 border-[#D4AF37]/20 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Truck size={120} className="text-[#D4AF37]" strokeWidth={0.5} />
                        </div>
                        <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white">
                            <Truck size={24} />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-2xl font-display italic text-[#1B2936]">Windsor Hand-Delivery</h3>
                            <div className="space-y-4 text-sm text-[#1B2936]/70 leading-relaxed font-medium">
                                <p className="text-[#1B2936] font-bold">Personal delivery by our Windsor team.</p>
                                <p>Available for all Windsor residents. Most orders delivered same-day or next-day.</p>
                                <p className="text-[#D4AF37] font-black uppercase tracking-widest text-[10px]">Complimentary / Free</p>
                            </div>
                        </div>
                    </div>

                    {/* Canada Wide */}
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                        <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#D4AF37]">
                            <Truck size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display italic text-[#1B2936]">Canada Wide</h3>
                            <div className="space-y-4 text-sm text-gray-400 leading-relaxed font-medium">
                                <p>Shipping across Canada (excluding local Windsor).</p>
                                <p>Ontario: $8.00</p>
                                <p>Other provinces: $12.00</p>
                            </div>
                        </div>
                    </div>

                    {/* United States */}
                    <div className="bg-[#1B2936] p-12 rounded-[2.5rem] shadow-xl text-white space-y-8">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-[#D4AF37]">
                            <Globe size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display italic">United States</h3>
                            <div className="space-y-4 text-sm text-white/60 leading-relaxed font-medium">
                                <p>Cross-border delivery to all US states.</p>
                                <p>Standard shipping: $18.00</p>
                                <p>Typical delivery: 5-7 business days</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[3rem] border border-gray-100 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[#D4AF37]">
                                <Clock size={18} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Processing Time</h4>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Our Atelier processes orders within 24-48 hours. During collection launches or holiday seasons, this may extend slightly.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[#D4AF37]">
                                <ShieldCheck size={18} />
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Secure Handling</h4>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                All luxury pieces are inspected and hand-packaged in protective garment bags to ensure they arrive in pristine condition.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
