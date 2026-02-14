'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            {/* Header / Breadcrumbs */}
            <section className="pt-44 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3 mb-8">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Connect with the Atelier</span>
                    </nav>

                    <div className="space-y-4 max-w-3xl">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.6em] text-[10px]">Atelier Presence</h5>
                        <h1 className="text-5xl md:text-7xl font-display font-medium italic text-[#1B2936] leading-tight">
                            Connect with Our Sanctuary.
                        </h1>
                        <p className="text-[#374151] text-sm md:text-base leading-relaxed max-w-xl font-medium">
                            Whether you seek a private consultation, have inquiries about our collections, or simply wish to share your experience, our team is at your grace.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Contact Content */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">

                        {/* Left Side: Contact Info & Hours */}
                        <div className="space-y-16 py-8">
                            {/* Contact Details */}
                            <div className="space-y-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#A8A29E] border-b border-[#D4AF37]/20 pb-4">
                                    Direct Channels
                                </h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all">
                                            <Phone size={20} strokeWidth={1} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Inquiries</p>
                                            <a href="tel:+12265060808" className="text-xl font-display italic text-[#1B2936] hover:text-[#D4AF37] transition-colors">
                                                +1 (226) 506-0808
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all">
                                            <Mail size={20} strokeWidth={1} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Email Correspondence</p>
                                            <a href="mailto:modeaura1@gmail.com" className="text-xl font-display italic text-[#1B2936] hover:text-[#D4AF37] transition-colors">
                                                modeaura1@gmail.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#1B2936] group-hover:text-white transition-all">
                                            <MapPin size={20} strokeWidth={1} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">The Atelier</p>
                                            <address className="text-xl font-display italic text-[#1B2936] not-italic leading-relaxed">
                                                785 Wyandotte St E<br />
                                                Windsor, ON N9A 3J5
                                            </address>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="space-y-10">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#A8A29E] border-b border-[#D4AF37]/20 pb-4 flex items-center gap-3">
                                    <Clock size={14} className="text-[#D4AF37]" /> Operational Grace
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="p-8 bg-white/50 backdrop-blur-sm border border-[#D4AF37]/10 rounded-[2rem]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4">Monday — Saturday</p>
                                        <p className="text-3xl font-display italic text-[#1B2936]">11:00 AM — 7:00 PM</p>
                                    </div>
                                    <div className="p-8 bg-[#1B2936] rounded-[2rem] text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4">Sunday</p>
                                        <p className="text-3xl font-display italic">12:00 PM — 5:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Presence */}
                            <div className="flex gap-4 pt-4">
                                <a href="https://www.instagram.com/modeaura1/" target="_blank" rel="noopener noreferrer" className="px-6 py-4 flex items-center gap-3 rounded-full border border-[#D4AF37]/20 text-[#1B2936] text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all">
                                    <Instagram size={16} /> Instagram
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61561081692244" target="_blank" rel="noopener noreferrer" className="px-6 py-4 flex items-center gap-3 rounded-full border border-[#D4AF37]/20 text-[#1B2936] text-[10px] font-black uppercase tracking-widest hover:bg-[#1B2936] hover:text-white transition-all">
                                    <Facebook size={16} /> Facebook
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Map */}
                        <div className="relative min-h-[500px] lg:min-h-full rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-[#D4AF37]/10 group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2950.407775986877!2d-83.0210087!3d42.327856599999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b2d6a54f8d507%3A0x62a8d1b1f0e4b8b!2s785%20Wyandotte%20St%20E%2C%20Windsor%2C%20ON%20N9A%203J5%2C%20Canada!5e0!3m2!1sen!2sca!4v1707246415606!5m2!1sen!2sca"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(0.4) contrast(1.1) brightness(1.05)' }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 transition-opacity duration-1000 group-hover:opacity-90"
                            />
                            {/* Artistic Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-[1.5rem] border-white/10 rounded-[3rem]"></div>
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-[#D4AF37]/20 animate-fade-in">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1">The Address</p>
                                <p className="text-xs font-bold text-[#1B2936]">Windsor Atelier • 785 Wyandotte St E</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section (Visual Placeholder) */}
            <section className="py-32 bg-[#FAF9F6] border-t border-[#D4AF37]/10 text-center">
                <div className="max-w-xl mx-auto space-y-8 px-6">
                    <h2 className="text-3xl font-display italic text-[#1B2936]">Stay Connected</h2>
                    <p className="text-[#1B2936]/60 text-xs font-medium uppercase tracking-[0.3em]">Join the inner circle for exclusive drops</p>
                    <div className="flex gap-2 p-1.5 bg-white rounded-full border border-[#D4AF37]/20 shadow-sm focus-within:border-[#D4AF37] transition-all">
                        <input
                            type="email"
                            placeholder="your email address"
                            className="flex-1 bg-transparent px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                        />
                        <button className="bg-[#1B2936] text-white px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all">
                            Ascend
                        </button>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                .font-display { font-family: var(--font-cormorant), serif; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s forwards ease-out;
                }
            `}</style>
        </main>
    );
}
