'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Price from '@/components/Price';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToBag = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        });
        removeFromWishlist(item.id);
    };

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-64 pb-24">
                <div className="space-y-12">
                    {/* Header */}
                    <div className="space-y-6">
                        <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                            <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                            <span className="text-[#B45309]/40">/</span>
                            <span className="text-[#B45309]">Wishlist</span>
                        </nav>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Your Desires</h1>
                    </div>

                    {wishlist.length === 0 ? (
                        <div className="py-32 text-center space-y-8">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-gray-200">
                                <Heart size={48} strokeWidth={1} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-display italic text-[#1B2936]">Your wishlist is currently empty</p>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                                    Curate your personal collection of luxury pieces to revisit them at your leisure.
                                </p>
                            </div>
                            <Link href="/shop" className="inline-flex items-center gap-3 bg-[var(--brand-navy)] text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                                Explore Collection <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {wishlist.map((item) => (
                                <div key={item.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                                        <div className="space-y-2 text-center">
                                            {item.category && (
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--gold)]">{item.category}</p>
                                            )}
                                            <h3 className="text-2xl font-display italic text-[#1B2936]">{item.name}</h3>
                                            <Price amount={item.price} className="text-lg font-bold text-[#1B2936]" />
                                        </div>

                                        <button
                                            onClick={() => handleMoveToBag(item)}
                                            className="w-full bg-[#1B2936] text-white py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={14} /> Add to Bag
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
