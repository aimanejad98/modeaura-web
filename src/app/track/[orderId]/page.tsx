'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { printOnlineReceipt } from '@/components/OnlineReceipt';
import { Package, Truck, CheckCircle, Clock, MapPin, Printer } from 'lucide-react';

export default function TrackOrderPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadOrder() {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                setError('Failed to load order');
            } finally {
                setLoading(false);
            }
        }
        if (orderId) loadOrder();
    }, [orderId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#1B2936] font-medium">Loading order details...</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="max-w-2xl mx-auto px-6 pt-64 pb-24 text-center space-y-6">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <Package size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-4xl font-display italic text-[#1B2936]">Order Not Found</h1>
                    <p className="text-gray-500">We couldn't find an order with ID: <span className="font-bold">{orderId}</span></p>
                    <Link href="/" className="inline-block mt-6 px-8 py-4 bg-[#1B2936] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        Return Home
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    const statusSteps = [
        { name: 'Order Placed', icon: CheckCircle, completed: true },
        { name: 'In Processing', icon: Package, completed: order.status !== 'Pending' },
        { name: 'Packed & Ready', icon: Clock, completed: order.status === 'Ready for Shipping' || order.status === 'Shipped' || order.status === 'Delivered' },
        { name: 'Shipped', icon: Truck, completed: order.status === 'Shipped' || order.status === 'Delivered' }
    ];

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 pt-64 pb-24 space-y-16">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-block px-6 py-2 bg-[#D4AF37]/10 rounded-full">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Order Tracking</p>
                    </div>
                    <h1 className="text-5xl font-display italic text-[#1B2936]">Order #{order.orderId}</h1>
                    <p className="text-gray-500">Placed on {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                    <button
                        onClick={() => printOnlineReceipt(order)}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1B2936] hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer size={14} /> Print Official Receipt
                    </button>
                </div>

                {/* Status Timeline */}
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-display italic text-[#1B2936] mb-10">Delivery Status</h2>
                    <div className="relative">
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100">
                            <div
                                className="h-full bg-[#D4AF37] transition-all duration-500"
                                style={{ width: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%` }}
                            ></div>
                        </div>
                        <div className="relative grid grid-cols-4 gap-4">
                            {statusSteps.map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center space-y-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.completed ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-400'
                                        } transition-all duration-500`}>
                                        <step.icon size={20} />
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-center ${step.completed ? 'text-[#1B2936]' : 'text-gray-400'
                                        }`}>{step.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Items */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <h3 className="text-xl font-display italic text-[#1B2936]">Order Items</h3>
                        <div className="space-y-4">
                            {(Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]')).map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div className="space-y-1">
                                        <span className="text-gray-600 block">{item.quantity || item.qty}x {item.name}</span>
                                        {item.sku && <code className="text-[10px] text-gray-300 font-mono uppercase">{item.sku}</code>}
                                    </div>
                                    <span className="font-bold text-[#1B2936]">${((Number(item.price) || 0) * (item.quantity || item.qty || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${(Number(order.total) / 1.13 - (order.shippingCost || 10)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>Logistics</span>
                                <span>${(order.shippingCost || 10).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>Tax (HST 13%)</span>
                                <span>${(Number(order.total) - (Number(order.total) / 1.13)).toFixed(2)}</span>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-[#1B2936]">Total</span>
                                <span className="text-2xl font-display italic text-[#D4AF37]">${order.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <h3 className="text-xl font-display italic text-[#1B2936]">Shipping Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                                <p className="text-[#1B2936] font-medium">{order.customer}</p>
                            </div>
                            {order.address && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Delivery Address</p>
                                    <p className="text-[#1B2936] font-medium">{order.address}</p>
                                    <p className="text-[#1B2936] font-medium">{order.city}, {order.province || 'ON'} {order.postalCode}</p>
                                    <p className="text-[#1B2936] font-medium uppercase text-[10px] tracking-widest mt-1">Canada</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shipping Method</p>
                                <p className="text-[#1B2936] font-medium">{order.shippingMethod || 'Standard'}</p>
                            </div>
                            {order.trackingNumber && (
                                <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Live Tracking</p>
                                    <p className="text-[#1B2936] font-bold text-lg font-mono">{order.trackingNumber}</p>
                                    <p className="text-[10px] text-green-600/60 uppercase font-black">{order.courier || 'Shipping Partner'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-[#1B2936] p-12 rounded-[3rem] text-white text-center space-y-6">
                    <Clock size={40} className="text-[#D4AF37] mx-auto" />
                    <h3 className="text-2xl font-display italic">Need Help?</h3>
                    <p className="text-white/60 text-sm max-w-lg mx-auto">
                        If you have any questions about your order, feel free to contact our customer service team.
                    </p>
                    <Link href="/contact" className="inline-block px-8 py-4 bg-[#D4AF37] text-[#1B2936] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                        Contact Support
                    </Link>
                </div>
            </div>

            <Footer />
        </main >
    );
}
