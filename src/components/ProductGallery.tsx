'use client'

import { useState } from 'react'

interface ProductGalleryProps {
    images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(images[0] || '')

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[4/5] bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
                <span className="text-4xl">📦</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide py-2">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[var(--gold)]' : 'border-transparent hover:border-gray-300'
                            }`}
                    >
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative group">
                <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 shadow-sm">
                    <img
                        src={activeImage}
                        alt="Product Main View"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                {/* Floating Indicators for Mobile */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${images.indexOf(activeImage) === i ? 'w-4 bg-[var(--gold)]' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
