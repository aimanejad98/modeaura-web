'use client'

import { useState, useEffect } from 'react'
import { getOrders, deleteOrder, refundOrder } from '@/app/actions/orders'
import { getStoreSettings } from '@/app/actions/settings'
import { Trash2, RotateCcw, CheckCircle2, AlertCircle, DollarSign, Eye, X } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'
import JsBarcode from 'jsbarcode'

export default function ReceiptsPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // 'all', 'POS', 'WEBSITE'
    const [paymentFilter, setPaymentFilter] = useState('all') // 'all', 'Cash', 'Card'
    const [search, setSearch] = useState('')

    // Refund State
    const [refundingOrder, setRefundingOrder] = useState<any>(null)
    const [restockItems, setRestockItems] = useState(true)
    const [processingRefund, setProcessingRefund] = useState(false)

    // View Receipt State
    const [viewingOrder, setViewingOrder] = useState<any>(null)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
        try {
            const [data, storeData] = await Promise.all([
                getOrders(),
                getStoreSettings()
            ])
            setOrders(data || [])
            setSettings(storeData)
        } catch (error) {
            console.error('Failed to load orders', error)
        } finally {
            setLoading(false)
        }
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

    function generateReceiptHtml(order: any, forPrint: boolean = true) {
        // Create a hidden canvas for barcode generation
        const canvas = document.createElement('canvas');
        try {
            JsBarcode(canvas, order.orderId, {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: false,
                margin: 0
            });
        } catch (e) {
            console.error('Barcode gen failed', e);
        }
        const barcodeDataUrl = canvas.toDataURL("image/png");

        const items = order.items || []

        const itemsHtml = items.map((item: any, i: number) => {
            const qty = item.qty || 1
            const price = parseFloat(item.price) || 0
            const total = qty * price
            return `
            <div style="margin-bottom: 4px; font-family: monospace; font-size: 11px;">
                <div style="font-weight: bold;">${item.sku || 'ITEM-' + i}</div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1; padding-right: 8px;">
                        <div>${item.name}</div>
                        <div style="font-size: 9px; color: #666;">
                            ${item.variant ? item.variant : [item.size, item.color].filter(Boolean).join(' / ')}
                        </div>
                    </div>
                    <div style="width: 30px; text-align: center;">${qty}</div>
                    <div style="width: 60px; text-align: right;">${price.toFixed(2)}</div>
                    <div style="width: 60px; text-align: right;">${total.toFixed(2)}</div>
                </div>
            </div>
            `
        }).join('')

        const date = new Date(order.createdAt || order.date)
        const dateStr = date.toLocaleDateString()
        const timeStr = date.toLocaleTimeString()

        const isRefunded = order.status === 'Refunded'
        const cashierName = order.cashierName || 'Admin'

        // Discount info
        const hasDiscount = order.discountAmount && order.discountAmount > 0
        const discountCode = order.discountCode || ''

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderId}</title>
            <style>
                @media print { 
                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 10px; } 
                    @page { margin: 0; size: auto; }
                    .no-print { display: none !important; }
                }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    background: white; 
                    color: black; 
                    width: 100%;
                    max-width: 300px; 
                    margin: 0 auto;
                    padding: 10px;
                    line-height: 1.2;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mt-2 { margin-top: 8px; }
                .mt-4 { margin-top: 16px; }
                .border-dashed { border-bottom: 1px dashed black; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .text-xs { font-size: 10px; }
                .text-sm { font-size: 12px; }
                .text-lg { font-size: 18px; }
                .refund-banner { 
                    background: #000; color: #fff; padding: 6px; 
                    text-align: center; font-weight: bold; font-size: 14px; 
                    letter-spacing: 2px; margin-bottom: 8px; 
                }
            </style>
        </head>
        <body>
            ${isRefunded ? '<div class="refund-banner">⚠ REFUNDED</div>' : ''}

            <div class="text-center mb-2">
                <div class="text-lg font-bold">${settings?.storeName || 'MODE AURA'}</div>
                <div class="text-xs font-bold">${settings?.tagline || 'Luxury Essentials'}</div>
                <div class="text-xs">${settings?.address || ''}</div>
                <div class="text-xs">${settings?.phone || ''}</div>
                <div class="text-xs">${settings?.website || ''}</div>
            </div>

            <div class="flex justify-between text-xs mb-1">
                <span>Date: ${dateStr}</span>
                <span>Time: ${timeStr}</span>
            </div>
            <div class="flex justify-between text-xs mb-2">
                <span>Trans: ${order.orderId}</span>
                <span>Cashier: ${cashierName}</span>
            </div>

            <div class="border-dashed mb-1"></div>
            <div class="flex font-bold text-xs mb-1">
                <span style="flex: 1;">Item</span>
                <span style="width: 30px; text-align: center;">Qty</span>
                <span style="width: 60px; text-align: right;">Price</span>
                <span style="width: 60px; text-align: right;">Total</span>
            </div>
            <div class="border-dashed mb-2"></div>

            <div class="mb-2">
                ${itemsHtml}
            </div>

            <div class="border-dashed mb-2"></div>

            <div class="text-right text-xs" style="margin-left: auto; width: 80%;">
                <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>${((order.total / 1.13) + (parseFloat(order.discountAmount) || 0)).toFixed(2)}</span>
                </div>
                ${hasDiscount ? `
                <div class="flex justify-between" style="color: #d32f2f;">
                    <span>Discount${discountCode ? ' (' + discountCode + ')' : ''}</span>
                    <span>-${parseFloat(order.discountAmount).toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="flex justify-between">
                    <span>HST (13%)</span>
                    <span>${(order.total - (order.total / 1.13)).toFixed(2)}</span>
                </div>
                <div class="flex justify-between font-bold text-sm mt-1" style="border-top: 1px solid black; padding-top: 4px;">
                    <span>TOTAL</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="mt-4 border-dashed mb-1"></div>

            <div class="text-right text-xs" style="margin-left: auto; width: 80%;">
                <div class="flex justify-between">
                    <span>${order.paymentMethod || 'Payment'}</span>
                    <span>${(order.amountPaid || order.total).toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Change</span>
                    <span>${(order.change || 0).toFixed(2)}</span>
                </div>
            </div>

            <div class="text-center mt-4 text-xs">
                <p>***************************</p>
                <p class="font-bold">THANK YOU FOR VISITING!</p>
                <p>NO REFUNDS OR EXCHANGES</p>
                <p>ON FINAL SALE ITEMS</p>
                <p>***************************</p>
                
                <div class="mt-2">
                    <img src="${barcodeDataUrl}" style="width: 80%; max-height: 40px;" />
                    <p style="font-size: 8px; margin-top: 2px;">${order.orderId}</p>
                </div>
            </div>

            ${forPrint ? `
            <script>
                window.onload = () => {
                    window.print();
                };
            </script>
            ` : ''}
        </body>
        </html>
        `
    }

    function printReceipt(order: any) {
        const printWindow = window.open('', '_blank', 'width=400,height=600')
        if (!printWindow) return
        printWindow.document.write(generateReceiptHtml(order, true))
        printWindow.document.close()
    }

    function viewReceipt(order: any) {
        setViewingOrder(order)
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Receipt History</h2>
                    <p className="text-gray-500 mt-1">{orders.length} receipts • View and reprint any transaction</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Order Source</p>
                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {['all', 'POS', 'WEBSITE'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f === 'all' ? 'Everything' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</p>
                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {['all', 'Cash', 'Card'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setPaymentFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${paymentFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f === 'all' ? 'All Methods' : f}
                                </button>
                            ))}
                        </div>
                    </div>

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
            {/* Desktop: Table Layout (xl+) */}
            <div className="hidden xl:block bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[130px_110px_1fr_140px_110px_70px_100px_160px] gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</div>
                </div>

                {filteredOrders.map((order, idx) => {
                    const orderDate = new Date(order.createdAt || order.date)
                    const items = order.items || []
                    const itemSummary = items.slice(0, 2).map((item: any) => `${item.name} ×${item.qty || 1}`).join(', ')
                    const moreCount = items.length > 2 ? items.length - 2 : 0

                    return (
                        <div key={order.id} className={`grid grid-cols-[130px_110px_1fr_140px_110px_70px_100px_160px] gap-3 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors ${idx < filteredOrders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <div>
                                <p className="font-black text-sm text-[#D4AF37]">{order.orderId}</p>
                                <p className={`text-[9px] font-bold mt-0.5 ${order.status === 'Refunded' ? 'text-rose-500' : 'text-green-500'}`}>
                                    {order.status === 'Refunded' ? '↩ Refunded' : '✓ Completed'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-700">{orderDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{orderDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-700 truncate">{itemSummary || 'No items'}</p>
                                {moreCount > 0 && <p className="text-[10px] text-gray-400">+{moreCount} more</p>}
                            </div>
                            <div><p className="text-xs font-bold text-gray-700 truncate">{order.customer || 'Walk-in'}</p></div>
                            <div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${(order.paymentMethod || 'Cash') === 'Cash' ? 'bg-emerald-50 text-emerald-600' : order.paymentMethod?.includes('Split') ? 'bg-violet-50 text-violet-600' : order.paymentMethod === 'Debit Card' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {(order.paymentMethod || 'Cash') === 'Cash' ? '💵' : order.paymentMethod?.includes('Split') ? '💵💳' : '💳'} {order.paymentMethod || 'Cash'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${order.source === 'POS' ? 'bg-orange-50 text-orange-600' : 'bg-sky-50 text-sky-600'}`}>
                                    {order.source || 'WEB'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-gray-900">${(parseFloat(order.total) || 0).toFixed(2)}</p>
                                {order.discountAmount > 0 && <p className="text-[9px] text-red-500 font-bold">-${parseFloat(order.discountAmount).toFixed(2)} off</p>}
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={async () => { if (confirm('Delete this order permanently?')) { await deleteOrder(order.id); loadOrders() } }} className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                {(order.status === 'Paid' || order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Completed' || order.status === 'Order Received' || order.status === 'Order Placed') && (
                                    <button onClick={() => setRefundingOrder(order)} className="p-2 hover:bg-rose-50 rounded-xl text-gray-300 hover:text-rose-500 transition-colors" title="Refund"><RotateCcw size={14} /></button>
                                )}
                                <button onClick={() => viewReceipt(order)} className="p-2 hover:bg-blue-50 rounded-xl text-gray-300 hover:text-blue-500 transition-colors" title="View Receipt"><Eye size={14} /></button>
                                <button onClick={() => printReceipt(order)} className="gold-btn py-1.5 px-3 text-[10px] font-black uppercase tracking-wider">🖨️ Print</button>
                            </div>
                        </div>
                    )
                })}

                {filteredOrders.length === 0 && (
                    <div className="p-16 text-center text-gray-400">
                        <div className="text-4xl mb-4">🧾</div>
                        <p className="font-bold">No receipts found</p>
                        <p className="text-sm">Complete a sale to see receipts here</p>
                    </div>
                )}
            </div>

            {/* Mobile / Tablet: Card Layout (below xl) */}
            <div className="xl:hidden space-y-3">
                {filteredOrders.map((order) => {
                    const orderDate = new Date(order.createdAt || order.date)
                    const items = order.items || []

                    return (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                            {/* Top Row: Order ID + Total */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-black text-base text-[#D4AF37]">{order.orderId}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {orderDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })} • {orderDate.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {order.status === 'Refunded' && (
                                        <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-500 uppercase tracking-wider">↩ Refunded</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-gray-900">${(parseFloat(order.total) || 0).toFixed(2)}</p>
                                    {order.discountAmount > 0 && <p className="text-[9px] text-red-500 font-bold">-${parseFloat(order.discountAmount).toFixed(2)} off</p>}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-3">
                                {items.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs text-gray-600 py-0.5">
                                        <span className="font-medium truncate mr-2">{item.name} ×{item.qty || 1}</span>
                                        <span className="font-bold text-gray-800 shrink-0">${((parseFloat(item.price) || 0) * (item.qty || 1)).toFixed(2)}</span>
                                    </div>
                                ))}
                                {items.length > 3 && <p className="text-[10px] text-gray-400 mt-1">+{items.length - 3} more items</p>}
                            </div>

                            {/* Bottom Row: Tags + Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600">👤 {order.customer || 'Walk-in'}</span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${(order.paymentMethod || 'Cash') === 'Cash' ? 'bg-emerald-50 text-emerald-600' : order.paymentMethod?.includes('Split') ? 'bg-violet-50 text-violet-600' : order.paymentMethod === 'Debit Card' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {order.paymentMethod || 'Cash'}
                                    </span>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${order.source === 'POS' ? 'bg-orange-50 text-orange-600' : 'bg-sky-50 text-sky-600'}`}>
                                        {order.source || 'WEB'}
                                    </span>
                                    {order.cashierName && (
                                        <span className="text-[9px] font-bold text-gray-400">by {order.cashierName}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={async () => { if (confirm('Delete this order permanently?')) { await deleteOrder(order.id); loadOrders() } }} className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    {(order.status === 'Paid' || order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Completed' || order.status === 'Order Received' || order.status === 'Order Placed') && (
                                        <button onClick={() => setRefundingOrder(order)} className="p-2 hover:bg-rose-50 rounded-xl text-gray-300 hover:text-rose-500 transition-colors" title="Refund"><RotateCcw size={14} /></button>
                                    )}
                                    <button onClick={() => viewReceipt(order)} className="p-2 hover:bg-blue-50 rounded-xl text-gray-300 hover:text-blue-500 transition-colors" title="View"><Eye size={14} /></button>
                                    <button onClick={() => printReceipt(order)} className="gold-btn py-1.5 px-3 text-[10px] font-black uppercase tracking-wider">🖨️ Print</button>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {filteredOrders.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                        <div className="text-4xl mb-4">🧾</div>
                        <p className="font-bold">No receipts found</p>
                        <p className="text-sm">Complete a sale to see receipts here</p>
                    </div>
                )}
            </div>

            <DashboardPageGuide
                pageName={{ en: "Receipt Archive", ar: "أرشيف الإيصالات" }}
                steps={[
                    { title: { en: "Transaction History", ar: "سجل المعاملات" }, description: { en: "Browse all completed orders with dates.", ar: "تصفح سجل الطلبات." }, icon: "🗂️" },
                    { title: { en: "Print Receipts", ar: "طباعة الإيصالات" }, description: { en: "Generate thermal-ready receipts.", ar: "طباعة إيصالات احترافية." }, icon: "🖨️" },
                    { title: { en: "Order Search", ar: "البحث عن الطلبات" }, description: { en: "Find orders by ID or customer.", ar: "البحث عن المعاملات." }, icon: "🔍" }
                ]}
            />

            {/* View Receipt Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
                    <div className="relative bg-white rounded-[2rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Receipt Preview</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{viewingOrder.orderId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { printReceipt(viewingOrder); }} className="gold-btn py-2 px-4 text-[10px] font-black uppercase tracking-wider rounded-xl">🖨️ Print</button>
                                <button onClick={() => setViewingOrder(null)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <iframe
                                srcDoc={generateReceiptHtml(viewingOrder, false)}
                                className="w-full border-0 rounded-xl bg-white"
                                style={{ minHeight: '500px' }}
                                title="Receipt Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {refundingOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-display italic text-gray-900">Process Refund</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order {refundingOrder.orderId}</p>
                            </div>
                            <div className="p-3 bg-rose-50 rounded-full text-rose-500"><DollarSign size={24} /></div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-700">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div className="text-xs font-medium">
                                    <p className="font-bold mb-1 uppercase tracking-wide">Manual Action Required</p>
                                    <p>Action updates records only. Process actual refund in Stripe or register.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setRestockItems(!restockItems)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${restockItems ? 'bg-[var(--gold)] border-[var(--gold)] text-white' : 'border-gray-300 bg-white'}`}>
                                    {restockItems && <CheckCircle2 size={12} strokeWidth={4} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Restock Items</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Return items to inventory</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setRefundingOrder(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Cancel</button>
                                <button onClick={handleRefund} disabled={processingRefund} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 disabled:opacity-50">
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
