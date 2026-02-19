'use client'

import { useState, useEffect } from 'react'
import { Landmark, TrendingUp, Calculator, ShieldCheck, HelpCircle, Lock, Truck, Globe, Users, Copy, CheckCircle2, Plus, Trash2, Package, Sofa, Monitor } from 'lucide-react'
import { getInsuranceStats, getAssets, addAsset, deleteAsset } from '@/app/actions/assets'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function InsurancePage() {
    // --- DATA STATE ---
    const [stats, setStats] = useState({
        stockCost: 0,
        assetsValue: 0,
        equipmentValue: 0,
        furnitureValue: 0,
        totalContents: 0
    })
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // --- FORM STATE (PROJECTION) ---
    const [annualRevenue, setAnnualRevenue] = useState(200000)

    // --- ASSET FORM ---
    const [showAssetForm, setShowAssetForm] = useState(false)
    const [newAsset, setNewAsset] = useState({ name: '', type: 'Equipment', value: 0, description: '' })

    // --- SHIPPING & SECURITY ---
    const [hasMonitoredAlarm, setHasMonitoredAlarm] = useState(true)
    const [hasFireSprinklers, setHasFireSprinklers] = useState(false)
    const [usSalesPercent, setUsSalesPercent] = useState(0)

    // --- HELPERS ---
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [s, a] = await Promise.all([getInsuranceStats(), getAssets()])
        setStats(s)
        setAssets(a)
        setLoading(false)
    }

    const handleAddAsset = async () => {
        if (!newAsset.name || newAsset.value <= 0) return
        await addAsset(newAsset)
        setNewAsset({ name: '', type: 'Equipment', value: 0, description: '' })
        setShowAssetForm(false)
        loadData()
    }

    const handleDeleteAsset = async (id: string) => {
        await deleteAsset(id)
        loadData()
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900 flex items-center gap-3">
                        <ShieldCheck className="text-[var(--gold)]" size={36} />
                        Insurance & Asset Hub
                    </h2>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Universal Protection & Value Tracking</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => loadData()}
                        className="bg-white border border-gray-100 p-3 rounded-2xl hover:shadow-md transition-all text-gray-400 hover:text-black"
                    >
                        <TrendingUp size={20} />
                    </button>
                    <div className="bg-white/50 backdrop-blur-sm border border-[var(--gold)]/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Live Valuation Sync</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Main Calculators & Asset Management */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <Package className="absolute -right-4 -bottom-4 text-gray-50 size-24 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Stock Cost</p>
                            <p className="text-3xl font-black italic text-gray-900">${stats.stockCost.toLocaleString()}</p>
                            <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter mt-2 block">Auto-calculated from Inventory</span>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <Monitor className="absolute -right-4 -bottom-4 text-gray-50 size-24 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Equipment & Tech</p>
                            <p className="text-3xl font-black italic text-gray-900">${stats.equipmentValue.toLocaleString()}</p>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-2 block">Recorded Assets</span>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <Sofa className="absolute -right-4 -bottom-4 text-gray-50 size-24 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Furniture & Fixtures</p>
                            <p className="text-3xl font-black italic text-gray-900">${stats.furnitureValue.toLocaleString()}</p>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-2 block">Recorded Assets</span>
                        </div>
                    </div>

                    {/* 2. Revenue Projection Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-[var(--gold)]" size={24} />
                            <h3 className="text-xl font-black italic">Annual Revenue Projection</h3>
                        </div>

                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estimated Revenue</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black text-gray-900 italic">${annualRevenue.toLocaleString()}</span>
                                    <span className="text-xl font-bold text-[var(--gold)]">/ YEAR</span>
                                </div>
                            </div>
                            <div className="px-6 py-2 bg-gray-900 text-white rounded-full text-[10px] font-bold tracking-[0.2em]">
                                {annualRevenue < 300000 ? 'LUXURY STARTUP' : annualRevenue < 1000000 ? 'PREMIUM BOUTIQUE' : 'ENTERPRISE SCALE'}
                            </div>
                        </div>

                        <div className="relative h-4 group">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[#C9A227] transition-all duration-300" style={{ width: `${Math.min((annualRevenue / 5000000) * 100, 100)}%` }} />
                            </div>
                            <input
                                type="range" min="0" max="5000000" step="10000"
                                value={annualRevenue}
                                onChange={(e) => setAnnualRevenue(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20"
                            />
                        </div>
                    </div>

                    {/* 3. Asset Management Section */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Landmark className="text-[var(--gold)]" size={24} />
                                <h3 className="text-xl font-black italic">Asset Inventory Recorder</h3>
                            </div>
                            <button
                                onClick={() => setShowAssetForm(!showAssetForm)}
                                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[var(--gold)] hover:text-black transition-all"
                            >
                                <Plus size={16} />
                                Record Asset
                            </button>
                        </div>

                        {showAssetForm && (
                            <div className="mb-8 p-8 bg-gray-50 rounded-[2rem] border border-black/5 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Name</label>
                                        <input
                                            placeholder="e.g. MacBook Pro M3, Store Desk..."
                                            value={newAsset.name}
                                            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                            className="w-full bg-white rounded-xl p-4 font-bold outline-none border border-transparent focus:border-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</label>
                                        <select
                                            value={newAsset.type}
                                            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                            className="w-full bg-white rounded-xl p-4 font-bold outline-none border border-transparent focus:border-black"
                                        >
                                            <option>Equipment</option>
                                            <option>Furniture</option>
                                            <option>Fixture</option>
                                            <option>Tech</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value ($)</label>
                                        <input
                                            type="number"
                                            value={newAsset.value}
                                            onChange={(e) => setNewAsset({ ...newAsset, value: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white rounded-xl p-4 font-bold outline-none border border-transparent focus:border-black"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setShowAssetForm(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Cancel</button>
                                    <button onClick={handleAddAsset} className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--gold)] hover:text-black transition-all">Save Asset</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {assets.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No assets recorded yet</p>
                                </div>
                            ) : (
                                assets.map((asset) => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-black/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[var(--gold)]">
                                                {asset.type === 'Tech' ? <Monitor size={18} /> : asset.type === 'Furniture' ? <Sofa size={18} /> : <Landmark size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                                    {asset.name}
                                                    {asset.isFromFinance && (
                                                        <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100">Finance Hub</span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{asset.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="font-black italic text-lg">${asset.value.toLocaleString()}</p>
                                            {!asset.isFromFinance && (
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {asset.isFromFinance && (
                                                <div className="w-[32px]" /> // Spacer to align with manual assets
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 4. Shipping & Security */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Lock className="text-[var(--gold)]" size={20} />
                                <h3 className="text-lg font-black italic">Building Safety</h3>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-black/5">
                                    <span className="text-sm font-bold text-gray-700">Monitored Alarm</span>
                                    <input type="checkbox" checked={hasMonitoredAlarm} onChange={(e) => setHasMonitoredAlarm(e.target.checked)} className="w-5 h-5 accent-black" />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-black/5">
                                    <span className="text-sm font-bold text-gray-700">Fire Sprinkler System</span>
                                    <input type="checkbox" checked={hasFireSprinklers} onChange={(e) => setHasFireSprinklers(e.target.checked)} className="w-5 h-5 accent-black" />
                                </label>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Truck className="text-[var(--gold)]" size={20} />
                                <h3 className="text-lg font-black italic">Shipping Destination</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">US Sales % (Liability Factor)</label>
                                <input
                                    type="number"
                                    value={usSalesPercent}
                                    onChange={(e) => setUsSalesPercent(parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-50 rounded-2xl p-4 font-bold outline-none border border-transparent focus:border-black"
                                />
                                <p className="text-[9px] text-gray-400 mt-2 px-1 leading-relaxed">Most Ontario insurers (TD, Aviva) need to know if Sales exceed 25% to USA.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Quick Copy Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-8 bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
                            <Copy className="text-[var(--gold)]" size={20} />
                            Quick-Copy for Forms
                        </h3>

                        <div className="space-y-6">
                            {[
                                { label: 'Gross Annual Revenue', val: `$${annualRevenue.toLocaleString()}` },
                                { label: 'Contents Replacement Cost', val: `$${stats.totalContents.toLocaleString()}` },
                                { label: 'Location Jurisdiction', val: 'Windsor, ON' },
                                { label: 'Security Features', val: `${hasMonitoredAlarm ? 'Monitored Alarm' : 'Standard Protection'} + ${hasFireSprinklers ? 'Full Sprinklers' : 'No Sprinklers'}` },
                                { label: 'Shipping Scope', val: usSalesPercent > 0 ? `Canada + ${usSalesPercent}% USA` : '100% Domestic (Canada)' },
                            ].map((item, idx) => (
                                <div key={idx} className="group relative">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg text-white font-mono">{item.val}</span>
                                        <button
                                            onClick={() => handleCopy(item.val)}
                                            className="p-2 bg-white/5 rounded-lg hover:bg-[var(--gold)] hover:text-black transition-all"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="text-[var(--gold)]" size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Digital Risk Policy</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed font-bold">
                                MODE AURA Cyber-Security Tier: HIGH.
                                <br />PCI-DSS Compliant (via Stripe), TLS 1.3 Encryption, and MFA enabled management.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[var(--gold)] p-8 rounded-[2.5rem] text-black">
                        <h4 className="font-black italic text-lg mb-2">Ayman's Tip</h4>
                        <p className="text-xs font-bold leading-relaxed">
                            Always insurance your stock at **COST PRICE**, not retail value. TD only pays you what you lost, not the profit you would have made!
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {copied && (
                <div className="fixed bottom-10 right-10 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-[100]">
                    <CheckCircle2 className="text-[var(--gold)]" size={20} />
                    <span className="font-bold text-xs uppercase tracking-widest">Copied to Clipboard!</span>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Insurance Vault", ar: "خزنة التأمين" }}
                steps={[
                    {
                        title: { en: "Coverage Overview", ar: "نظرة عامة على التغطية" },
                        description: {
                            en: "View total inventory value, insurance recommendations, and premium estimates for your assets.",
                            ar: "عرض إجمالي قيمة المخزون وتوصيات التأمين وتقديرات الأقساط لأصولك."
                        },
                        icon: "🛡️"
                    },
                    {
                        title: { en: "Asset Registry", ar: "سجل الأصول" },
                        description: {
                            en: "Register business assets (equipment, furniture, electronics) with estimated values for insurance coverage.",
                            ar: "تسجيل أصول العمل (معدات، أثاث، إلكترونيات) بقيم تقديرية لتغطية التأمين."
                        },
                        icon: "📝"
                    },
                    {
                        title: { en: "Risk Assessment", ar: "تقييم المخاطر" },
                        description: {
                            en: "Review coverage recommendations and copy insurance summary reports for broker communications.",
                            ar: "مراجعة توصيات التغطية ونسخ تقارير ملخص التأمين للتواصل مع الوسيط."
                        },
                        icon: "📊"
                    }
                ]}
            />
        </div>
    )
}
