'use client'

import { useState, useEffect } from 'react'
import { getExpenses, addExpense, getDashboardStats, getRecurringExpenses, addRecurringExpense, deleteRecurringExpense, checkAndRenewExpenses } from '@/app/actions/finance'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function FinancePage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [recurring, setRecurring] = useState<any[]>([])
    const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, avgOrderValue: 0, totalTraffic: 0, totalSalaries: 0, staffCount: 0 })
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [addTab, setAddTab] = useState<'one-time' | 'recurring'>('one-time')

    // Form States
    const [newExpense, setNewExpense] = useState({ category: 'Rent', description: '', amount: 0, date: '', isRecurring: false })
    const [newRecurring, setNewRecurring] = useState({ category: 'Rent', description: '', amount: 0, frequency: 'Monthly', nextDueDate: '' })

    useEffect(() => {
        loadData()
        // Auto-check for renewals on load
        checkAndRenewExpenses().then((res) => {
            if (res.processed > 0) loadData() // Reload if changes occurred
        })
    }, [])

    async function loadData() {
        setLoading(true)
        const [expData, recData, statsData] = await Promise.all([
            getExpenses(),
            getRecurringExpenses(),
            getDashboardStats()
        ])
        setExpenses(expData)
        setRecurring(recData)
        setStats(statsData)
        setLoading(false)
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (addTab === 'one-time') {
            await addExpense(newExpense)
            setNewExpense({ category: 'Rent', description: '', amount: 0, date: '', isRecurring: false })
        } else {
            await addRecurringExpense(newRecurring)
            setNewRecurring({ category: 'Rent', description: '', amount: 0, frequency: 'Monthly', nextDueDate: '' })
        }
        setShowAdd(false)
        loadData()
    }

    async function handleDeleteRecurring(id: string) {
        if (!confirm('Stop this subscription?')) return
        await deleteRecurringExpense(id)
        loadData()
    }

    const [filter, setFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly'>('All')

    const filteredExpenses = expenses.filter(exp => {
        if (filter === 'All') return true
        const date = new Date(exp.date)
        const now = new Date()
        if (filter === 'Daily') {
            return date.toDateString() === now.toDateString()
        }
        if (filter === 'Weekly') {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            return date >= oneWeekAgo
        }
        if (filter === 'Monthly') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }
        return true
    })

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalCosts = totalExpenses + stats.totalSalaries
    const profit = stats.totalRevenue - totalCosts

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-[#D4AF37] font-bold animate-pulse text-xl">Loading Finance Hub...</div>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Finance Hub</h2>
                    <p className="text-gray-500 mt-1">Revenue, subscriptions, and profit tracking</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="gold-btn px-6 py-3 flex items-center gap-2">
                    <span className="text-xl">+</span> Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                    <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Revenue</p>
                    <p className="text-3xl font-black text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">Total Expenses</p>
                    <p className="text-3xl font-black text-red-500">${totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                    <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Salaries ({stats.staffCount} staff)</p>
                    <p className="text-3xl font-black text-purple-600">${stats.totalSalaries.toFixed(2)}</p>
                </div>
                <div className={`p-6 rounded-3xl border ${profit >= 0 ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: profit >= 0 ? '#D4AF37' : '#ef4444' }}>
                        {profit >= 0 ? 'Net Profit' : 'Net Loss'}
                    </p>
                    <p className="text-3xl font-black" style={{ color: profit >= 0 ? '#D4AF37' : '#ef4444' }}>
                        ${Math.abs(profit).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Expenses Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-black">Expense History</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['All', 'Daily', 'Weekly', 'Monthly'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    {filter !== 'All' && (
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{filter} Total</span>
                            <span className="font-black text-gray-900">${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                        </div>
                    )}

                    {/* Desktop Table: Hidden on Mobile */}
                    <table className="w-full hidden lg:table">
                        <thead className="bg-gray-50/50">
                            <tr className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                <th className="p-5 text-left">Description</th>
                                <th className="p-5 text-left">Category</th>
                                <th className="p-5 text-left">Date</th>
                                <th className="p-5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5 font-bold text-gray-700">
                                        {expense.description}
                                        {expense.description.includes('Auto-Renew') && (
                                            <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Auto</span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                                            {expense.category?.name || 'Other'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-gray-400">{expense.date}</td>
                                    <td className="p-5 text-right font-black text-red-500">-${expense.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Cards: Hidden on Desktop */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {filteredExpenses.map((expense) => (
                            <div key={expense.id} className="p-6 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800">
                                            {expense.description}
                                            {expense.description.includes('Auto-Renew') && (
                                                <span className="ml-2 text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Auto</span>
                                            )}
                                        </p>
                                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                            {expense.category?.name || 'Other'}
                                        </span>
                                    </div>
                                    <p className="font-black text-red-500">-${expense.amount.toFixed(2)}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{expense.date}</p>
                            </div>
                        ))}
                    </div>

                    {filteredExpenses.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No expenses recorded yet.
                        </div>
                    )}
                </div>

                {/* Subscriptions / Recurring */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🔄</div>
                        <h3 className="text-xl font-bold mb-1 relative z-10">Subscriptions</h3>
                        <p className="text-white/60 text-sm mb-6 relative z-10">Auto-renewing recurring costs</p>

                        <div className="space-y-3 relative z-10">
                            {recurring.map((rec) => (
                                <div key={rec.id} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex justify-between items-center group">
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {rec.description}
                                            <span className="text-[10px] bg-[#D4AF37] text-black px-1.5 rounded font-black">{rec.frequency}</span>
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">
                                            Next: {new Date(rec.nextDueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">${rec.amount.toFixed(2)}</div>
                                        <button
                                            onClick={() => handleDeleteRecurring(rec.id)}
                                            className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {recurring.length === 0 && (
                                <div className="text-center py-4 text-white/30 text-sm">
                                    No active subscriptions.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Add Expense</h3>
                            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setAddTab('one-time')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addTab === 'one-time' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                            >
                                One-Time
                            </button>
                            <button
                                onClick={() => setAddTab('recurring')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addTab === 'recurring' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
                            >
                                Subscription 🔄
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            {addTab === 'one-time' ? (
                                <>
                                    <input
                                        required
                                        placeholder="Description (e.g. Office Supplies)"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-[#D4AF37]/20 border-transparent outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="w-full p-4 bg-gray-50 rounded-xl outline-none"
                                        >
                                            <option value="Rent">Rent</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Supplies">Supplies</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="$$$"
                                            value={newExpense.amount || ''}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                            className="w-full p-4 bg-gray-50 rounded-xl font-bold"
                                        />
                                    </div>
                                    <input
                                        required
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl"
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        required
                                        placeholder="Service Name (e.g. WiFi, Adobe)"
                                        value={newRecurring.description}
                                        onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-[#D4AF37]/20 border-transparent outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={newRecurring.category}
                                            onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                                            className="w-full p-4 bg-gray-50 rounded-xl outline-none"
                                        >
                                            <option value="Rent">Rent</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Software">Software</option>
                                            <option value="Marketing">Marketing</option>
                                        </select>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="$$$"
                                            value={newRecurring.amount || ''}
                                            onChange={(e) => setNewRecurring({ ...newRecurring, amount: parseFloat(e.target.value) })}
                                            className="w-full p-4 bg-gray-50 rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block ml-1">Frequency</label>
                                            <select
                                                value={newRecurring.frequency}
                                                onChange={(e) => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
                                                className="w-full p-4 bg-gray-50 rounded-xl outline-none"
                                            >
                                                <option value="Daily">Daily</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block ml-1">First Due Date</label>
                                            <input
                                                required
                                                type="date"
                                                value={newRecurring.nextDueDate}
                                                onChange={(e) => setNewRecurring({ ...newRecurring, nextDueDate: e.target.value })}
                                                className="w-full p-4 bg-gray-50 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full gold-btn py-4 mt-4">
                                {addTab === 'one-time' ? 'Add Expense' : 'Start Subscription'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Finance Vault", ar: "خزنة المالية" }}
                steps={[
                    {
                        title: { en: "Revenue Summary", ar: "ملخص الإيرادات" },
                        description: {
                            en: "Track total revenue, expenses, and net profit at a glance with live financial KPIs.",
                            ar: "تتبع إجمالي الإيرادات والمصروفات وصافي الربح بلمحة عبر مؤشرات مالية حية."
                        },
                        icon: "💰"
                    },
                    {
                        title: { en: "Expense Logging", ar: "تسجيل المصروفات" },
                        description: {
                            en: "Record business expenses with description, amount, and category for precise financial tracking.",
                            ar: "سجّل مصروفات العمل بالوصف والمبلغ والفئة لتتبع مالي دقيق."
                        },
                        icon: "📋"
                    },
                    {
                        title: { en: "Recurring Expenses", ar: "المصروفات المتكررة" },
                        description: {
                            en: "Set up automatic recurring expenses (rent, subscriptions) that renew monthly for hands-free accounting.",
                            ar: "أعد مصروفات متكررة تلقائية (إيجار، اشتراكات) تتجدد شهرياً لمحاسبة بدون جهد."
                        },
                        icon: "🔄"
                    },
                    {
                        title: { en: "Transaction History", ar: "سجل المعاملات" },
                        description: {
                            en: "Browse detailed expense history with dates, categories, and amounts for auditing and reporting.",
                            ar: "تصفح سجل المصروفات المفصل بالتواريخ والفئات والمبالغ للتدقيق والتقارير."
                        },
                        icon: "📄"
                    }
                ]}
            />
        </div>
    )
}
