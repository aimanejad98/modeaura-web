'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { Scale, FileText, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Header & Breadcrumbs */}
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Terms of Service</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.5em] text-[10px]">Agreements of Elegance</h5>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Terms of Service</h1>
                        <p className="text-[#374151] text-sm max-w-lg mx-auto leading-relaxed italic font-medium">
                            These Terms of Service govern your use of the Mode AURA website and services.
                        </p>
                    </div>
                </div>

                {/* Terms Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <Scale size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Fair Usage</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            We strive to provide accurate and fair services to all our valued clientele.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <FileText size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Clear Agreements</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Our terms are designed to be transparent and easy to understand.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <AlertCircle size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Mutual Respect</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            We expect a relationship built on mutual respect and adherence to these guidelines.
                        </p>
                    </div>
                </div>

                {/* Terms Content */}
                <div className="max-w-4xl mx-auto space-y-16 py-12">
                    <div className="prose prose-stone max-w-none text-[#1B2936]/80 text-sm leading-relaxed">
                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">1. Overview</h3>
                                <p>
                                    This website is operated by Mode AURA. Throughout the site, the terms "we", "us" and "our" refer to Mode AURA. Mode AURA offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">2. Online Store Terms</h3>
                                <p>
                                    By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">3. Accuracy, Completeness and Timeliness</h3>
                                <p>
                                    We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">4. Modifications to the Service and Prices</h3>
                                <p>
                                    Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">5. Governing Law</h3>
                                <p>
                                    These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Canada.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">6. Contact Information</h3>
                                <p>
                                    Questions about the Terms of Service should be sent to us at <a href="mailto:modeaura1@gmail.com" className="text-[#D4AF37] underline hover:text-[#1B2936]">modeaura1@gmail.com</a>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
