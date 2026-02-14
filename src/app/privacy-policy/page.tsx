'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { Lock, Eye, FileText, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Header & Breadcrumbs */}
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Privacy Policy</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.5em] text-[10px]">Your Trust, Our Treasure</h5>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Privacy Policy</h1>
                        <p className="text-[#374151] text-sm max-w-lg mx-auto leading-relaxed italic font-medium">
                            We are committed to protecting your personal information and your right to privacy.
                        </p>
                    </div>
                </div>

                {/* Privacy Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <Lock size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Secure Data</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Your payment and personal data are encrypted and processed with the highest security standards.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <Eye size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Transparency</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            We are transparent about the data we collect and how it is used to enhance your experience.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center space-y-6 group">
                        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all duration-500">
                            <Globe size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-display italic text-[#1B2936]">Global Standards</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            We adhere to international privacy regulations to ensure your rights are respected worldwide.
                        </p>
                    </div>
                </div>

                {/* Policy Content */}
                <div className="max-w-4xl mx-auto space-y-16 py-12">
                    <div className="prose prose-stone max-w-none text-[#1B2936]/80 text-sm leading-relaxed">
                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">1. Information We Collect</h3>
                                <p>
                                    When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">2. How We Use Your Personal Information</h3>
                                <p>
                                    We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Communicate with you;</li>
                                    <li>Screen our orders for potential risk or fraud; and</li>
                                    <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">3. Sharing Your Personal Information</h3>
                                <p>
                                    We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site. We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">4. Your Rights</h3>
                                <p>
                                    If you are a resident of certain territories, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-2xl font-display italic text-[#1B2936]">5. Contact Us</h3>
                                <p>
                                    For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:modeaura1@gmail.com" className="text-[#D4AF37] underline hover:text-[#1B2936]">modeaura1@gmail.com</a>.
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
