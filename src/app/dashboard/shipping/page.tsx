'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, updateShippingStatus, updateEstimatedDelivery } from '@/app/actions/orders';
import { printInternalLabel } from '@/components/InternalLabel';
import { Printer, CheckCircle2, Package, MapPin, Search, Clock, AlertTriangle, Truck, ChevronDown } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

function getDelayStatus(order: any): { label: string; color: string; icon: any; days: number } {
    if (!order.estimatedDeliveryDate) return { label: 'No ETA', color: 'gray', icon: Clock, days: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eta = new Date(order.estimatedDeliveryDate + 'T00:00:00');
    const diff = Math.ceil((eta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (order.shippingStatus === 'Delivered') return { label: 'Delivered', color: 'emerald', icon: CheckCircle2, days: 0 };
    if (diff < 0) return { label: 'Delayed', color: 'red', icon: AlertTriangle, days: Math.abs(diff) };
    if (diff <= 1) return { label: 'At Risk', color: 'amber', icon: Clock, days: diff };
    return { label: 'On Time', color: 'emerald', icon: Truck, days: diff };
}

const SHIPPING_STATUSES = ['Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Issue'];

export default function ShippingHub() {
    const [orders, setOrders] = useState<any[]>([]);
    const [shippedOrders, setShippedOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shippedFilter, setShippedFilter] = useState('all');
    const [editingETA, setEditingETA] = useState<string | null>(null);
    const [etaValue, setEtaValue] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        const data = await getOrders();
        const shippableOrders = data.filter((o: any) => o.status === 'Ready for Shipping' || o.status === 'Packaging');
        const shipped = data.filter((o: any) => o.status === 'Shipped' && o.source !== 'POS');
        setOrders(shippableOrders);
        setShippedOrders(shipped);
        setLoading(false);
    }

    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredShipped = shippedOrders.filter(o => {
        const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (shippedFilter === 'all') return true;
        const delay = getDelayStatus(o);
        if (shippedFilter === 'delayed') return delay.label === 'Delayed';
        if (shippedFilter === 'at-risk') return delay.label === 'At Risk';
        if (shippedFilter === 'delivered') return delay.label === 'Delivered';
        return true;
    });

    async function handleManualShipped(order: any) {
        setIsProcessing(true);
        try {
            await updateOrderStatus(order.id, 'Shipped');
            alert('Order marked as Shipped!');
            loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            console.error('Manual shipping failed:', error);
            alert('Failed to update status.');
        } finally {
            setIsProcessing(false);
        }
    }

    async function handleShippingStatusChange(orderId: string, status: string) {
        await updateShippingStatus(orderId, status);
        loadOrders();
    }

    async function handleETAUpdate(orderId: string) {
        if (!etaValue) return;
        await updateEstimatedDelivery(orderId, etaValue);
        setEditingETA(null);
        setEtaValue('');
        loadOrders();
    }

    const delayStats = {
        total: shippedOrders.length,
        delayed: shippedOrders.filter(o => getDelayStatus(o).label === 'Delayed').length,
        atRisk: shippedOrders.filter(o => getDelayStatus(o).label === 'At Risk').length,
        delivered: shippedOrders.filter(o => getDelayStatus(o).label === 'Delivered').length,
    };

    if (loading) return (
        <div className="p-8 flex items-center gap-3 text-[var(--text-secondary)] font-medium">
            <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
            Loading fulfillment data...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-display font-medium text-[var(--text-primary)] italic">Logistics Hub</h2>
                    <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Manual Fulfillment, Tracking & Delay Monitoring</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH ORDERS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3 bg-[var(--mocha-bg)] border border-[var(--mocha-border)] rounded-full text-[10px] font-black tracking-widest text-[var(--text-primary)] focus:border-[var(--gold)] transition-all outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Orders List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-display font-medium text-[var(--text-secondary)] text-xl italic pt-2">Pending Shipments</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--gold)] bg-[var(--gold)]/10 px-3 py-1 rounded-full border border-[var(--gold)]/20">
                            {filteredOrders.length} ORDERS
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`group relative p-6 bg-[var(--mocha-bg)] border rounded-3xl transition-all cursor-pointer ${selectedOrder?.id === order.id
                                    ? 'border-[var(--gold)] shadow-[0_0_30px_-10px_rgba(212,175,55,0.2)]'
                                    : 'border-[var(--mocha-border)] hover:border-[var(--gold)]/50'
                                    }`}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-[var(--text-primary)] text-lg tracking-tight">{order.orderId}</p>
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${order.shippingMethod === 'Local Hand-Delivery'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {order.shippingMethod || 'Standard'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] font-medium">
                                            {order.customer.split('|')[0].trim()}
                                        </p>
                                    </div>
                                    <p className="font-black text-[var(--gold)] text-xl italic">${order.total.toFixed(2)}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[var(--mocha-border)]/50 grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={12} className="text-[var(--gold)] mt-0.5 shrink-0" />
                                        <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase leading-tight tracking-wider">
                                            {order.address}<br />
                                            {order.city}, {order.province || 'ON'} {order.postalCode}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Package size={12} className="text-[var(--gold)] mt-0.5 shrink-0" />
                                        <div className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                            {JSON.parse(JSON.stringify(order.items)).length} Items in Bag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center border-2 border-dashed border-[var(--mocha-border)] rounded-3xl opacity-50">
                                <Package className="mx-auto text-[var(--text-muted)] mb-4" size={40} />
                                <p className="font-display italic text-lg text-[var(--text-primary)]">All Clear</p>
                                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">No orders pending logistics</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fulfillment Console */}
                <div className="sticky top-8">
                    {selectedOrder ? (
                        <div className="card p-10 border-[var(--gold)]/30 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 rounded-bl-full -mr-16 -mt-16"></div>

                            <h3 className="text-3xl font-display font-medium text-[var(--text-primary)] mb-8 italic">
                                Process {selectedOrder.orderId}
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="p-6 bg-[var(--mocha-bg)] rounded-3xl border border-[var(--mocha-border)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold)] mb-4">Internal Branding</p>
                                    <button
                                        onClick={() => printInternalLabel(selectedOrder)}
                                        className="w-full group flex items-center justify-between px-6 py-5 bg-white rounded-2xl text-[#1B2936] transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Printer size={24} className="group-hover:rotate-12 transition-transform" />
                                            <div className="text-left">
                                                <p className="font-black text-xs uppercase tracking-widest">Print Boutique Label</p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">4x6 Thermal | Barcode Support</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="p-6 bg-[var(--mocha-bg)] rounded-3xl border border-[var(--mocha-border)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4">Status Override</p>
                                    <button
                                        onClick={() => handleManualShipped(selectedOrder)}
                                        disabled={isProcessing}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#1B2936] border border-white/10 rounded-2xl text-white transition-all hover:bg-black disabled:opacity-50 group"
                                    >
                                        <CheckCircle2 size={18} className="text-[var(--gold)]" />
                                        <span className="font-black text-xs uppercase tracking-widest">
                                            {isProcessing ? 'UPDATING...' : 'MARK AS SHIPPED'}
                                        </span>
                                    </button>
                                    <p className="text-[9px] text-center text-[var(--text-muted)] mt-4 font-bold uppercase tracking-widest">
                                        Auto-sets ETA to 5 business days
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card p-16 border-[var(--mocha-border)] border-dashed border-2 flex flex-col items-center justify-center text-center opacity-40 h-full min-h-[500px] rounded-[3rem]">
                            <div className="w-24 h-24 bg-[var(--mocha-bg)] rounded-full flex items-center justify-center text-4xl mb-8 border border-[var(--mocha-border)]">
                                🚚
                            </div>
                            <h3 className="text-2xl font-display font-medium text-[var(--text-primary)] italic">Logistics Hub</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-xs font-medium">Select a pending shipment to generate internal branding or update status.</p>
                            <div className="mt-8 flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce delay-100"></div>
                                <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Shipped Orders - Delay Tracking Section */}
            <div className="border-t border-[var(--mocha-border)] pt-12 mt-12 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-3xl font-display font-medium text-[var(--text-primary)] italic">Shipped Orders</h3>
                        <p className="text-[var(--text-secondary)] font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Delay monitoring & delivery tracking</p>
                    </div>

                    {/* Delay Stats */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShippedFilter('all')}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${shippedFilter === 'all'
                                ? 'bg-[var(--gold)] text-white border-[var(--gold)]'
                                : 'bg-transparent text-[var(--text-muted)] border-[var(--mocha-border)] hover:border-[var(--gold)]/50'
                                }`}
                        >
                            All ({delayStats.total})
                        </button>
                        {delayStats.delayed > 0 && (
                            <button
                                onClick={() => setShippedFilter('delayed')}
                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${shippedFilter === 'delayed'
                                    ? 'bg-red-500 text-white border-red-500'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                🔴 Delayed ({delayStats.delayed})
                            </button>
                        )}
                        {delayStats.atRisk > 0 && (
                            <button
                                onClick={() => setShippedFilter('at-risk')}
                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${shippedFilter === 'at-risk'
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                    }`}
                            >
                                🟡 At Risk ({delayStats.atRisk})
                            </button>
                        )}
                        <button
                            onClick={() => setShippedFilter('delivered')}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${shippedFilter === 'delivered'
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                        >
                            ✅ Delivered ({delayStats.delivered})
                        </button>
                    </div>
                </div>

                {/* Shipped Orders Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredShipped.length > 0 ? filteredShipped.map((order) => {
                        const delay = getDelayStatus(order);
                        const DelayIcon = delay.icon;
                        return (
                            <div key={order.id} className="p-6 bg-[var(--mocha-bg)] border border-[var(--mocha-border)] rounded-3xl transition-all hover:border-[var(--gold)]/30">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-black text-[var(--text-primary)] tracking-tight">{order.orderId}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">{order.customer.split('|')[0].trim()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => printInternalLabel(order)}
                                            className="p-2 bg-white text-[#1B2936] rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md group"
                                            title="Reprint Label"
                                        >
                                            <Printer size={14} className="group-hover:rotate-12 transition-transform" />
                                        </button>
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border
                                            ${delay.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                                                delay.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    delay.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}
                                        >
                                            <DelayIcon size={10} />
                                            {delay.label}
                                            {delay.label === 'Delayed' && ` (${delay.days}d)`}
                                            {delay.label === 'On Time' && ` (${delay.days}d left)`}
                                            {delay.label === 'At Risk' && ` (${delay.days}d left)`}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                        <span className="text-[var(--text-muted)]">Shipped</span>
                                        <span className="text-[var(--text-secondary)]">{order.shippedDate || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                        <span className="text-[var(--text-muted)]">ETA</span>
                                        {editingETA === order.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={etaValue}
                                                    onChange={(e) => setEtaValue(e.target.value)}
                                                    className="bg-[var(--mocha-bg)] border border-[var(--mocha-border)] rounded-lg px-2 py-1 text-[9px] text-[var(--text-primary)] outline-none focus:border-[var(--gold)]"
                                                />
                                                <button
                                                    onClick={() => handleETAUpdate(order.id)}
                                                    className="text-[var(--gold)] hover:text-white transition-colors"
                                                >✓</button>
                                                <button
                                                    onClick={() => setEditingETA(null)}
                                                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingETA(order.id); setEtaValue(order.estimatedDeliveryDate || ''); }}
                                                className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                                            >
                                                {order.estimatedDeliveryDate || 'Set ETA'}
                                            </button>
                                        )}
                                    </div>
                                    {order.trackingNumber && (
                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-[var(--text-muted)]">Tracking</span>
                                            <span className="text-[var(--gold)]">{order.courier}: {order.trackingNumber}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Dropdown */}
                                <div className="relative">
                                    <select
                                        value={order.shippingStatus || 'Shipped'}
                                        onChange={(e) => handleShippingStatusChange(order.id, e.target.value)}
                                        className="w-full appearance-none bg-[#1B2936] text-white rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-black transition-colors pr-10"
                                    >
                                        {SHIPPING_STATUSES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full p-12 text-center border-2 border-dashed border-[var(--mocha-border)] rounded-3xl opacity-50">
                            <Truck className="mx-auto text-[var(--text-muted)] mb-4" size={40} />
                            <p className="font-display italic text-lg text-[var(--text-primary)]">No Shipped Orders</p>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                                {shippedFilter !== 'all' ? 'No orders match this filter' : 'Orders will appear here when shipped'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <DashboardPageGuide
                pageName={{ en: "Shipping Hub", ar: "مركز الشحن" }}
                steps={[
                    {
                        title: { en: "Shipment Queue", ar: "قائمة الشحنات" },
                        description: {
                            en: "View all orders ready for dispatch. Orders appear here once they've been picked and packaged.",
                            ar: "عرض جميع الطلبات الجاهزة للإرسال. تظهر الطلبات هنا بعد التقاطها وتغليفها."
                        },
                        icon: "📦"
                    },
                    {
                        title: { en: "Delay Monitoring", ar: "مراقبة التأخير" },
                        description: {
                            en: "Track shipped orders with real-time delay indicators. Red = Delayed, Yellow = At Risk, Green = On Time.",
                            ar: "تتبع الطلبات المشحونة مع مؤشرات التأخير في الوقت الفعلي. أحمر = متأخر، أصفر = في خطر، أخضر = في الموعد."
                        },
                        icon: "⏰"
                    },
                    {
                        title: { en: "Status Updates", ar: "تحديثات الحالة" },
                        description: {
                            en: "Manually update shipping status: In Transit, Out for Delivery, Delivered, or flag as Issue.",
                            ar: "تحديث حالة الشحن يدوياً: في الطريق، قيد التوصيل، تم التسليم، أو وضع علامة كمشكلة."
                        },
                        icon: "🔄"
                    },
                    {
                        title: { en: "Label Generation", ar: "إنشاء الملصقات" },
                        description: {
                            en: "Print branded shipping labels with customer details, order number, and tracking information.",
                            ar: "طباعة ملصقات شحن تحمل العلامة التجارية مع تفاصيل العميل ورقم الطلب ومعلومات التتبع."
                        },
                        icon: "🏷️"
                    }
                ]}
            />
        </div>
    );
}
