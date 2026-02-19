'use client'

import { useState, useEffect } from 'react'
import { getOrders, deleteOrder, refundOrder } from '@/app/actions/orders'
import { Trash2, RotateCcw, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function ReceiptsPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'POS', 'WEBSITE'
    const [paymentFilter, setPaymentFilter] = useState('all') // 'all', 'Cash', 'Card'
    const [search, setSearch] = useState('')

    // Refund State
    const [refundingOrder, setRefundingOrder] = useState<any>(null)
    const [restockItems, setRestockItems] = useState(true)
    const [processingRefund, setProcessingRefund] = useState(false)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
        const data = await getOrders()
        setOrders(data)
        setLoading(false)
    }

    async function handleRefund() {
        if (!refundingOrder) return
        setProcessingRefund(true)
        const res = await refundOrder(refundingOrder.id, restockItems)
        if (res.success) {
            setRefundingOrder(null)
            loadOrders()
        } else {
            alert('Refund failed: ' + res.error)
        }
        setProcessingRefund(false)
    }

    function printReceipt(order: any) {
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (!printWindow) return

        const items = order.items || []
        const itemsHtml = items.map((item: any) => {
            const qty = item.qty || 1
            const price = parseFloat(item.price) || 0
            const total = qty * price
            return `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                <div>
                    <span style="font-weight: 600;">${item.name}</span>
                    <span style="color: #666; margin-left: 8px;">×${qty}</span>
                </div>
                <span style="font-weight: 600;">$${total.toFixed(2)}</span>
            </div>
        `}).join('')

        const subtotal = order.total / 1.13
        const tax = order.total - subtotal

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderId}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; padding-bottom: 80px; }
                .header { text-align: center; padding-bottom: 15px; border-bottom: 2px solid #000; margin-bottom: 15px; }
                .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
                .info { font-size: 11px; color: #666; margin-top: 5px; }
                .items { margin: 15px 0; }
                .total-section { border-top: 2px solid #000; padding-top: 10px; margin-top: 15px; }
                .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; font-size: 11px; color: #666; }
                @media print { body { padding: 0; padding-bottom: 80px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Mode AURA</div>
                <div class="info">Luxury Accessories</div>
                <div class="info">${new Date(order.createdAt || order.date).toLocaleString()}</div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 10px;">
                <span>Order #${order.orderId}</span>
            </div>

            <div class="items">
                ${itemsHtml}
            </div>

            <div class="total-section">
                <div style="display: flex; justify-content: space-between; color: #666; font-size: 12px; margin-bottom: 4px;">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #666; font-size: 12px; margin-bottom: 4px;">
                    <span>HST (13%)</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #666; margin-top: 8px;">
                    <span>Customer</span>
                    <span>${order.customer || 'Guest'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #666;">
                    <span>Payment</span>
                    <span>${order.paymentMethod || 'Cash'}</span>
                </div>
                <div class="total">
                    <span>TOTAL</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for shopping with us!</p>
                <p>No refunds/exchanges on accessories.</p>
                <p style="margin-top: 5px; font-weight: bold;">modeaura.ca</p>
                <p style="margin-top: 10px; font-size: 10px;">Authorized Dealer</p>
            </div>

            <script>setTimeout(() => window.print(), 300);</script>
        </body>
        </html>
        `)
        printWindow.document.close()
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !search ||
            (order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
                order.customer?.toLowerCase().includes(search.toLowerCase()))

        const matchesSource = filter === 'all' || order.source === filter
        const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter

        return matchesSearch && matchesSource && matchesPayment
    })

    if (loading) {
        return <div className="p-8 text-[#D4AF37] font-bold animate-pulse">Loading receipts...</div>
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Receipt History</h2>
                    <p className="text-gray-500 mt-1">{orders.length} receipts • View and reprint any transaction</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Source Filter */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Order Source</p>
                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {['all', 'POS', 'WEBSITE'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {f === 'all' ? 'Everything' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Filter */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</p>
                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {['all', 'Cash', 'Card'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setPaymentFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${paymentFilter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {f === 'all' ? 'All Methods' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-[300px] space-y-2 lg:ml-auto">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Search Records</p>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search ID or Customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 focus:border-[var(--gold)] focus:bg-white outline-none transition-all text-sm font-medium"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--gold)]">🔍</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="card p-5 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-black text-lg text-[#D4AF37]">{order.orderId}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(order.createdAt || order.date).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <p className="text-2xl font-black text-gray-900">${(parseFloat(order.total) || 0).toFixed(2)}</p>
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${order.source === 'POS' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {order.source || 'WEBSITE'}
                                    </span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider">
                                        {order.paymentMethod || 'Cash'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {(order.items || []).slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm text-gray-600">
                                    <span>{item.name} ×{item.qty || 1}</span>
                                    <span>${((parseFloat(item.price) || 0) * (item.qty || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                            {(order.items || []).length > 3 && (
                                <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                                👤 {order.customer || 'Guest'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        if (confirm('Delete this order permanently?')) {
                                            await deleteOrder(order.id)
                                            loadOrders()
                                        }
                                    }}
                                    className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors"
                                    title="Delete order"
                                >
                                    <Trash2 size={16} />
                                </button>
                                {(order.status === 'Paid' || order.status === 'Pending' || order.status === 'Shipped') && (
                                    <button
                                        onClick={() => setRefundingOrder(order)}
                                        className="p-2 hover:bg-rose-50 rounded-xl text-gray-300 hover:text-rose-500 transition-colors"
                                        title="Refund Order"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => printReceipt(order)}
                                    className="gold-btn py-2 px-4 text-xs"
                                >
                                    🖨️ Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="card p-16 text-center text-gray-400">
                    <div className="text-4xl mb-4">🧾</div>
                    <p className="font-bold">No receipts found</p>
                    <p className="text-sm">Complete a sale to see receipts here</p>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Receipt Archive", ar: "أرشيف الإيصالات" }}
                steps={[
                    {
                        title: { en: "Transaction History", ar: "سجل المعاملات" },
                        description: {
                            en: "Browse all completed orders with dates, customer names, items, and total amounts.",
                            ar: "تصفح جميع الطلبات المكتملة مع التواريخ وأسماء العملاء والعناصر والمبالغ الإجمالية."
                        },
                        icon: "🗂️"
                    },
                    {
                        title: { en: "Print Receipts", ar: "طباعة الإيصالات" },
                        description: {
                            en: "Generate and print professional A4 receipts with branding, itemized breakdown, and payment details.",
                            ar: "إنشاء وطباعة إيصالات A4 احترافية بالعلامة التجارية والتفصيل وتفاصيل الدفع."
                        },
                        icon: "🖨️"
                    },
                    {
                        title: { en: "Order Search", ar: "البحث عن الطلبات" },
                        description: {
                            en: "Search through past orders by order number, customer name, or date to quickly locate specific transactions.",
                            ar: "ابحث في الطلبات السابقة برقم الطلب أو اسم العميل أو التاريخ لتحديد معاملات محددة بسرعة."
                        },
                        icon: "🔍"
                    }
                ]}
            />

            {/* Refund Modal */}
            {refundingOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 leading-relaxed">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-display italic text-gray-900">Process Refund</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order {refundingOrder.orderId}</p>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-full text-rose-500">
                                <DollarSign size={24} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-700">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div className="text-xs font-medium">
                                    <p className="font-bold mb-1 uppercase tracking-wide">Manual Action Required</p>
                                    <p>This action will only update the system records. You must manually process the actual money refund in your Stripe Dashboard or cash register.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setRestockItems(!restockItems)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${restockItems ? 'bg-[var(--gold)] border-[var(--gold)] text-white' : 'border-gray-300 bg-white'}`}>
                                    {restockItems && <CheckCircle2 size={12} strokeWidth={4} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Restock Items</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Automatically add items back to inventory</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setRefundingOrder(null)}
                                    className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRefund}
                                    disabled={processingRefund}
                                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 disabled:opacity-50"
                                >
                                    {processingRefund ? 'Processing...' : 'Confirm Refund'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
