'use client'

import { useState, useEffect, useMemo } from 'react'
import { getExpenses, addExpense, deleteExpense, updateExpense, getDashboardStats, getRecurringExpenses, addRecurringExpense, deleteRecurringExpense, updateRecurringExpense, checkAndRenewExpenses, getSalesOrders } from '@/app/actions/finance'
import DashboardPageGuide from '@/components/DashboardPageGuide'

type TimeFilter = 'All' | 'Daily' | 'Weekly' | 'Monthly'
type MainTab = 'expenses' | 'sales' | 'purchases'

const PURCHASE_CATEGORIES = ['Inventory Purchase', 'Wholesale Order', 'Stock Replenishment', 'Equipment', 'Packaging & Supplies']
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Supplies', 'Marketing', 'Other']

function filterByDate<T extends { date?: string; createdAt?: string }>(items: T[], filter: TimeFilter): T[] {
    if (filter === 'All') return items
    const now = new Date()
    return items.filter(item => {
        const dateStr = item.date || item.createdAt
        if (!dateStr) return false
        const date = new Date(dateStr)
        if (filter === 'Daily') return date.toDateString() === now.toDateString()
        if (filter === 'Weekly') {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            return date >= oneWeekAgo
        }
        if (filter === 'Monthly') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        return true
    })
}

export default function FinancePage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [salesOrders, setSalesOrders] = useState<any[]>([])
    const [recurring, setRecurring] = useState<any[]>([])
    const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, avgOrderValue: 0, totalTraffic: 0, totalSalaries: 0, staffCount: 0 })
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [addTab, setAddTab] = useState<'one-time' | 'recurring'>('one-time')

    // Tabs & Filters
    const [mainTab, setMainTab] = useState<MainTab>('expenses')
    const [filter, setFilter] = useState<TimeFilter>('All')

    // Form States
    const [newExpense, setNewExpense] = useState({ category: 'Rent', description: '', amount: 0, date: '', isRecurring: false })
    const [newRecurring, setNewRecurring] = useState({ category: 'Rent', description: '', amount: 0, frequency: 'Monthly', nextDueDate: '' })

    // Edit States
    const [editingExpense, setEditingExpense] = useState<any>(null)
    const [editExpenseForm, setEditExpenseForm] = useState({ category: '', description: '', amount: 0, date: '' })
    const [editingRecurring, setEditingRecurring] = useState<any>(null)
    const [editRecurringForm, setEditRecurringForm] = useState({ category: '', description: '', amount: 0, frequency: 'Monthly', nextDueDate: '' })

    useEffect(() => {
        loadData()
        checkAndRenewExpenses().then((res) => {
            if (res.processed > 0) loadData()
        })
    }, [])

    async function loadData() {
        setLoading(true)
        const [expData, recData, statsData, ordersData] = await Promise.all([
            getExpenses(),
            getRecurringExpenses(),
            getDashboardStats(),
            getSalesOrders()
        ])
        setExpenses(expData)
        setRecurring(recData)
        setStats(statsData)
        setSalesOrders(ordersData)
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

    async function handleDeleteExpense(id: string) {
        if (!confirm('Delete this expense?')) return
        await deleteExpense(id)
        loadData()
    }

    function openEditExpense(expense: any) {
        setEditingExpense(expense)
        setEditExpenseForm({
            category: expense.category?.name || 'Other',
            description: expense.description,
            amount: expense.amount,
            date: expense.date
        })
    }

    async function handleUpdateExpense(e: React.FormEvent) {
        e.preventDefault()
        if (!editingExpense) return
        await updateExpense(editingExpense.id, editExpenseForm)
        setEditingExpense(null)
        loadData()
    }

    async function handleDeleteRecurring(id: string) {
        if (!confirm('Stop this subscription?')) return
        await deleteRecurringExpense(id)
        loadData()
    }

    function openEditRecurring(rec: any) {
        setEditingRecurring(rec)
        setEditRecurringForm({
            category: rec.category?.name || 'Other',
            description: rec.description,
            amount: rec.amount,
            frequency: rec.frequency,
            nextDueDate: new Date(rec.nextDueDate).toISOString().split('T')[0]
        })
    }

    async function handleUpdateRecurring(e: React.FormEvent) {
        e.preventDefault()
        if (!editingRecurring) return
        await updateRecurringExpense(editingRecurring.id, editRecurringForm)
        setEditingRecurring(null)
        loadData()
    }

    // Derived data
    const pureExpenses = expenses.filter(exp => !PURCHASE_CATEGORIES.includes(exp.category?.name))
    const purchases = expenses.filter(exp => PURCHASE_CATEGORIES.includes(exp.category?.name))

    const filteredExpenses = filterByDate(pureExpenses, filter)
    const filteredPurchases = filterByDate(purchases, filter)
    const filteredSales = filterByDate(salesOrders, filter)

    const totalFilteredExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalFilteredPurchases = filteredPurchases.reduce((sum, e) => sum + e.amount, 0)
    const totalFilteredSales = filteredSales.reduce((sum, o) => sum + (o.total || 0), 0)

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
                    <p className="text-gray-500 mt-1">Revenue, expenses, purchases, and profit tracking</p>
                </div>
                <button onClick={() => {
                    // Pre-select category based on active tab
                    if (mainTab === 'purchases') {
                        setNewExpense({ ...newExpense, category: 'Inventory Purchase' })
                    } else {
                        setNewExpense({ ...newExpense, category: 'Rent' })
                    }
                    setShowAdd(true)
                }} className="gold-btn px-6 py-3 flex items-center gap-2">
                    <span className="text-xl">+</span> {mainTab === 'purchases' ? 'Add Purchase' : 'Add Expense'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <button onClick={() => setMainTab('sales')} className={`p-5 rounded-2xl border transition-all text-left ${mainTab === 'sales' ? 'ring-2 ring-green-400 border-green-200' : 'border-green-100'} bg-green-50 hover:shadow-md`}>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Revenue</p>
                    <p className="text-2xl font-black text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                </button>
                <button onClick={() => setMainTab('expenses')} className={`p-5 rounded-2xl border transition-all text-left ${mainTab === 'expenses' ? 'ring-2 ring-red-400 border-red-200' : 'border-red-100'} bg-red-50 hover:shadow-md`}>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Expenses</p>
                    <p className="text-2xl font-black text-red-500">${totalExpenses.toFixed(2)}</p>
                </button>
                <button onClick={() => setMainTab('purchases')} className={`p-5 rounded-2xl border transition-all text-left ${mainTab === 'purchases' ? 'ring-2 ring-blue-400 border-blue-200' : 'border-blue-100'} bg-blue-50 hover:shadow-md`}>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Purchases</p>
                    <p className="text-2xl font-black text-blue-600">${purchases.reduce((s, p) => s + p.amount, 0).toFixed(2)}</p>
                </button>
                <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Salaries ({stats.staffCount})</p>
                    <p className="text-2xl font-black text-purple-600">${stats.totalSalaries.toFixed(2)}</p>
                </div>
                <div className={`p-5 rounded-2xl border ${profit >= 0 ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: profit >= 0 ? '#D4AF37' : '#ef4444' }}>
                        {profit >= 0 ? 'Net Profit' : 'Net Loss'}
                    </p>
                    <p className="text-2xl font-black" style={{ color: profit >= 0 ? '#D4AF37' : '#ef4444' }}>
                        ${Math.abs(profit).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Main Tab Navigation */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
                {([
                    { key: 'expenses', label: '📋 Expenses', color: 'text-red-600' },
                    { key: 'sales', label: '💰 Sales', color: 'text-green-600' },
                    { key: 'purchases', label: '📦 Purchases', color: 'text-blue-600' },
                ] as { key: MainTab; label: string; color: string }[]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setMainTab(tab.key); setFilter('All') }}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Table Header with Filters */}
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-black">
                            {mainTab === 'expenses' && 'Expense History'}
                            {mainTab === 'sales' && 'Sales History'}
                            {mainTab === 'purchases' && 'Purchase History'}
                        </h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['All', 'Daily', 'Weekly', 'Monthly'] as TimeFilter[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Period Total Banner */}
                    {filter !== 'All' && (
                        <div className={`border-b border-gray-100 p-4 flex justify-between items-center ${mainTab === 'sales' ? 'bg-green-50' : mainTab === 'purchases' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{filter} Total</span>
                            <span className={`font-black text-lg ${mainTab === 'sales' ? 'text-green-600' : mainTab === 'purchases' ? 'text-blue-600' : 'text-red-500'}`}>
                                ${mainTab === 'sales' ? totalFilteredSales.toFixed(2) : mainTab === 'purchases' ? totalFilteredPurchases.toFixed(2) : totalFilteredExpenses.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* EXPENSES TAB */}
                    {mainTab === 'expenses' && (
                        <>
                            {/* Desktop Table */}
                            <table className="w-full hidden lg:table">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                        <th className="p-5 text-left">Description</th>
                                        <th className="p-5 text-left">Category</th>
                                        <th className="p-5 text-left">Date</th>
                                        <th className="p-5 text-right">Amount</th>
                                        <th className="p-5 text-right w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-5 font-bold text-gray-700">
                                                {expense.description}
                                                {expense.description.includes('Auto-Renew') && (
                                                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Auto</span>
                                                )}
                                            </td>
                                            <td className="p-5"><span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">{expense.category?.name || 'Other'}</span></td>
                                            <td className="p-5 text-sm text-gray-400">{expense.date}</td>
                                            <td className="p-5 text-right font-black text-red-500">-${expense.amount.toFixed(2)}</td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditExpense(expense)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">✏️</button>
                                                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile Cards */}
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
                                                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500">{expense.category?.name || 'Other'}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-red-500">-${expense.amount.toFixed(2)}</p>
                                                <div className="flex items-center gap-1 mt-1 justify-end">
                                                    <button onClick={() => openEditExpense(expense)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors text-xs">✏️</button>
                                                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{expense.date}</p>
                                    </div>
                                ))}
                            </div>
                            {filteredExpenses.length === 0 && (
                                <div className="p-12 text-center text-gray-400">No expenses {filter !== 'All' ? `this ${filter.toLowerCase().replace('daily', 'day')}` : 'recorded yet'}.</div>
                            )}
                        </>
                    )}

                    {/* SALES TAB */}
                    {mainTab === 'sales' && (
                        <>
                            <table className="w-full hidden lg:table">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                        <th className="p-5 text-left">Order ID</th>
                                        <th className="p-5 text-left">Customer</th>
                                        <th className="p-5 text-left">Date</th>
                                        <th className="p-5 text-left">Payment</th>
                                        <th className="p-5 text-left">Source</th>
                                        <th className="p-5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSales.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-5 font-bold text-gray-700 font-mono text-sm">{order.orderId}</td>
                                            <td className="p-5 text-sm text-gray-600">{order.customer || 'Guest'}</td>
                                            <td className="p-5 text-sm text-gray-400">{order.date}</td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                    order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                                                    order.paymentMethod?.includes('Split') ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.paymentMethod || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                    order.source === 'POS' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {order.source || 'Website'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right font-black text-green-600">+${(order.total || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {filteredSales.map((order) => (
                                    <div key={order.id} className="p-5 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800 font-mono text-sm">{order.orderId}</p>
                                                <p className="text-xs text-gray-500">{order.customer || 'Guest'}</p>
                                            </div>
                                            <p className="font-black text-green-600">+${(order.total || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.paymentMethod || 'N/A'}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.source === 'POS' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{order.source || 'Web'}</span>
                                            <span className="text-[10px] text-gray-400 ml-auto">{order.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredSales.length === 0 && (
                                <div className="p-12 text-center text-gray-400">No sales {filter !== 'All' ? `this ${filter.toLowerCase().replace('daily', 'day')}` : 'recorded yet'}.</div>
                            )}
                        </>
                    )}

                    {/* PURCHASES TAB */}
                    {mainTab === 'purchases' && (
                        <>
                            <table className="w-full hidden lg:table">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-xs font-black uppercase text-gray-400 tracking-wider">
                                        <th className="p-5 text-left">Description</th>
                                        <th className="p-5 text-left">Category</th>
                                        <th className="p-5 text-left">Date</th>
                                        <th className="p-5 text-right">Amount</th>
                                        <th className="p-5 text-right w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPurchases.map((purchase) => (
                                        <tr key={purchase.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-5 font-bold text-gray-700">{purchase.description}</td>
                                            <td className="p-5"><span className="px-3 py-1 bg-blue-50 rounded-lg text-xs font-bold text-blue-600">{purchase.category?.name || 'Purchase'}</span></td>
                                            <td className="p-5 text-sm text-gray-400">{purchase.date}</td>
                                            <td className="p-5 text-right font-black text-blue-600">-${purchase.amount.toFixed(2)}</td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditExpense(purchase)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">✏️</button>
                                                    <button onClick={() => handleDeleteExpense(purchase.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {filteredPurchases.map((purchase) => (
                                    <div key={purchase.id} className="p-6 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-800">{purchase.description}</p>
                                                <span className="inline-block px-2 py-0.5 bg-blue-50 rounded text-[10px] font-bold text-blue-600">{purchase.category?.name || 'Purchase'}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-blue-600">-${purchase.amount.toFixed(2)}</p>
                                                <div className="flex items-center gap-1 mt-1 justify-end">
                                                    <button onClick={() => openEditExpense(purchase)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors text-xs">✏️</button>
                                                    <button onClick={() => handleDeleteExpense(purchase.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{purchase.date}</p>
                                    </div>
                                ))}
                            </div>
                            {filteredPurchases.length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    <p className="mb-2">No purchases {filter !== 'All' ? `this ${filter.toLowerCase().replace('daily', 'day')}` : 'recorded yet'}.</p>
                                    <p className="text-xs">Click "+ Add Purchase" to track inventory or stock purchases.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Sidebar: Subscriptions + Quick Stats */}
                <div className="space-y-6">
                    {/* Period Summary Card */}
                    {filter !== 'All' && (
                        <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 p-6 rounded-3xl border border-[#D4AF37]/20">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4">{filter} Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">Sales</span>
                                    <span className="font-black text-green-600">+${totalFilteredSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">Expenses</span>
                                    <span className="font-black text-red-500">-${totalFilteredExpenses.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">Purchases</span>
                                    <span className="font-black text-blue-600">-${totalFilteredPurchases.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-[#D4AF37]/20 pt-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">Net</span>
                                    <span className={`font-black text-lg ${(totalFilteredSales - totalFilteredExpenses - totalFilteredPurchases) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        ${(totalFilteredSales - totalFilteredExpenses - totalFilteredPurchases).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscriptions / Recurring */}
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
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                            <button onClick={() => openEditRecurring(rec)} className="text-[10px] text-blue-300 hover:text-blue-200 uppercase tracking-wider">Edit</button>
                                            <button onClick={() => handleDeleteRecurring(rec.id)} className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recurring.length === 0 && (
                                <div className="text-center py-4 text-white/30 text-sm">No active subscriptions.</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Orders</span>
                                <span className="font-black text-gray-900">{salesOrders.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Avg Order Value</span>
                                <span className="font-black text-gray-900">${stats.avgOrderValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Recurring Costs</span>
                                <span className="font-black text-gray-900">${recurring.reduce((s: number, r: any) => s + r.amount, 0).toFixed(2)}/mo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Expense/Purchase Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">{mainTab === 'purchases' ? 'Add Purchase' : 'Add Expense'}</h3>
                            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        {/* Modal Tabs */}
                        {mainTab !== 'purchases' && (
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                <button onClick={() => setAddTab('one-time')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addTab === 'one-time' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>One-Time</button>
                                <button onClick={() => setAddTab('recurring')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addTab === 'recurring' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Subscription 🔄</button>
                            </div>
                        )}

                        <form onSubmit={handleAdd} className="space-y-4">
                            {(mainTab === 'purchases' || addTab === 'one-time') ? (
                                <>
                                    <input
                                        required
                                        placeholder={mainTab === 'purchases' ? 'Description (e.g. 50 Abayas from supplier)' : 'Description (e.g. Office Supplies)'}
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
                                            {mainTab === 'purchases' ? (
                                                PURCHASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                                            ) : (
                                                EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                                            )}
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
                                {mainTab === 'purchases' ? 'Add Purchase' : addTab === 'one-time' ? 'Add Expense' : 'Start Subscription'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Expense/Purchase Modal */}
            {editingExpense && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Edit {PURCHASE_CATEGORIES.includes(editExpenseForm.category) ? 'Purchase' : 'Expense'}</h3>
                            <button onClick={() => setEditingExpense(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleUpdateExpense} className="space-y-4">
                            <input
                                required
                                placeholder="Description"
                                value={editExpenseForm.description}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                                className="w-full p-4 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-[#D4AF37]/20 border-transparent outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={editExpenseForm.category}
                                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none"
                                >
                                    {[...EXPENSE_CATEGORIES, ...PURCHASE_CATEGORIES].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="$$$"
                                    value={editExpenseForm.amount || ''}
                                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: parseFloat(e.target.value) })}
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold"
                                />
                            </div>
                            <input
                                required
                                type="date"
                                value={editExpenseForm.date}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, date: e.target.value })}
                                className="w-full p-4 bg-gray-50 rounded-xl"
                            />
                            <button type="submit" className="w-full gold-btn py-4 mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Subscription Modal */}
            {editingRecurring && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Edit Subscription</h3>
                            <button onClick={() => setEditingRecurring(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleUpdateRecurring} className="space-y-4">
                            <input
                                required
                                placeholder="Service Name"
                                value={editRecurringForm.description}
                                onChange={(e) => setEditRecurringForm({ ...editRecurringForm, description: e.target.value })}
                                className="w-full p-4 bg-gray-50 rounded-xl font-medium focus:ring-2 focus:ring-[#D4AF37]/20 border-transparent outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={editRecurringForm.category}
                                    onChange={(e) => setEditRecurringForm({ ...editRecurringForm, category: e.target.value })}
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
                                    value={editRecurringForm.amount || ''}
                                    onChange={(e) => setEditRecurringForm({ ...editRecurringForm, amount: parseFloat(e.target.value) })}
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block ml-1">Frequency</label>
                                    <select
                                        value={editRecurringForm.frequency}
                                        onChange={(e) => setEditRecurringForm({ ...editRecurringForm, frequency: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl outline-none"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block ml-1">Next Due Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={editRecurringForm.nextDueDate}
                                        onChange={(e) => setEditRecurringForm({ ...editRecurringForm, nextDueDate: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full gold-btn py-4 mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Finance Vault", ar: "خزنة المالية" }}
                steps={[
                    {
                        title: { en: "Revenue & Sales", ar: "الإيرادات والمبيعات" },
                        description: {
                            en: "Track total revenue and browse all sales orders with daily, weekly, or monthly filtering.",
                            ar: "تتبع إجمالي الإيرادات وتصفح جميع طلبات المبيعات مع تصفية يومي وأسبوعي وشهري."
                        },
                        icon: "💰"
                    },
                    {
                        title: { en: "Expense Tracking", ar: "تتبع المصروفات" },
                        description: {
                            en: "Record and manage business expenses with categories, descriptions, and date-based filtering.",
                            ar: "سجّل وأدر مصروفات العمل بالفئات والأوصاف والتصفية بالتاريخ."
                        },
                        icon: "📋"
                    },
                    {
                        title: { en: "Purchase Management", ar: "إدارة المشتريات" },
                        description: {
                            en: "Track inventory purchases, wholesale orders, and stock replenishment costs separately from regular expenses.",
                            ar: "تتبع مشتريات المخزون وطلبات الجملة وتكاليف تجديد المخزون بشكل منفصل عن المصروفات العادية."
                        },
                        icon: "📦"
                    },
                    {
                        title: { en: "Recurring Expenses", ar: "المصروفات المتكررة" },
                        description: {
                            en: "Set up automatic recurring expenses (rent, subscriptions) that renew automatically.",
                            ar: "أعد مصروفات متكررة تلقائية (إيجار، اشتراكات) تتجدد تلقائياً."
                        },
                        icon: "🔄"
                    }
                ]}
            />
        </div>
    )
}
