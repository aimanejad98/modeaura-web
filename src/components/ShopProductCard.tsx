'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import Price from '@/components/Price'
import { useWishlist } from '@/context/WishlistContext'

interface Variant {
    id: string
    size: string | null
    color: string | null
    images: string
    price: number
    stock: number
}

interface ProductCardProps {
    product: any // Grouped product
}

export default function ShopProductCard({ product }: ProductCardProps) {
    const variants: Variant[] = product.allVariants || []

    // Get unique colors and their representative variants
    const colorMap = new Map<string, Variant>()
    variants.forEach(v => {
        if (v.color && !colorMap.has(v.color.toLowerCase())) {
            colorMap.set(v.color.toLowerCase(), v)
        }
    })

    const availableColors = Array.from(colorMap.keys())
    const [activeColor, setActiveColor] = useState<string | null>(
        product.color ? product.color.toLowerCase() : (availableColors[0] || null)
    )

    const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const activeVariant = activeColor ? colorMap.get(activeColor) : variants[0]

    // Safely get display image
    const variantImages = activeVariant?.images ? activeVariant.images.split(',').filter(Boolean) : []
    const productImages = product.images ? product.images.split(',').filter(Boolean) : []
    const displayImage = variantImages[0] || productImages[0] || '/images/placeholder_luxury.png'

    const isSaved = isInWishlist(product.id)

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isSaved) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: displayImage,
                category: product.category?.name
            })
        }
    }

    return (
        <div className="group flex flex-col h-full bg-white transition-all duration-700 relative">
            {/* Image Area */}
            <Link href={`/product/${activeVariant?.id || product.id}`} className="aspect-[3/4] relative overflow-hidden bg-[#F9F6F1] rounded-2xl">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
                />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNewArrival && (
                        <div className="bg-[#D4AF37] text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-md shadow-[#D4AF37]/20 border border-white/20">
                            New Arrival
                        </div>
                    )}
                    {product.stock === 0 && (
                        <div className="bg-gray-900 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-md border border-white/10">
                            Sold Out
                        </div>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isSaved
                        ? 'bg-[var(--gold)] text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-md text-gray-400 hover:text-[var(--gold)] hover:bg-white'
                        }`}
                >
                    <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} className={isSaved ? 'animate-pulse' : ''} />
                </button>
            </Link>

            {/* Info Area */}
            <div className="pt-6 pb-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 text-left">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                            {product.category?.name || 'Collection'}
                        </p>
                        <Link href={`/product/${activeVariant?.id || product.id}`}>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#D4AF37] transition-colors leading-relaxed">
                                {product.name}
                                {activeColor && <span className="text-gray-400 font-normal"> — {activeColor}</span>}
                            </h3>
                        </Link>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    {(() => {
                        const effectiveDiscount = product.discountPrice || (
                            product.sale
                                ? product.sale.type === 'Percentage'
                                    ? product.price * (1 - product.sale.value / 100)
                                    : product.price - product.sale.value
                                : null
                        );
                        return effectiveDiscount ? (
                            <div className="flex items-center gap-2">
                                <Price amount={effectiveDiscount} className="text-sm font-bold text-red-500" />
                                <Price amount={product.price} className="text-[10px] text-gray-400 line-through" />
                            </div>
                        ) : (
                            <Price amount={product.price} className="text-sm font-bold text-gray-900" />
                        );
                    })()}

                    {/* Size Summary */}
                    <div className="flex gap-1.5">
                        {product.availableSizes?.slice(0, 3).map((size: string) => (
                            <span key={size} className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">{size}</span>
                        ))}
                    </div>
                </div>

                {/* Color Selection - Discrete */}
                {availableColors.length > 1 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {availableColors.map(color => (
                            <button
                                key={color}
                                onClick={() => setActiveColor(color)}
                                className={`w-3.5 h-3.5 rounded-full border transition-all ${activeColor === color
                                    ? 'border-gray-900 ring-1 ring-gray-900 ring-offset-2 scale-110'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
