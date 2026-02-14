'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin, ArrowUp, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStoreSettings } from '@/app/actions/settings';
import { useTheme } from '@/components/ThemeProvider';

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        const data = await getStoreSettings();
        setSettings(data);
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer
            className="text-white pt-32 pb-12 transition-colors duration-1000 relative overflow-hidden"
            style={{ backgroundColor: theme?.secondaryColor || 'var(--brand-navy)' }}
        >
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/images/luxury-pattern-light.png')] bg-repeat bg-[length:200px]"></div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">

                {/* Upper Tier: The Connect Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 pb-24 border-b border-white/10">

                    {/* Column 1: Brand Essence */}
                    <div className="lg:col-span-1 space-y-10">
                        <Link href="/" className="inline-block group">
                            {settings?.logo ? (
                                <img src={settings.logo} alt="Mode Aura" className="h-16 object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="flex items-center">
                                    <span className="font-display text-4xl font-light italic text-white transition-colors group-hover:text-[var(--gold)]">Mode</span>
                                    <span className="font-bold text-4xl uppercase text-[var(--gold)] ml-[-0.12em] tracking-[0.05em]">Aura</span>
                                </div>
                            )}
                        </Link>
                        <p className="text-white/50 text-[10px] uppercase tracking-[0.4em] leading-loose max-w-xs font-medium">
                            {settings?.tagline || 'A sanctuary of modern elegance where architecture meets the art of modest fashion.'}
                        </p>
                        <div className="flex gap-4">
                            <a href={settings?.instagram || "https://www.instagram.com/modeaura1/"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all group">
                                <Instagram size={18} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a href={settings?.facebook || "https://www.facebook.com/profile.php?id=61561081692244"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all group">
                                <Facebook size={18} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: The Atelier Links */}
                    <div className="space-y-10">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-[var(--gold)]">The Atelier</h4>
                        <ul className="space-y-5">
                            <li><FooterLink href="/shop" label="Bespoke Collection" /></li>
                            <li><FooterLink href="/shop?filter=new" label="New Arrivals" /></li>
                            <li><FooterLink href="/shop?kids=true" label="Kids Line" /></li>
                            <li><FooterLink href="/about" label="Our Heritage" /></li>
                        </ul>
                    </div>

                    {/* Column 3: Client Services */}
                    <div className="space-y-10">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-[var(--gold)]">Curated Support</h4>
                        <ul className="space-y-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                            <li><FooterLink href="/contact" label="Contact Us" /></li>
                            <li><FooterLink href="/size-guide" label="Size Precision" /></li>
                            <li><FooterLink href="/shipping" label="Shipping Grace" /></li>
                            <li><FooterLink href="/track-order" label="Track Your Order" /></li>
                            <li><FooterLink href="/returns" label="Exchange Policy" /></li>
                        </ul>
                    </div>

                    {/* Column 4: Reach Out (Direct) */}
                    <div className="space-y-10">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-[var(--gold)]">Reach The Atelier</h4>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Correspondence</p>
                                <a href={`mailto:${settings?.email || 'modeaura1@gmail.com'}`} className="text-sm font-display italic text-white/80 hover:text-[var(--gold)] transition-colors block border-b border-white/5 pb-2">
                                    {settings?.email || 'modeaura1@gmail.com'}
                                </a>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Consultation</p>
                                <a href={`tel:${settings?.phone || '+12265060808'}`} className="text-sm font-display italic text-white/80 hover:text-[var(--gold)] transition-colors block border-b border-white/5 pb-2">
                                    {settings?.phone || '+1 (226) 506-0808'}
                                </a>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Presence</p>
                                <p className="text-[10px] leading-relaxed text-white/50 uppercase tracking-widest">
                                    {settings?.address ? (
                                        <span dangerouslySetInnerHTML={{ __html: settings.address.replace('\n', '<br />') }} />
                                    ) : (
                                        <>785 Wyandotte St E<br />Windsor, ON N9A 3J5</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Tier: Legal & Back to Top */}
                <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                        <p>© 2026 Mode AURA Atelier. Crafted for Grace.</p>
                        <div className="flex gap-10">
                            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <Link href="/contact" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-[var(--gold)] transition-all">
                            Visit Sanctuary <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={scrollToTop}
                            className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--gold)] hover:text-white transition-colors"
                        >
                            Back To Top <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, label, color = "text-white/50" }: { href: string, label: string, color?: string }) {
    return (
        <Link
            href={href}
            className={`${color} text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 group`}
        >
            <div className="w-0 h-px bg-[var(--gold)] group-hover:w-3 transition-all duration-500"></div>
            {label}
        </Link>
    );
}
