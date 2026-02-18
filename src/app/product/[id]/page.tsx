import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductGallery from '@/components/ProductGallery'
import Link from 'next/link'
import BagControls from '@/components/BagControls'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, sale: true }
    }) as any

    if (!product) notFound()

    // Fetch all variants of this product line
    const variants = await prisma.product.findMany({
        where: { name: product.name },
        select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            sku: true,
            price: true
        }
    })

    // Group variants by color and size
    const availableColors = Array.from(new Set(variants.map((v: { color: string | null }) => v.color).filter(Boolean))) as string[]
    const availableSizes = Array.from(new Set(variants.map((v: { size: string | null }) => v.size).filter(Boolean))) as string[]

    // Fetch popular add-ons (Hijabs / Accessories)
    const addons = await prisma.product.findMany({
        where: {
            category: {
                name: { in: ['HIJABS', 'ACCESSORIES', 'SCARFS', 'BAGS'] }
            },
            NOT: [
                { id: product.id },
                { name: product.name }
            ]
        },
        take: 3
    })

    // Fetch similar products (Same Category or Parent Category if empty)
    let similarProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            NOT: [
                { id: product.id },
                { name: product.name }
            ]
        },
        take: 4
    })

    if (similarProducts.length < 2 && product.category.parentId) {
        // Find other products in the same parent category
        const siblingProducts = await prisma.product.findMany({
            where: {
                category: {
                    parentId: product.category.parentId
                },
                NOT: [
                    { id: product.id },
                    { name: product.name }
                ]
            },
            take: 4 - similarProducts.length
        })

        // Merge without duplicates by name
        const names = new Set(similarProducts.map(p => p.name));
        siblingProducts.forEach(p => {
            if (!names.has(p.name)) {
                similarProducts.push(p);
                names.add(p.name);
            }
        });
    }

    // Final deduplication by name just in case
    const uniqueSimilar = [];
    const seenNames = new Set();
    for (const p of similarProducts) {
        if (!seenNames.has(p.name)) {
            uniqueSimilar.push(p);
            seenNames.add(p.name);
        }
    }
    similarProducts = uniqueSimilar.slice(0, 4);

    const images = product.images ? product.images.split(',') : []

    // Compute effective discount price from either discountPrice field or sale campaign
    const effectiveDiscount = product.discountPrice || (
        product.sale
            ? product.sale.type === 'Percentage'
                ? product.price * (1 - product.sale.value / 100)
                : product.price - product.sale.value
            : null
    );

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 pt-64 md:pt-72 pb-24">
                {/* Breadcrumbs */}
                <nav className="flex items-center justify-start gap-2 text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-12">
                    <Link href="/" className="hover:text-[#1B2936]">Home</Link>
                    <span className="text-[#B45309]/40">/</span>
                    <Link href="/shop" className="hover:text-[#1B2936]">Shop</Link>
                    <span className="text-[#B45309]/40">/</span>
                    <Link href={`/shop?category=${product.categoryId}`} className="hover:text-[#1B2936]">{product.category.name}</Link>
                    <span className="text-[#B45309]/40">/</span>
                    <span className="text-[#B45309]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Gallery */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={images} />
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-display font-medium text-[var(--text-primary)] italic leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-sm text-[#374151] font-bold mt-2 uppercase tracking-tighter">SKU: {product.sku}</p>
                            </div>
                            {product.isNewArrival && (
                                <span className="bg-[var(--gold)] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">New Arrival</span>
                            )}
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            {effectiveDiscount ? (
                                <>
                                    <span className="text-3xl font-display font-medium text-red-500">${effectiveDiscount.toFixed(2)}</span>
                                    <span className="text-xl text-gray-300 line-through">${product.price.toFixed(2)}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-3 py-1 rounded-full">
                                        Save ${(product.price - effectiveDiscount).toFixed(0)}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl font-display font-medium text-[var(--gold)]">${product.price.toFixed(2)}</span>
                                    {product.comparePrice && (
                                        <span className="text-xl text-gray-300 line-through">${product.comparePrice.toFixed(2)}</span>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="space-y-8">
                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Color Selection</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.map((color: string) => {
                                            const variant = variants.find((v: { color: string | null }) => v.color === color)
                                            const isActive = product.color === color
                                            return (
                                                <Link
                                                    key={color}
                                                    href={`/product/${variant?.id}`}
                                                    className={`px-4 py-2 border-2 rounded-full text-[10px] font-bold transition-all ${isActive
                                                        ? 'border-[var(--gold)] bg-[var(--gold)] text-white shadow-md'
                                                        : 'border-gray-200 hover:border-gray-400 text-gray-600'
                                                        }`}
                                                >
                                                    {color}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Size</h3>
                                        <Link href="/size-guide" className="text-[9px] font-bold text-[var(--gold)] border-b border-[var(--gold)] hover:text-[#B8860B] transition-colors">SIZE GUIDE</Link>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {availableSizes.map((size: string) => {
                                            const variant = variants.find((v: { size: string | null; color: string | null }) => v.size === size && v.color === product.color)
                                            const isActive = product.size === size
                                            const isOutOfStock = !variant || variant.stock <= 0

                                            if (isOutOfStock) {
                                                return (
                                                    <div key={size} className="px-6 py-3 border-2 border-gray-100 bg-gray-50 text-gray-300 rounded-xl text-[10px] font-black relative overflow-hidden cursor-not-allowed">
                                                        {size}
                                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -rotate-12" />
                                                    </div>
                                                )
                                            }

                                            return (
                                                <Link
                                                    key={size}
                                                    href={`/product/${variant.id}`}
                                                    className={`px-6 py-3 border-2 rounded-xl text-[10px] font-black transition-all relative ${isActive
                                                        ? 'border-[var(--gold)] text-gray-900 shadow-sm bg-white'
                                                        : 'border-gray-200 hover:border-gray-400 text-gray-500 hover:bg-white'
                                                        }`}
                                                >
                                                    {size}
                                                    {variant.stock <= 5 && (
                                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" title={`Only ${variant.stock} left`} />
                                                    )}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Collection Details</h3>
                                <p className="text-gray-600 leading-relaxed font-medium text-sm">
                                    {product.description || `Experience the epitome of elegance with the ${product.name}. Carefully crafted from premium ${product.material || 'fabrics'}, this piece is designed for the modern woman who values both tradition and sophistication.`}
                                </p>
                                <ul className="mt-4 space-y-2 text-[10px] text-gray-500 font-medium">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-[var(--gold)] rounded-full" />
                                        Premium {product.material || 'High-Quality'} Material
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-[var(--gold)] rounded-full" />
                                        Meticulously finished seams
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-[var(--gold)] rounded-full" />
                                        Designed for multiple occasions
                                    </li>
                                </ul>
                            </div>

                            {/* Add Ons section */}
                            {addons.length > 0 && (
                                <div className="bg-[#FAF9F6] border border-gray-200 rounded-3xl p-6">
                                    <h3 className="text-[10px] font-black text-[var(--gold)] uppercase tracking-widest mb-4">Complete the Look</h3>
                                    <div className="space-y-4">
                                        {addons.map((addon: any) => (
                                            <div key={addon.id} className="flex items-center justify-between group">
                                                <Link href={`/product/${addon.id}`} className="flex items-center gap-3">
                                                    <img
                                                        src={addon.images.split(',')[0]}
                                                        alt={addon.name}
                                                        className="w-12 h-14 object-cover rounded-lg group-hover:scale-105 transition-transform"
                                                    />
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 leading-none">{addon.name}</p>
                                                        <p className="text-[10px] font-bold text-[var(--gold)] mt-1">${addon.price.toFixed(2)}</p>
                                                    </div>
                                                </Link>
                                                <button className="text-[10px] font-black text-gray-400 uppercase tracking-tighter hover:text-gray-900 transition-colors">+ ADD</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                            {/* Add to Bag CTA */}
                            <div className="sticky bottom-6 lg:static pt-8 bg-[#FAF9F6]/80 backdrop-blur-md">
                                <BagControls product={product} effectivePrice={effectiveDiscount || undefined} />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Similar Products Section */}
                {
                    similarProducts.length > 0 && (
                        <div className="mt-24 border-t border-gray-200 pt-16">
                            <div className="flex justify-between items-end mb-12">
                                <h2 className="text-3xl font-display italic text-gray-900">You May Also Love</h2>
                                <Link href={`/shop?category=${product.categoryId}`} className="text-xs font-bold text-[var(--gold)] hover:text-black transition-colors uppercase tracking-widest">
                                    View Collection
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {similarProducts.map((p: any) => (
                                    <Link key={p.id} href={`/product/${p.id}`} className="group block">
                                        <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-4 relative">
                                            <img
                                                src={p.images?.split(',')[0]}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {p.isNewArrival && (
                                                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">New</span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[var(--gold)] transition-colors uppercase tracking-wider">{p.name}</h3>
                                        <p className="text-xs font-medium text-gray-500 mt-1">${p.price.toFixed(2)}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </main >

            <Footer />
        </div >
    )
}
