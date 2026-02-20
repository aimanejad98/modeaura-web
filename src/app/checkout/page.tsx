'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import { ArrowRight, CheckCircle2, Loader2, MapPin, ShieldCheck, Ticket, Truck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createOrder } from '@/app/actions/orders';
import { getCurrentUser } from '@/app/actions/auth';
import { validateDiscountCode, incrementDiscountUses } from '@/app/actions/discounts';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart, discount, applyDiscount, removeDiscount, totalAfterDiscount } = useCart();
    const [user, setUser] = useState<any>(null);
    const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'success'>('info');
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    // Stripe State
    const [clientSecret, setClientSecret] = useState('');
    const [loadingPayment, setLoadingPayment] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada',
        email: ''
    });

    const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');

    const canadianProvinces = [
        'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
        'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
        'Northwest Territories', 'Nunavut', 'Yukon'
    ];

    const usStates = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
    ];

    const provinces = formData.country === 'Canada' ? canadianProvinces : usStates;

    const router = useRouter();

    useEffect(() => {
        async function loadUser() {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const [first, ...last] = currentUser.name.split(' ');
                setFormData(prev => ({
                    ...prev,
                    firstName: first || '',
                    lastName: last.join(' ') || '',
                    email: currentUser.email
                }));
            }
        }
        loadUser();
    }, []);

    const isLocalDelivery = useMemo(() => {
        if (deliveryMethod === 'pickup') return false;
        const city = formData.city.toLowerCase().trim();
        return city === 'windsor' || city === 'lasalle';
    }, [formData.city, deliveryMethod]);

    const shippingCost = useMemo(() => {
        if (deliveryMethod === 'pickup') return 0;
        if (isLocalDelivery) return 0;
        if (!formData.country) return 0;
        if (formData.country === 'Canada') {
            const province = formData.province.toLowerCase();
            if (province === 'ontario') return 8;
            return 12;
        }
        if (formData.country === 'United States') {
            return 18;
        }
        return 0;
    }, [formData.country, formData.province, formData.city, isLocalDelivery, deliveryMethod]);

    const taxableAmount = totalAfterDiscount + shippingCost;
    const gstAmount = taxableAmount * 0.05;
    const hstAmount = taxableAmount * 0.08;
    const finalTotal = taxableAmount + gstAmount + hstAmount;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProceedToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPayment(true);

        try {
            // Fetch Client Secret
            // We pass the *calculated* amount to API mostly for validation or just simple init
            // API should ideally recalculate, but for now we trust the flow
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    amount: finalTotal, // Pass the total including tax/shipping
                    email: formData.email
                })
            });

            if (!res.ok) throw new Error('Failed to init payment');

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setPaymentStep('payment');
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            alert('Failed to load payment system. Please try again.');
        } finally {
            setLoadingPayment(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsValidating(true);
        setPromoError('');

        const result = await validateDiscountCode(promoCode, cartTotal);
        if (result.success && result.discount) {
            applyDiscount(result.discount);
            setPromoCode('');
        } else {
            setPromoError(result.error || 'Invalid code');
        }
        setIsValidating(false);
    };

    const handleSuccess = async (paymentIntentId: string) => {
        try {
            const orderId = `MA-${Math.floor(100000 + Math.random() * 900000)}`;
            const orderData = {
                orderId: orderId,
                customer: `${formData.firstName} ${formData.lastName} | ${formData.email}`,

                customerId: user?.id || null,
                email: formData.email,
                total: finalTotal,
                date: new Date().toISOString(),
                items: cart.map(item => ({
                    ...item,
                    sku: item.sku || 'N/A'
                })),
                address: deliveryMethod === 'pickup' ? 'Mode Aura Boutique (Pickup)' : formData.address,
                city: deliveryMethod === 'pickup' ? 'Windsor' : formData.city,
                province: deliveryMethod === 'pickup' ? 'Ontario' : formData.province,
                postalCode: deliveryMethod === 'pickup' ? 'N8X 2S2' : formData.postalCode,
                status: 'Pending',
                paymentMethod: 'Credit Card (Stripe)',
                amountPaid: finalTotal,
                source: 'WEBSITE',
                shippingMethod: deliveryMethod === 'pickup' ? 'Store Pickup' : (isLocalDelivery ? 'Local Hand-Delivery' : 'Standard'),
                discountCode: discount?.code,
                discountAmount: discount?.amount
            };

            await createOrder(orderData);
            if (discount) {
                await incrementDiscountUses(discount.code);
            }
            localStorage.setItem('lastOrderId', orderId);
            clearCart();
            removeDiscount();
            setPaymentStep('success');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Payment successful but order creation failed. Please contact support.');
        }
    };

    // ... (Empty cart check and Success view remain unchanged)

    if (cart.length === 0 && paymentStep !== 'success') {
        return (
            <main className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 pt-64 pb-24 text-center">
                    <h1 className="text-4xl font-display italic text-[#1B2936]">Your bag is empty.</h1>
                    <p className="mt-4 text-gray-500">Please add items to your bag before checking out.</p>
                </div>
                <Footer />
            </main>
        );
    }

    if (paymentStep === 'success') {
        return (
            <main className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 pt-64 pb-24 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-100">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-display italic text-[#1B2936]">Order Confirmed</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--gold)]">Thank you for your boutique purchase</p>
                    </div>

                    <div className="py-6 px-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm max-w-sm mx-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Your Order Number</p>
                        <p className="text-3xl font-mono font-bold text-[#1B2936]">{localStorage.getItem('lastOrderId')}</p>
                    </div>

                    <p className="text-gray-500 leading-relaxed font-medium max-w-lg mx-auto">
                        Your order has been received and is being prepared by our atelier in Windsor.
                        A confirmation email has been sent to <span className="text-[#1B2936] font-bold">{formData.email}</span>.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/track/${localStorage.getItem('lastOrderId')}`} className="bg-[#1B2936] text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                            Track Order Status
                        </Link>
                        <Link href="/shop" className="bg-white border border-gray-100 text-[#1B2936] px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[var(--gold)] transition-all">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-64 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Shipping & Payment Form */}
                    <div className="lg:col-span-7 space-y-12">
                        {paymentStep === 'info' ? (
                            <form onSubmit={handleProceedToPayment} className="space-y-12 animate-in slide-in-from-left-4 duration-500">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-display italic text-[#1B2936]">Delivery Details</h2>
                                        {!user && (
                                            <Link href="/login?redirect=/checkout" className="text-[9px] font-black uppercase tracking-widest text-[var(--gold)] hover:text-black transition-colors">Already a member? Sign In</Link>
                                        )}
                                    </div>

                                    {/* Delivery Method Toggle */}
                                    <div className="grid grid-cols-2 gap-4 bg-white p-2 rounded-2xl border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod('shipping')}
                                            className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${deliveryMethod === 'shipping' ? 'bg-[#1B2936] text-white shadow-lg' : 'text-gray-400 hover:text-[#1B2936]'}`}
                                        >
                                            Standard Shipping
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod('pickup')}
                                            className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${deliveryMethod === 'pickup' ? 'bg-[#1B2936] text-white shadow-lg' : 'text-gray-400 hover:text-[#1B2936]'}`}
                                        >
                                            Pick from Store
                                        </button>
                                    </div>

                                    {/* Pickup Info */}
                                    {deliveryMethod === 'pickup' && (
                                        <div className="p-8 bg-white border border-[var(--gold)]/20 rounded-[2rem] flex gap-6 animate-in fade-in zoom-in-95">
                                            <div className="w-16 h-16 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-[#1B2936] shrink-0">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1B2936]">Mode Aura Boutique</h4>
                                                <p className="text-sm text-gray-500 mt-1">Windsor, Ontario</p>
                                                <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-widest mt-4">Ready in 24 Hours</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">First Name</label>
                                            <input
                                                type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name</label>
                                            <input
                                                type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                                            <input
                                                type="email" name="email" value={formData.email} onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                            />
                                        </div>

                                        {/* Shipping Fields - Only show if Shipping */}
                                        {deliveryMethod === 'shipping' && (
                                            <>
                                                <div className="col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping Address</label>
                                                    <input
                                                        type="text" name="address" value={formData.address} onChange={handleInputChange}
                                                        placeholder="Street address, apartment, suite, etc."
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Country</label>
                                                    <select
                                                        name="country" value={formData.country} onChange={handleInputChange}
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none cursor-pointer"
                                                        required
                                                    >
                                                        <option value="Canada">Canada</option>
                                                        <option value="United States">United States</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">City</label>
                                                    <input
                                                        type="text" name="city" value={formData.city} onChange={handleInputChange}
                                                        placeholder="e.g. Windsor"
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{formData.country === 'Canada' ? 'Province' : 'State'}</label>
                                                    <select
                                                        name="province" value={formData.province} onChange={handleInputChange}
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none cursor-pointer"
                                                        required
                                                    >
                                                        <option value="">Select {formData.country === 'Canada' ? 'Province' : 'State'}</option>
                                                        {provinces.map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{formData.country === 'Canada' ? 'Postal Code' : 'ZIP Code'}</label>
                                                    <input
                                                        type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                                                        placeholder={formData.country === 'Canada' ? 'A1A 1A1' : '12345'}
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-[var(--gold)] outline-none" required
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {isLocalDelivery && deliveryMethod === 'shipping' && (
                                        <div className="p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[2rem] flex items-center gap-4 animate-in fade-in zoom-in-95">
                                            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shrink-0">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-[#1B2936]">Local Hand-Delivery Detected</p>
                                                <p className="text-[10px] text-gray-500 font-bold mt-1">Our Windsor team will personally deliver your order.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={loadingPayment} className="w-full bg-[#1B2936] text-white py-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl">
                                    {loadingPayment ? <Loader2 className="animate-spin" /> : <>Proceed to Payment <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-display italic text-[#1B2936]">Payment Method</h2>
                                        <button onClick={() => setPaymentStep('info')} className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">← Edit Details</button>
                                    </div>

                                    {clientSecret && (
                                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                                            <CheckoutForm total={finalTotal} onSuccess={handleSuccess} />
                                        </Elements>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary Table */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-10 sticky top-48">
                            <h2 className="text-2xl font-display italic text-[#1B2936]">Order Breakdown</h2>

                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.variant}`} className="flex gap-4">
                                        <div className="w-16 h-20 bg-[#FAF9F6] rounded-lg overflow-hidden shrink-0 shadow-sm">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-xs font-bold text-[#1B2936]">{item.name}</h4>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">{item.variant}</p>
                                            <p className="text-[10px] font-black text-[var(--gold)]">Qty: {item.quantity}</p>
                                        </div>
                                        <Price amount={item.price * item.quantity} className="text-sm font-bold text-[#1B2936]" />
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Input */}
                            <div className="pt-2">
                                {!discount ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    placeholder="PROMO CODE"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black tracking-widest focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={isValidating || !promoCode}
                                                className="px-6 bg-[#1B2936] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                            >
                                                {isValidating ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{promoError}</p>}
                                    </div>
                                ) : (
                                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white">
                                                <Ticket size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#1B2936]">{discount.code}</p>
                                                <p className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest">
                                                    Saved {discount.type === 'Percentage' ? `${discount.value}%` : <Price amount={discount.value} />}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={removeDiscount} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-8">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Subtotal</span>
                                    <Price amount={cartTotal} />
                                </div>
                                {discount && (
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                        <span>Discount Applied</span>
                                        <span>-<Price amount={discount.amount} /></span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>GST (5%)</span>
                                    <span>${gstAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>HST (8%)</span>
                                    <span>${hstAmount.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-display italic text-xl text-[#1B2936]">Total Value</span>
                                    <span className="font-display italic text-2xl text-[var(--gold)]">
                                        CAD ${finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
