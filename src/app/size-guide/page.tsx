'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SizeGuidePage() {
    const abayaSizes = [
        { height: '4\' 9" / 145cm', standard: '52', plus: 'NA' },
        { height: '4\' 10" / 147cm', standard: '52', plus: 'NA' },
        { height: '4\' 11" / 150cm', standard: '52', plus: 'NA' },
        { height: '5\' 0" / 152cm', standard: '52', plus: 'NA' },
        { height: '5\' 1" / 155cm', standard: '52/54', plus: 'NA' },
        { height: '5\' 2" / 157cm', standard: '54', plus: 'NA' },
        { height: '5\' 3" / 160cm', standard: '54/56', plus: 'NA' },
        { height: '5\' 4" / 163cm', standard: '56', plus: 'NA' },
        { height: '5\' 5" / 165cm', standard: '56/58', plus: '58' },
        { height: '5\' 6" / 168cm', standard: '58', plus: '58/60' },
        { height: '5\' 7" / 170cm', standard: '58/60', plus: '60' },
        { height: '5\' 8" / 173cm', standard: '60', plus: '60/62' },
        { height: '5\' 9" / 175cm', standard: '60/62', plus: '62' },
        { height: '5\' 10" / 178cm', standard: '62', plus: '62' },
    ];

    const dressMeasurements = [
        { label: 'Bust (Inches/Cm)', x: '31/78.5', s1: '32/81', s2: '34/86', m: '36/91', l: '38/96' },
        { label: 'Waist (Inches/Cm)', x: '24/60', s1: '26/66', s2: '28/71', m: '30/76', l: '31/78' },
        { label: 'Hips (Inches/Cm)', x: '34/86', s1: '35/88.5', s2: '37/93.5', m: '39/99', l: '41/104' },
        { label: 'Shoulder to Shoulder (Inches/Cm)', x: '12.9/33', s1: '13.7/35', s2: '14.5/37', m: '15.3/39', l: '15.7/40' },
        { label: 'Sleeve Length (Inches/Cm)', x: '24/61.2', s1: '24.2/61.5', s2: '24.4/62.1', m: '24.6/62.7', l: '24.9/63.3' },
    ];

    const conversions = [
        { label: 'UK', x: '6', s1: '8', s2: '10', m: '12', l: '14' },
        { label: 'EUROPEAN', x: '34', s1: '36', s2: '38', m: '40', l: '42' },
        { label: 'CANADA / US', x: '2', s1: '4', s2: '6', m: '8', l: '10' },
        { label: 'AUSTRALIA', x: '6', s1: '8', s2: '10', m: '12', l: '14' },
    ];

    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-5xl mx-auto px-6 space-y-24">
                {/* Header */}
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#D4AF37]/40">/</span>
                        <span className="text-[#D4AF37]">Size Precision</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#D4AF37] font-black uppercase tracking-[0.5em] text-[10px]">Atelier Precision</h5>
                        <h1 className="text-5xl md:text-7xl font-display font-medium italic text-[#1B2936]">Sizing Guide</h1>
                        <p className="text-[#1B2936]/60 text-sm max-w-xl mx-auto leading-relaxed italic">
                            To ensure the perfect architectural fit, please refer to our curated measurements below. All charts include Canada, US, and International standards.
                        </p>
                    </div>
                </div>

                {/* Abaya Section */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-display italic text-[#1B2936]">What is my abaya size?</h2>
                        <p className="text-xs text-[#1B2936]/50 mt-2 uppercase tracking-widest">Recommended by Height</p>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-[var(--mocha-border)] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-[#FAF9F6] border-b border-[var(--mocha-border)]">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936]">Height (Feet & Inches/CM)</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">Standard Size (UK 4-16 / EU 32-44 / CA 2-14)</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">Curvy Size (UK 16-20 / EU 44-48 / CA 14-18)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--mocha-border)]/50">
                                    {abayaSizes.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                                            <td className="px-8 py-4 text-xs font-bold text-[#1B2936]/70">{s.height}</td>
                                            <td className="px-8 py-4 text-xs font-black text-[var(--gold)] text-center">{s.standard}</td>
                                            <td className="px-8 py-4 text-xs font-medium text-[#1B2936]/40 text-center">{s.plus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-[#1B2936]/40 italic">
                        If you will be wearing heels with your abaya, we recommend buying one size up.
                    </p>
                </div>

                {/* Dress Section */}
                <div className="space-y-12 pt-12 border-t border-[var(--mocha-border)]/30">
                    <div className="text-center">
                        <h2 className="text-2xl font-display italic text-[#1B2936]">What is my dress size?</h2>
                        <p className="text-xs text-[#1B2936]/50 mt-2 uppercase tracking-widest">Garment Measurements</p>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-[var(--mocha-border)] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className="bg-[#FAF9F6] border-b border-[var(--mocha-border)]">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936]">Measurement</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">X</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">S1</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">S2</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">M</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--mocha-border)]/50">
                                    {dressMeasurements.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                                            <td className="px-8 py-5 text-xs font-bold text-[#1B2936]/70">{m.label}</td>
                                            <td className="px-8 py-5 text-xs font-medium text-[#1B2936]/60 text-center">{m.x}</td>
                                            <td className="px-8 py-5 text-xs font-medium text-[#1B2936]/60 text-center">{m.s1}</td>
                                            <td className="px-8 py-5 text-xs font-medium text-[#1B2936]/60 text-center">{m.s2}</td>
                                            <td className="px-8 py-5 text-xs font-medium text-[#1B2936]/60 text-center">{m.m}</td>
                                            <td className="px-8 py-5 text-xs font-medium text-[#1B2936]/60 text-center">{m.l}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-[var(--mocha-border)] overflow-hidden shadow-sm mt-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className="bg-[#FAF9F6] border-b border-[var(--mocha-border)]">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936]">Conversion</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">X</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">S1</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">S2</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">M</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#1B2936] text-center">L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--mocha-border)]/50">
                                    {conversions.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                                            <td className="px-8 py-5 text-xs font-bold text-[#1B2936]/70">{c.label}</td>
                                            <td className="px-8 py-5 text-xs font-black text-[var(--gold)] text-center">{c.x}</td>
                                            <td className="px-8 py-5 text-xs font-black text-[var(--gold)] text-center">{c.s1}</td>
                                            <td className="px-8 py-5 text-xs font-black text-[var(--gold)] text-center">{c.s2}</td>
                                            <td className="px-8 py-5 text-xs font-black text-[var(--gold)] text-center">{c.m}</td>
                                            <td className="px-8 py-5 text-xs font-black text-[var(--gold)] text-center">{c.l}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Bottom Assistance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[var(--mocha-border)]/30">
                    <div className="bg-white p-12 rounded-[2rem] space-y-6 border border-[var(--mocha-border)]">
                        <h3 className="text-xl font-display italic text-[#1B2936]">How to Measure</h3>
                        <div className="space-y-4 text-xs text-[#1B2936]/60 leading-relaxed uppercase tracking-wider font-bold">
                            <p className="flex justify-between border-b border-gray-100 pb-2"><span>Length:</span> <span className="text-[#1B2936]">Shoulder to floor</span></p>
                            <p className="flex justify-between border-b border-gray-100 pb-2"><span>Sleeve:</span> <span className="text-[#1B2936]">Shoulder to wrist</span></p>
                            <p className="flex justify-between border-b border-gray-100 pb-2"><span>Silhouette:</span> <span className="text-[#1B2936]">Loose Flowing Fit</span></p>
                        </div>
                    </div>
                    <div className="bg-[#1B2936] p-12 rounded-[2rem] space-y-6 flex flex-col justify-center shadow-xl">
                        <p className="text-sm italic text-white/80 leading-relaxed">
                            "If you require any further assistance with the sizing, please contact us to clarify."
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--gold)]">— THE MODE AURA CONCIERGE</p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
