'use client';
// Trigger rebuild

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBanners } from '@/app/actions/banners';

export default function HeroSlider() {
    const [slides, setSlides] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getBanners();
                const activeBanners = data.filter((b: any) => b.active);
                setSlides(activeBanners);
            } catch (err) {
                console.error('Slider load failed:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [slides]);

    if (loading || slides.length === 0) return (
        <section className="h-[95vh] bg-[#FAF7F2] flex items-center justify-center">
            <div className="flex flex-baseline gap-2 text-4xl opacity-10 animate-pulse">
                <span className="font-display italic">Mode</span>
                <span className="font-bold uppercase tracking-widest">Aura</span>
            </div>
        </section>
    );

    return (
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-[#FAF7F2]">
            {slides.map((slide, index) => {
                const isActive = index === current;
                const layout = slide.designLayout || 'Full';

                return (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {/* Background Layer */}
                        {(layout === 'Full' || layout === 'Glass' || layout === 'Minimal' || layout === 'Split-Left' || layout === 'Split-Right') && (
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[12000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />
                        )}

                        {layout === 'Full' && <div className="absolute inset-0 bg-black/10 transition-opacity duration-1000" />}
                        {layout === 'Full' && <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30" />}

                        {/* Layout Content */}
                        <div className="relative h-full w-full">
                            {layout === 'Full' && (
                                <div className="h-full max-w-7xl mx-auto px-8 flex items-center justify-center text-center pt-32 md:pt-48">
                                    <div className={`max-w-3xl space-y-8 transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                                        <div className="space-y-4">
                                            <h5 className="font-black uppercase tracking-[0.6em] text-[10px] md:text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" style={{ color: slide.subtitleColor || 'var(--gold)' }}>
                                                {slide.subtitle || 'Exclusive Collection'}
                                            </h5>
                                            <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-medium italic leading-[1.1] drop-shadow-2xl" style={{ color: slide.textColor || 'white' }}>
                                                {slide.title}
                                            </h1>
                                        </div>
                                        <div className="pt-10">
                                            <Link href={slide.link || '/shop'} className="inline-block bg-white text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] px-14 py-5 hover:bg-[var(--gold)] hover:text-white transition-all shadow-xl">
                                                Shop Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(layout === 'Split-Left' || layout === 'Split-Right' || layout === 'Split-Blur-Left' || layout === 'Split-Blur-Right') && (
                                <div className={`flex flex-col md:flex-row h-full ${layout === 'Split-Right' || layout === 'Split-Blur-Right' ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="w-full md:w-1/2 h-full flex items-center justify-center p-12 md:p-24 pb-0 pt-32 md:pt-48 bg-white relative z-10">
                                        <div className={`space-y-6 transition-all duration-1000 delay-300 ${isActive ? 'translate-x-0 opacity-100' : (layout.includes('Left') ? '-translate-x-12' : 'translate-x-12') + ' opacity-0'}`}>
                                            <h5 className="font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-sm" style={{ color: slide.subtitleColor || 'var(--gold)' }}>
                                                {slide.subtitle}
                                            </h5>
                                            <h1 className="text-4xl md:text-6xl font-display italic leading-tight" style={{ color: slide.textColor || '#111827' }}>
                                                {slide.title}
                                            </h1>
                                            <div className="pt-4">
                                                <Link href={slide.link || '/shop'} className="inline-block border-2 font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-black hover:text-white transition-all" style={{ borderColor: slide.textColor || 'black', color: slide.textColor || 'black' }}>
                                                    Discover More
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 h-full relative">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />

                                        {/* Blur Gradients */}
                                        {layout === 'Split-Blur-Left' && (
                                            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                                        )}
                                        {layout === 'Split-Blur-Right' && (
                                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {layout === 'Glass' && (
                                <div className="h-full flex items-center justify-center p-8">
                                    <div className={`backdrop-blur-md bg-white/10 p-12 md:p-20 rounded-[3rem] border border-white/20 shadow-2xl max-w-xl text-center space-y-6 transition-all duration-1000 delay-300 ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                                        <h1 className="text-3xl md:text-5xl font-display italic leading-tight" style={{ color: slide.textColor || 'white' }}>
                                            {slide.title}
                                        </h1>
                                        <p className="font-medium tracking-wide text-sm md:text-base" style={{ color: slide.subtitleColor || 'white', opacity: 0.8 }}>
                                            {slide.subtitle}
                                        </p>
                                        <div className="pt-4">
                                            <Link href={slide.link || '/shop'} className="inline-block bg-[var(--gold)] text-white font-black text-[10px] uppercase tracking-[0.3em] px-12 py-5 rounded-full hover:scale-105 transition-all">
                                                View Collection
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {layout === 'Minimal' && (
                                <div className="h-full flex flex-col justify-end p-12 md:p-24">
                                    <div className={`space-y-4 transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                                        <div className="w-12 h-0.5" style={{ backgroundColor: slide.subtitleColor || 'var(--gold)' }} />
                                        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter" style={{ color: slide.textColor || 'white' }}>
                                            {slide.title}
                                        </h1>
                                        <Link href={slide.link || '/shop'} className="inline-flex items-center gap-4 text-white hover:text-[var(--gold)] transition-all">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--gold)] drop-shadow-md">Shop</span>
                                            <span className="text-xl">→</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Middle-Side Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-all text-4xl font-light"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-all text-4xl font-light"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Bottom Centered Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-1.5 rounded-full transition-all duration-700 ${index === current ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
