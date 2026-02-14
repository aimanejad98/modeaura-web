'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, ArrowRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/app/actions/inventory';
import { getMainCategories } from '@/app/actions/categories';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const { formatPrice } = useCurrency();

    // Load products & categories once when overlay opens
    useEffect(() => {
        if (isOpen && !loaded) {
            Promise.all([getProducts(), getMainCategories()]).then(([prods, cats]) => {
                setProducts(prods);
                setCategories(cats);
                setLoaded(true);
            });
        }
    }, [isOpen, loaded]);

    // Auto-focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Escape to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Filter products
    const results = query.trim().length >= 2
        ? products.filter(p => {
            const q = query.toLowerCase();
            return (
                p.name?.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.category?.name?.toLowerCase().includes(q) ||
                p.material?.toLowerCase().includes(q) ||
                p.color?.toLowerCase().includes(q)
            );
        }).slice(0, 8)
        : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
        onClose();
    };

    const handleCategoryClick = (catId: string) => {
        router.push(`/shop?category=${catId}`);
        onClose();
    };

    // Get first image from images string
    const getImage = (product: any) => {
        if (!product.images) return '/images/placeholder_luxury.png';
        const imgs = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
        return imgs[0] || '/images/placeholder_luxury.png';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Search Panel */}
            <div className="relative z-10 bg-white animate-in slide-in-from-top-4 fade-in duration-500 ease-out w-full max-h-[100dvh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex items-center gap-4 sm:gap-8">
                        {/* Search Icon */}
                        <Search size={20} className="text-[var(--gold)] shrink-0 hidden sm:block" strokeWidth={2} />

                        {/* Search Input */}
                        <form onSubmit={handleSubmit} className="flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="What are you looking for?"
                                className="w-full text-xl sm:text-3xl md:text-4xl font-display italic text-gray-900 placeholder:text-gray-300 bg-transparent border-none outline-none"
                            />
                        </form>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all group shrink-0"
                        >
                            <X size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
                        {/* When no query: Show quick links */}
                        {query.trim().length < 2 && (
                            <div className="space-y-10 sm:space-y-14">
                                {/* Quick Categories */}
                                <div>
                                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-5 sm:mb-8">
                                        Quick Links
                                    </h3>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        <button
                                            onClick={() => { router.push('/shop?filter=new'); onClose(); }}
                                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--gold)] transition-all"
                                        >
                                            New Arrivals
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id)}
                                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all border border-gray-100 hover:border-gray-200"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => { router.push('/shop'); onClose(); }}
                                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all border border-gray-100 hover:border-gray-200 flex items-center gap-2"
                                        >
                                            View All <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Trending / Popular Products */}
                                {products.length > 0 && (
                                    <div>
                                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-5 sm:mb-8 flex items-center gap-2">
                                            <TrendingUp size={14} /> Trending Now
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                                            {products.slice(0, 4).map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product.id)}
                                                    className="group text-left"
                                                >
                                                    <div className="aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 mb-3">
                                                        <img
                                                            src={getImage(product)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder_luxury.png'; }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 truncate">{product.name}</p>
                                                    <p className="text-[10px] sm:text-xs text-[var(--gold)] font-bold mt-1">{formatPrice(product.discountPrice || product.price)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* When typing: Show results */}
                        {query.trim().length >= 2 && (
                            <div>
                                {results.length > 0 ? (
                                    <>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 sm:mb-8">
                                            {results.length} Result{results.length > 1 ? 's' : ''}
                                        </p>
                                        <div className="space-y-3">
                                            {results.map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product.id)}
                                                    className="w-full flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all group text-left"
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 shrink-0">
                                                        <img
                                                            src={getImage(product)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder_luxury.png'; }}
                                                        />
                                                    </div>
                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900 truncate group-hover:text-[var(--gold)] transition-colors">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                                                            {product.category?.name} {product.color ? `• ${product.color}` : ''}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {product.discountPrice ? (
                                                                <>
                                                                    <span className="text-xs font-bold text-red-500">{formatPrice(product.discountPrice)}</span>
                                                                    <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs font-bold text-gray-900">{formatPrice(product.price)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Arrow */}
                                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-all shrink-0" />
                                                </button>
                                            ))}
                                        </div>

                                        {/* See all results button */}
                                        <button
                                            onClick={handleSubmit as any}
                                            className="mt-6 sm:mt-8 w-full py-4 sm:py-5 bg-gray-900 hover:bg-[var(--gold)] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] rounded-xl sm:rounded-2xl transition-all"
                                        >
                                            See All Results for "{query}"
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-16 sm:py-24">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                                            <Search size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm sm:text-base font-display italic text-gray-400 mb-2">
                                            No results for "{query}"
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                            Try adjusting your search or browse our collections
                                        </p>
                                        <button
                                            onClick={() => { router.push('/shop'); onClose(); }}
                                            className="mt-6 sm:mt-8 px-8 py-3 sm:py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[var(--gold)] transition-all"
                                        >
                                            Browse All Products
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
