'use client'

import { useState, useEffect } from 'react'
import { getSales, addSale, updateSale, deleteSale } from '@/app/actions/sales'
import { Plus, Trash2, Edit2, Calendar, Percent, Tag } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function SalesManagement() {
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [newSale, setNewSale] = useState({
        name: '',
        type: 'Percentage',
        value: 0,
        startDate: '',
        endDate: '',
        description: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getSales()
        setSales(data)
        setLoading(false)
    }

    async function handleAddSale(e: React.FormEvent) {
        e.preventDefault()
        try {
            await addSale(
                newSale.name,
                newSale.type,
                newSale.value,
                newSale.startDate,
                newSale.endDate,
                newSale.description
            )
            setNewSale({ name: '', type: 'Percentage', value: 0, startDate: '', endDate: '', description: '' })
            setShowAdd(false)
            loadData()
        } catch (error) {
            alert('Failed to create sale')
        }
    }

    async function handleToggleActive(id: string, currentActive: boolean) {
        try {
            await updateSale(id, { active: !currentActive })
            loadData()
        } catch (error) {
            alert('Failed to update sale')
        }
    }

    async function handleDeleteSale(id: string) {
        if (!confirm('Delete this sale campaign? Products will no longer have this discount.')) return
        try {
            await deleteSale(id)
            loadData()
        } catch (error) {
            alert('Failed to delete sale')
        }
    }

    if (loading) return <div className="p-12 text-center animate-pulse text-[var(--gold)] font-bold">Loading sales...</div>

    const activeSales = sales.filter(s => s.active)
    const inactiveSales = sales.filter(s => !s.active)

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Sales Campaigns</h2>
                    <p className="text-gray-500 mt-2">Create seasonal sales and discount campaigns</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="gold-btn">
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {/* Active Sales */}
            <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-wider text-gray-700">🔥 Active Campaigns</h3>
                {activeSales.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
                        No active sales campaigns
                    </div>
                )}
                <div className="grid gap-4">
                    {activeSales.map((sale) => (
                        <SaleCard key={sale.id} sale={sale} onToggle={handleToggleActive} onDelete={handleDeleteSale} />
                    ))}
                </div>
            </div>

            {/* Inactive Sales */}
            {inactiveSales.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-black uppercase tracking-wider text-gray-400">📦 Inactive Campaigns</h3>
                    <div className="grid gap-4 opacity-60">
                        {inactiveSales.map((sale) => (
                            <SaleCard key={sale.id} sale={sale} onToggle={handleToggleActive} onDelete={handleDeleteSale} />
                        ))}
                    </div>
                </div>
            )}

            {/* Add Sale Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl">
                        <h3 className="text-2xl font-black mb-6">Create Sale Campaign</h3>
                        <form onSubmit={handleAddSale} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Campaign Name</label>
                                <input
                                    required
                                    placeholder="e.g., Summer Sale 2024"
                                    value={newSale.name}
                                    onChange={(e) => setNewSale({ ...newSale, name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Discount Type</label>
                                    <select
                                        value={newSale.type}
                                        onChange={(e) => setNewSale({ ...newSale, type: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all"
                                    >
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Value</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder={newSale.type === 'Percentage' ? '20' : '10.00'}
                                        value={newSale.value || ''}
                                        onChange={(e) => setNewSale({ ...newSale, value: parseFloat(e.target.value) })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Start Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={newSale.startDate}
                                        onChange={(e) => setNewSale({ ...newSale, startDate: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">End Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={newSale.endDate}
                                        onChange={(e) => setNewSale({ ...newSale, endDate: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Description (Optional)</label>
                                <textarea
                                    placeholder="e.g., Save big this summer!"
                                    value={newSale.description}
                                    onChange={(e) => setNewSale({ ...newSale, description: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-4 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 gold-btn">
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Sales Campaigns", ar: "حملات البيع" }}
                steps={[
                    {
                        title: { en: "Campaign Overview", ar: "نظرة عامة على الحملات" },
                        description: {
                            en: "View all active and inactive sale campaigns with their discount percentages, dates, and linked products.",
                            ar: "عرض جميع حملات البيع النشطة وغير النشطة مع نسب الخصم والتواريخ والمنتجات المرتبطة."
                        },
                        icon: "🔥"
                    },
                    {
                        title: { en: "Create Campaign", ar: "إنشاء حملة" },
                        description: {
                            en: "Click 'New Campaign' to set up a sale with name, discount type (percentage or fixed), value, and date range.",
                            ar: "انقر على 'حملة جديدة' لإعداد عرض بيع باسم ونوع الخصم (نسبة أو ثابت) والقيمة ونطاق التاريخ."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Activate & Deactivate", ar: "تفعيل وتعطيل" },
                        description: {
                            en: "Toggle campaigns on or off instantly. Active campaigns automatically apply discounts to linked products.",
                            ar: "قم بتبديل الحملات بين التشغيل والإيقاف فوراً. الحملات النشطة تطبق الخصومات تلقائياً على المنتجات المرتبطة."
                        },
                        icon: "⚡"
                    },
                    {
                        title: { en: "Campaign Analytics", ar: "تحليلات الحملات" },
                        description: {
                            en: "Track the number of products linked to each campaign and monitor the live status of ongoing sales.",
                            ar: "تتبع عدد المنتجات المرتبطة بكل حملة وراقب حالة المبيعات الجارية مباشرة."
                        },
                        icon: "📊"
                    }
                ]}
            />
        </div>
    )
}

function SaleCard({ sale, onToggle, onDelete }: { sale: any, onToggle: (id: string, active: boolean) => void, onDelete: (id: string) => void }) {
    const isActive = sale.active
    const now = new Date()
    const start = new Date(sale.startDate)
    const end = new Date(sale.endDate)
    const isOngoing = now >= start && now <= end

    return (
        <div className={`bg-white rounded-2xl p-6 border-2 ${isActive ? 'border-[var(--gold)]' : 'border-gray-200'} transition-all`}>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-black">{sale.name}</h4>
                        {isOngoing && isActive && (
                            <span className="text-xs font-black uppercase tracking-wider bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                Live Now
                            </span>
                        )}
                        {!isActive && (
                            <span className="text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                Inactive
                            </span>
                        )}
                    </div>

                    {sale.description && (
                        <p className="text-sm text-gray-600 mb-4">{sale.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Percent size={16} className="text-[var(--gold)]" />
                            <span className="font-bold">{sale.type === 'Percentage' ? `${sale.value}%` : `$${sale.value}`} OFF</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag size={16} className="text-gray-400" />
                            <span>{sale.products?.length || 0} products</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onToggle(sale.id, sale.active)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-[var(--gold)] text-white hover:bg-[#c49a3c]'
                            }`}
                    >
                        {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={() => onDelete(sale.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
