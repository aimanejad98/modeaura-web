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

        // Generate Receipt HTML matching POS design
        const itemsHtml = items.map((item: any, i: number) => {
            const qty = item.qty || 1
            const price = parseFloat(item.price) || 0
            const total = qty * price
            return `
            <div style="margin-bottom: 8px;">
                <div style="font-weight: bold; font-size: 10px;">${item.sku || 'ITEM-' + i}</div>
                <div style="display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); font-size: 10px;">
                    <div style="grid-column: span 6; padding-right: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <div>${item.name}</div>
                        <div style="font-size: 8px; font-weight: normal; color: #6b7280;">
                            ${item.variant ? item.variant : [item.size, item.color].filter(Boolean).join(' / ')}
                        </div>
                    </div>
                    <div style="grid-column: span 2; text-align: center;">${qty}</div>
                    <div style="grid-column: span 2; text-align: right;">${price.toFixed(2)}</div>
                    <div style="grid-column: span 2; text-align: right;">${total.toFixed(2)}</div>
                </div>
            </div>
            `
        }).join('')

        const date = new Date(order.createdAt || order.date)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderId}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print { 
                    body { -webkit-print-color-adjust: exact; } 
                    @page { margin: 0; size: auto; }
                }
                body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
            </style>
        </head>
        <body class="bg-white text-black p-2 leading-tight" style="max-width: 300px; margin: 0 auto;">
            
            <!-- Header -->
            <div class="text-center mb-2">
                <h1 class="text-xl font-black tracking-tighter mb-1">MODE AURA</h1>
                <p class="font-bold text-[10px]">Fashion and Accessories</p>
                <p class="text-[10px]">2670 Kevin St</p>
                <p class="text-[10px]">Windsor, ON N8X 2S2</p>
                <p class="text-[10px]">Tel: (519) 999-9999</p>
                <p class="text-[10px] mt-1">Visit Us At www.modeaura.ca</p>
            </div>

            <!-- Info -->
            <div class="flex justify-between mb-1 text-[10px] font-mono">
                <span>Store: 001</span>
                <span>Register: 1</span>
            </div>
            <div class="flex justify-between mb-1 text-[10px] font-mono">
                <span>Date: ${dateStr}</span>
                <span>Time: ${timeStr}</span>
            </div>
            <div class="flex justify-between mb-2 text-[10px] font-mono">
                <span>Trans: ${order.orderId.replace('MA-', '')}</span>
                <span>Cashier: Admin</span>
            </div>

            <div class="mb-2 border-b border-black border-dashed"></div>

            <!-- Headers -->
            <div class="grid grid-cols-12 font-bold mb-1 text-[10px] font-mono">
                <div class="col-span-6">Item</div>
                <div class="col-span-2 text-center">Qty</div>
                <div class="col-span-2 text-right">Price</div>
                <div class="col-span-2 text-right">Amnt</div>
            </div>

            <div class="mb-2 border-b border-black border-dashed"></div>

            <!-- Items -->
            <div class="mb-2 font-mono">
                ${itemsHtml}
            </div>

            <div class="mb-2 border-b border-black border-dashed"></div>

            <!-- Totals -->
            <div class="space-y-1 text-right ml-auto text-[10px] font-mono" style="max-width: 80%;">
                <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(order.total / 1.13).toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>GST (5%)</span>
                    <span>${(order.total * 0.05).toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>HST (8%)</span>
                    <span>${(order.total * 0.08).toFixed(2)}</span>
                </div>
                <div class="flex justify-between font-black text-sm mt-1">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="mt-4 mb-2 border-b border-black border-dashed"></div>

            <!-- Payments -->
            <div class="space-y-1 text-right ml-auto text-[10px] font-mono" style="max-width: 80%;">
                <div class="flex justify-between">
                    <span>${order.paymentMethod || 'Payment'}</span>
                    <span>${(order.amountPaid || order.total).toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Change</span>
                    <span>${(order.change || 0).toFixed(2)}</span>
                </div>
            </div>

            <!-- Footer -->
             <div class="mt-6 text-center space-y-2 text-[10px] font-mono">
                <p>***********************************</p>
                <p class="font-bold">Thank you for shopping with us!</p>
                <p>NO REFUNDS OR EXCHANGES</p>
                <p>ON FINAL SALE ITEMS</p>
                <p>***********************************</p>

                <div class="mt-4 pt-2">
                    <!-- Scan Bar -->
                    <div style="height: 30px; background: black; width: 75%; margin: 0 auto; display: flex; align-items: flex-end; justify-content: center; color: white; font-size: 8px; letter-spacing: 4px; padding-bottom: 2px;">
                        ||| || ||| || |||
                    </div>
                    <p class="text-[8px] mt-1 text-black">${order.orderId}</p>
                </div>

                <div class="pt-2 text-[8px] uppercase tracking-widest text-gray-500">
                    Mode Aura &bull; Customer Copy
                </div>
            </div>

            <script>
                setTimeout(() => {
                    window.print();
                    // window.close(); // Optional: Close after print
                }, 500);
            </script>
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
