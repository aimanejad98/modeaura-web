'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/app/actions/inventory';
import { getCategories } from '@/app/actions/categories';
import { getPatterns } from '@/app/actions/patterns';
import { getMaterials } from '@/app/actions/materials';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import ShopProductCard from '@/components/ShopProductCard';
import PriceFilter from '@/components/PriceFilter';
import FilterDropdown from '@/components/FilterDropdown';
import { getColors } from '@/app/actions/colors';
import Footer from '@/components/Footer';

export default function ShopClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params
    const initialCategory = searchParams.get('category');
    const initialFilter = searchParams.get('filter');
    const initialKids = searchParams.get('kids') === 'true';

    // Data State
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [managedMaterials, setManagedMaterials] = useState<any[]>([]);
    const [managedColors, setManagedColors] = useState<any[]>([]);
    const [patterns, setPatterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Interaction State
    const [sortBy, setSortBy] = useState('newest');

    // Filter State
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategory ? [initialCategory] : []);
    const [isKidsOnly, setIsKidsOnly] = useState(initialKids);
    const [isNewArrivalFilter, setIsNewArrivalFilter] = useState(initialFilter === 'new');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedStyleNames, setSelectedStyleNames] = useState<string[]>([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
    const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outstock'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile only
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [maxProductPrice, setMaxProductPrice] = useState(1000);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        loadData();
    }, []);

    // Sync state with URL changes
    useEffect(() => {
        const cat = searchParams.get('category');
        const filt = searchParams.get('filter');
        const kids = searchParams.get('kids') === 'true';
        const q = searchParams.get('q');

        if (cat && !selectedCategoryIds.includes(cat)) setSelectedCategoryIds([cat]);
        if ((filt === 'new') !== isNewArrivalFilter) setIsNewArrivalFilter(filt === 'new');
        if (kids !== isKidsOnly) setIsKidsOnly(kids);
        if (q !== searchQuery) setSearchQuery(q || '');
    }, [searchParams]);

    async function loadData() {
        setLoading(true);
        console.log('[Shop] Loading started...');
        try {
            const start = Date.now();
            const [productsData, categoriesData, materialsData, colorsData, patternsData] = await Promise.all([
                getProducts(),
                getCategories(),
                getMaterials(),
                getColors(),
                getPatterns()
            ]);
            console.log(`[Shop] Data loaded in ${Date.now() - start}ms:`, {
                products: productsData.length,
                categories: categoriesData.length
            });
            setAllProducts(productsData);
            setCategories(categoriesData);
            setManagedMaterials(materialsData);
            setManagedColors(colorsData);
            setPatterns(patternsData);

            if (productsData.length > 0) {
                const max = Math.max(...productsData.map((p: any) => p.price));
                setMaxProductPrice(max);
                setPriceRange([0, max]);
            }
        } catch (error) {
            console.error('[Shop] Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }

    const availableSizes = useMemo(() => {
        const sizes = new Set<string>();
        allProducts.forEach(p => {
            if (p.size) {
                p.size.split(',').forEach((s: string) => sizes.add(s.trim()));
            }
        });
        return Array.from(sizes).sort();
    }, [allProducts]);

    const activeCategoriesData = useMemo(() => {
        return categories.filter(c => selectedCategoryIds.includes(c.id));
    }, [selectedCategoryIds, categories]);

    const headerContent = useMemo(() => {
        if (isKidsOnly && activeCategoriesData.length === 0) {
            return {
                title: "Kids Collection",
                description: "Discover our elegant and modest collection designed specifically for your little ones."
            };
        }

        if (activeCategoriesData.length === 1) {
            const cat = activeCategoriesData[0];
            return {
                title: isKidsOnly ? `Kids ${cat.name}` : cat.name,
                description: `Explore our exclusive collection of ${isKidsOnly ? 'children\'s' : ''} ${cat.name.toLowerCase()}, crafted with elegance and modesty in mind.`
            };
        }

        if (isNewArrivalFilter) {
            return {
                title: "New Arrivals",
                description: "Be the first to wear our latest architectural masterworks and seasonal essentials."
            };
        }

        return {
            title: "The Collection",
            description: "Discover our curated selection of modest essentials, designed with architectural precision and timeless grace."
        };
    }, [activeCategoriesData, isKidsOnly, isNewArrivalFilter]);

    const availableCollections = useMemo(() => {
        return categories.filter(c => !c.parentId).map(c => c.name).sort();
    }, [categories]);

    const selectedCollectionIds = useMemo(() => {
        const ids = new Set<string>();
        selectedCategoryIds.forEach(id => {
            const cat = categories.find(c => c.id === id);
            if (cat) {
                if (!cat.parentId) ids.add(cat.id);
                else ids.add(cat.parentId);
            }
        });
        return Array.from(ids);
    }, [selectedCategoryIds, categories]);

    const availableStyles = useMemo(() => {
        if (selectedCategoryIds.length === 0) return [];
        // Only show patterns that belong to selected categories
        return patterns.filter(p => selectedCategoryIds.includes(p.categoryId)).map(p => p.name).sort();
    }, [patterns, selectedCategoryIds]);



    const availableMaterials = useMemo(() => {
        if (managedMaterials.length > 0) {
            if (selectedCollectionIds.length > 0) {
                return managedMaterials
                    .filter(m => !m.categoryId || selectedCollectionIds.includes(m.categoryId))
                    .map(m => m.name)
                    .sort();
            }
            return managedMaterials.map(m => m.name).sort();
        }
        const materials = new Set<string>();
        allProducts.forEach(p => {
            if (p.material) {
                p.material.split(',').forEach((m: string) => materials.add(m.trim()));
            }
        });
        return Array.from(materials).sort();
    }, [allProducts, managedMaterials, selectedCollectionIds]);

    const availableColors = useMemo(() => {
        if (managedColors.length > 0) {
            if (selectedCollectionIds.length > 0) {
                return managedColors
                    .filter(c => !c.categoryId || selectedCollectionIds.includes(c.categoryId))
                    .map(c => c.name)
                    .sort();
            }
            return managedColors.map(c => c.name).sort();
        }
        const colorsSet = new Set<string>();
        allProducts.forEach(p => {
            if (p.color) {
                p.color.split(',').forEach((c: string) => colorsSet.add(c.trim()));
            }
        });
        return Array.from(colorsSet).sort();
    }, [allProducts, managedColors, selectedCollectionIds]);

    const filteredAndGroupedProducts = useMemo(() => {
        let filtered = allProducts;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => {
                const productName = p.name.toLowerCase();
                const categoryName = categories.find(c => c.id === p.categoryId)?.name.toLowerCase() || '';
                const material = p.material?.toLowerCase() || '';
                const size = p.size?.toLowerCase() || '';
                const description = p.description?.toLowerCase() || '';

                return productName.includes(q) || categoryName.includes(q) || material.includes(q) || size.includes(q) || description.includes(q);
            });
        }

        if (selectedCategoryIds.length > 0) {
            const allowedIds = new Set<string>();
            selectedCategoryIds.forEach(id => {
                allowedIds.add(id);
                categories.filter(c => c.parentId === id).forEach(child => allowedIds.add(child.id));
            });
            filtered = filtered.filter(p => allowedIds.has(p.categoryId));
        }

        if (selectedStyleNames.length > 0) {
            filtered = filtered.filter(p => selectedStyleNames.includes(p.style || ''));
        }

        if (isKidsOnly) {
            const kidsCat = categories.find(c => c.name.toUpperCase() === 'KID' || c.name.toUpperCase() === 'KIDS');
            filtered = filtered.filter(p => p.isKids || (kidsCat && p.categoryId === kidsCat.id));
        }

        if (isNewArrivalFilter) {
            filtered = filtered.filter(p => p.isNewArrival);
        }

        if (selectedSizes.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.size) return false;
                const pSizes = p.size.split(',').map((s: string) => s.trim());
                return selectedSizes.some(s => pSizes.includes(s));
            });
        }

        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.material) return false;
                const pMats = p.material.split(',').map((m: string) => m.trim());
                return selectedMaterials.some(m => pMats.includes(m));
            });
        }

        if (selectedColors.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.color) return false;
                const pColors = p.color.split(',').map((c: string) => c.trim());
                return selectedColors.some(c => pColors.includes(c));
            });
        }

        if (stockFilter === 'instock') filtered = filtered.filter(p => p.stock > 0);
        else if (stockFilter === 'outstock') filtered = filtered.filter(p => p.stock === 0);

        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Group by name
        const uniqueProductsMap = new Map();
        filtered.forEach(p => {
            if (!uniqueProductsMap.has(p.name)) {
                uniqueProductsMap.set(p.name, {
                    ...p,
                    availableSizes: new Set(p.size ? p.size.split(',').map((s: string) => s.trim()) : []),
                    allVariants: [p]
                });
            } else {
                const existing = uniqueProductsMap.get(p.name);
                if (p.size) p.size.split(',').forEach((s: string) => existing.availableSizes.add(s.trim()));
                existing.allVariants.push(p);
            }
        });

        const grouped = Array.from(uniqueProductsMap.values()).map(p => ({
            ...p,
            availableSizes: Array.from(p.availableSizes as Set<string>).filter(Boolean).sort()
        }));

        return grouped.sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'name-az': return a.name.localeCompare(b.name);
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    }, [allProducts, searchQuery, selectedCategoryIds, isKidsOnly, isNewArrivalFilter, selectedSizes, selectedMaterials, selectedColors, stockFilter, priceRange, sortBy, categories]);

    const toggleCategory = (catId: string | null) => {
        if (!catId) setSelectedCategoryIds([]);
        else setSelectedCategoryIds(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
        setIsNewArrivalFilter(false);
        setIsKidsOnly(false);
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    };

    const clearFilters = () => {
        setSelectedCategoryIds([]);
        setIsKidsOnly(false);
        setIsNewArrivalFilter(false);
        setSelectedSizes([]);
        setSelectedMaterials([]);
        setSelectedColors([]);
        setSelectedStyleNames([]);
        setStockFilter('all');
        setPriceRange([0, maxProductPrice]);
        setSearchQuery('');
        router.push('/shop');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse text-[var(--gold)] font-bold tracking-widest uppercase">Loading Collection...</div>
            </div>
        );
    }

    const currentCollectionNames = categories.filter(c => selectedCollectionIds.includes(c.id)).map(c => c.name);

    return (
        <div className="min-h-screen bg-white">
            <header className="pt-64 md:pt-72 pb-4 px-6 md:px-12 max-w-[1440px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-6xl md:text-8xl font-display italic text-gray-900 mb-6 transition-all">{headerContent.title}</h1>
                        <p className="text-gray-500 max-w-md text-sm leading-relaxed transition-all">{headerContent.description}</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search the atelier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-80 bg-[#FAF9F6] border-0 px-6 py-4 rounded-2xl text-xs font-bold tracking-wide outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-widest"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                        </div>
                    </div>
                </div>

                <div className="border-y border-gray-100 py-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="flex items-center gap-6 w-full md:w-auto overflow-hidden">
                            <span className="hidden xl:inline-block text-[10px] font-black text-gray-300 uppercase tracking-widest mr-4 shrink-0">Filtering By</span>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="lg:hidden flex-1 flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20"
                            >
                                <ChevronDown size={14} /> Filter & Sort
                            </button>

                            {/* Active Collection Indicator (Tablet/Desktop Header) */}
                            <div className="hidden lg:flex items-center gap-3">
                                {selectedCollectionIds.length > 0 ? (
                                    currentCollectionNames.map(name => (
                                        <span key={name} className="px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 rounded-full text-[9px] font-black uppercase tracking-widest">{name}</span>
                                    ))
                                ) : (
                                    <span className="px-4 py-2 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest">All Collections</span>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-6">
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-[#FAF9F6] border-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest outline-none pr-12 cursor-pointer transition-all hover:bg-gray-100"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name-az">A to Z</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8 pb-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0 space-y-12 sticky top-48 self-start max-h-[calc(100vh-12rem)] overflow-y-auto pr-4 custom-scrollbar">
                        <FilterDropdown
                            label="Collection"
                            variant="sidebar"
                            options={availableCollections}
                            selected={currentCollectionNames}
                            onApply={(vals) => {
                                const newIds = categories.filter(c => vals.includes(c.name) && !c.parentId).map(c => c.id);
                                setSelectedCategoryIds(newIds);
                                setIsNewArrivalFilter(false);
                            }}
                        />

                        <FilterDropdown
                            label="Patterns"
                            variant="sidebar"
                            options={availableStyles}
                            selected={selectedStyleNames}
                            onApply={setSelectedStyleNames}
                        />

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Target</h3>
                            <button
                                onClick={() => {
                                    const newVal = !isKidsOnly;
                                    setIsKidsOnly(newVal);
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (newVal) { params.set('kids', 'true'); setSelectedCategoryIds([]); params.delete('category'); }
                                    else params.delete('kids');
                                    router.push(`/shop?${params.toString()}`, { scroll: false });
                                }}
                                className={`w-full flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-widest transition-all px-5 py-4 rounded-2xl border ${isKidsOnly ? 'bg-black text-white border-black shadow-lg' : 'text-gray-400 border-gray-100 hover:border-gray-200'}`}
                            >
                                👶 Kids {isKidsOnly && <X size={12} />}
                            </button>
                        </div>

                        <FilterDropdown
                            label="Material"
                            variant="sidebar"
                            options={availableMaterials}
                            selected={selectedMaterials}
                            onApply={setSelectedMaterials}
                        />

                        <FilterDropdown
                            label="Colorway"
                            variant="sidebar"
                            options={availableColors}
                            selected={selectedColors}
                            onApply={setSelectedColors}
                        />

                        <div className="space-y-6 pt-4 border-t border-gray-100">
                            <PriceFilter min={0} max={maxProductPrice} selectedRange={priceRange} onApply={setPriceRange} />
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        {(selectedCategoryIds.length > 0 || isKidsOnly || selectedSizes.length > 0 || selectedMaterials.length > 0 || stockFilter !== 'all' || searchQuery) && (
                            <div className="flex flex-wrap items-center gap-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mr-2">Results for:</span>
                                {selectedCategoryIds.map(id => (
                                    <button key={id} onClick={() => toggleCategory(id)} className="flex items-center gap-2 bg-[#FAF9F6] px-4 py-2 rounded-xl text-[10px] font-bold text-gray-900 group">{categories.find(c => c.id === id)?.name} <X size={12} className="text-gray-300 group-hover:text-red-500 transition-colors" /></button>
                                ))}
                                {isKidsOnly && (
                                    <button onClick={() => { setIsKidsOnly(false); const params = new URLSearchParams(searchParams.toString()); params.delete('kids'); router.push(`/shop?${params.toString()}`, { scroll: false }); }} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg">Department: Kids <X size={12} /></button>
                                )}
                                <button onClick={clearFilters} className="text-[10px] font-black text-[#B45309] border-b-2 border-transparent hover:border-[#B45309] transition-all ml-4 uppercase tracking-widest">Clear All</button>
                            </div>
                        )}

                        {filteredAndGroupedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-50 rounded-[3rem] bg-[#FAF9F6]/30">
                                <h2 className="text-3xl font-display italic text-gray-400 mb-6">No pieces match your search</h2>
                                <button onClick={clearFilters} className="px-12 py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B45309] shadow-xl shadow-black/10 transition-all active:scale-95">Reset Exploration</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-20">
                                {filteredAndGroupedProducts.map((product: any) => (
                                    <ShopProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Portal */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-white p-8 overflow-y-auto">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-display italic text-gray-900">Refine Collection</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-4 bg-gray-50 rounded-full text-gray-900">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-12">
                                <FilterDropdown
                                    label="Collection"
                                    options={availableCollections}
                                    selected={currentCollectionNames}
                                    onApply={(vals) => {
                                        const newIds = categories.filter(c => vals.includes(c.name) && !c.parentId).map(c => c.id);
                                        setSelectedCategoryIds(newIds);
                                    }}
                                />
                                <FilterDropdown
                                    label="Style"
                                    options={availableStyles}
                                    selected={selectedStyleNames}
                                    onApply={(vals) => {
                                        const rootIds = selectedCategoryIds.filter(id => !categories.find(c => c.id === id)?.parentId);
                                        const newStyleIds = categories.filter(c => vals.includes(c.name) && c.parentId && (selectedCollectionIds.length === 0 || selectedCollectionIds.includes(c.parentId))).map(c => c.id);
                                        setSelectedCategoryIds([...rootIds, ...newStyleIds]);
                                    }}
                                />
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Department</h3>
                                    <button
                                        onClick={() => setIsKidsOnly(!isKidsOnly)}
                                        className={`w-full flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all ${isKidsOnly ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">👶 Kids Selection</span>
                                        {isKidsOnly && <X size={16} />}
                                    </button>
                                </div>
                                <FilterDropdown label="Material" options={availableMaterials} selected={selectedMaterials} onApply={setSelectedMaterials} />
                                <FilterDropdown label="Color" options={availableColors} selected={selectedColors} onApply={setSelectedColors} />
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Price Range</h3>
                                    <PriceFilter min={0} max={maxProductPrice} selectedRange={priceRange} onApply={setPriceRange} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Sort By</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['newest', 'price-low', 'price-high', 'name-az'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setSortBy(opt)}
                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${sortBy === opt ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}
                                            >
                                                {opt.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 sticky bottom-0 bg-white pt-6 pb-2">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full bg-black text-white py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/20"
                                >
                                    Show Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
