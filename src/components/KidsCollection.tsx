'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { getProducts } from '@/app/actions/inventory';
import Price from './Price';

export default function KidsCollection() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const allProducts = await getProducts();

                // Filter for Kids products and group by name to avoid duplicates
                const kidsProducts = allProducts.filter((p: any) => p.isKids);

                const groupedProducts = kidsProducts.reduce((acc: any, p: any) => {
                    if (!acc[p.name]) {
                        acc[p.name] = {
                            ...p,
                            availableSizes: new Set([p.size]),
                            allVariants: [p]
                        };
                    } else {
                        acc[p.name].availableSizes.add(p.size);
                        acc[p.name].allVariants.push(p);
                    }
                    return acc;
                }, {});

                const uniqueKids = Object.values(groupedProducts).map((p: any) => ({
                    ...p,
                    availableSizes: Array.from(p.availableSizes).filter(Boolean).sort()
                }));

                // Sort by newest first
                const sorted = uniqueKids.sort((a: any, b: any) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setProducts(sorted.slice(0, 4));
            } catch (error) {
                console.error('Failed to load kids collection:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-px bg-[var(--gold)]"></span>
                            <h5 className="text-[var(--gold)] font-black uppercase tracking-[0.5em] text-[10px]">Atelier Fresh</h5>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-display font-medium italic text-[var(--brand-navy)] leading-tight">
                            New Arrivals <br />
                            <span className="text-[var(--gold)]">Collection</span>
                        </h2>
                    </div>
                    <Link
                        href="/shop?kids=true"
                        className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--brand-navy)] hover:text-[var(--gold)] transition-all bg-[#F8F5F0] px-8 py-4 rounded-full"
                    >
                        Explore Line <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group relative flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                            style={{ animationDelay: `${index * 200}ms` }}
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#f8f5f0] shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                <img
                                    src={product.images?.split(',')[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {product.isNewArrival && (
                                    <span className="absolute left-8 top-8 bg-white/90 backdrop-blur-md text-[var(--brand-navy)] text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-[var(--gold)]/20">
                                        Atelier New
                                    </span>
                                )}

                                {/* Quick Add Hover Side Drawer effect placeholder */}
                                <div className="absolute right-6 bottom-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[var(--brand-navy)] shadow-xl hover:bg-[var(--gold)] hover:text-white transition-colors cursor-pointer">
                                        <ShoppingBag size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-2 px-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--brand-navy)] group-hover:text-[var(--gold)] transition-colors">
                                    {product.name}
                                </h3>
                                <div className="h-px w-6 bg-[var(--gold)]/30 group-hover:w-12 transition-all duration-700"></div>
                                <Price
                                    amount={product.price}
                                    className="text-2xl font-display font-medium italic text-[var(--brand-navy)] pt-1"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
