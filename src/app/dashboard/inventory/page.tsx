'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getProducts, addProduct, bulkImportProducts, deleteProduct, updateProduct, updateStock, toggleGroupNewArrival, toggleGroupKids, bulkDeleteProducts, bulkApplySale, bulkRemoveSale } from '@/app/actions/inventory'
import { getMainCategories } from '@/app/actions/categories'
import { getColors } from '@/app/actions/colors'
import { getSales } from '@/app/actions/sales'
import { printBarcode } from '@/components/Barcode'
import { uploadImage } from '@/app/actions/upload'
import DashboardTour from '@/components/DashboardTour'
import MediaPicker from '@/components/MediaPicker'
import DashboardPageGuide from '@/components/DashboardPageGuide'
import { Search, ArrowUpDown, CheckSquare, Square, Trash2, Tag, Archive, Package, Barcode, TrendingDown, Layers } from 'lucide-react'

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [colors, setColors] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [showPicker, setShowPicker] = useState(false)
    const [quickMode, setQuickMode] = useState(false)
    const [quickCount, setQuickCount] = useState(0)
    const [showImport, setShowImport] = useState(false)
    const [importData, setImportData] = useState<any[]>([])
    const [importResult, setImportResult] = useState<any>(null)
    const [selectedMain, setSelectedMain] = useState<any>(null)
    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [canEdit, setCanEdit] = useState(true)
    const [newProduct, setNewProduct] = useState({
        name: '', categoryId: '', price: 0, costPrice: 0, stock: 0, size: '', color: '', material: '', isNewArrival: false, isKids: false,
        discountPrice: 0, saleId: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Cashier'>('Admin')
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    // New Features State
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
    const [activeTab, setActiveTab] = useState<string>('All')

    const fileRef = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadData()
        const savedUser = localStorage.getItem('dashboard_user')
        if (savedUser) {
            const user = JSON.parse(savedUser)
            setCanEdit(user.role === 'Admin' || user.role === 'Manager')
            setUserRole(user.role)
        }
    }, [])

    async function loadData(silent = false) {
        if (!silent) setLoading(true)
        const [prodData, catData, colorData, saleData] = await Promise.all([
            getProducts(),
            getMainCategories(),
            getColors(),
            getSales()
        ])
        setProducts(prodData)
        setCategories(catData)
        setColors(colorData)
        setSales(saleData.filter((s: any) => s.active))
        if (!silent) setLoading(false)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files) return
        setUploading(true)
        const newImages: string[] = []
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData()
            formData.append('file', files[i])
            try {
                const url = await uploadImage(formData)
                newImages.push(url)
            } catch (error) {
                console.error('Upload failed:', error)
            }
        }
        setImages([...images, ...newImages])
        setUploading(false)
    }

    function removeImage(index: number) {
        setImages(images.filter((_, i) => i !== index))
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addProduct({
                name: newProduct.name,
                categoryId: newProduct.categoryId,
                price: newProduct.price,
                costPrice: newProduct.costPrice,
                stock: newProduct.stock,
                size: newProduct.size || undefined,
                color: newProduct.color || undefined,
                material: newProduct.material || undefined,
                images: images.join(','),
                isNewArrival: newProduct.isNewArrival,
                isKids: newProduct.isKids,
                discountPrice: newProduct.discountPrice || undefined,
                saleId: newProduct.saleId || undefined,
            })
            if (quickMode) {
                setQuickCount(quickCount + 1)
                setNewProduct({ ...newProduct, name: '', size: '', color: '', material: '', isNewArrival: false, isKids: false, discountPrice: 0, saleId: '' })
                setImages([])
                await loadData(true)
            } else {
                setNewProduct({ name: '', categoryId: '', price: 0, costPrice: 0, stock: 0, size: '', color: '', material: '', isNewArrival: false, isKids: false, discountPrice: 0, saleId: '' })
                setSelectedMain(null)
                setImages([])
                setShowAdd(false)
                await loadData(true)
            }
        } catch (error: any) {
            console.error('Failed to add product:', error)
            alert(`Failed to add product: ${error.message || 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleMainCategoryChange(catId: string) {
        const cat = categories.find((c: any) => c.id === catId)
        setSelectedMain(cat)
        if (!cat?.children || cat.children.length === 0) {
            setNewProduct({ ...newProduct, categoryId: catId })
        } else {
            setNewProduct({ ...newProduct, categoryId: '' })
        }
    }

    // Auto-select category when adding if tab is active
    useEffect(() => {
        if (showAdd && activeTab !== 'All' && !newProduct.categoryId && !editingProduct) {
            const cat = categories.find(c => c.name === activeTab)
            if (cat) {
                handleMainCategoryChange(cat.id)
            }
        }
    }, [showAdd, activeTab, categories])

    function handleDuplicate(product: any) {
        const subCat = product.category
        const mainCat = categories.find((c: any) =>
            c.children?.some((sub: any) => sub.id === subCat?.id) || c.id === subCat?.id
        )
        setSelectedMain(mainCat)
        setNewProduct({
            name: product.name,
            categoryId: product.categoryId,
            price: product.price,
            costPrice: product.costPrice || 0,
            stock: product.stock,
            size: '',
            color: product.color || '',
            material: product.material || '',
            isNewArrival: product.isNewArrival || false,
            isKids: product.isKids || false,
            discountPrice: product.discountPrice || 0,
            saleId: product.saleId || '',
        })
        setImages(product.images ? product.images.split(',') : [])
        setShowAdd(true)
    }

    function handleAddVariant(group: any) {
        const firstVariant = group.variants[0]
        // Resolve categories for the form
        const subCat = firstVariant.category
        const mainCat = categories.find((c: any) =>
            c.children?.some((sub: any) => sub.id === subCat?.id) || c.id === subCat?.id
        )
        setSelectedMain(mainCat)

        setNewProduct({
            name: firstVariant.name,
            categoryId: firstVariant.categoryId,
            price: firstVariant.price,
            costPrice: firstVariant.costPrice || 0,
            stock: 0, // Reset stock for new variant
            size: '',
            color: '',
            material: firstVariant.material || '',
            isNewArrival: firstVariant.isNewArrival || false,
            isKids: firstVariant.isKids || false,
            discountPrice: 0,
            saleId: '',
        })
        setImages([]) // Clear images so user can add color-specific ones
        setShowAdd(true)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return
        await deleteProduct(id)
        loadData()
    }

    function startEdit(product: any) {
        setEditingProduct(product)
        const subCat = product.category
        const mainCat = categories.find((c: any) =>
            c.children?.some((sub: any) => sub.id === subCat?.id) || c.id === subCat?.id
        )
        setSelectedMain(mainCat)
        setImages(product.images ? product.images.split(',') : [])
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingProduct) return
        setIsSubmitting(true)
        try {
            await updateProduct(editingProduct.id, {
                name: editingProduct.name,
                categoryId: editingProduct.categoryId,
                price: editingProduct.price,
                costPrice: editingProduct.costPrice,
                stock: editingProduct.stock,
                size: editingProduct.size || undefined,
                color: editingProduct.color || undefined,
                material: editingProduct.material || undefined,
                images: images.join(','),
                isNewArrival: editingProduct.isNewArrival,
                isKids: editingProduct.isKids,
                discountPrice: editingProduct.discountPrice || null,
                saleId: editingProduct.saleId || null,
            })
            setEditingProduct(null)
            setImages([])
            await loadData(true)
        } catch (error) {
            alert('Failed to update product.')
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleQuickStock(product: any, delta: number) {
        const newStock = Math.max(0, product.stock + delta)
        await updateStock(product.id, newStock)
        loadData(true)
    }

    function getCategoryFields(): string[] {
        if (!selectedMain) return ['size', 'color', 'material']
        const subCat = selectedMain.children?.find((c: any) => c.id === newProduct.categoryId || c.id === editingProduct?.categoryId)
        const fields = (subCat?.fields || selectedMain.fields || 'size,color,material')
        return fields.split(',').filter(Boolean)
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const lines = text.split('\n').filter(line => line.trim())
            if (lines.length < 2) return

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
            const products = lines.slice(1).map(line => {
                // Handle comma-separated values, but be careful with quotes if any
                // Simplified split for now as CSV standard in this app is simple
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const product: any = {}

                headers.forEach((header, i) => {
                    const value = values[i]
                    if (!value && value !== '0') return

                    // Mapping headers to internal product fields
                    if (header === 'name' || header === 'product name') product.name = value
                    else if (header === 'category') product.categoryName = value
                    else if (header === 'subcategory') product.subcategoryName = value
                    else if (header === 'price') product.price = parseFloat(value) || 0
                    else if (header === 'costprice' || header === 'cost price') product.costPrice = parseFloat(value) || 0
                    else if (header === 'stock' || header === 'quantity' || header === 'stock qty') product.stock = parseInt(value) || 0
                    else if (header === 'iskids' || header === 'is kids' || header === 'kids' || header === 'for kids') {
                        const v = value.toLowerCase()
                        product.isKids = v === 'true' || v === '1' || v === 'yes'
                    }
                    else if (header === 'isnewarrival' || header === 'is new arrival' || header === 'newarrival' || header === 'new') {
                        const v = value.toLowerCase()
                        product.isNewArrival = v === 'true' || v === '1' || v === 'yes'
                    }
                    else if (header === 'images' || header === 'photos' || header === 'ppic') {
                        product.images = value.replace(/\|/g, ',')
                    }
                    else if (header !== 'sku' && header !== 'id') {
                        product[header] = value
                    }
                })
                return product
            }).filter(p => p.name)

            setImportData(products)
            setShowImport(true)
        }
        reader.readAsText(file)
    }

    async function handleImport() {
        const result = await bulkImportProducts(importData)
        setImportResult(result)
        if (result.success > 0) loadData()
    }

    const filteredProducts = useMemo(() => {
        let result = products

        // Tab Filter
        if (activeTab !== 'All') {
            result = result.filter(p => {
                const cat = categories.find(c => c.id === p.categoryId)
                return cat?.name === activeTab || cat?.parent?.name === activeTab
            })
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.sku?.toLowerCase().includes(q) ||
                p.barcode?.toLowerCase().includes(q)
            )
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key]
                let bVal = b[sortConfig.key]

                // Handle special cases
                if (sortConfig.key === 'category') {
                    aVal = a.category?.name || ''
                    bVal = b.category?.name || ''
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }

        return result
    }, [products, activeTab, searchQuery, sortConfig, categories])

    const groupedProducts = useMemo(() => {
        const groups = filteredProducts.reduce((acc, p) => {
            const key = p.name;
            if (!acc[key]) {
                acc[key] = {
                    ...p,
                    ids: [p.id],
                    variants: [p],
                    totalStock: p.stock,
                    sizes: new Set([p.size]),
                    colors: new Set([p.color]),
                };
            } else {
                acc[key].ids.push(p.id);
                acc[key].variants.push(p);
                acc[key].totalStock += p.stock;
                if (p.size) acc[key].sizes.add(p.size);
                if (p.color) acc[key].colors.add(p.color);
            }
            return acc;
        }, {} as Record<string, any>);
        return Object.values(groups);
    }, [filteredProducts]);

    // Bulk Actions Handlers
    const handleSelectAll = () => {
        if (selectedProductIds.size === filteredProducts.length) {
            setSelectedProductIds(new Set())
        } else {
            setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))
        }
    }

    const handleSelectProduct = (id: string) => {
        const newSet = new Set(selectedProductIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedProductIds(newSet)
    }

    const handleToggleGroupSelect = (group: any) => {
        const newSet = new Set(selectedProductIds)
        const allSelected = group.ids.every((id: string) => newSet.has(id))

        group.ids.forEach((id: string) => {
            if (allSelected) newSet.delete(id)
            else newSet.add(id)
        })
        setSelectedProductIds(newSet)
    }

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const executeBulkAction = async (action: 'delete' | 'sale' | 'removeSale', saleId?: string) => {
        if (!confirm(`Apply this action to ${selectedProductIds.size} products?`)) return
        setLoading(true)

        const ids = Array.from(selectedProductIds)
        if (action === 'delete') await bulkDeleteProducts(ids)
        if (action === 'sale' && saleId) await bulkApplySale(ids, saleId)
        if (action === 'removeSale') await bulkRemoveSale(ids)

        setSelectedProductIds(new Set())
        loadData()
    }

    const toggleGroup = (name: string) => {
        const next = new Set(expandedGroups);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        setExpandedGroups(next);
    };

    const categoryFields = getCategoryFields()

    return (
        <>
            <div className="space-y-8 animate-fade-in text-left">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-display font-medium text-[var(--text-primary)] italic">Collection Registry</h2>
                        <p className="text-[var(--text-secondary)] font-medium mt-1">{products.length} curated pieces in catalog</p>
                    </div>
                    <div className="flex gap-4">
                        {canEdit && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <a href="/templates/Import_Template.csv" download className="p-4 bg-[var(--mocha-card)] border border-[var(--mocha-border)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--mocha-bg)] transition-all flex items-center gap-2 shadow-sm">
                                        <span>📄</span> Template
                                    </a>
                                    <span className="text-[10px] text-gray-400 text-center font-bold">Images: pipe | separated URLs</span>
                                </div>
                                <button onClick={() => fileRef.current?.click()} className="p-4 bg-[var(--mocha-card)] border border-[var(--mocha-border)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--mocha-bg)] transition-all flex items-center gap-2 shadow-sm">
                                    <span>📥</span> Import
                                    <input type="file" accept=".csv" ref={fileRef} onChange={handleFileUpload} className="hidden" />
                                </button>
                                <button onClick={() => { setQuickMode(true); setShowAdd(true); setQuickCount(0); }} className="p-4 bg-[var(--mocha-bg)] text-[var(--text-secondary)] border border-[var(--mocha-border)] rounded-xl font-bold hover:bg-[var(--mocha-card)] transition-all flex items-center gap-2">
                                    ⚡ Quick Entry
                                </button>
                                <button onClick={() => { setShowAdd(true); setQuickMode(false); }} className="gold-btn shadow-lg" data-tour="add-product-btn">
                                    ✨ Add Product
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 justify-between items-center sticky top-24 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm py-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full xl:w-auto custom-scrollbar no-scrollbar">
                        <button
                            onClick={() => setActiveTab('All')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'All' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-[var(--mocha-border)] text-gray-400 hover:border-gray-900 hover:text-gray-900'}`}
                        >
                            All
                        </button>
                        {categories.filter(c => !c.parentId).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.name)}
                                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === cat.name ? 'bg-[var(--gold)] text-white shadow-lg border-[var(--gold)]' : 'bg-white border border-[var(--mocha-border)] text-gray-400 hover:border-[var(--gold)] hover:text-[var(--gold)]'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full xl:w-96 group shrink-0">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--gold)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Scan Barcode / Search SKU..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--mocha-border)] rounded-full text-xs font-bold uppercase tracking-wider outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all shadow-sm"
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">SCAN</div>
                    </div>
                </div>

                <div className="card overflow-hidden border-[var(--mocha-border)]">
                    {/* Desktop Table: Hidden on Mobile */}
                    <table className="w-full hidden lg:table">
                        <thead className="bg-[#F4F0EA]/50">
                            <tr className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">
                                <th className="p-5 text-left w-10">
                                    <button onClick={handleSelectAll} className="hover:text-[var(--gold)]">
                                        {selectedProductIds.size > 0 && selectedProductIds.size === filteredProducts.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="p-5 text-left">Article</th>
                                <th className="p-5 text-left">Details</th>
                                <th className="p-5 text-left">Designation</th>
                                <th className="p-5 text-left cursor-pointer hover:bg-black/5" onClick={() => handleSort('category')}>
                                    Category
                                    <ArrowUpDown size={12} className={`inline ml-1 ${sortConfig?.key === 'category' ? 'text-[var(--gold)] opacity-100' : 'opacity-20'}`} />
                                </th>
                                <th className="p-5 text-left">Specifications</th>
                                <th className="p-5 text-right">Valuation</th>
                                <th className="p-5 text-center cursor-pointer hover:bg-black/5" onClick={() => handleSort('stock')}>
                                    In Stock
                                    <ArrowUpDown size={12} className={`inline ml-1 ${sortConfig?.key === 'stock' ? 'text-[var(--gold)] opacity-100' : 'opacity-20'}`} />
                                </th>
                                <th className="p-5 text-center">Expand</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3EDE4]">
                            {groupedProducts.map((group: any) => {
                                const isGroupSelected = group.ids?.every((id: string) => selectedProductIds.has(id));
                                return (
                                    <React.Fragment key={group.name}>
                                        <tr className={`hover:bg-[#FDFBF9] transition-colors group cursor-pointer ${isGroupSelected ? 'bg-[var(--gold)]/5' : ''}`} onClick={() => toggleGroup(group.name)}>
                                            <td className="p-5" onClick={(e) => { e.stopPropagation(); handleToggleGroupSelect(group); }}>
                                                <div className="text-gray-400 hover:text-[var(--gold)] cursor-pointer">
                                                    {isGroupSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {group.images && group.images.split(',')[0] ? (
                                                    <img src={group.images.split(',')[0]} alt={group.name} className="w-12 h-12 object-cover rounded-xl" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">📦</div>
                                                )}
                                            </td>
                                            <td className="p-5 flex items-center gap-3">
                                                <span className="text-xs text-gray-400 italic">{group.variants.length} variant{group.variants.length > 1 ? 's' : ''}</span>
                                                {canEdit && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAddVariant(group); }}
                                                        className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--gold)] text-white text-xs font-bold hover:scale-110 transition-transform"
                                                        title="Add New Color/Variant"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{group.name}</p>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (!confirm(`Mark all variants of "${group.name}" as ${group.isNewArrival ? 'standard' : 'New Arrival'}?`)) return;
                                                                await toggleGroupNewArrival(group.name, !group.isNewArrival);
                                                                loadData(true);
                                                            }}
                                                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-all hover:scale-110 ${group.isNewArrival
                                                                ? 'bg-[var(--gold)] text-white shadow-md shadow-[var(--gold)]/30'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                            title="Toggle New Arrival"
                                                        >
                                                            {group.isNewArrival ? 'New' : 'Std'}
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (!confirm(`Mark all variants of "${group.name}" as ${group.isKids ? 'Standard' : 'For Kids'}?`)) return;
                                                                await toggleGroupKids(group.name, !group.isKids);
                                                                loadData(true);
                                                            }}
                                                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-all hover:scale-110 ${group.isKids
                                                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                            title="Toggle Kids Collection"
                                                        >
                                                            {group.isKids ? 'Kids' : 'Adult'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-gray-500">{group.category?.name}</td>
                                            <td className="p-5 text-sm text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    {group.sizes.size > 0 && <span className="text-[10px] font-bold text-gray-400 uppercase">Sizes: {Array.from(group.sizes).filter(Boolean).join(', ')}</span>}
                                                    {group.colors.size > 0 && <span className="text-[10px] font-bold text-gray-400 uppercase">Colors: {Array.from(group.colors).filter(Boolean).join(', ')}</span>}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    {group.variants[0].discountPrice || group.variants[0].sale ? (
                                                        <>
                                                            <span className="text-[10px] text-gray-400 line-through decoration-[var(--gold)]/30">${group.price.toFixed(2)}</span>
                                                            <span className="font-black text-red-500">
                                                                ${(group.variants[0].discountPrice || (
                                                                    group.variants[0].sale.type === 'Percentage'
                                                                        ? group.price * (1 - group.variants[0].sale.value / 100)
                                                                        : group.price - group.variants[0].sale.value
                                                                )).toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-black text-[#D4AF37]">${group.price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`badge min-w-[3rem] ${group.totalStock > 10 ? 'badge-green' : group.totalStock > 0 ? 'bg-yellow-100 text-yellow-600' : 'badge-red'}`}>
                                                    {group.totalStock}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`transition-transform duration-300 inline-block ${expandedGroups.has(group.name) ? 'rotate-180' : ''}`}>▼</span>
                                            </td>
                                        </tr>
                                        {expandedGroups.has(group.name) && group.variants.map((product: any) => (
                                            <tr key={product.id} className={`bg-[#FAF9F6] border-l-4 border-[var(--gold)] animate-in slide-in-from-left-2 ${selectedProductIds.has(product.id) ? 'bg-[var(--gold)]/10' : ''}`}>
                                                <td className="p-2 pl-4">
                                                    <button onClick={(e) => { e.stopPropagation(); handleSelectProduct(product.id); }} className="text-gray-400 hover:text-[var(--gold)]">
                                                        {selectedProductIds.has(product.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                                                    </button>
                                                </td>
                                                <td className="p-2 pl-4 pt-4 pb-4">
                                                    <code className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded font-mono">{product.sku}</code>
                                                </td>
                                                <td className="p-2 pt-4 pb-4">
                                                    <span className="text-xs font-bold text-gray-600">{product.size || product.color || 'Standard'}</span>
                                                </td>
                                                <td className="p-2" colSpan={2}>
                                                    <span className="text-[10px] text-gray-400 uppercase">{product.material || ''}</span>
                                                </td>
                                                <td className="p-2 text-right">
                                                    <div className="flex flex-col items-end">
                                                        {product.discountPrice || product.sale ? (
                                                            <>
                                                                <span className="text-[9px] text-gray-300 line-through">${product.price}</span>
                                                                <span className="text-xs font-bold text-red-400">
                                                                    ${(product.discountPrice || (
                                                                        product.sale.type === 'Percentage'
                                                                            ? product.price * (1 - product.sale.value / 100)
                                                                            : product.price - product.sale.value
                                                                    )).toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-500">${product.price}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleQuickStock(product, -1); }} className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500">-</button>
                                                        <span className="text-xs font-bold w-8">{product.stock}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); handleQuickStock(product, 1); }} className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-500">+</button>
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {canEdit && <button onClick={(e) => { e.stopPropagation(); startEdit(product); }} className="p-1.5 hover:bg-white rounded-lg" title="Edit">✏️</button>}
                                                        {canEdit && <button onClick={(e) => { e.stopPropagation(); handleDuplicate(product); }} className="p-1.5 hover:bg-white rounded-lg" title="Duplicate">📋</button>}
                                                        <button onClick={(e) => { e.stopPropagation(); printBarcode(product.sku, product.name, product.price, product.size, product.color, product.material); }} className="p-1.5 hover:bg-white rounded-lg" title="Barcode">🏷️</button>
                                                        {canEdit && <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="p-1.5 hover:bg-white rounded-lg text-red-500" title="Delete">🗑️</button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Mobile Card List: Hidden on Desktop */}
                    <div className="lg:hidden divide-y divide-[#F3EDE4]">
                        {groupedProducts.map((group: any) => (
                            <div key={group.name} className="p-6 space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="shrink-0 flex gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleGroupSelect(group); }}
                                            className="text-gray-400 hover:text-[var(--gold)] cursor-pointer self-center"
                                        >
                                            {group.ids?.every((id: string) => selectedProductIds.has(id)) ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        <div className="shrink-0">
                                            {group.images && group.images.split(',')[0] ? (
                                                <img src={group.images.split(',')[0]} alt={group.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">📦</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-black text-gray-900 truncate">{group.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.category?.name}</p>
                                            </div>
                                            <span className="font-black text-[var(--gold)] ml-2">${group.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className={`badge text-[9px] ${group.totalStock > 10 ? 'badge-green' : group.totalStock > 0 ? 'bg-yellow-100 text-yellow-600' : 'badge-red'}`}>
                                                Stock: {group.totalStock}
                                            </span>
                                            {group.isNewArrival && <span className="badge-gold text-[9px]">New Collection</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3">
                                    {group.variants.map((variant: any) => (
                                        <div key={variant.id} className="flex items-center justify-between group">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    {variant.size || variant.color || 'Standard Variant'}
                                                </p>
                                                <code className="text-[8px] text-gray-300">{variant.sku}</code>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-white border border-gray-100 px-2 py-1 rounded-lg">
                                                    <button onClick={() => handleQuickStock(variant, -1)} className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500">-</button>
                                                    <span className="text-xs font-bold min-w-[1.5rem] text-center">{variant.stock}</span>
                                                    <button onClick={() => handleQuickStock(variant, 1)} className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-green-500">+</button>
                                                </div>
                                                <div className="flex items-center">
                                                    {canEdit && <button onClick={() => startEdit(variant)} className="p-1 mr-2 opacity-40 hover:opacity-100">✏️</button>}
                                                    <button onClick={() => printBarcode(variant.sku, variant.name, variant.price, variant.size, variant.color, variant.material)} className="p-1 opacity-40 hover:opacity-100">🏷️</button>
                                                    {canEdit && <button onClick={() => handleDelete(variant.id)} className="p-1 ml-2 opacity-40 hover:opacity-100 text-red-500">🗑️</button>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {canEdit && (
                                        <button
                                            onClick={() => handleAddVariant(group)}
                                            className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
                                        >
                                            + Add Color or Size
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {groupedProducts.length === 0 && (
                            <div className="p-20 text-center opacity-30">
                                <p className="text-4xl mb-4">📦</p>
                                <p className="font-black uppercase tracking-widest text-xs">No entries found in registry</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Floating Bulk Support Bar */}
            {
                selectedProductIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-6 duration-300">
                        <span className="text-xs font-black uppercase tracking-widest">{selectedProductIds.size} Selected</span>
                        <div className="h-4 w-px bg-gray-700"></div>
                        <div className="flex gap-4">
                            <button onClick={() => executeBulkAction('delete')} className="flex items-center gap-2 hover:text-red-400 transition-colors">
                                <Trash2 size={16} /> <span className="text-xs font-bold">Delete</span>
                            </button>
                            <div className="relative group">
                                <button className="flex items-center gap-2 hover:text-[var(--gold)] transition-colors py-2">
                                    <Tag size={16} /> <span className="text-xs font-bold">Apply Sale</span>
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 pb-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                                    <div className="bg-white text-black p-2 rounded-xl shadow-xl">
                                        {sales.map(sale => (
                                            <button key={sale.id} onClick={() => executeBulkAction('sale', sale.id)} className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-xs font-bold">
                                                {sale.name}
                                            </button>
                                        ))}
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button onClick={() => executeBulkAction('removeSale')} className="w-full text-left p-2 hover:bg-gray-100 rounded-lg text-xs font-bold text-red-500">
                                            Remove Sale
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Product Modal */}
            {
                showAdd && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 pb-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAdd(false); setQuickMode(false); setImages([]); }}></div>
                        <div className="relative bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in text-left border border-white/20">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{quickMode ? '⚡ Quick Entry Mode' : 'Add Product'}</h3>
                                    {quickMode && <p className="text-green-600 font-bold mt-1">✓ Added: {quickCount} products</p>}
                                </div>
                                <button onClick={() => { setShowAdd(false); setQuickMode(false); setImages([]); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Product Images</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative group">
                                                <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                                                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs">×</button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setShowPicker(true)}
                                            className="w-20 h-20 border-2 border-[var(--gold)] border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/5 transition-all bg-[#D4AF37]/5 group"
                                        >
                                            <div className="text-center">
                                                <span className="text-2xl block text-[var(--gold)]">🖼️</span>
                                                <span className="text-[7px] font-black text-[var(--gold)] uppercase tracking-[0.2em]">VAULT</span>
                                            </div>
                                        </button>
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all bg-gray-50 group">
                                            {uploading ? <span className="animate-pulse">⏳</span> : (
                                                <div className="text-center">
                                                    <span className="text-2xl text-gray-400 group-hover:text-[var(--gold)] block">+</span>
                                                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">FILES</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                                        <select required value={selectedMain?.id || ''} onChange={(e) => handleMainCategoryChange(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all">
                                            <option value="">Select category...</option>
                                            {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setNewProduct({ ...newProduct, isKids: !newProduct.isKids })}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">For Kids</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${newProduct.isKids ? 'bg-[var(--gold)]' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${newProduct.isKids ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setNewProduct({ ...newProduct, isNewArrival: !newProduct.isNewArrival })}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">New Arrival</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${newProduct.isNewArrival ? 'bg-[var(--gold)]' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${newProduct.isNewArrival ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {selectedMain?.children?.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subcategory</label>
                                        <select required value={newProduct.categoryId} onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all">
                                            <option value="">Select subcategory...</option>
                                            {selectedMain.children.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Product Name</label>
                                    <input required placeholder="e.g., Elegant Black Abaya" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Retail Price ($)</label>
                                        <input required type="number" step="0.01" value={newProduct.price || ''} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block flex items-center gap-1">
                                            Cost Price ($) <span className="text-[9px] lowercase font-normal text-gray-400 font-sans">(internal - your cost)</span>
                                        </label>
                                        <input required type="number" step="0.01" value={newProduct.costPrice || ''} onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) })} className="w-full p-4 bg-gray-50 border-2 border-[var(--gold)]/20 rounded-xl focus:border-[var(--gold)] transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Stock Qty</label>
                                        <input required type="number" value={newProduct.stock || ''} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block">Manual Discount Price ($)</label>
                                        <input type="number" step="0.01" placeholder="Override price..." value={newProduct.discountPrice || ''} onChange={(e) => setNewProduct({ ...newProduct, discountPrice: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all text-sm" />
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Overrides retail price if set.</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block">Seasonal Sale</label>
                                        <select value={newProduct.saleId || ''} onChange={(e) => setNewProduct({ ...newProduct, saleId: e.target.value })} className="w-full p-3 bg-white rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all text-sm">
                                            <option value="">No Active Sale</option>
                                            {sales.map((sale: any) => (
                                                <option key={sale.id} value={sale.id}>{sale.name} ({sale.type === 'Percentage' ? `${sale.value}%` : `$${sale.value}`} off)</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Applied if no manual discount set.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {categoryFields.map(field => (
                                        <div key={field}>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{field}</label>
                                            {field === 'color' ? (
                                                <select
                                                    value={(newProduct as any)[field] || ''}
                                                    onChange={(e) => setNewProduct({ ...newProduct, [field]: e.target.value } as any)}
                                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all cursor-pointer"
                                                >
                                                    <option value="">Select Color</option>
                                                    {colors.map(color => (
                                                        <option key={color.id} value={color.name}>{color.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input placeholder={`e.g., ${field === 'size' ? 'M' : ''}`} value={(newProduct as any)[field] || ''} onChange={(e) => setNewProduct({ ...newProduct, [field]: e.target.value } as any)} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    {!quickMode && <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Cancel</button>}
                                    <button type="submit" className="flex-1 gold-btn py-4" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : (quickMode ? '+ Add & Continue' : 'Add Product')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Product Modal */}
            {
                editingProduct && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 pb-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditingProduct(null); setImages([]); }}></div>
                        <div className="relative bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in text-left border border-white/20">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Edit Product</h3>
                                    <p className="text-gray-500 text-sm">SKU: {editingProduct.sku}</p>
                                </div>
                                <button onClick={() => { setEditingProduct(null); setImages([]); }} className="text-gray-400 text-2xl">×</button>
                            </div>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Product Images</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative group">
                                                <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                                                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs">×</button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setShowPicker(true)}
                                            className="w-20 h-20 border-2 border-[var(--gold)] border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/5 transition-all bg-[#D4AF37]/5 group"
                                        >
                                            <div className="text-center">
                                                <span className="text-2xl block text-[var(--gold)]">🖼️</span>
                                                <span className="text-[7px] font-black text-[var(--gold)] uppercase tracking-[0.2em]">VAULT</span>
                                            </div>
                                        </button>
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all bg-gray-50 group">
                                            {uploading ? <span className="animate-pulse">⏳</span> : (
                                                <div className="text-center">
                                                    <span className="text-2xl text-gray-400 group-hover:text-[var(--gold)] block">+</span>
                                                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">FILES</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                                        <div className="w-full p-4 bg-gray-100 rounded-xl text-xs font-bold text-gray-500 uppercase">
                                            {selectedMain?.name}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setEditingProduct({ ...editingProduct, isKids: !editingProduct.isKids })}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">For Kids</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${editingProduct.isKids ? 'bg-[var(--gold)]' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editingProduct.isKids ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setEditingProduct({ ...editingProduct, isNewArrival: !editingProduct.isNewArrival })}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">New Arrival</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${editingProduct.isNewArrival ? 'bg-[var(--gold)]' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editingProduct.isNewArrival ? 'translate-x-5' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Product Name</label>
                                    <input required value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Retail Price ($)</label>
                                        <input required type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block flex items-center gap-1">
                                            Cost Price ($) <span className="text-[9px] lowercase font-normal text-gray-400 font-sans">(internal - your cost)</span>
                                        </label>
                                        <input required type="number" step="0.01" value={editingProduct.costPrice || 0} onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) })} className="w-full p-4 bg-gray-50 border-2 border-[var(--gold)]/20 rounded-xl focus:border-[var(--gold)] transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Stock Level</label>
                                        <input required type="number" value={editingProduct.stock || ''} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block">Manual Discount Price ($)</label>
                                        <input type="number" step="0.01" placeholder="Override price..." value={editingProduct.discountPrice || ''} onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-white rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all text-sm" />
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Overrides retail price if set.</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2 block">Seasonal Sale</label>
                                        <select value={editingProduct.saleId || ''} onChange={(e) => setEditingProduct({ ...editingProduct, saleId: e.target.value })} className="w-full p-3 bg-white rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all text-sm">
                                            <option value="">No Active Sale</option>
                                            {sales.map((sale: any) => (
                                                <option key={sale.id} value={sale.id}>{sale.name} ({sale.type === 'Percentage' ? `${sale.value}%` : `$${sale.value}`} off)</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 italic">Applied if no manual discount set.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {categoryFields.map(field => (
                                        <div key={field}>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{field}</label>
                                            {field === 'color' ? (
                                                <select
                                                    value={editingProduct[field] || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, [field]: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all cursor-pointer"
                                                >
                                                    <option value="">Select Color</option>
                                                    {colors.map(color => (
                                                        <option key={color.id} value={color.name}>{color.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input placeholder={`e.g., ${field === 'size' ? 'M' : ''}`} value={editingProduct[field] || ''} onChange={(e) => setEditingProduct({ ...editingProduct, [field]: e.target.value })} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 gold-btn py-4" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Import Modal */}
            {
                showImport && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 pb-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImport(false)}></div>
                        <div className="relative bg-white p-8 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in text-left border border-white/20">
                            <h3 className="text-2xl font-black mb-6">📤 Import Products</h3>
                            {!importResult ? (
                                <>
                                    <p className="text-gray-500 mb-4">Found {importData.length} products to import:</p>
                                    <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto mb-6">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-xs font-bold text-gray-400 uppercase"><th className="text-left p-2">Name</th><th className="text-left p-2">Category</th><th className="text-right p-2">Price</th><th className="text-right p-2">Stock</th></tr></thead>
                                            <tbody>
                                                {importData.slice(0, 10).map((p, i) => (
                                                    <tr key={i} className="border-t border-gray-200">
                                                        <td className="p-2 font-medium">{p.name}</td>
                                                        <td className="p-2 text-gray-500">{p.categoryName}{p.subcategoryName ? ` → ${p.subcategoryName}` : ''}</td>
                                                        <td className="p-2 text-right">${p.price}</td>
                                                        <td className="p-2 text-right">{p.stock}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setShowImport(false)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Cancel</button>
                                        <button onClick={handleImport} className="flex-1 gold-btn py-4">Import {importData.length} Products</button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-6xl mb-4">{importResult.failed === 0 ? '✅' : '⚠️'}</p>
                                    <h4 className="text-2xl font-black">Import Complete</h4>
                                    <p className="text-green-600 font-bold mt-2">{importResult.success} products imported</p>
                                    {importResult.failed > 0 && <p className="text-red-500 font-bold">{importResult.failed} failed</p>}
                                    <button onClick={() => { setShowImport(false); setImportResult(null); }} className="w-full p-4 bg-gray-100 rounded-xl font-bold mt-6">Close</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            <DashboardTour userRole={userRole} />
            {
                showPicker && (
                    <MediaPicker
                        onSelect={(url) => setImages(prev => [...prev, url])}
                        onClose={() => setShowPicker(false)}
                    />
                )
            }
            <DashboardPageGuide
                pageName={{ en: "Inventory Registry", ar: "سجل المخزون" }}
                steps={[
                    {
                        title: { en: "Collection Library", ar: "مكتبة المجموعة" },
                        description: {
                            en: "Manage unique pieces in the catalog. Items are grouped by Article Name for a clean, boutique-style view.",
                            ar: "إدارة القطع الفريدة في الكتالوج. يتم تجميع العناصر حسب اسم المنتج لعرض أنيق بأسلوب البوتيك."
                        },
                        icon: <Package size={14} />
                    },
                    {
                        title: { en: "Variant Management", ar: "إدارة المتغيرات" },
                        description: {
                            en: "Expand any Article to manage specific Sizes and Colors as individual SKUs with dedicated stock counts.",
                            ar: "وسّع أي منتج لإدارة الأحجام والألوان كوحدات SKU منفصلة مع عدادات مخزون مخصصة."
                        },
                        icon: <Layers size={14} />
                    },
                    {
                        title: { en: "Dynamic Valuation", ar: "التسعير الديناميكي" },
                        description: {
                            en: "Set standard luxury prices or link products to active Sale Campaigns for automated boutique discounting.",
                            ar: "حدد أسعار الرفاهية القياسية أو اربط المنتجات بحملات البيع النشطة للخصومات التلقائية."
                        },
                        icon: <TrendingDown size={14} />
                    },
                    {
                        title: { en: "Logistics Labeling", ar: "ملصقات اللوجستيات" },
                        description: {
                            en: "Generate high-contrast barcodes for each variant to enable rapid scanning during fulfilling and checkout.",
                            ar: "إنشاء باركودات عالية التباين لكل متغير لتمكين المسح السريع أثناء التجهيز والدفع."
                        },
                        icon: <Barcode size={14} />
                    }
                ]}
            />
        </>
    )
}
