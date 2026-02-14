'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { getProducts } from '@/app/actions/inventory';
import Price from './Price';

export default function TrendingCollection() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const allProducts = await getProducts();

                // Group products by name to avoid duplicates and collect sizes
                const groupedProducts = allProducts.reduce((acc: any, p: any) => {
                    if (!acc[p.name]) {
                        acc[p.name] = {
                            ...p,
                            availableSizes: new Set([p.size]),
                            allVariants: [p]
                        };
                    } else {
                        acc[p.name].availableSizes.add(p.size);
                        acc[p.name].allVariants.push(p);
                        // Use the newest one for the main display properties if needed
                        if (new Date(p.createdAt) > new Date(acc[p.name].createdAt)) {
                            acc[p.name].createdAt = p.createdAt;
                            acc[p.name].isNewArrival = acc[p.name].isNewArrival || p.isNewArrival;
                        }
                    }
                    return acc;
                }, {});

                const uniqueProducts = Object.values(groupedProducts).map((p: any) => ({
                    ...p,
                    availableSizes: Array.from(p.availableSizes).filter(Boolean).sort()
                }));

                const filteredArrivals = uniqueProducts.filter((p: any) => p.isNewArrival);

                // Sort by newest first
                const sorted = filteredArrivals.sort((a: any, b: any) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setProducts(sorted.slice(0, 4));
            } catch (error) {
                console.error('Failed to load collection:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="py-24 px-6 bg-[#fcfaf7]">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div className="space-y-4">
                        <h5 className="text-[var(--gold)] font-black uppercase tracking-[0.5em] text-[10px]">New Arrivals</h5>
                        <h2 className="text-4xl md:text-5xl font-display font-medium italic text-[var(--brand-navy)]">Latest Collection</h2>
                    </div>
                    <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                        View All Collections <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group relative flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f8f5f0]">
                                <img
                                    src={product.images?.split(',')[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                {product.isNewArrival && (
                                    <span className="absolute left-4 top-4 bg-[var(--gold)] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                        New
                                    </span>
                                )}

                                {/* Hover Overlay: Available Sizes */}
                                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Select Size</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.availableSizes.map((size: string) => (
                                                <button
                                                    key={size}
                                                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-black text-white hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all"
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                        <button className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--gold)] hover:text-white transition-all mt-2">
                                            <ShoppingBag size={14} /> Quick Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--brand-navy)] group-hover:text-[var(--gold)] transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest">
                                    {product.category?.name}
                                </p>
                                <Price amount={product.price} className="text-sm font-display italic text-[var(--brand-navy)] font-bold pt-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
