'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

interface BagControlsProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string;
        color?: string;
        size?: string;
        material?: string;
        stock: number;
    };
    effectivePrice?: number; // discounted price if applicable
}

export default function BagControls({ product, effectivePrice }: BagControlsProps) {
    const finalPrice = effectivePrice || product.price;
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        setIsAdding(true);
        addToCart({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: product.images.split(',')[0],
            quantity: quantity,
            sku: (product as any).sku,
            variant: product.color && product.size ? `${product.color} / ${product.size}` : product.color || product.size,
            stock: product.stock
        });

        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="flex-1 bg-white border-2 border-gray-100 rounded-2xl h-16 flex items-center justify-between px-6 relative group">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-xl font-bold text-gray-400 hover:text-gray-900 flex-shrink-0"
                    >
                        <Minus size={18} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-gray-900">{quantity}</span>
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap border border-red-200 uppercase tracking-wide">
                                Only {product.stock} Left!
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="text-xl font-bold text-gray-400 hover:text-gray-900 flex-shrink-0 disabled:opacity-50"
                        disabled={quantity >= product.stock}
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={isAdding || product.stock === 0}
                    className={`flex-[2] h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${isAdding
                        ? 'bg-[var(--gold)] text-white shadow-[#D4AF37]/20'
                        : product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                        }`}
                >
                    {isAdding ? (
                        <>Added to Bag!</>
                    ) : (
                        <>
                            <ShoppingBag size={18} />
                            Add to Bag
                        </>
                    )}
                </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-2">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    <span>Free Shipping Progress</span>
                    <span>$250.00 Limit</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--gold)] transition-all duration-1000"
                        style={{ width: `${Math.min((finalPrice * quantity / 250) * 100, 100)}%` }}
                    />
                </div>
                <p className="text-[9px] font-bold text-center mt-2 text-gray-500 uppercase">
                    {(finalPrice * quantity) >= 250
                        ? "You've earned free shipping! 🎉"
                        : `Add $${(250 - (finalPrice * quantity)).toFixed(2)} more for free delivery`}
                </p>
            </div>
        </div>
    );
}
