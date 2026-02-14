'use client';

import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            {/* Hero Section - Increased padding for Nav visibility */}
            <section className="pt-64 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="space-y-8">
                            <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                                <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                                <span className="text-[#B45309]/40">/</span>
                                <span className="text-[#B45309]">Our Heritage</span>
                            </nav>

                            <div className="space-y-4">
                                <h5 className="text-[#B45309] font-black uppercase tracking-[0.6em] text-[10px]">The Atelier Heritage</h5>
                                <h1 className="text-5xl md:text-7xl font-display font-medium italic text-[#1B2936] leading-[1.1]">
                                    Influential, Innovative & Progressive.
                                </h1>
                            </div>

                            <div className="space-y-6 max-w-xl">
                                <p className="text-[#1B2936] text-sm md:text-base leading-relaxed font-medium italic">
                                    At Mode AURA, we don’t just follow the tides of fashion; we curate the architecture of identity.
                                    We pride ourselves on the avant-garde fusion of traditional modest silhouettes with high-fashion sensibilities.
                                    Here, you discover the essential elements of a modern wardrobe—crafted to stand out, never to merely blend in.
                                </p>
                                <p className="text-[#1B2936]/60 text-xs md:text-sm leading-[1.8] font-medium">
                                    Understanding the diverse requirements of the modern woman, our collection offers a seamless pairing of practicality and high-end style.
                                    Whether you seek the casual elegance of a daytime open abaya or the opulent luxury of an evening gown,
                                    every garment is a favored masterpiece waiting to find its home in your wardrobe.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-[4/5] order-1 lg:order-2">
                        <div className="absolute -inset-4 border border-[#D4AF37]/20 rounded-t-full transition-transform duration-1000 group-hover:scale-105"></div>
                        <div className="relative h-full w-full rounded-t-full overflow-hidden shadow-2xl">
                            <Image
                                src="/heritage-hero.png"
                                alt="Mode AURA Heritage"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* The Collection Categories Grid */}
            <section className="py-32 bg-[#1B2936] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#D4AF37]">
                        <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M0,500 C200,300 400,700 600,500 S800,300 1000,500" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="mb-24 text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-display italic">A Fusion of Tradition & Trend</h2>
                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em]">Our Curated Pillars</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[
                            { title: "Atelier Abayas", desc: "Open or closed silhouettes, from daily essentials to luxury embellished couture. Bases covered for every base of life." },
                            { title: "Sculpted Dresses", desc: "From fluid midi pieces to majestic evening gowns. The fashion lifeline for special occasion showstoppers." },
                            { title: "Ritual Jilbabs", desc: "Designed for devotion. Light, breathable fabrics that allow for movement and prayer without compromise." },
                            { title: "Ethereal Hijabs", desc: "Versatile glamour in Jersey, Modal, and Premium Chiffon. Designed for day-long comfort and effortless styling." },
                            { title: "Curated Accoutrements", desc: "The final touch. From magnet pins to tassel belts, ensuring your silhouette is perfectly composed." },
                            { title: "Sacred Occasions", desc: "Tailored collections for Hajj, Umrah, Ramadan, and Eid. Look and feel your absolute best in every sacred moment." }
                        ].map((item, idx) => (
                            <div key={idx} className="group space-y-6 p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500">
                                <h3 className="text-xl font-display italic text-white/90 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                                <p className="text-white/40 text-xs leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Signature Palette */}
            <section className="py-40 px-6 bg-white">
                <div className="max-w-6xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <h2 className="text-[#1B2936] text-4xl md:text-5xl font-display italic">The Signature Palette</h2>
                        <div className="h-[0.5px] w-24 bg-[#D4AF37]/40 mx-auto"></div>
                        <p className="text-[#1B2936]/40 text-[10px] font-black uppercase tracking-widest">Find Your Signature Reflection</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { name: "Monochromatic Mastery", colors: "Obsidian, Ivory, Smoke", hex: "bg-[#1B2936]" },
                            { name: "Earthbound Whispers", colors: "Mocha, Truffle, Desert Sand", hex: "bg-[#D9C5B2]" },
                            { name: "Ethereal Blooms", colors: "Mint, Lilac, Soft Blush", hex: "bg-[#F0E6EF]" },
                            { name: "Regal Depths", colors: "Midnight, Forest, Burgundy", hex: "bg-[#1A2530]" }
                        ].map((p, idx) => (
                            <div key={idx} className="space-y-6 text-center group">
                                <div className={`aspect-square w-full rounded-full ${p.hex} shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-700 border border-black/5`}></div>
                                <div className="space-y-2">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1B2936]">{p.name}</h4>
                                    <p className="text-[#1B2936]/40 text-[10px] font-medium italic">{p.colors}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sacred Journeys Section */}
            <section className="py-40 px-6 bg-[#1B2936] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2000')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-white text-3xl md:text-5xl font-display italic leading-tight">Sacred Spirit. <br /> Elegant Purpose.</h2>
                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">The Pilgrimage & Eid Edit</p>
                    </div>

                    <p className="text-white/70 text-sm md:text-base leading-[2] font-medium font-serif italic max-w-2xl mx-auto">
                        "Mode AURA honors your most sacred rites. From the weightless fabrics required for the heat of Hajj and Umrah
                        to the opulent showstoppers designed for the divine brilliance of Ramadan and Eid.
                        We ensure you remain composed, cool, and spiritually resonant in every holy moment."
                    </p>

                    <div className="pt-8">
                        <Link
                            href="/shop?category=Occasion"
                            className="inline-block border border-white/20 text-white px-10 py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-[#1B2936] transition-all"
                        >
                            Explore the Edit
                        </Link>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-40 px-6 text-center bg-[#FAF9F6]">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="h-[1px] w-20 bg-[#D4AF37]/30 mx-auto"></div>
                    <p className="text-[#1B2936] text-lg md:text-xl leading-relaxed italic font-display px-4">
                        "Mode AURA is more than a boutique; it is a movement towards heads-held-high elegance.
                        Let us accompany you on your style journey, from the first daily layer to the final evening shine."
                    </p>
                    <div className="pt-6">
                        <Link
                            href="/shop"
                            className="inline-block bg-[#1B2936] text-white px-14 py-5 text-[10px] font-black uppercase tracking-[0.5em] shadow-[0_20px_40px_-10px_rgba(27,41,54,0.3)] hover:bg-[#D4AF37] transition-all transform hover:-translate-y-1"
                        >
                            Shop the Collection
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
