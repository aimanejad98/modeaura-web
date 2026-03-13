'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '@/app/actions/categories';
import { getProducts } from '@/app/actions/inventory';

function CategoryCard({ category }: { category: any }) {
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (!category.displayImages || category.displayImages.length <= 1) return;
        const interval = setInterval(() => {
            setImageIndex((prev) => (prev + 1) % category.displayImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [category.displayImages]);

    const hasImages = category.displayImages && category.displayImages.length > 0;

    return (
        <Link
            href={category.isKidsVirtual ? `/shop?kids=true` : `/shop?category=${category.id}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#FAF7F2] shadow-sm hover:shadow-2xl transition-all duration-700"
        >
            {/* Background Images with Crossfade effect */}
            {hasImages ? (
                category.displayImages.map((img: string, idx: number) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`${category.name} preview ${idx}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-110 group-hover:duration-[2000ms] ${idx === imageIndex ? 'opacity-100 relative' : 'opacity-0'
                            }`}
                    />
                ))
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
    );
}

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

                // Option A: Extract main categories that have been explicitly toggled to show on homepage
                let mainCats = allCats.filter((c: any) => !c.parentId && c.showOnHome);

                // Fallback: If no categories are explicitly selected yet, just pick the top 3
                if (mainCats.length === 0) {
                    mainCats = allCats.filter((c: any) => !c.parentId).slice(0, 3);
                }

                // Enhance categories with a rotation array of images
                const enhancedCats = mainCats.map((cat: any) => {
                    // Find all products in this category or its subcategories
                    const subcatIds = allCats.filter((c: any) => c.parentId === cat.id).map((c: any) => c.id);
                    const categoryProducts = allProducts.filter((p: any) =>
                        (p.categoryId === cat.id || subcatIds.includes(p.categoryId)) && p.images
                    );

                    let imagesToCycle: string[] = [];
                    if (cat.image) imagesToCycle.push(cat.image); // Start with featured image

                    const productImages = categoryProducts.flatMap((p: any) => p.images.split(',').filter(Boolean));
                    const uniqueProductImages = Array.from(new Set(productImages)) as string[];

                    // Shuffle product images and take up to 4 extra ones
                    const shuffled = uniqueProductImages.sort(() => 0.5 - Math.random());
                    imagesToCycle = Array.from(new Set([...imagesToCycle, ...shuffled.slice(0, 4)]));

                    return {
                        ...cat,
                        displayImages: imagesToCycle
                    };
                });

                // Always add Kids as a virtual category for visibility
                const kidsProductsList = allProducts.filter((p: any) => p.isKids && p.images);
                const kidsImages = Array.from(new Set(kidsProductsList.flatMap((p: any) => p.images.split(',').filter(Boolean)))) as string[];

                enhancedCats.push({
                    id: 'kids-virtual',
                    name: 'Kids',
                    displayImages: kidsImages.length > 0 ? kidsImages.slice(0, 5) : ['/images/luxury-gold-vibrance.png'],
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
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </section>
    );
}
