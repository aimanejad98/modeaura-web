'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveTestimonials } from '@/app/actions/testimonials';

export default function GoogleReviews() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getActiveTestimonials();
            setTestimonials(data);
            setLoading(false);
        }
        load();
    }, []);

    const next = () => {
        if (testimonials.length === 0) return;
        setCurrent((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        if (testimonials.length === 0) return;
        setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        if (testimonials.length === 0) return;
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    if (loading) return null;
    if (testimonials.length === 0) return null;

    return (
        <section className="relative py-40 px-6 overflow-hidden bg-[#FAF9F6]">
            {/* Organic corner visuals like the reference */}
            <div className="absolute top-0 left-0 w-64 h-64 opacity-[0.08] pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#D4AF37" d="M44.7,-76.4C58.2,-69.2,70.1,-58.3,77.9,-45.1C85.7,-31.9,89.5,-15.9,88.4,-0.6C87.3,14.7,81.4,29.3,72.7,42C64,54.7,52.6,65.4,39.3,72.4C26.1,79.4,13,82.7,-0.9,84.2C-14.8,85.7,-29.6,85.4,-42.6,79.2C-55.6,73,-66.7,60.8,-74.6,47.1C-82.5,33.3,-87.3,18.1,-87.4,2.9C-87.5,-12.3,-82.9,-27.4,-74.4,-40.4C-65.9,-53.4,-53.6,-64.3,-40.1,-71.5C-26.6,-78.7,-13.3,-82.2,0.8,-83.5C14.8,-84.8,29.7,-84,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-96 h-96 opacity-[0.08] pointer-events-none rotate-180">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#D4AF37" d="M44.7,-76.4C58.2,-69.2,70.1,-58.3,77.9,-45.1C85.7,-31.9,89.5,-15.9,88.4,-0.6C87.3,14.7,81.4,29.3,72.7,42C64,54.7,52.6,65.4,39.3,72.4C26.1,79.4,13,82.7,-0.9,84.2C-14.8,85.7,-29.6,85.4,-42.6,79.2C-55.6,73,-66.7,60.8,-74.6,47.1C-82.5,33.3,-87.3,18.1,-87.4,2.9C-87.5,-12.3,-82.9,-27.4,-74.4,-40.4C-65.9,-53.4,-53.6,-64.3,-40.1,-71.5C-26.6,-78.7,-13.3,-82.2,0.8,-83.5C14.8,-84.8,29.7,-84,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
            </div>

            <div className="relative max-w-4xl mx-auto text-center">
                <div key={testimonials[current]?.id} className="animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
                    {/* Header Title */}
                    <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-[#1B2936] opacity-60 mb-12">
                        {testimonials[current]?.title || 'Atelier Voice'}
                    </h4>

                    {/* Elegant Message - Serif */}
                    <p className="text-xl md:text-2xl font-display italic text-[#1B2936] max-w-2xl mx-auto mb-12 leading-relaxed px-4">
                        "{testimonials[current]?.content}"
                    </p>

                    {/* Name */}
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-6">
                        {testimonials[current]?.name}
                    </p>

                    {/* Stars */}
                    <div className="flex items-center gap-2 mb-16">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                fill={i < testimonials[current]?.rating ? '#E6C18B' : 'none'}
                                className={i < testimonials[current]?.rating ? 'text-[#E6C18B]' : 'text-gray-200'}
                                strokeWidth={1}
                            />
                        ))}
                    </div>

                    {/* Minimalist Navigation Icons */}
                    <div className="flex items-center justify-center gap-10 text-[#1B2936]/20">
                        <button onClick={prev} className="hover:text-[#D4AF37] transition-all transform hover:-translate-x-1">
                            <ChevronLeft size={20} strokeWidth={1.5} />
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black tracking-widest text-[#1B2936]">{current + 1} / {testimonials.length}</span>
                        </div>
                        <button onClick={next} className="hover:text-[#D4AF37] transition-all transform hover:translate-x-1">
                            <ChevronRight size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
