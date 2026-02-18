'use client'

import { useState, useEffect } from 'react'
import { getMaterials, addMaterial, deleteMaterial } from '@/app/actions/materials'
import { getColors, addColor, deleteColor, updateColor } from '@/app/actions/colors'
import { getMainCategories, addCategory, deleteCategory } from '@/app/actions/categories'
import { getSizes, addSize, deleteSize } from '@/app/actions/sizes'
import { getPatterns, addPattern, deletePattern } from '@/app/actions/patterns'
import { Plus, Trash2, ChevronRight, Settings2, Package } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function FiltersManagement() {
    const [materials, setMaterials] = useState<any[]>([])
    const [colors, setColors] = useState<any[]>([])
    const [sizes, setSizes] = useState<any[]>([])
    const [patterns, setPatterns] = useState<any[]>([])
    const [mainCategories, setMainCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newMaterial, setNewMaterial] = useState('')
    const [newColor, setNewColor] = useState({ name: '', hex: '' })
    const [newSize, setNewSize] = useState('')

    // Style management
    const [selectedMainCat, setSelectedMainCat] = useState<string | null>(null)
    const [newStyle, setNewStyle] = useState({ name: '', code: '' })

    // Material management
    const [selectedMaterialCat, setSelectedMaterialCat] = useState<string | 'uncategorized' | null>(null)

    // Color management
    const [selectedColorCat, setSelectedColorCat] = useState<string | 'uncategorized' | null>(null)

    // Size management
    const [selectedSizeCat, setSelectedSizeCat] = useState<string | 'uncategorized' | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [mats, clrs, szs, cats, pats] = await Promise.all([
            getMaterials(),
            getColors(),
            getSizes(),
            getMainCategories(),
            getPatterns()
        ])
        setMaterials(mats)
        setColors(clrs)
        setSizes(szs)
        setMainCategories(cats)
        setPatterns(pats)
        if (cats.length > 0) {
            if (!selectedMainCat) setSelectedMainCat(cats[0].id)
            if (!selectedMaterialCat) setSelectedMaterialCat(cats[0].id)
            if (!selectedColorCat) setSelectedColorCat(cats[0].id)
            if (!selectedSizeCat) setSelectedSizeCat(cats[0].id)
        }
        setLoading(false)
    }

    async function handleAddMaterial(e: React.FormEvent) {
        e.preventDefault()
        if (!newMaterial.trim()) return
        // Pass categoryId ONLY if it's an actual category ID (not 'uncategorized')
        const catIdForAction = selectedMaterialCat === 'uncategorized' ? undefined : (selectedMaterialCat || undefined);
        await addMaterial(newMaterial.trim(), catIdForAction)
        setNewMaterial('')
        loadData()
    }

    async function handleAddStyle(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedMainCat || !newStyle.name.trim()) return
        await addPattern(newStyle.name.trim(), selectedMainCat)
        setNewStyle({ name: '', code: '' })
        loadData()
    }

    async function handleDeleteMaterial(id: string) {
        if (!confirm('Delete this material?')) return
        await deleteMaterial(id)
        loadData()
    }

    async function handleDeleteStyle(id: string) {
        if (!confirm('Delete this pattern?')) return
        await deletePattern(id)
        loadData()
    }

    async function handleAddColor(e: React.FormEvent) {
        e.preventDefault()
        if (!newColor.name.trim()) return
        const catIdForAction = selectedColorCat === 'uncategorized' ? undefined : (selectedColorCat || undefined);
        await addColor(newColor.name.trim(), newColor.hex.trim(), catIdForAction)
        setNewColor({ name: '', hex: '' })
        loadData()
    }

    async function handleDeleteColor(id: string) {
        if (!confirm('Delete this color?')) return
        await deleteColor(id)
        loadData()
    }

    async function handleAddSize(e: React.FormEvent) {
        e.preventDefault()
        if (!newSize.trim()) return
        const catIdForAction = selectedSizeCat === 'uncategorized' ? undefined : (selectedSizeCat || undefined);
        await addSize(newSize.trim(), catIdForAction)
        setNewSize('')
        loadData()
    }

    async function handleDeleteSize(id: string) {
        if (!confirm('Delete this size?')) return
        await deleteSize(id)
        loadData()
    }

    if (loading) return <div className="p-12 text-center animate-pulse text-[var(--gold)] font-bold">Loading filter management...</div>

    const activeMainCat = mainCategories.find(c => c.id === selectedMainCat)
    const categoryPatterns = patterns.filter(p => p.categoryId === selectedMainCat)

    // Helper for pattern placeholder examples
    const patternExamples: Record<string, string> = {
        'abayas': 'e.g. Open Front, Closed, Butterfly, Kimono, Bisht',
        'scarfs': 'e.g. Printed, Plain, Embroidered, Chiffon',
        'bags': 'e.g. Tote, Clutch, Shoulder, Crossbody',
        'accessories': 'e.g. Rings, Bracelets, Necklaces, Earrings',
        'shaylas': 'e.g. Plain, Embroidered, Lace-trim',
    }
    const currentExample = activeMainCat ? (patternExamples[activeMainCat.name.toLowerCase()] || 'e.g. Type A, Type B') : ''

    // Filter materials by selected category
    const activeMaterialCatName = selectedMaterialCat === 'uncategorized'
        ? 'Uncategorized'
        : mainCategories.find(c => c.id === selectedMaterialCat)?.name || 'Materials'

    const displayedMaterials = materials.filter(m => {
        if (selectedMaterialCat === 'uncategorized') return !m.categoryId;
        return m.categoryId === selectedMaterialCat;
    })

    const displayedColors = colors.filter(c => {
        if (selectedColorCat === 'uncategorized') return !c.categoryId;
        return c.categoryId === selectedColorCat;
    })

    const displayedSizes = sizes.filter(s => {
        if (selectedSizeCat === 'uncategorized') return !s.categoryId;
        return s.categoryId === selectedSizeCat;
    })

    const activeSizeCatName = selectedSizeCat === 'uncategorized'
        ? 'Uncategorized'
        : mainCategories.find(c => c.id === selectedSizeCat)?.name || 'Sizes'

    return (
        <div className="space-y-12 pb-20">
            <div>
                <h2 className="text-4xl font-black italic text-gray-900">Filter Management</h2>
                <p className="text-gray-500 mt-2">Manage product styles and materials for the shop page.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Style Management (Sub-categories) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white">
                            <Settings2 size={20} />
                        </div>
                        <h3 className="text-2xl font-black">Patterns by Category</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Category Tabs */}
                        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-50 bg-gray-50/50">
                            {mainCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedMainCat(cat.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedMainCat === cat.id
                                        ? 'border-black text-black bg-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Available Patterns</h4>
                                <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full">{categoryPatterns.length} Total</span>
                            </div>

                            {categoryPatterns.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-sm font-bold">No patterns yet for {activeMainCat?.name}</p>
                                    <p className="text-xs mt-1 text-gray-300 italic">{currentExample}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    {categoryPatterns.map((pattern: any) => (
                                        <div key={pattern.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[var(--gold)]"></div>
                                                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{pattern.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteStyle(pattern.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleAddStyle} className="space-y-4 pt-8 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add New Pattern to {activeMainCat?.name}</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        required
                                        placeholder={currentExample || 'Pattern name...'}
                                        value={newStyle.name}
                                        onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                                        className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm border-2 border-transparent focus:border-black transition-all"
                                    />
                                    <button type="submit" className="py-4 sm:py-0 px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                                        Add Pattern
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Material Management */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--gold)] flex items-center justify-center text-white">
                            <Package size={20} />
                        </div>
                        <h3 className="text-2xl font-black">Fabrics & Materials</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Category Tabs for Materials */}
                        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-50 bg-gray-50/50">
                            <button
                                onClick={() => setSelectedMaterialCat('uncategorized')}
                                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedMaterialCat === 'uncategorized'
                                    ? 'border-black text-black bg-white'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Uncategorized
                            </button>
                            {mainCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedMaterialCat(cat.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedMaterialCat === cat.id
                                        ? 'border-[var(--gold)] text-[var(--gold)] bg-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Available Materials</h4>
                                <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full">{displayedMaterials.length} Total</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {displayedMaterials.map((mat) => (
                                    <div key={mat.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{mat.name}</span>
                                        <button
                                            onClick={() => handleDeleteMaterial(mat.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {displayedMaterials.length === 0 && (
                                    <p className="col-span-2 text-center py-12 text-gray-400 text-sm italic">No materials added for {activeMaterialCatName} yet.</p>
                                )}
                            </div>

                            <form onSubmit={handleAddMaterial} className="space-y-4 pt-8 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add New Material to {activeMaterialCatName}</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        required
                                        placeholder="e.g., Luxury Korean Nida"
                                        value={newMaterial}
                                        onChange={(e) => setNewMaterial(e.target.value)}
                                        className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm border-2 border-transparent focus:border-[var(--gold)] transition-all"
                                    />
                                    <button type="submit" className="py-4 sm:py-0 px-8 bg-[var(--gold)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B8962F] transition-all">
                                        Add Material
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Color Management */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#1B2936] flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-2xl font-black">Color Swatches</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Category Tabs for Colors */}
                        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-50 bg-gray-50/50">
                            <button
                                onClick={() => setSelectedColorCat('uncategorized')}
                                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedColorCat === 'uncategorized'
                                    ? 'border-black text-black bg-white'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Uncategorized
                            </button>
                            {mainCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedColorCat(cat.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedColorCat === cat.id
                                        ? 'border-black text-black bg-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Available Colors</h4>
                                <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full">{displayedColors.length} Total</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {displayedColors.map((color) => (
                                    <div key={color.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-3 flex-1">
                                            {color.hex && (
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm shrink-0"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                            )}
                                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{color.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={color.categoryId || 'uncategorized'}
                                                onChange={async (e) => {
                                                    const newCategoryId = e.target.value === 'uncategorized' ? null : e.target.value;
                                                    try {
                                                        await updateColor(color.id, newCategoryId);
                                                        await loadData();
                                                    } catch (error) {
                                                        alert('Failed to update color category');
                                                    }
                                                }}
                                                className="text-[10px] font-bold uppercase bg-white border border-gray-200 rounded-xl px-3 py-1.5 hover:border-gray-300 focus:outline-none focus:border-black transition-all cursor-pointer"
                                            >
                                                <option value="uncategorized">Uncategorized</option>
                                                {mainCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleDeleteColor(color.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {displayedColors.length === 0 && (
                                    <p className="col-span-2 text-center py-12 text-gray-400 text-sm italic">No colors added yet.</p>
                                )}
                            </div>

                            <form onSubmit={handleAddColor} className="space-y-4 pt-8 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add New Color</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        required
                                        placeholder="Color Name (e.g., Midnight Black)"
                                        value={newColor.name}
                                        onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                        className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm border-2 border-transparent focus:border-black transition-all"
                                    />
                                    <div className="flex gap-4">
                                        <input
                                            type="color"
                                            value={newColor.hex}
                                            onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                                            className="w-16 sm:w-20 h-14 rounded-2xl cursor-pointer bg-gray-50 border-2 border-transparent focus:border-black transition-all shrink-0"
                                        />
                                        <button type="submit" className="flex-1 sm:px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                                            Add Color
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Size Management */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black">Sizes</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Category Tabs for Sizes */}
                        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-50 bg-gray-50/50">
                            <button
                                onClick={() => setSelectedSizeCat('uncategorized')}
                                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedSizeCat === 'uncategorized'
                                    ? 'border-black text-black bg-white'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Uncategorized
                            </button>
                            {mainCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedSizeCat(cat.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedSizeCat === cat.id
                                        ? 'border-blue-600 text-blue-600 bg-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Available Sizes</h4>
                                <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full">{displayedSizes.length} Total</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                                {displayedSizes.map((size) => (
                                    <div key={size.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                                        <span className="text-sm font-black text-gray-800 uppercase">{size.name}</span>
                                        <button
                                            onClick={() => handleDeleteSize(size.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {displayedSizes.length === 0 && (
                                    <p className="col-span-4 text-center py-12 text-gray-400 text-sm italic">No sizes added for {activeSizeCatName} yet.</p>
                                )}
                            </div>

                            <form onSubmit={handleAddSize} className="space-y-4 pt-8 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add New Size to {activeSizeCatName}</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        required
                                        placeholder="Size (e.g., S, M, 52, 54)"
                                        value={newSize}
                                        onChange={(e) => setNewSize(e.target.value)}
                                        className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm border-2 border-transparent focus:border-blue-600 transition-all"
                                    />
                                    <button type="submit" className="py-4 sm:py-0 px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                                        Add Size
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardPageGuide
                pageName={{ en: "Filter Management", ar: "إدارة الفلاتر" }}
                steps={[
                    {
                        title: { en: "Pattern Styles", ar: "أنماط التصميم" },
                        description: {
                            en: "Define product patterns per category (e.g., Open Front, Butterfly for Abayas) to power storefront filters.",
                            ar: "حدد أنماط المنتجات لكل فئة (مثل أمامي مفتوح، فراشة للعبايات) لتشغيل فلاتر واجهة المتجر."
                        },
                        icon: "🎨"
                    },
                    {
                        title: { en: "Fabrics & Materials", ar: "الأقمشة والمواد" },
                        description: {
                            en: "Add and manage fabric types (Korean Nida, Crepe, Silk) organized by product category.",
                            ar: "إضافة وإدارة أنواع الأقمشة (نيدا كوري، كريب، حرير) مرتبة حسب فئة المنتج."
                        },
                        icon: "🧵"
                    },
                    {
                        title: { en: "Color Swatches", ar: "عينات الألوان" },
                        description: {
                            en: "Create color options with names and hex codes. Assign colors to categories for organized filtering.",
                            ar: "أنشئ خيارات ألوان بأسماء ورموز hex. خصص الألوان للفئات لتصفية منظمة."
                        },
                        icon: "🎨"
                    },
                    {
                        title: { en: "Size Chart", ar: "جدول الأحجام" },
                        description: {
                            en: "Manage available sizes per category. Add custom sizes (S, M, L, 52, 54) for precise inventory tracking.",
                            ar: "إدارة الأحجام المتاحة لكل فئة. أضف أحجاماً مخصصة (S, M, L, 52, 54) لتتبع دقيق للمخزون."
                        },
                        icon: "📐"
                    }
                ]}
            />
        </div>
    )
}
