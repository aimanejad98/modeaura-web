'use client'

import { useState, useEffect } from 'react'
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers'
import { Search, UserPlus, Mail, Phone, Tag, MoreVertical, Edit2, Trash2, Key, CheckCircle, Compass } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<any>(null)
    const [resettingUser, setResettingUser] = useState<any>(null)
    const [newPassword, setNewPassword] = useState('')
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', tags: '' })
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadCustomers()
    }, [])

    async function loadCustomers() {
        setLoading(true)
        const data = await getCustomers()
        setCustomers(data)
        setLoading(false)
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        await addCustomer(newCustomer)
        setNewCustomer({ name: '', email: '', phone: '', tags: '' })
        setShowAdd(false)
        loadCustomers()
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingCustomer) return
        await updateCustomer(editingCustomer.id, editingCustomer)
        setEditingCustomer(null)
        loadCustomers()
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return
        await deleteCustomer(id)
        loadCustomers()
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        if (!resettingUser || !newPassword) return
        const { resetCustomerPassword } = await import('@/app/actions/customers')
        await resetCustomerPassword(resettingUser.id, newPassword)
        setResettingUser(null)
        setNewPassword('')
        alert('Password has been reset successfully.')
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery) ||
        c.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return (
        <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing CRM Database...</p>
        </div>
    )

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h2 className="text-4xl font-black italic text-[#1B2936] tracking-tight">Customer CRM</h2>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">Management Console</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--gold)] transition-colors" size={16} />
                        <input
                            placeholder="SEARCH DATABASE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-[#E8E2D9] rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[var(--gold)] w-full sm:w-80 shadow-sm transition-all"
                        />
                    </div>
                    <button onClick={() => setShowAdd(true)} className="gold-btn h-[58px] px-10 rounded-2xl shadow-xl shadow-[var(--gold)]/20 hover:scale-[1.02] active:scale-95">
                        <UserPlus size={16} className="mr-3" />
                        New Entry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-[#E8E2D9] hover:border-[var(--gold)]/30 hover:shadow-2xl hover:shadow-[var(--gold)]/5 transition-all duration-500 relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-[#1B2936]/5 rounded-3xl flex items-center justify-center text-[#1B2936] font-display text-2xl italic transition-colors group-hover:bg-[var(--gold)] group-hover:text-white">
                                    {customer.name[0]}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-display italic text-xl text-[#1B2936]">{customer.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={async () => {
                                                const { toggleVerifyCustomer } = await import('@/app/actions/customers');
                                                await toggleVerifyCustomer(customer.id, !customer.isVerified);
                                                loadCustomers();
                                            }}
                                            className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full transition-all ${customer.isVerified
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                                }`}
                                        >
                                            <CheckCircle size={10} />
                                            {customer.isVerified ? 'Verified' : 'Pending'}
                                        </button>
                                        {customer.tags && (
                                            <span className="bg-[#1B2936]/5 text-[#1B2936]/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <Tag size={10} />
                                                {customer.tags}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button onClick={() => setEditingCustomer(customer)} className="p-3 text-gray-300 hover:text-[var(--gold)] hover:bg-[var(--gold)]/5 rounded-2xl transition-all" title="Edit Profile">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(customer.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Remove Entry">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3 pt-8 border-t border-[#F1EEE9]">
                            {customer.email && (
                                <div className="flex items-center gap-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="text-[10px] font-bold tracking-wider truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="flex items-center gap-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <Phone size={14} className="shrink-0" />
                                    <span className="text-[10px] font-bold tracking-wider">{customer.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-[#FAF9F6] p-4 rounded-2xl">
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Valuation</p>
                                <p className="font-display italic text-lg text-[var(--gold)]">${customer.totalSpend.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={() => setResettingUser(customer)}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-gray-200 hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 text-gray-300 hover:text-[var(--gold)] transition-all"
                            >
                                <Key size={14} className="mb-1" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Security</span>
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCustomers.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-[#E8E2D9] rounded-[3rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-gray-200" size={32} />
                        </div>
                        <h3 className="font-display italic text-2xl text-[#1B2936] mb-2">No Records Found</h3>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Adjust your search or add a new entry</p>
                    </div>
                )}
            </div>

            {/* Modals - Refined Styling */}
            {(showAdd || editingCustomer) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.25)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--gold)]" />

                        <div className="space-y-2 mb-10">
                            <h3 className="text-3xl font-black italic text-[#1B2936]">{editingCustomer ? 'Edit Resident' : 'Add New Resident'}</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">CRM DATA ENTRY</p>
                        </div>

                        <form onSubmit={editingCustomer ? handleUpdate : handleAdd} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Legal Name</label>
                                <input
                                    required
                                    placeholder="Enter full name..."
                                    value={editingCustomer ? editingCustomer.name : newCustomer.name}
                                    onChange={(e) => editingCustomer ? setEditingCustomer({ ...editingCustomer, name: e.target.value }) : setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full px-6 py-5 bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={editingCustomer ? editingCustomer.email : newCustomer.email}
                                        onChange={(e) => editingCustomer ? setEditingCustomer({ ...editingCustomer, email: e.target.value }) : setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className="w-full px-6 py-5 bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Contact Phone</label>
                                    <input
                                        placeholder="+1 (555) 000-0000"
                                        value={editingCustomer ? editingCustomer.phone : newCustomer.phone}
                                        onChange={(e) => editingCustomer ? setEditingCustomer({ ...editingCustomer, phone: e.target.value }) : setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        className="w-full px-6 py-5 bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Categories (Tags)</label>
                                <input
                                    placeholder="VIP, REGULAR, ATELIER..."
                                    value={editingCustomer ? editingCustomer.tags : newCustomer.tags}
                                    onChange={(e) => editingCustomer ? setEditingCustomer({ ...editingCustomer, tags: e.target.value }) : setNewCustomer({ ...newCustomer, tags: e.target.value })}
                                    className="w-full px-6 py-5 bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => { setShowAdd(false); setEditingCustomer(null); }} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                                    Discard
                                </button>
                                <button type="submit" className="flex-2 gold-btn px-12 rounded-2xl">
                                    {editingCustomer ? 'Update Profile' : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resettingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="space-y-2 mb-10 text-center">
                            <Key className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
                            <h3 className="text-3xl font-black italic">Security Protocol</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
                                User: <span className="text-[var(--gold)]">{resettingUser.name}</span>
                            </p>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300 ml-2">ACCESS CREDENTIALS</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter new master password..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl px-8 py-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--gold)] transition-all shadow-inner"
                                />
                                <p className="text-[9px] text-gray-400 italic text-center px-4">Changes are permanent and immediately active.</p>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setResettingUser(null)} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 gold-btn rounded-2xl shadow-xl shadow-[var(--gold)]/20">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Customer CRM", ar: "إدارة العملاء" }}
                steps={[
                    {
                        title: { en: "Resident Registry", ar: "سجل المقيمين" },
                        description: {
                            en: "View and manage the complete boutique database of Mode Aura residents and their total valuations.",
                            ar: "عرض وإدارة قاعدة بيانات المقيمين الكاملة وتقييماتهم الإجمالية."
                        },
                        icon: <CheckCircle size={14} />
                    },
                    {
                        title: { en: "Database Search", ar: "البحث في القاعدة" },
                        description: {
                            en: "Rapidly locate entries by Name, Email, Phone, or categorical Tags (e.g., VIP, Regular).",
                            ar: "حدد العملاء بسرعة بالاسم أو البريد أو الهاتف أو التصنيف (مثل VIP أو عادي)."
                        },
                        icon: <Search size={14} />
                    },
                    {
                        title: { en: "Profile Intelligence", ar: "إدارة الملفات" },
                        description: {
                            en: "Use the Edit icon to update contact details or the Trash icon to remove records from the system.",
                            ar: "استخدم أيقونة التعديل لتحديث بيانات الاتصال أو أيقونة الحذف لإزالة السجلات."
                        },
                        icon: <Edit2 size={14} />
                    },
                    {
                        title: { en: "Security Protocol", ar: "بروتوكول الأمان" },
                        description: {
                            en: "Securely reset resident passwords through the vault system if authentication credentials are lost.",
                            ar: "إعادة تعيين كلمات مرور المقيمين بشكل آمن عبر نظام الخزنة عند فقدان بيانات الدخول."
                        },
                        icon: <Key size={14} />
                    }
                ]}
            />
        </div>
    )
}
