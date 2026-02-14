'use client'

import { useState, useEffect } from 'react'
import { getStaff, addStaff, updateStaff, deleteStaff, clockIn, clockOut } from '@/app/actions/staff'
import { printStaffBarcode } from '@/components/Barcode'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', role: 'Cashier', hourlyRate: 0
    })

    useEffect(() => {
        loadStaff()
    }, [])

    async function loadStaff() {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (editingId) {
            await updateStaff(editingId, formData)
        } else {
            await addStaff(formData)
        }
        setFormData({ name: '', email: '', password: '', phone: '', role: 'Cashier', hourlyRate: 0 })
        setShowAdd(false)
        setEditingId(null)
        loadStaff()
    }

    function handleEdit(member: any) {
        setFormData({
            name: member.name,
            email: member.email,
            password: '',
            phone: member.phone || '',
            role: member.role,
            hourlyRate: member.hourlyRate || 0
        })
        setEditingId(member.id)
        setShowAdd(true)
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this staff member?')) {
            await deleteStaff(id)
            loadStaff()
        }
    }

    async function handleClockIn(id: string) {
        await clockIn(id)
        loadStaff()
    }

    async function handleClockOut(id: string) {
        await clockOut(id)
        loadStaff()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#D4AF37] font-bold animate-pulse">Loading staff...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Staff</h2>
                    <p className="text-gray-500 mt-1">{staff.length} team members</p>
                </div>
                <button onClick={() => { setShowAdd(true); setEditingId(null); setFormData({ name: '', email: '', password: '', phone: '', role: 'Cashier', hourlyRate: 0 }); }} className="gold-btn">
                    + Add Staff
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="card p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center text-white font-black text-xl">
                                {member.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className={`text-xs px-2 py-1 rounded-full inline-block ${member.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                                    member.role === 'Manager' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                    {member.role}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status === 'Clocked In' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {member.status}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Email</span>
                                <span className="font-medium">{member.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Phone</span>
                                <span className="font-medium">{member.phone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Password</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{member.password ? '••••••••' : 'Not set'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Hourly Rate</span>
                                <span className="font-bold text-[#D4AF37]">${member.hourlyRate?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                            {member.status === 'Clocked Out' ? (
                                <button onClick={() => handleClockIn(member.id)} className="flex-1 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100">
                                    Clock In
                                </button>
                            ) : (
                                <button onClick={() => handleClockOut(member.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100">
                                    Clock Out
                                </button>
                            )}
                            <button onClick={() => handleEdit(member)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold hover:bg-gray-200">
                                Edit
                            </button>
                            <button
                                onClick={() => printStaffBarcode(member.name, member.role, member.email, member.password || '')}
                                className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-[#D4AF37]/20"
                                title="Print Login Barcode"
                            >
                                📇
                            </button>
                            <button onClick={() => handleDelete(member.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {staff.length === 0 && (
                <div className="card p-16 text-center text-gray-400">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="font-bold">No staff members yet</p>
                    <p className="text-sm">Add your first team member to get started</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg animate-fade-in">
                        <h3 className="text-2xl font-black mb-6">{editingId ? 'Edit Staff' : 'Add Staff'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Name *</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Password *</label>
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="Login password"
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone</label>
                                    <input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    >
                                        <option value="Admin">Admin - Full access</option>
                                        <option value="Manager">Manager - No finance</option>
                                        <option value="Cashier">Cashier - POS & Inventory view only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Hourly Rate ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setShowAdd(false); setEditingId(null); }} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 gold-btn py-4">
                                    {editingId ? 'Update' : 'Add Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Staff Management", ar: "إدارة الموظفين" }}
                steps={[
                    {
                        title: { en: "Team Roster", ar: "قائمة الفريق" },
                        description: {
                            en: "View all staff members with their roles (Admin, Manager, Cashier), email, and hourly rates.",
                            ar: "عرض جميع الموظفين مع أدوارهم (مدير، مشرف، كاشير) والبريد والأجر بالساعة."
                        },
                        icon: "👥"
                    },
                    {
                        title: { en: "Time Tracking", ar: "تتبع الوقت" },
                        description: {
                            en: "Clock in and out staff members to track working hours and calculate payroll automatically.",
                            ar: "تسجيل دخول وخروج الموظفين لتتبع ساعات العمل وحساب الرواتب تلقائياً."
                        },
                        icon: "⏰"
                    },
                    {
                        title: { en: "Add & Edit Staff", ar: "إضافة وتعديل الموظفين" },
                        description: {
                            en: "Register new team members with credentials and role assignments. Edit existing profiles as needed.",
                            ar: "تسجيل أعضاء جدد في الفريق ببيانات الدخول وتعيين الأدوار. تعديل الملفات الحالية حسب الحاجة."
                        },
                        icon: "✏️"
                    },
                    {
                        title: { en: "Staff Barcodes", ar: "باركود الموظفين" },
                        description: {
                            en: "Generate and print unique barcodes for each staff member for quick POS identification.",
                            ar: "إنشاء وطباعة باركودات فريدة لكل موظف للتعرف السريع في نقطة البيع."
                        },
                        icon: "📱"
                    }
                ]}
            />
        </div>
    )
}
