'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

const posts = [
    {
        id: '1',
        title: 'The Art of Silk: Choosing the Perfect Fabric',
        category: 'Craftsmanship',
        date: 'Jan 24, 2026',
        image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop',
        excerpt: 'Dive deep into the world of premium silks used in our latest collection...'
    },
    {
        id: '2',
        title: 'Minimalism in Modest Fashion',
        category: 'Lifestyle',
        date: 'Jan 20, 2026',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
        excerpt: 'How to achieve architectural grace with simple, monochromatic palettes.'
    },
    {
        id: '3',
        title: 'New Season: The Winter Atelier',
        category: 'Collection',
        date: 'Jan 15, 2026',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        excerpt: 'A preview of the textures and silhouettes defining our winter sanctuary.'
    }
];

export default function BlogPage() {
    return (
        <main className="pt-64 pb-24 bg-[#FAF9F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                <div className="space-y-12">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">The Journal</span>
                    </nav>

                    <div className="text-center space-y-6">
                        <h5 className="text-[#B45309] font-black uppercase tracking-[0.5em] text-[10px]">The Journal</h5>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">AURA Insights</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {posts.map((post) => (
                        <div key={post.id} className="group cursor-pointer space-y-8">
                            <div className="aspect-[4/5] bg-[#FAF9F6] rounded-[2rem] overflow-hidden relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                                />
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[var(--gold)]">
                                    {post.category}
                                </div>
                            </div>
                            <div className="space-y-4 px-2">
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{post.date}</p>
                                <h3 className="text-2xl font-display italic text-[var(--brand-navy)] group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--gold)] border-b border-[var(--gold)] pb-1 pt-4 hover:tracking-[0.4em] transition-all">
                                    Read Article
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
