'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '@/app/actions/categories';
import { getProducts } from '@/app/actions/inventory';

export default function CategoryGrid() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [allCats, allProducts] = await Promise.all([
                    getCategories(),
                    getProducts()
                ]);

                // Filter for main categories
                const mainCats = allCats.filter((c: any) => !c.parentId).slice(0, 6);

                // Enhance categories with a random sample image from their products if missing
                const enhancedCats = mainCats.map((cat: any) => {
                    if (cat.image) return cat;

                    // Find all products in this category or its subcategories
                    const subcatIds = allCats.filter((c: any) => c.parentId === cat.id).map((c: any) => c.id);
                    const categoryProducts = allProducts.filter((p: any) =>
                        p.categoryId === cat.id || subcatIds.includes(p.categoryId)
                    );

                    if (categoryProducts.length > 0) {
                        // Pick a random product
                        const randomProduct = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
                        if (randomProduct.images) {
                            return { ...cat, image: randomProduct.images.split(',')[0] };
                        }
                    }
                    return cat;
                });

                // Always add Kids as a virtual category for visibility
                enhancedCats.push({
                    id: 'kids-virtual',
                    name: 'Kids',
                    image: allProducts.find((p: any) => p.isKids)?.images?.split(',')[0] || '/images/luxury-gold-vibrance.png',
                    isKidsVirtual: true
                });

                setCategories(enhancedCats);
            } catch (err) {
                console.error('Failed to load categories for grid:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="py-24 max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    return (
        <section className="py-24 px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h5 className="text-[var(--gold)] font-black uppercase tracking-[0.6em] text-[10px]">Curated Selection</h5>
                <h2 className="text-4xl md:text-5xl font-display font-medium italic text-[var(--text-primary)]">Shop by Category</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={category.isKidsVirtual ? `/shop?kids=true` : `/shop?category=${category.id}`}
                        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#FAF7F2] shadow-sm hover:shadow-2xl transition-all duration-700"
                    >
                        {/* Background Image with Zoom Effect */}
                        {category.image ? (
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--mocha-border)]/20">
                                <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">{category.name}</span>
                            </div>
                        )}

                        {/* Sophisticated Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center text-white">
                            <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <h3 className="text-xl md:text-2xl font-display font-medium italic tracking-wide uppercase">
                                    {category.name}
                                </h3>
                                <div className="h-px w-8 bg-[var(--gold)] mx-auto opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:w-16"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-60 transition-all duration-700 block pt-2">
                                    View Collection
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
