'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
    {
        question: "What is an abaya?",
        answer: "An abaya is a simple, loose over-garment, essentially a robe-like dress, worn by many women in the Muslim world. It is a symbol of modesty and can range from simple everyday designs to highly decorative, tailored atelier pieces."
    },
    {
        question: "Why buy abayas from Mode AURA vs. other shops?",
        answer: "Mode AURA focuses on 'Sophistication without Compromise'. Our pieces are architectural statements of grace, using premium materials and artisanal tailoring that you won't find in mass-produced collections. We prioritize fit, fabric longevity, and the modern aesthetic."
    },
    {
        question: "What materials are your abayas made from?",
        answer: "We source only the finest fabrics including premium Nida, luxury Crepe, Silk blends, and lightweight Chiffon. Each material is selected for its breathability, drape, and premium feel against the skin."
    },
    {
        question: "Are your abayas available in different colours?",
        answer: "Yes, while we specialize in timeless neutrals and deep botanical tones, many of our bespoke and core collections are available in a variety of curated shades. Check the product options for specific availability."
    },
    {
        question: "How should I care for my abaya?",
        answer: "To maintain the quality of the premium fabrics, we recommend hand washing or using a delicate machine cycle in cold water. Always air dry away from direct sunlight and use a cool iron or garment steamer."
    },
    {
        question: "How do I choose the right size abaya?",
        answer: "Abaya sizing is typically based on length in inches. Measure from the top of your shoulder down to your ankle or where you want the hem to sit. Our size guide on each product page provides detailed measurements to ensure a perfect fit."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-3xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h5 className="text-[var(--gold)] font-black uppercase tracking-[0.5em] text-[10px]">Information</h5>
                    <h2 className="text-3xl md:text-5xl font-display font-medium italic text-[var(--brand-navy)] uppercase tracking-wider">Abaya FAQs</h2>
                </div>

                <div className="border-t border-[var(--mocha-border)]">
                    {FAQS.map((faq, index) => (
                        <div key={index} className="border-b border-[var(--mocha-border)]">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full py-8 flex items-center justify-between text-left group"
                            >
                                <span className={`text-[12px] md:text-sm font-bold tracking-widest uppercase transition-colors duration-500 ${openIndex === index ? 'text-[var(--gold)]' : 'text-[var(--text-primary)] group-hover:text-[var(--gold)]'}`}>
                                    {faq.question}
                                </span>
                                <div className={`transition-transform duration-500 ${openIndex === index ? 'rotate-180 text-[var(--gold)]' : 'text-[var(--text-muted)]'}`}>
                                    {openIndex === index ? <Minus size={18} strokeWidth={1} /> : <Plus size={18} strokeWidth={1} />}
                                </div>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-700 ease-in-out ${openIndex === index ? 'max-h-[300px] pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="text-xs md:text-[13px] leading-relaxed text-[var(--text-secondary)] max-w-2xl font-medium">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
