'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getOrders, deleteOrder, updateTracking, updateOrderStatus } from '@/app/actions/orders'
import { getProductSku } from '@/app/actions/inventory'
import { printOnlineReceipt } from '@/components/OnlineReceipt'
import DashboardPageGuide from '@/components/DashboardPageGuide'
import { Search, Package, CheckCircle2, Scan, QrCode, X, ChevronRight, Loader2, Boxes, Truck, MapPin, ClipboardCheck } from 'lucide-react'

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [editingTracking, setEditingTracking] = useState<any>(null)
    const [trackingData, setTrackingData] = useState({ trackingNumber: '', courier: '' })

    // Fetching Logic
    const [fetchingOrder, setFetchingOrder] = useState<any>(null)
    const [verifiedItems, setVerifiedItems] = useState<Record<string, number>>({}) // SKU: count
    const [scanInput, setScanInput] = useState('')
    const scanInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadOrders()
        const interval = setInterval(() => {
            loadOrders(false)
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (fetchingOrder && scanInputRef.current) {
            scanInputRef.current.focus()
        }
    }, [fetchingOrder])

    async function loadOrders(showLoading = true) {
        if (showLoading) setLoading(true)
        const data = await getOrders()
        setOrders(data)
        if (showLoading) setLoading(false)
    }

    async function handleStatusUpdate(id: string, status: string) {
        await updateOrderStatus(id, status)
        loadOrders(false)
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this order?')) {
            await deleteOrder(id)
            loadOrders()
        }
    }

    // Barcode Scan Handler
    const handleScan = (e: React.FormEvent) => {
        e.preventDefault()
        if (!scanInput || !fetchingOrder) return

        const sku = scanInput.trim().toUpperCase()

        // Find item in order by SKU or ID (fallback)
        const item = fetchingOrder.items.find((i: any) =>
            (i.sku?.toUpperCase() === sku) || (i.id?.toUpperCase() === sku) || (i.sku === 'N/A' && i.id.toUpperCase().includes(sku))
        )

        if (item) {
            const currentCount = verifiedItems[item.id] || 0
            if (currentCount < item.quantity) {
                setVerifiedItems({ ...verifiedItems, [item.id]: currentCount + 1 })
            } else {
                // Already full
            }
        } else {
            console.log(`Scan Mismatch: ${sku}`)
        }
        setScanInput('')
    }

    const manualVerify = (itemId: string) => {
        const item = fetchingOrder.items.find((i: any) => i.id === itemId)
        if (item) {
            setVerifiedItems({ ...verifiedItems, [itemId]: (verifiedItems[itemId] || 0) + 1 })
        }
    }

    const startFetching = async (order: any) => {
        // Safe Parse
        const rawItems = Array.isArray(order.items) ? order.items : (() => {
            try {
                return JSON.parse(order.items || '[]')
            } catch (e) {
                return []
            }
        })()

        // Professional "Healer" - Enrichment for legacy orders with missing SKUs
        const enrichedItems = await Promise.all(rawItems.map(async (item: any) => {
            if (!item.sku || item.sku === 'N/A') {
                const liveSku = await getProductSku(item.id);
                if (liveSku) return { ...item, sku: liveSku };
            }
            return item;
        }));

        setFetchingOrder({ ...order, items: enrichedItems })
        setVerifiedItems({})
        setScanInput('')
        await handleStatusUpdate(order.id, 'Fetching')
    }

    const finishFetching = async () => {
        await handleStatusUpdate(fetchingOrder.id, 'Packaging')
        setFetchingOrder(null)
        router.push('/dashboard/shipping')
    }

    const onlineOrders = orders.filter(o => o.source !== 'POS')

    const filteredOrders = filter === 'all'
        ? onlineOrders.filter(o => o.status !== 'Completed' && o.status !== 'Shipped')
        : onlineOrders.filter(o => o.status === filter)

    const stats = {
        total: onlineOrders.filter(o => o.status !== 'Completed' && o.status !== 'Shipped').length,
        pending: onlineOrders.filter(o => o.status === 'Pending' || o.status === 'Paid').length,
        fetching: onlineOrders.filter(o => o.status === 'Fetching').length,
        packaging: onlineOrders.filter(o => o.status === 'Packaging' || o.status === 'Ready for Shipping').length,
        shipped: onlineOrders.filter(o => o.status === 'Shipped').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#D4AF37] font-bold animate-pulse">Loading orders...</div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8 animate-fade-in print:hidden">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl font-black italic text-gray-900">Operations Control</h2>
                            <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Live Warehouse
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">{stats.total} Active workflows in stream</p>
                    </div>
                </div>

                {/* Flow Progress Steps */}
                <div className="grid grid-cols-4 gap-4">
                    <button
                        onClick={() => setFilter('Pending')}
                        className={`stat-card p-6 border-b-4 transition-all ${filter === 'Pending' ? 'border-[var(--gold)] bg-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Boxes size={20} /></div>
                            <span className="text-xl font-display italic text-rose-500">{stats.pending}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">1. Receipt</p>
                        <p className="text-xs font-bold text-gray-900">Pending Review</p>
                    </button>

                    <button
                        onClick={() => setFilter('Fetching')}
                        className={`stat-card p-6 border-b-4 transition-all ${filter === 'Fetching' ? 'border-sky-500 bg-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-sky-50 text-sky-500 rounded-xl"><Scan size={20} /></div>
                            <span className="text-xl font-display italic text-sky-500">{stats.fetching}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">2. Fetching</p>
                        <p className="text-xs font-bold text-gray-900">Picking & Verification</p>
                    </button>

                    <button
                        onClick={() => setFilter('Packaging')}
                        className={`stat-card p-6 border-b-4 transition-all ${filter === 'Packaging' ? 'border-amber-500 bg-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Package size={20} /></div>
                            <span className="text-xl font-display italic text-amber-500">{stats.packaging}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">3. Packaging</p>
                        <p className="text-xs font-bold text-gray-900">Quality Check</p>
                    </button>

                    <button
                        onClick={() => setFilter('Shipped')}
                        className={`stat-card p-6 border-b-4 transition-all ${filter === 'Shipped' ? 'border-blue-500 bg-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><ChevronRight size={20} /></div>
                            <span className="text-xl font-display italic text-blue-500">{stats.shipped}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">4. Dispatched</p>
                        <p className="text-xs font-bold text-gray-900">Tracked Logistics</p>
                    </button>
                </div>

                {/* Orders Table */}
                <div className="card overflow-hidden">
                    <table className="w-full hidden lg:table">
                        <thead className="bg-gray-50/80">
                            <tr className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                <th className="p-5 text-left">Internal ID</th>
                                <th className="p-5 text-left">Consignee</th>
                                <th className="p-5 text-left">Artisanal Units</th>
                                <th className="p-5 text-left">Stream Date</th>
                                <th className="p-5 text-right">Value</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right">Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-5">
                                        <code className="text-xs font-mono bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600">{order.orderId}</code>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-gray-900">{order.customer.split('|')[0].trim()}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{order.city || 'Windsor'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">{order.items?.length || 0} PCS</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-gray-500 text-xs font-medium">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-5 text-right font-black text-[var(--gold)] italic">CAD ${(parseFloat(order.total) || 0).toFixed(2)}</td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`badge px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${(order.status === 'Pending' || order.status === 'Paid') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                order.status === 'Fetching' ? 'bg-sky-50 text-sky-600 border border-sky-100 animate-pulse' :
                                                    order.status === 'Packaging' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                            'bg-gray-50 text-gray-500 border border-gray-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'Shipped' && order.estimatedDeliveryDate && new Date(order.estimatedDeliveryDate) < new Date() && (
                                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Delivery delayed" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            {(order.status === 'Pending' || order.status === 'Paid') && (
                                                <button
                                                    onClick={() => startFetching(order)}
                                                    className="px-4 py-2 bg-[#1B2936] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black flex items-center gap-2 shadow-lg"
                                                >
                                                    <Scan size={14} /> Start Picking
                                                </button>
                                            )}
                                            {order.status === 'Fetching' && (
                                                <button
                                                    onClick={() => setFetchingOrder(order)}
                                                    className="px-4 py-2 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-600 flex items-center gap-2 shadow-lg"
                                                >
                                                    <Scan size={14} /> Resume Scan
                                                </button>
                                            )}
                                            {order.status === 'Packaging' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Ready for Shipping')}
                                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 flex items-center gap-2 shadow-lg"
                                                >
                                                    <Package size={14} /> Finalize Pack
                                                </button>
                                            )}
                                            <button onClick={() => printOnlineReceipt(order)} className="p-2 text-gray-400 hover:text-[var(--gold)]">🖨️</button>
                                            <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-300 hover:text-rose-500">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {filteredOrders.length === 0 && (
                        <div className="py-24 text-center">
                            <p className="text-gray-400 text-sm font-medium italic">No orders in this stage of the stream.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FETCHING MODAL (pick & scan) */}
            {fetchingOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                    <div className="relative bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">Pick & Verify Session</p>
                                <h3 className="text-3xl font-display italic text-gray-900">Order {fetchingOrder.orderId}</h3>
                            </div>
                            <button onClick={() => setFetchingOrder(null)} className="p-4 bg-gray-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Items List */}
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirement Checklist</h4>
                                    <div className="space-y-4">
                                        {(Array.isArray(fetchingOrder.items) ? fetchingOrder.items : JSON.parse(fetchingOrder.items || '[]')).map((item: any) => {
                                            const vCount = verifiedItems[item.id] || 0
                                            const isComplete = vCount >= item.quantity
                                            return (
                                                <div key={item.id} className={`p-6 rounded-3xl border-2 transition-all flex gap-6 items-center ${isComplete ? 'bg-green-50 border-green-100 grayscale-0' : 'bg-gray-50 border-transparent grayscale'
                                                    }`}>
                                                    <div className="w-20 h-24 bg-white rounded-2xl overflow-hidden shadow-sm shrink-0 border border-black/5">
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-bold text-gray-900">{item.name}</h5>
                                                                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">{item.variant}</p>
                                                            </div>
                                                            {!isComplete && (
                                                                <button
                                                                    onClick={() => manualVerify(item.id)}
                                                                    className="text-[8px] font-black text-sky-500 border border-sky-200 px-2 py-1 rounded hover:bg-sky-100 transition-colors uppercase tracking-widest"
                                                                >
                                                                    Manual Verification
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-gray-900">{vCount}</span>
                                                                <span className="text-[10px] font-bold text-gray-300 uppercase">of</span>
                                                                <span className="text-sm font-black text-gray-400">{item.quantity} units</span>
                                                            </div>
                                                            {isComplete ? (
                                                                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                                                    <CheckCircle2 size={12} /> Verified
                                                                </span>
                                                            ) : (
                                                                <div className="text-right">
                                                                    <code className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded font-bold">
                                                                        {item.sku && item.sku !== 'N/A' ? item.sku : `ID: ${item.id.slice(-6)}`}
                                                                    </code>
                                                                    {!item.sku || item.sku === 'N/A' && (
                                                                        <p className="text-[8px] text-amber-500 font-bold mt-1 uppercase tracking-tighter">Missing SKU - Scan ID Fallback</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Scanner Input */}
                                <div className="space-y-12">
                                    <div className="p-10 bg-[#1B2936] rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all rotate-12">
                                            <QrCode size={120} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-display italic text-white/90">Scan Verification</h4>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Place cursor in box & trigger scanner gun</p>
                                        </div>

                                        <form onSubmit={handleScan} className="space-y-4">
                                            <div className="relative">
                                                <Scan className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--gold)]" size={24} />
                                                <input
                                                    ref={scanInputRef}
                                                    type="text"
                                                    value={scanInput}
                                                    onChange={(e) => setScanInput(e.target.value)}
                                                    placeholder="Awaiting SKU Input..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-8 text-xl font-mono text-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all placeholder:text-white/10"
                                                    autoFocus
                                                />
                                            </div>
                                            <button type="submit" className="hidden">Verify</button>
                                        </form>

                                        <div className="flex items-center gap-4 text-white/30">
                                            <div className="h-px bg-white/10 flex-1" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Ready Phase Active</span>
                                            <div className="h-px bg-white/10 flex-1" />
                                        </div>
                                    </div>

                                    {/* Summary & Finish */}
                                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] space-y-6">
                                        <div className="flex justify-between items-end">
                                            <p className="text-4xl font-display italic text-gray-900 border-b-2 border-[var(--gold)]">
                                                {Object.values(verifiedItems).reduce((a, b) => a + b, 0)} / {fetchingOrder.items.reduce((a: any, b: any) => a + b.quantity, 0)}
                                            </p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Picking Progress</p>
                                        </div>

                                        <button
                                            onClick={finishFetching}
                                            disabled={Object.values(verifiedItems).reduce((a, b) => a + b, 0) < fetchingOrder.items.reduce((a: any, b: any) => a + b.quantity, 0)}
                                            className="w-full py-6 bg-[var(--gold)] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-20 disabled:scale-100 shadow-xl"
                                        >
                                            Finalize Picking →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Logistics Hub", ar: "مركز اللوجستيات" }}
                steps={[
                    {
                        title: { en: "Operations Stream", ar: "خط العمليات" },
                        description: {
                            en: "Monitor the real-time lifecycle of boutique orders from initial Receipt to final Dispatch.",
                            ar: "راقب دورة حياة الطلبات في الوقت الفعلي من الاستلام الأولي إلى الإرسال النهائي."
                        },
                        icon: <Loader2 size={14} />
                    },
                    {
                        title: { en: "Stage Navigation", ar: "التنقل بين المراحل" },
                        description: {
                            en: "Filter workflows by stage: Pending (New), Fetching (Picking), or Packaging (Quality Check).",
                            ar: "تصفية سير العمل حسب المرحلة: قيد الانتظار (جديد)، الجلب (التقاط)، أو التغليف (فحص الجودة)."
                        },
                        icon: <Boxes size={14} />
                    },
                    {
                        title: { en: "Atelier Picking", ar: "التقاط الأتيليه" },
                        description: {
                            en: "Initiate 'Start Picking' to begin a digital verification session using the barcode scanner.",
                            ar: "ابدأ 'بدء التقاط' لبدء جلسة تحقق رقمية باستخدام ماسح الباركود."
                        },
                        icon: <Scan size={14} />
                    },
                    {
                        title: { en: "International Shipping", ar: "الشحن الدولي" },
                        description: {
                            en: "Finalize picked orders to generate branding-aligned labels and initiate resident notifications.",
                            ar: "أنهِ الطلبات المُلتقطة لإنشاء ملصقات متوافقة مع العلامة التجارية وإرسال إشعارات للعملاء."
                        },
                        icon: <Truck size={14} />
                    }
                ]}
            />
        </>
    )
}
