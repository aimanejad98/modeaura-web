'use client'

import { useState, useEffect } from 'react'
import { trackOrder } from '@/app/actions/orders'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, Package, Truck, MapPin, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const TIMELINE_STEPS = [
    { key: 'Processing', label: 'Order Placed', icon: Package, description: 'Your order has been confirmed' },
    { key: 'Shipped', label: 'Shipped', icon: Truck, description: 'Package has left the warehouse' },
    { key: 'In Transit', label: 'In Transit', icon: ArrowRight, description: 'On its way to your destination' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin, description: 'Your package is nearby' },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, description: 'Successfully delivered' },
]

function getStepIndex(status: string): number {
    const idx = TIMELINE_STEPS.findIndex(s => s.key === status)
    return idx >= 0 ? idx : 0
}

export default function TrackOrderClient() {
    const searchParams = useSearchParams()
    const [orderId, setOrderId] = useState('')
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searched, setSearched] = useState(false)

    // Auto-search if orderId is in URL
    useEffect(() => {
        const urlOrderId = searchParams.get('orderId')
        if (urlOrderId) {
            setOrderId(urlOrderId)
            // Call internal track function immediately
            const fetchOrder = async () => {
                setLoading(true)
                setSearched(true)
                const result = await trackOrder(urlOrderId.toUpperCase())
                if (result) {
                    setOrder(result)
                } else {
                    setError('Order not found. Please check your order number and try again.')
                }
                setLoading(false)
            }
            fetchOrder()
        }
    }, [searchParams])

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId.trim()) return

        setLoading(true)
        setError('')
        setSearched(true)

        const result = await trackOrder(orderId.trim().toUpperCase())

        if (result) {
            setOrder(result)
        } else {
            setOrder(null)
            setError('Order not found. Please check your order number and try again.')
        }
        setLoading(false)
    }

    const currentStep = order ? getStepIndex(order.shippingStatus) : -1
    const isDelayed = order?.shippingStatus === 'Delayed' || order?.shippingStatus === 'Issue'

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 pt-64 md:pt-72 pb-24">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.6em] mb-4">Order Tracking</p>
                    <h1 className="text-4xl md:text-5xl font-display italic text-[#1B2936] leading-tight">
                        Track Your Order
                    </h1>
                    <p className="text-sm text-gray-500 mt-4 max-w-md mx-auto font-medium">
                        Enter your order number to view real-time shipping updates and estimated delivery information.
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-16">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--gold)] transition-colors" size={20} />
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Order ID (e.g. MA-20260212-A1B2)"
                            className="w-full pl-16 pr-36 py-6 bg-white border-2 border-gray-100 rounded-full text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all shadow-lg shadow-black/[0.03]"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-[#1B2936] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                </form>

                {/* Error State */}
                {error && (
                    <div className="max-w-xl mx-auto text-center p-8 bg-red-50 border border-red-100 rounded-3xl mb-8">
                        <AlertTriangle className="mx-auto text-red-400 mb-3" size={24} />
                        <p className="text-sm font-bold text-red-600">{error}</p>
                        <p className="text-[10px] text-red-400 mt-2 font-medium uppercase tracking-widest">
                            Check your confirmation email for the correct order number
                        </p>
                    </div>
                )}

                {/* Order Result */}
                {order && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Order Header Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-xl shadow-black/[0.03] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--gold)]/5 rounded-bl-full -mr-20 -mt-20" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.4em] mb-2">Order Number</p>
                                    <h2 className="text-3xl font-display italic text-[#1B2936]">{order.orderId}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                                        Placed {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                                        ${isDelayed
                                            ? 'bg-red-50 text-red-500 border-red-100 animate-pulse'
                                            : order.shippingStatus === 'Delivered'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20'
                                        }`}
                                    >
                                        {isDelayed ? <AlertTriangle size={12} /> : order.shippingStatus === 'Delivered' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                                        {order.shippingStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-10 shadow-xl shadow-black/[0.03]">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10">Shipping Progress</h3>

                            {isDelayed ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="text-red-500" size={28} />
                                    </div>
                                    <p className="text-lg font-bold text-red-600 mb-2">
                                        {order.shippingStatus === 'Issue' ? 'Shipping Issue Detected' : 'Delivery Delayed'}
                                    </p>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        We&apos;re working on resolving this. Please contact support if you need immediate assistance.
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100" />
                                    <div
                                        className="absolute left-6 top-0 w-px bg-[var(--gold)] transition-all duration-1000"
                                        style={{ height: `${Math.min(100, (currentStep / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
                                    />

                                    <div className="space-y-10">
                                        {TIMELINE_STEPS.map((step, i) => {
                                            const StepIcon = step.icon
                                            const isActive = i <= currentStep
                                            const isCurrent = i === currentStep

                                            return (
                                                <div key={step.key} className="flex items-start gap-6 relative">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative z-10 transition-all duration-500
                                                        ${isCurrent
                                                            ? 'bg-[var(--gold)] text-white shadow-lg shadow-[var(--gold)]/30 scale-110'
                                                            : isActive
                                                                ? 'bg-[var(--gold)]/20 text-[var(--gold)]'
                                                                : 'bg-gray-50 text-gray-300 border border-gray-100'
                                                        }`}
                                                    >
                                                        <StepIcon size={18} />
                                                    </div>
                                                    <div className={`pt-2 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                                        <p className={`text-sm font-black uppercase tracking-widest ${isCurrent ? 'text-[#1B2936]' : 'text-gray-500'}`}>
                                                            {step.label}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{step.description}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Shipping Method</p>
                                <p className="text-sm font-bold text-[#1B2936]">{order.shippingMethod || 'Standard'}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Estimated Delivery</p>
                                <p className="text-sm font-bold text-[#1B2936]">
                                    {order.estimatedDeliveryDate
                                        ? new Date(order.estimatedDeliveryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                        : 'Pending'}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Destination</p>
                                <p className="text-sm font-bold text-[#1B2936]">{order.city}{order.province ? `, ${order.province}` : ''}</p>
                            </div>
                        </div>

                        {/* Tracking Number */}
                        {order.trackingNumber && (
                            <div className="bg-[#1B2936] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Package className="text-[var(--gold)]" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Tracking Number</p>
                                        <p className="text-sm font-bold text-white mt-0.5">{order.trackingNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Courier</p>
                                    <p className="text-sm font-bold text-[var(--gold)] mt-0.5">{order.courier || 'Standard'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty Initial State */}
                {!order && !error && !searched && (
                    <div className="text-center py-16 opacity-40">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                            <Package className="text-gray-300" size={36} />
                        </div>
                        <p className="text-sm text-gray-400 font-medium italic">Enter your order number above to get started</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
