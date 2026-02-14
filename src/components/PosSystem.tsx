'use client'

import { useState, useEffect, useRef } from 'react'
import { getInventory, getStaffList, verifyAccess, getProductBySku, getProductVariants } from '@/app/actions/pos'
import { getCategories } from '@/app/actions/categories'
import { createOrder } from '@/app/actions/orders'
import { X } from 'lucide-react'
import Link from 'next/link'

export default function PosSystem({ restrictedMode = false }: { restrictedMode?: boolean }) {
    const [staff, setStaff] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [selectedStaff, setSelectedStaff] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [scannedProduct, setScannedProduct] = useState<any>(null)
    const [variants, setVariants] = useState<any[]>([])
    const [showVariants, setShowVariants] = useState(false)
    const scanInputRef = useRef<HTMLInputElement>(null)

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentTab, setPaymentTab] = useState<'cash' | 'card'>('cash')
    const [tenderedAmount, setTenderedAmount] = useState('')
    const [lastOrder, setLastOrder] = useState<any>(null)

    const [attemptingUser, setAttemptingUser] = useState<any>(null)
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const [terminalState, setTerminalState] = useState<'idle' | 'sending' | 'waiting' | 'success' | 'failed'>('idle')
    const [terminalMsg, setTerminalMsg] = useState('Ready for Card Terminal')

    const [selectedCategory, setSelectedCategory] = useState('All Items')
    const [selectedCustomerType, setSelectedCustomerType] = useState('Walk-in Customer')
    const customerTypes = ['Walk-in Customer', 'VIP Client', 'Staff Member', 'Online Order']

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [staffData, productData, categoriesData] = await Promise.all([
            getStaffList(),
            getInventory(),
            getCategories()
        ])
        setStaff(staffData)
        setProducts(productData)
        setCategories(categoriesData)
        setLoading(false)
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        if (!attemptingUser) return

        const result = await verifyAccess(attemptingUser.id, password)
        if (result.success) {
            setSelectedStaff(attemptingUser)
            setAttemptingUser(null)
            setPassword('')
            setLoginError('')
        } else {
            setLoginError('Invalid password')
        }
    }

    async function openVariantLookup(product: any) {
        setScannedProduct(product)
        const variantData = await getProductVariants(product.name, product.categoryId)
        setVariants(variantData)
        setShowVariants(true)
    }

    async function handleScan(e: React.FormEvent) {
        e.preventDefault()
        if (!searchTerm) return

        // 1. Try exact SKU match from loaded products first
        // This is faster and handles the "scan" scenario
        const exactMatch = products.find(p => p.sku && p.sku.toLowerCase() === searchTerm.toLowerCase())

        if (exactMatch) {
            // Check if it has variants (if simple product, add directly)
            // For now, if we have a direct match on a product ID that implies a specific item, add it.
            // If the product has "configurable" nature (like size/color options not in the top level product object), show variants.
            // Assuming your Product mode has flattened variants or strictly SKU based:
            addToCart(exactMatch)
            setSearchTerm('')
            // Focus back on input to keep scanning
            setTimeout(() => scanInputRef.current?.focus(), 100)
            return
        }

        // 2. Server-side lookup if not in local cache (fallback)
        const product = await getProductBySku(searchTerm)
        if (product && product.sku && product.sku.toLowerCase() === searchTerm.toLowerCase()) {
            // Found exact SKU on server, add directly
            addToCart(product)
            setSearchTerm('')
            setTimeout(() => scanInputRef.current?.focus(), 100)
        } else if (product) {
            // Found a product but not an exact SKU match (maybe it found by name or prefix)
            await openVariantLookup(product)
            setSearchTerm('')
        } else {
            // 3. Search by name if SKU fails
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            if (matches.length === 1) {
                // If only one match by name, treat as scan? Maybe safer to show variant lookup.
                // But for SKU scans, the above 'exactMatch' catch should have handled it.
                await openVariantLookup(matches[0])
                setSearchTerm('')
            }
        }
    }

    function addToCart(product: any) {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ))
        } else {
            setCart([...cart, { ...product, qty: 1 }])
        }
        setShowVariants(false)
    }

    function removeFromCart(id: string) {
        setCart(cart.filter(item => item.id !== id))
    }

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All Items'
            || (selectedCategory === 'Kids' ? p.isKids === true : p.category?.name === selectedCategory)
        const term = searchTerm.toLowerCase()
        const matchesSearch = !searchTerm ||
            p.name.toLowerCase().includes(term) ||
            (p.sku && p.sku.toLowerCase().includes(term)) // Added null check for sku
        return matchesCategory && matchesSearch
    })

    // Main POS Screen
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const tax = subtotal * 0.13 // Ontario 13% HST
    const total = subtotal + tax

    // Open Payment Modal
    function handleCheckout() {
        if (cart.length === 0) return alert('Cart is empty')
        setTenderedAmount('')
        setPaymentTab('card') // Default to card
        setTerminalState('idle')
        setTerminalMsg('Ready for Chase Merchant Terminal')
        setShowPaymentModal(true)
    }

    async function sendToChaseTerminal() {
        setTerminalState('sending');
        setTerminalMsg('Pushing amount to Chase Terminal...');

        // Simulate Terminal Integration/Cloud Request
        setTimeout(() => {
            setTerminalState('waiting');
            setTerminalMsg('Awaiting Authorization on Machine...');
        }, 1500);

        // In a real production environment, this would be a fetch() call to the Chase Cloud API 
        // or a local network bridge (e.g., J.P. Morgan Payments API)
        // For now, we simulate the success callback after the customer taps their card.
        setTimeout(() => {
            setTerminalState('success');
            setTerminalMsg('Payment Approved by Chase');
            // Auto-process once terminal approves
            processPayment();
        }, 6000);
    }

    // Finalize Transaction
    async function processPayment() {
        try {
            const orderId = `ORD-${Date.now().toString().slice(-6)}`
            const paymentMethod = paymentTab === 'cash' ? 'Cash' : 'Card'
            const received = paymentTab === 'cash' ? parseFloat(tenderedAmount) : total
            const changeDue = received - total

            const order = await createOrder({
                orderId,
                customer: 'Guest',
                total,
                date: new Date().toISOString().split('T')[0],
                items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
                paymentMethod,
                amountPaid: received,
                change: changeDue,
                source: 'POS',
                status: 'Completed'
            })

            setLastOrder({
                ...order,
                items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
                changeDue: paymentTab === 'cash' ? changeDue : 0,
                paymentMethod,
                amountReceived: received,
                payment: paymentMethod
            })
            setCart([])
            setShowPaymentModal(false)
        } catch (error) {
            console.error('Checkout failed:', error)
            alert('Failed to process transaction. Please try again.')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#F8F9FB]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
    )

    // Staff Selection Screen (POS Terminal)
    if (!selectedStaff) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-8 relative">
                <Link href="/dashboard" className="absolute top-8 left-8 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-black transition-all flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                    <span className="text-sm">←</span> Exit Terminal
                </Link>

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Who is selling today?</h2>
                    <p className="text-gray-500">Select your profile to access the POS Register</p>
                </div>

                {attemptingUser ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full animate-fade-in border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-black text-2xl shadow-lg shadow-[#D4AF37]/20">
                                {attemptingUser.name[0]}
                            </div>
                            <h3 className="font-bold text-2xl text-gray-900">{attemptingUser.name}</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{attemptingUser.role}</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    autoFocus
                                    placeholder="Enter Access PIN / Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full text-center text-2xl tracking-widest font-bold p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] focus:bg-white transition-all outline-none"
                                />
                            </div>
                            {loginError && <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setAttemptingUser(null); setPassword(''); setLoginError(''); }}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#1E1E1E] text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl w-full">
                        {staff.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => setAttemptingUser(member)}
                                className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-2xl group-hover:bg-[#D4AF37] transition-colors duration-300">
                                    <span className="group-hover:text-white transition-colors duration-300 font-black text-gray-400">{member.name[0]}</span>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">{member.role}</p>
                            </button>
                        ))}
                        {staff.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="text-4xl mb-4">👥</span>
                                <p>No staff members found.</p>
                                <a href="/dashboard/staff" className="mt-4 text-[#D4AF37] font-bold hover:underline">Add Staff & Hours &rarr;</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row h-screen gap-6 bg-[#F8F9FB] p-6 lg:p-8 overflow-y-auto lg:overflow-hidden font-sans print:hidden">
                {/* LEFT COLUMN: Product Browser */}
                <div className="flex-1 flex flex-col gap-6 lg:overflow-hidden min-h-[500px]">
                    {/* Header Section */}
                    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-black text-gray-900">Product Browser</h2>
                            <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Logged in as {selectedStaff.name}</p>
                        </div>
                        <form onSubmit={handleScan} className="flex-1 w-full max-w-md relative group">
                            <input
                                ref={scanInputRef}
                                autoFocus
                                type="text"
                                placeholder="Scan or search name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-6 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 outline-none transition-all text-sm font-bold"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--gold)]">🔍</span>
                        </form>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedStaff(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors whitespace-nowrap">
                                Switch User
                            </button>
                            <div className="w-px h-4 bg-gray-200" />
                            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap">
                                Exit
                            </Link>
                        </div>
                    </div>

                    {/* Categories / Filters */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {['All Items', ...categories.filter(c => !c.parentId).map(c => c.name), 'Kids'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? 'bg-gray-900 text-white shadow-xl shadow-black/20'
                                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="lg:flex-1 lg:overflow-y-auto lg:pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => openVariantLookup(product)}
                                    className="bg-white p-4 rounded-2xl hover:shadow-2xl transition-all border border-gray-100 group flex flex-col items-center text-center relative"
                                >
                                    {product.stock <= 3 && (
                                        <span className="absolute top-4 right-4 flex h-2.5 w-2.5 z-10">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                    <div className="w-full aspect-[3/4] bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-50">
                                        {product.images ? (
                                            <img src={product.images.split(',')[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>
                                        )}
                                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xl border border-gray-100">
                                            ${product.price}
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[var(--gold)] transition-colors">{product.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-auto">{product.category?.name}</p>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-20 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">🔍</div>
                                    <p className="text-gray-400 font-bold">No atelier matches found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Details / Cart */}
                <div className="w-full lg:w-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col lg:h-full lg:sticky lg:top-0 overflow-hidden shrink-0">
                    {/* Order Header */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Current Order</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Node</p>
                            </div>
                            <span className="bg-[var(--gold)]/10 text-[var(--gold)] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                                ID #{Date.now().toString().slice(-4)}
                            </span>
                        </div>

                        {/* Customer Selector */}
                        <div className="relative group/dropdown">
                            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--gold)] transition-all shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-xl">👤</div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Selected Client</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomerType}</p>
                                </div>
                                <span className="text-gray-400 text-xs text-xs">▼</span>
                            </div>
                            {/* Dropdown Menu */}
                            <div className="hidden group-hover/dropdown:block absolute top-[calc(100%-8px)] left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-300">
                                {customerTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedCustomerType(type)}
                                        className="w-full text-left px-6 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors border-b border-gray-50 last:border-0 uppercase tracking-widest"
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-white min-h-[300px]">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-6 py-12">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl">🛒</div>
                                <p className="font-bold text-sm uppercase tracking-widest opacity-50">Empty Boutique Basket</p>
                            </div>
                        ) : cart.map((item: any) => (
                            <div key={item.id} className="flex gap-5 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    {item.images ? (
                                        <img src={item.images.split(',')[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-all hover:rotate-90">
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">
                                            {item.size || 'OS'} • {item.color || 'Standard'}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="font-black text-lg text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                                        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                                            <button className="text-gray-400 hover:text-black font-black" onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}>-</button>
                                            <span className="text-xs font-black min-w-4 text-center">{item.qty}</span>
                                            <button className="text-gray-400 hover:text-black font-black" onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 mt-auto">
                        <div className="space-y-3 mb-8">

                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>HST (Windsor/Ontario 13%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 my-4 pt-4 flex justify-between text-3xl font-black text-gray-900">
                                <span className="font-display italic text-2xl font-normal">Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full py-5 gold-btn rounded-2xl text-[12px] shadow-xl disabled:opacity-50 disabled:filter-none transition-all"
                        >
                            Finalize Transaction
                        </button>
                        {cart.length > 0 && <button onClick={() => setCart([])} className="w-full mt-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-red-500 transition-colors">Discard Draft Order</button>}
                    </div>
                </div>

                {/* Variant Lookup Modal */}
                {showVariants && scannedProduct && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Select Variation</h3>
                                    <p className="text-sm text-gray-500">{scannedProduct.name}</p>
                                </div>
                                <button onClick={() => setShowVariants(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors">×</button>
                            </div>
                            <div className="p-6 max-h-[500px] overflow-y-auto">
                                <div className="grid grid-cols-1 gap-3">
                                    {variants.map((v: any) => (
                                        <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${v.stock > 0 ? 'bg-white border-gray-100 hover:border-[#D4AF37] hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">{v.size || 'OS'}</span>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{v.color || 'Standard'}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{v.sku}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">${v.price.toFixed(2)}</p>
                                                    <p className={`text-[10px] font-bold ${v.stock > 5 ? 'text-green-600' : 'text-orange-500'}`}>{v.stock} left</p>
                                                </div>
                                                <button
                                                    disabled={v.stock <= 0}
                                                    onClick={() => addToCart(v)}
                                                    className="px-4 py-2 bg-[#1E1E1E] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-fade-in flex">
                            {/* Left: Summary */}
                            <div className="w-1/3 bg-gray-50 p-8 border-r border-gray-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 font-medium">
                                            <span>HST (13%)</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-sm font-bold text-gray-900">Total Due</span>
                                                <span className="text-4xl font-black text-gray-900">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 text-gray-400 font-bold hover:text-black hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                    Cancel
                                </button>
                            </div>

                            {/* Right: Payment Method */}
                            <div className="w-2/3 p-8">
                                <h3 className="text-xl font-black text-gray-900 mb-6">Select Payment Method</h3>

                                <div className="flex gap-4 mb-8">
                                    <button
                                        onClick={() => setPaymentTab('cash')}
                                        className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${paymentTab === 'cash' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        💵 Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentTab('card')}
                                        className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${paymentTab === 'card' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        💳 Card
                                    </button>
                                </div>

                                {paymentTab === 'cash' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount Tendered</label>
                                            <input
                                                autoFocus
                                                type="number"
                                                value={tenderedAmount}
                                                onChange={(e) => setTenderedAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-5xl font-black text-gray-900 border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none py-2 placeholder-gray-200"
                                            />
                                        </div>

                                        {/* Quick Notes */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[20, 50, 100].map(amount => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setTenderedAmount(amount.toString())}
                                                    className="py-2 bg-gray-50 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors"
                                                >
                                                    ${amount}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setTenderedAmount(total.toFixed(2))}
                                                className="py-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-lg font-bold transition-colors"
                                            >
                                                Exact
                                            </button>
                                        </div>

                                        {/* Change Calculation */}
                                        <div className="bg-gray-50 p-5 rounded-xl flex justify-between items-center">
                                            <span className="font-bold text-gray-500">Change Due</span>
                                            <span className={`text-2xl font-black ${parseFloat(tenderedAmount || '0') >= total ? 'text-green-600' : 'text-gray-300'}`}>
                                                ${Math.max(0, parseFloat(tenderedAmount || '0') - total).toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={processPayment}
                                            disabled={!tenderedAmount || parseFloat(tenderedAmount) < total}
                                            className="w-full py-4 bg-[#1E1E1E] text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Complete Cash Sale
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-500 ${terminalState === 'waiting' ? 'bg-blue-500/10 text-blue-500 animate-pulse' : terminalState === 'success' ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            {terminalState === 'success' ? '✓' : '💳'}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-gray-900">{terminalMsg}</h4>
                                            <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">
                                                {terminalState === 'sending' && 'Checking hardware connection...'}
                                                {terminalState === 'waiting' && 'Please have the client tap, insert, or swipe their card on the physical terminal now.'}
                                                {terminalState === 'idle' && 'Transfer the total value to your integrated Chase hardware.'}
                                                {terminalState === 'success' && 'Transaction authorized. Finalizing order...'}
                                            </p>
                                        </div>

                                        {terminalState === 'idle' ? (
                                            <button
                                                onClick={sendToChaseTerminal}
                                                className="w-full py-4 bg-[#D4AF37] text-white rounded-xl font-black text-lg hover:bg-[#B8962E] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                                            >
                                                <span>⚡</span> Send to Chase Machine
                                            </button>
                                        ) : terminalState === 'waiting' ? (
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="flex items-center justify-center gap-2 text-[var(--gold)] font-bold text-xs">
                                                    <div className="w-2 h-2 bg-[var(--gold)] rounded-full animate-ping" /> Connection Active
                                                </div>
                                                <button
                                                    onClick={() => setTerminalState('idle')}
                                                    className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    Cancel Terminal Request
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-lg cursor-not-allowed"
                                            >
                                                Processing...
                                            </button>
                                        )}

                                        {terminalState === 'idle' && (
                                            <button
                                                onClick={processPayment}
                                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                                            >
                                                Or Manual Override (Record Only)
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {lastOrder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 print:hidden">
                        <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-in text-center p-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 mb-8">Order #{lastOrder.orderId}</p>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span className="font-bold text-sm">Amount Paid</span>
                                    <span className="font-bold text-lg text-gray-900">${lastOrder.amountReceived?.toFixed(2) || lastOrder.total.toFixed(2)}</span>
                                </div>
                                {lastOrder.changeDue > 0 && (
                                    <div className="flex justify-between items-center text-green-600 pt-4 border-t border-gray-200">
                                        <span className="font-bold text-lg">Change Due</span>
                                        <span className="font-black text-3xl">${lastOrder.changeDue.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => window.print()} className="w-full py-3 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                    🖨️ Print Receipt
                                </button>
                                <button onClick={() => setLastOrder(null)} className="w-full py-4 bg-[#1E1E1E] text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200">
                                    New Sale
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT ONLY RECEIPT LAYOUT */}
            {lastOrder && (
                <div className="hidden print:block print:w-[80mm] print:p-2 bg-white text-black font-mono text-sm print:pb-20">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">ModeAura</h1>
                        <p className="text-xs">Luxury Accessories</p>
                        <p className="text-xs mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                        <p className="text-xs">Order #{lastOrder.orderId}</p>
                    </div>

                    <div className="border-b-2 border-dashed border-black my-2"></div>

                    <div className="space-y-2">
                        {lastOrder.items.map((item: any, i: number) => {
                            const itemPrice = Number(item.price) || 0;
                            const itemQty = Number(item.qty) || 1;
                            return (
                                <div key={i} className="flex justify-between text-xs">
                                    <span>{itemQty}x {item.name}</span>
                                    <span>${(itemPrice * itemQty).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-b-2 border-dashed border-black my-2"></div>

                    <div className="space-y-1 text-right">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${(lastOrder.total / 1.13).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (13%)</span>
                            <span>${(lastOrder.total - (lastOrder.total / 1.13)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-black text-lg mt-2">
                            <span>TOTAL</span>
                            <span>${lastOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span>Paid ({lastOrder.payment})</span>
                            <span>${lastOrder.amountReceived?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span>Change</span>
                            <span>${lastOrder.changeDue.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-b-2 border-dashed border-black my-4"></div>

                    <div className="text-center text-xs space-y-2 pb-8">
                        <p>Thank you for shopping with us!</p>
                        <p>Visit modeaura.ca/policy for returns & exchanges</p>
                        <p className="font-bold">modeaura.ca</p>
                        <div className="pt-4 text-[10px] text-center">
                            Authorized Dealer
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
