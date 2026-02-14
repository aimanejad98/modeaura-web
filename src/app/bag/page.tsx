'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import Price from '@/components/Price';

export default function BagPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

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
                            <span className="text-[#B45309]">The Bag</span>
                        </nav>
                        <h1 className="text-5xl md:text-6xl font-display font-medium italic text-[#1B2936]">Your Selection</h1>
                    </div>

                    {cart.length === 0 ? (
                        <div className="py-32 text-center space-y-8">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-gray-200">
                                <ShoppingBag size={48} strokeWidth={1} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-display italic text-[#1B2936]">Your bag is empty</p>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                                    Pieces from our latest collection are waiting to be part of your sanctuary.
                                </p>
                            </div>
                            <Link href="/shop" className="inline-flex items-center gap-3 bg-[var(--brand-navy)] text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                                Explore Collection <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            {/* Items List */}
                            <div className="lg:col-span-8 space-y-8">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.variant}`} className="flex gap-8 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm group">
                                        <div className="w-32 h-40 bg-[#FAF9F6] rounded-2xl overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-display italic text-[#1B2936]">{item.name}</h3>
                                                    {item.variant && (
                                                        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Variant: {item.variant}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} strokeWidth={1.5} />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-6 bg-[#FAF9F6] p-2 rounded-xl">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1B2936] transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-xs font-black text-[#1B2936] w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1B2936] transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <Price amount={item.price * item.quantity} className="text-lg font-bold text-[#1B2936]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Card */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#1B2936] text-white p-10 rounded-[3rem] space-y-10 sticky top-48 shadow-2xl">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-display italic">Atelier Summary</h2>
                                        <p className="text-xs text-white/40 leading-relaxed font-medium">
                                            Hand-packaged with care from our Windsor Atelier. Final shipping and duties calculated at checkout.
                                        </p>
                                    </div>

                                    <div className="space-y-6 border-t border-white/10 pt-10">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                                            <span>Subtotal ({cartCount} Items)</span>
                                            <Price amount={cartTotal} />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                                            <span>Standard Delivery</span>
                                            <span className="text-[var(--gold)]">FREE</span>
                                        </div>

                                        <div className="border-t border-white/10 pt-6 flex justify-between items-baseline">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total Value</span>
                                            <Price amount={cartTotal} className="text-4xl font-display italic text-[var(--gold)]" />
                                        </div>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className="w-full flex items-center justify-center gap-3 bg-white text-[#1B2936] py-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--gold)] hover:text-white transition-all group"
                                    >
                                        Proceed to Checkout <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                    </Link>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-3 opacity-40">
                                            <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">SECURE PAYMENTS</span>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-40">
                                            <div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full" />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">HAND-PACKAGED IN WINDSOR</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
