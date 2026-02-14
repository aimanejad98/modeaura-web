'use client'

import { useState, useEffect } from 'react'
import { getStaff } from '@/app/actions/staff'
import { getProducts } from '@/app/actions/inventory'
import { printStaffBarcode, printBarcode } from '@/components/Barcode'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function BarcodeHub() {
    const [staff, setStaff] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'staff' | 'products'>('products')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('dashboard_user')
            if (savedUser) {
                const user = JSON.parse(savedUser)
                if (user.role !== 'Admin') {
                    window.location.href = '/dashboard'
                    return
                }
            } else {
                window.location.href = '/login'
                return
            }
        }
        checkAuth()
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [staffData, productsData] = await Promise.all([
            getStaff(),
            getProducts()
        ])
        setStaff(staffData)
        setProducts(productsData)
        setLoading(false)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#D4AF37] font-bold animate-pulse text-lg tracking-widest uppercase">Initializing Vault...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Vault Labels</h2>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Generate secure barcodes for inventory & personnel</p>
                </div>
                <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setTab('products')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'products' ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        📦 Inventory
                    </button>
                    <button
                        onClick={() => setTab('staff')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'staff' ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        👥 Staff IDs
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={`Search ${tab === 'products' ? 'Products by Name or SKU' : 'Staff by Name or Email'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl grayscale opacity-30">🔍</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tab === 'products' ? (
                    filteredProducts.map(p => (
                        <div key={p.id} className="card p-6 flex flex-col justify-between group hover:border-[#D4AF37] transition-colors">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                    {p.images ? (
                                        <img src={p.images.split(',')[0]} className="w-full h-full object-cover" alt={p.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-1">SKU: {p.sku}</p>
                                    <p className="text-sm font-black text-[var(--gold)] mt-1">${p.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => printBarcode(p.sku, p.name, p.price, p.size, p.color, p.material)}
                                className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all group-hover:shadow-xl group-hover:shadow-[var(--gold)]/20"
                            >
                                Generate Tag 🖨️
                            </button>
                        </div>
                    ))
                ) : (
                    filteredStaff.map(s => (
                        <div key={s.id} className="card p-6 flex flex-col justify-between group hover:border-[#D4AF37] transition-colors">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0">
                                    {s.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                                    <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest mt-1">{s.role}</p>
                                    <p className="text-[10px] text-gray-400 truncate mt-1">{s.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => printStaffBarcode(s.name, s.role, s.email, s.password || '')}
                                className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all group-hover:shadow-xl group-hover:shadow-[var(--gold)]/20"
                            >
                                Generate ID 📇
                            </button>
                        </div>
                    ))
                )}
            </div>

            {((tab === 'products' && filteredProducts.length === 0) || (tab === 'staff' && filteredStaff.length === 0)) && (
                <div className="p-20 text-center card bg-gray-50/50 border-dashed">
                    <div className="text-4xl mb-4 grayscale opacity-30">🔍</div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No matching records found in the vault</p>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Barcode Hub", ar: "مركز الباركود" }}
                steps={[
                    {
                        title: { en: "Product Barcodes", ar: "باركود المنتجات" },
                        description: {
                            en: "Generate and print barcodes for product variants. Search by name or SKU to find specific items.",
                            ar: "إنشاء وطباعة باركودات لمتغيرات المنتج. ابحث بالاسم أو SKU للعثور على عناصر محددة."
                        },
                        icon: "📱"
                    },
                    {
                        title: { en: "Staff Barcodes", ar: "باركود الموظفين" },
                        description: {
                            en: "Print identification barcodes for team members to enable quick login at the POS terminal.",
                            ar: "طباعة باركودات تعريف لأعضاء الفريق لتمكين الدخول السريع في نقطة البيع."
                        },
                        icon: "💳"
                    },
                    {
                        title: { en: "Batch Printing", ar: "الطباعة الجماعية" },
                        description: {
                            en: "Use the search filter to narrow results and print multiple barcodes efficiently for inventory labeling.",
                            ar: "استخدم فلتر البحث لتضييق النتائج وطباعة عدة باركودات بكفاءة لتسمية المخزون."
                        },
                        icon: "🖨️"
                    }
                ]}
            />
        </div>
    )
}
