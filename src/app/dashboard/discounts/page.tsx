'use client';

import { useState, useEffect } from 'react';
import { getDiscountCodes, createDiscountCode, toggleDiscountCode, deleteDiscountCode } from '@/app/actions/discounts';
import { Ticket, Plus, Save, Trash2, CheckCircle2, XCircle, Loader2, Calendar, DollarSign, Percent, TrendingUp } from 'lucide-react';
import Price from '@/components/Price';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function DiscountsPage() {
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'Percentage' as 'Percentage' | 'Fixed',
        value: 10,
        minOrderAmount: 0,
        maxUses: '',
        expiresAt: ''
    });

    useEffect(() => {
        loadCodes();
    }, []);

    async function loadCodes() {
        const data = await getDiscountCodes();
        setCodes(data);
        setLoading(false);
    }

    async function handleCreate() {
        setSaving(true);
        const result = await createDiscountCode({
            ...formData,
            maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined
        });
        if (result.success) {
            setShowAdd(false);
            setFormData({ code: '', type: 'Percentage', value: 10, minOrderAmount: 0, maxUses: '', expiresAt: '' });
            await loadCodes();
        } else {
            alert(result.error);
        }
        setSaving(false);
    }

    async function handleToggle(id: string, active: boolean) {
        const result = await toggleDiscountCode(id, !active);
        if (result.success) loadCodes();
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this discount code?')) return;
        const result = await deleteDiscountCode(id);
        if (result.success) loadCodes();
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = 'MODE';
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, code: res });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] rounded-full border border-[var(--gold)]/20">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Growth & Incentives</span>
                    </div>
                    <h1 className="text-4xl font-display italic text-[var(--text-primary)]">Promotional Codes</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Manage incentives and track boutique conversions</p>
                </div>
                {!showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="gold-btn px-8 py-3 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span className="text-xs font-black uppercase tracking-widest text-white">Create New Code</span>
                    </button>
                )}
            </div>

            {/* Creation Workspace */}
            {showAdd && (
                <div className="card p-10 animate-in slide-in-from-top-6 duration-700">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--mocha-border)]">
                        <h2 className="text-xl font-display italic text-[var(--text-primary)]">New Promotion Logic</h2>
                        <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors">Discard</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Discount Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="flex-1 bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all font-mono uppercase"
                                    placeholder="MODE20"
                                />
                                <button onClick={generateCode} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-[var(--gold)] transition-all" title="Generate Random Code">
                                    <TrendingUp size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Incentive Type</label>
                            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-[var(--mocha-border)] h-[60px]">
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'Percentage' })}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'Percentage' ? 'bg-[var(--gold)] text-white' : 'text-gray-500'}`}
                                >
                                    <Percent size={14} /> Percentage
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'Fixed' })}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'Fixed' ? 'bg-[var(--gold)] text-white' : 'text-gray-500'}`}
                                >
                                    <DollarSign size={14} /> Fixed
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Value ({formData.type === 'Percentage' ? '%' : '$'})</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Min. Order Value</label>
                            <input
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                                className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Max Uses (Optional)</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all"
                                placeholder="Infinite"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:border-[var(--gold)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={handleCreate}
                            disabled={saving || !formData.code}
                            className="gold-btn px-12 py-4 flex items-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">Activatue Promotion</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Codes Ledger */}
            <div className="card overflow-hidden">
                <div className="p-8 border-b border-[var(--mocha-border)] flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Active Incentives</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{codes.length} Registered Codes</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-[var(--mocha-border)] bg-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Code Architecture</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Value</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Utilization</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Constraints</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {codes.map((code) => (
                                <tr key={code.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                                                <Ticket size={20} />
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">{code.code}</p>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Created {new Date(code.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                {code.type === 'Percentage' ? `${code.value}%` : <Price amount={code.value} />}
                                            </span>
                                            <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest">{code.type} REDUCTION</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all"
                                                    style={{ width: code.maxUses ? `${Math.min((code.uses / code.maxUses) * 100, 100)}%` : '0%' }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--text-secondary)]">{code.uses} {code.maxUses && `/ ${code.maxUses}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            {code.minOrderAmount > 0 && (
                                                <div className="flex items-center gap-2 text-[8px] font-black text-[var(--text-primary)]/40 uppercase tracking-widest">
                                                    <DollarSign size={8} /> Min. <Price amount={code.minOrderAmount} />
                                                </div>
                                            )}
                                            {code.expiresAt && (
                                                <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${new Date(code.expiresAt) < new Date() ? 'text-red-400' : 'text-emerald-400/60'}`}>
                                                    <Calendar size={8} /> Exp: {new Date(code.expiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            {!code.minOrderAmount && !code.expiresAt && <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Unconstrained</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleToggle(code.id, code.active)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${code.active
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}
                                        >
                                            {code.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{code.active ? 'Operational' : 'Paused'}</span>
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleDelete(code.id)}
                                            className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DashboardPageGuide
                pageName={{ en: "Discount Codes", ar: "أكواد الخصم" }}
                steps={[
                    {
                        title: { en: "Code Overview", ar: "نظرة عامة على الأكواد" },
                        description: {
                            en: "View all discount codes with their type (percentage/fixed), value, usage count, and active status.",
                            ar: "عرض جميع أكواد الخصم مع نوعها (نسبة/ثابت) وقيمتها وعدد الاستخدامات وحالة التفعيل."
                        },
                        icon: "🏷️"
                    },
                    {
                        title: { en: "Generate Codes", ar: "إنشاء الأكواد" },
                        description: {
                            en: "Create new discount codes with custom or auto-generated codes, set discount type and expiry dates.",
                            ar: "أنشئ أكواد خصم جديدة برموز مخصصة أو تلقائية، حدد نوع الخصم وتواريخ الانتهاء."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Usage Tracking", ar: "تتبع الاستخدام" },
                        description: {
                            en: "Monitor how many times each code has been used and its total savings impact on your revenue.",
                            ar: "راقب عدد مرات استخدام كل كود وتأثيره الإجمالي على التوفير في إيراداتك."
                        },
                        icon: "📊"
                    }
                ]}
            />
        </div>
    );
}
