'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { getInventory, getStaffList, verifyAccess, getProductBySku, getProductVariants } from '@/app/actions/pos'
import { getCategories } from '@/app/actions/categories'
import { X, RefreshCw, Wifi, WifiOff, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { loadStripeTerminal } from '@stripe/terminal-js';
import { createTerminalPaymentIntent, captureTerminalPayment } from '@/app/actions/stripe-terminal'

export default function PosSystem({ restrictedMode = false }: { restrictedMode?: boolean }) {
    // Data State
    const [staff, setStaff] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])

    // Cart & User State
    const [cart, setCart] = useState<any[]>([])
    const [selectedStaff, setSelectedStaff] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [scannedProduct, setScannedProduct] = useState<any>(null)
    const [variants, setVariants] = useState<any[]>([])
    const [showVariants, setShowVariants] = useState(false)
    const scanInputRef = useRef<HTMLInputElement>(null)

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentTab, setPaymentTab] = useState<'cash' | 'card'>('cash')
    const [tenderedAmount, setTenderedAmount] = useState('')
    const [lastOrder, setLastOrder] = useState<any>(null)

    // Login State
    const [lastActivity, setLastActivity] = useState<number>(Date.now())
    const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
    const [attemptingUser, setAttemptingUser] = useState<any>(null)
    const [password, setPassword] = useState('')
    const [pin, setPin] = useState('')
    const [loginError, setLoginError] = useState('')

    // Customer & Category Selection
    const [selectedCategory, setSelectedCategory] = useState('All Items')
    const [selectedCustomerType, setSelectedCustomerType] = useState('Walk-in Customer')
    const customerTypes = ['Walk-in Customer', 'VIP Client', 'Staff Member', 'Online Order']
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)

    // Discount State
    const [discountCode, setDiscountCode] = useState('')
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
    const [discountError, setDiscountError] = useState('')

    // Stripe Terminal State
    const [terminal, setTerminal] = useState<any>(null)
    const [isTerminalLoading, setIsTerminalLoading] = useState(false)
    const [readers, setReaders] = useState<any[]>([])
    const [connectedReader, setConnectedReader] = useState<any>(null)
    const [terminalStatus, setTerminalStatus] = useState<string>('Disconnected')
    const [paymentStatus, setPaymentStatus] = useState<string>('')

    useEffect(() => {
        loadData()
        initializeTerminal()

        // AFK Lock: Track activity
        const trackActivity = () => setLastActivity(Date.now())
        window.addEventListener('mousemove', trackActivity)
        window.addEventListener('mousedown', trackActivity)
        window.addEventListener('keypress', trackActivity)
        window.addEventListener('touchstart', trackActivity)

        // AFK Lock: Check for idle timeout every 10 seconds
        const idleCheck = setInterval(() => {
            if (selectedStaff && Date.now() - lastActivity > IDLE_TIMEOUT) {
                // Return to login screen
                setSelectedStaff(null)
                setAttemptingUser(null) // Reset any half-finished login
                setTenderedAmount('') // Reset payment state for safety
                setShowPaymentModal(false)
            }
        }, 10000)

        return () => {
            window.removeEventListener('mousemove', trackActivity)
            window.removeEventListener('mousedown', trackActivity)
            window.removeEventListener('keypress', trackActivity)
            window.removeEventListener('touchstart', trackActivity)
            clearInterval(idleCheck)
        }
    }, [selectedStaff, lastActivity]) // Re-run when staff logs in or activity happens

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

    // --- Stripe Terminal Logic ---

    async function initializeTerminal() {
        try {
            const StripeTerminal = await loadStripeTerminal();
            if (!StripeTerminal) return;

            const t = StripeTerminal.create({
                onFetchConnectionToken: async () => {
                    const response = await fetch('/api/stripe/connection_token', { method: 'POST' });
                    const data = await response.json();
                    if (data.error) throw new Error(data.error);
                    return data.secret;
                },
                onUnexpectedReaderDisconnect: () => {
                    setConnectedReader(null);
                    setTerminalStatus('Disconnected');
                },
            });
            setTerminal(t);
        } catch (error) {
            console.error('Failed to load Stripe Terminal:', error);
        }
    }

    async function discoverReaders() {
        if (!terminal) return;
        setIsTerminalLoading(true);
        setTerminalStatus('Discovering Readers...');
        try {
            const config = { simulated: false, discoveryMethod: 'internet' }; // Change simulated to true for testing
            const discoverResult = await terminal.discoverReaders(config);

            if (discoverResult.error) {
                console.error('Failed to discover readers:', discoverResult.error);
                setTerminalStatus(`Discovery Failed: ${discoverResult.error.message}`);
            } else if (discoverResult.discoveredReaders.length === 0) {
                setTerminalStatus('No readers found. Ensure reader is on and connected to internet.');
            } else {
                setReaders(discoverResult.discoveredReaders);
                setTerminalStatus('Readers Found');
            }
        } catch (error) {
            console.error('Error discovering readers:', error);
            setTerminalStatus('Error searching for readers');
        } finally {
            setIsTerminalLoading(false);
        }
    }

    async function connectToReader(reader: any) {
        if (!terminal) return;
        setIsTerminalLoading(true);
        setTerminalStatus(`Connecting to ${reader.label}...`);
        try {
            const connectResult = await terminal.connectReader(reader);
            if (connectResult.error) {
                console.error('Failed to connect:', connectResult.error);
                setTerminalStatus(`Connection Failed: ${connectResult.error.message}`);
            } else {
                setConnectedReader(connectResult.reader);
                setTerminalStatus('Connected');
                setReaders([]); // Clear list after connection
            }
        } catch (error) {
            console.error('Error connecting to reader:', error);
            setTerminalStatus('Connection Error');
        } finally {
            setIsTerminalLoading(false);
        }
    }

    async function handleCardPayment() {
        if (!terminal || !connectedReader) {
            setPaymentStatus('No reader connected. Please connect a reader first.');
            return;
        }

        setIsTerminalLoading(true);
        setPaymentStatus('Initializing Payment...');

        try {
            // 1. Create PaymentIntent on Server
            const piResult = await createTerminalPaymentIntent(total);
            if (!piResult.success) throw new Error(piResult.error);

            const clientSecret = piResult.clientSecret;

            // 2. Collect Payment Method
            setPaymentStatus('Please tap, insert, or swipe card...');
            const collectResult = await terminal.collectPaymentMethod(clientSecret);

            if (collectResult.error) {
                throw new Error(collectResult.error.message);
            }

            // 3. Process Payment
            setPaymentStatus('Processing Payment...');
            const processResult = await terminal.processPayment(collectResult.paymentIntent);

            if (processResult.error) {
                throw new Error(processResult.error.message);
            }

            // 4. Capture Payment (Server-side)
            setPaymentStatus('Capturing Payment...');
            const captureResult = await captureTerminalPayment(processResult.paymentIntent.id);

            if (!captureResult.success) {
                throw new Error('Payment authorized but capture failed. Check Stripe Dashboard.');
            }

            setPaymentStatus('Payment Successful!');
            await processPayment('Card'); // Finalize order in DB

        } catch (error: any) {
            console.error('Payment failed:', error);
            setPaymentStatus(`Payment Failed: ${error.message}`);
        } finally {
            setIsTerminalLoading(false);
        }
    }

    // --- End Stripe Logic ---

    // Staff Login
    async function handleStaffLogin(e: React.FormEvent) {
        e.preventDefault()
        if (!attemptingUser) return

        const code = pin || password
        const result = await verifyAccess(attemptingUser.id, code)
        if (result.success) {
            setSelectedStaff(attemptingUser)
            setAttemptingUser(null)
            setPassword('')
            setPin('')
            setLoginError('')
            // Try to auto-connect to saved reader? (Future enhancement)
        } else {
            setLoginError('Invalid PIN/Password')
            setPin('')
        }
    }

    // Product Scanning & Cart Logic
    async function openVariantLookup(product: any) {
        setScannedProduct(product)
        const variantData = await getProductVariants(product.name, product.categoryId)
        setVariants(variantData)
        setShowVariants(true)
    }

    async function handleScan(e: React.FormEvent) {
        e.preventDefault()
        if (!searchTerm) return
        const exactMatch = products.find(p => p.sku && p.sku.toLowerCase() === searchTerm.toLowerCase())
        if (exactMatch) {
            addToCart({
                id: exactMatch.id,
                name: exactMatch.name,
                price: exactMatch.price,
                image: exactMatch.images?.split(',')[0],
                quantity: 1,
                sku: exactMatch.sku,
                variant: exactMatch.color && exactMatch.size ? `${exactMatch.color} / ${exactMatch.size}` : exactMatch.color || exactMatch.size,
                stock: exactMatch.stock
            })
            setSearchTerm('')
            setTimeout(() => scanInputRef.current?.focus(), 100)
            return
        }
        const product = await getProductBySku(searchTerm)
        if (product && product.sku && product.sku.toLowerCase() === searchTerm.toLowerCase()) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.split(',')[0],
                quantity: 1,
                sku: product.sku,
                variant: product.color && product.size ? `${product.color} / ${product.size}` : product.color || product.size,
                stock: product.stock
            })
            setSearchTerm('')
            setTimeout(() => scanInputRef.current?.focus(), 100)
        } else if (product) {
            await openVariantLookup(product)
            setSearchTerm('')
        } else {
            const matches = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())))
            if (matches.length === 1) {
                await openVariantLookup(matches[0])
                setSearchTerm('')
            }
        }
    }

    function addToCart(product: any) {
        const existing = cart.find(item => item.id === product.id && item.variant === product.variant)
        if (existing) {
            const currentQty = Number(existing.qty);
            const maxStock = Number(existing.stock);

            if (currentQty + 1 > maxStock) {
                alert(`Sorry, only ${maxStock} available.`)
                return
            }
            setCart(cart.map(item => (item.id === product.id && item.variant === product.variant) ? { ...item, qty: currentQty + 1 } : item))
        } else {
            const stock = Number(product.stock);
            if (stock < 1) {
                alert('Out of stock')
                return
            }
            setCart([...cart, { ...product, qty: 1 }])
        }
        setShowVariants(false)
    }

    function removeFromCart(id: string, variant?: string) {
        setCart(cart.filter(item => !(item.id === id && item.variant === variant)))
    }

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All Items' || (selectedCategory === 'Kids' ? p.isKids === true : (() => {
            const activeCat = categories.find(c => c.name === selectedCategory);
            if (!activeCat) return p.category?.name === selectedCategory; // Fallback to exact name match

            // Find all children IDs for this category
            const childrenIds = categories.filter(c => c.parentId === activeCat.id).map(c => c.id);
            return p.categoryId === activeCat.id || childrenIds.includes(p.categoryId);
        })());

        const term = searchTerm.toLowerCase()
        const matchesSearch = !searchTerm || p.name.toLowerCase().includes(term) || (p.sku && p.sku.toLowerCase().includes(term))
        return matchesCategory && matchesSearch
    })

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const discountAmount = useMemo(() => {
        if (!appliedDiscount) return 0
        if (appliedDiscount.type === 'Percentage') return (subtotal * appliedDiscount.value) / 100
        return Math.min(appliedDiscount.value, subtotal)
    }, [subtotal, appliedDiscount])
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const tax = taxableAmount * 0.13
    const total = taxableAmount + tax

    // Discounts
    async function handleApplyDiscount() {
        setDiscountError('')
        if (!discountCode.trim()) return
        const { validateDiscountCode } = await import('@/app/actions/discounts')
        const result = await validateDiscountCode(discountCode, subtotal)
        if (result.success && result.discount) {
            setAppliedDiscount(result.discount)
            setDiscountCode('')
        } else {
            setDiscountError(result.error || 'Invalid code')
            setTimeout(() => setDiscountError(''), 3000)
        }
    }

    function removeDiscount() {
        setAppliedDiscount(null)
    }

    // Checkout Modal
    function handleCheckout() {
        if (cart.length === 0) return alert('Cart is empty')
        setTenderedAmount('')
        setPaymentTab('card')
        // Automatically try to connect active reader?
        if (!connectedReader) {
            setTerminalStatus('No Reader Connected')
        } else {
            setTerminalStatus('Connected')
        }
        setPaymentStatus('')
        setShowPaymentModal(true)
    }

    // Finalize
    async function processPayment(methodOverride?: string) {
        try {
            const orderId = `ORD-${Date.now().toString().slice(-6)}`
            const paymentMethod = methodOverride || (paymentTab === 'cash' ? 'Cash' : 'Card')
            const received = paymentTab === 'cash' ? parseFloat(tenderedAmount) : total
            const changeDue = received - total

            const { createOrder } = await import('@/app/actions/orders')
            const order = await createOrder({
                orderId,
                customer: selectedCustomerType,
                total,
                date: new Date().toISOString().split('T')[0],
                items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
                paymentMethod,
                amountPaid: received,
                change: changeDue,
                source: 'POS',
                status: 'Completed',
                discountCode: appliedDiscount?.code,
                discountAmount: discountAmount
            })

            if (appliedDiscount) {
                const { incrementDiscountUses } = await import('@/app/actions/discounts')
                await incrementDiscountUses(appliedDiscount.code)
            }

            setLastOrder({
                ...order,
                items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
                changeDue: paymentTab === 'cash' ? changeDue : 0,
                paymentMethod,
                amountReceived: received,
                payment: paymentMethod,
                discount: appliedDiscount,
                subtotal,
                tax
            })
            setCart([])
            setAppliedDiscount(null)
            setShowPaymentModal(false)
        } catch (error) {
            console.error('Checkout failed:', error)
            alert('Failed to process transaction. Please try again.')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[100dvh] bg-[#F8F9FB]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
    )

    if (!selectedStaff) {
        // ... (Same Login UI as before - abbreviated for brevity in thought, but full in file)
        return (
            <div className="min-h-[100dvh] bg-[#F8F9FB] flex flex-col items-center justify-center p-8 relative">
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
                        <form onSubmit={handleStaffLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enter PIN / Password</label>
                                <input autoFocus type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full text-center text-3xl font-black tracking-widest py-4 border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-colors" placeholder="••••" />
                                {loginError && <p className="text-red-500 text-xs font-bold mt-2 text-center">{loginError}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button key={num} type="button" onClick={() => setPin(prev => prev + num)} className="py-4 bg-gray-50 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors">{num}</button>
                                ))}
                                <button type="button" onClick={() => setPin('')} className="py-4 bg-red-50 rounded-xl font-bold text-sm text-red-500 hover:bg-red-100 transition-colors">CLR</button>
                                <button type="button" onClick={() => setPin(prev => prev + '0')} className="py-4 bg-gray-50 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors">0</button>
                                <button type="submit" className="py-4 bg-[#1E1E1E] text-white rounded-xl font-bold flex items-center justify-center">↵</button>
                            </div>
                            <button type="button" onClick={() => { setAttemptingUser(null); setPin(''); }} className="w-full py-4 text-gray-400 font-bold hover:text-black transition-colors">Cancel</button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
                        {staff.map((member) => (
                            <button key={member.id} onClick={() => setAttemptingUser(member)} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-1 transition-all group">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4AF37] transition-colors">
                                    <span className="text-xl font-black text-gray-400 group-hover:text-white transition-colors">{member.name[0]}</span>
                                </div>
                                <p className="font-bold text-lg text-gray-900">{member.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#D4AF37] transition-colors">{member.role}</p>
                            </button>
                        ))}
                        {staff.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="text-4xl mb-4">👥</span>
                                <p>No staff members found.</p>
                                <Link href="/dashboard/staff" className="mt-4 text-[#D4AF37] font-bold hover:underline">Add Staff & Hours &rarr;</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row h-[100dvh] gap-6 bg-[#F8F9FB] p-4 lg:p-8 overflow-y-auto lg:overflow-hidden font-sans print:hidden">
                {/* LEFT Side (Product Browser) */}
                <div className="flex-1 flex flex-col gap-6 lg:overflow-hidden min-h-[500px]">
                    {/* Header */}
                    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-black text-gray-900">Product Browser</h2>
                            <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Logged in as {selectedStaff.name}</p>
                        </div>
                        <form onSubmit={handleScan} className="flex-1 w-full max-w-md relative group">
                            <input ref={scanInputRef} autoFocus type="text" placeholder="Scan or search name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-6 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 outline-none transition-all text-sm font-bold" />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--gold)]">🔍</span>
                        </form>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedStaff(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors whitespace-nowrap">Switch User</button>
                            <div className="w-px h-4 bg-gray-200" />
                            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap">Exit</Link>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {['All Items', ...categories.filter(c => !c.parentId).map(c => c.name), 'Kids'].map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-gray-900 text-white shadow-xl shadow-black/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}>{cat}</button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="lg:flex-1 lg:overflow-y-auto lg:pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <button key={product.id} onClick={() => openVariantLookup(product)} className="bg-white p-4 rounded-2xl hover:shadow-2xl transition-all border border-gray-100 group flex flex-col items-center text-center relative">
                                    {product.stock <= 3 && (
                                        <span className="absolute top-4 right-4 flex h-2.5 w-2.5 z-10">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                    <div className="w-full aspect-[3/4] bg-gray-50 rounded-xl mb-4 overflow-hidden relative border border-gray-50">
                                        {product.images ? <img src={product.images.split(',')[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>}
                                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xl border border-gray-100">${product.price}</div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[var(--gold)] transition-colors">{product.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-auto">{product.category?.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT Side (Cart) */}
                <div className="w-full lg:w-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col lg:h-full lg:sticky lg:top-0 overflow-hidden shrink-0 pb-32 lg:pb-0">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Current Order</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Node</p>
                            </div>
                            <span className="bg-[var(--gold)]/10 text-[var(--gold)] px-3 py-1 rounded-full text-[10px] font-black tracking-widest">ID #{Date.now().toString().slice(-4)}</span>
                        </div>
                        {/* Selected Client Dropdown */}
                        <div className="relative">
                            <button onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)} className={`w-full bg-white border ${customerDropdownOpen ? 'border-[var(--gold)]' : 'border-gray-200'} rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--gold)] transition-all shadow-sm`}>
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-xl">👤</div>
                                <div className="flex-1 text-left">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Selected Client</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomerType}</p>
                                </div>
                                <span className="text-gray-400 text-xs text-xs">▼</span>
                            </button>
                            {customerDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-300">
                                    {customerTypes.map(type => (
                                        <button key={type} onClick={() => { setSelectedCustomerType(type); setCustomerDropdownOpen(false); }} className="w-full text-left px-6 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors border-b border-gray-50 last:border-0 uppercase tracking-widest">{type}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-white min-h-[300px]">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-6 py-12">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl">🛒</div>
                                <p className="font-bold text-sm uppercase tracking-widest opacity-50">Empty Boutique Basket</p>
                            </div>
                        ) : cart.map((item: any) => (
                            <div key={item.id} className="flex gap-5 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    {item.images ? <img src={item.images.split(',')[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                            <button onClick={() => removeFromCart(item.id, item.variant)} className="text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><X size={18} /></button>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">{item.size || 'OS'} • {item.color || 'Standard'}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="font-black text-lg text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                                        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                                            <button className="text-gray-400 hover:text-black font-black" onClick={() => setCart(cart.map(c => (c.id === item.id && c.variant === item.variant) ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}>-</button>
                                            <span className="text-xs font-black min-w-4 text-center">{item.qty}</span>
                                            <button className="text-gray-400 hover:text-black font-black" onClick={() => {
                                                const currentQty = Number(item.qty);
                                                const maxStock = Number(item.stock);
                                                if (currentQty + 1 > maxStock) {
                                                    alert(`Only ${maxStock} available`)
                                                    return
                                                }
                                                setCart(cart.map(c => (c.id === item.id && c.variant === item.variant) ? { ...c, qty: currentQty + 1 } : c))
                                            }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 mt-auto sticky bottom-0 lg:static z-10 glass-effect lg:glass-none">
                        {/* Discount Input */}
                        <div className="mb-4">
                            {appliedDiscount ? (
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-bold text-xs uppercase tracking-wider">🏷️ {appliedDiscount.code}</span>
                                        <span className="text-[10px] font-bold text-green-500">(-{appliedDiscount.type === 'Percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`})</span>
                                    </div>
                                    <button onClick={removeDiscount} className="text-gray-400 hover:text-red-500 font-bold p-1">×</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input type="text" placeholder="Promo Code" value={discountCode} onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }} className={`w-full p-3 bg-white border ${discountError ? 'border-red-300' : 'border-gray-200'} rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[var(--gold)]`} />
                                        {discountError && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-bold">{discountError}</span>}
                                    </div>
                                    <button onClick={handleApplyDiscount} disabled={!discountCode} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--gold)] disabled:opacity-50 disabled:hover:bg-gray-900 transition-colors">Apply</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-[11px] font-bold text-green-600 uppercase tracking-widest">
                                    <span>Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>HST (Windsor/Ontario 13%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 my-4 pt-4 flex justify-between text-3xl font-black text-gray-900">
                                <span className="font-display italic text-2xl font-normal">Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-5 gold-btn rounded-2xl text-[12px] shadow-xl disabled:opacity-50 disabled:filter-none transition-all">Finalize Transaction</button>
                        {cart.length > 0 && <button onClick={() => setCart([])} className="w-full mt-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-red-500 transition-colors">Discard Draft Order</button>}
                    </div>
                </div>

                {/* Variant Lookup Modal */}
                {showVariants && scannedProduct && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in border border-gray-100">
                            {/* ... Variant Content ... */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div><h3 className="text-xl font-black text-gray-900">Select Variation</h3><p className="text-sm text-gray-500">{scannedProduct.name}</p></div>
                                <button onClick={() => setShowVariants(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors">×</button>
                            </div>
                            <div className="p-6 max-h-[500px] overflow-y-auto">
                                <div className="grid grid-cols-1 gap-3">
                                    {variants.map((v: any) => (
                                        <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${v.stock > 0 ? 'bg-white border-gray-100 hover:border-[#D4AF37] hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">{v.size || 'OS'}</span>
                                                <div><p className="font-bold text-sm text-gray-900">{v.color || 'Standard'}</p><p className="text-[10px] text-gray-400 font-mono">{v.sku}</p></div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right"><p className="font-black text-gray-900">${v.price.toFixed(2)}</p><p className={`text-[10px] font-bold ${v.stock > 5 ? 'text-green-600' : 'text-orange-500'}`}>{v.stock} left</p></div>
                                                <button disabled={v.stock <= 0} onClick={() => addToCart({
                                                    id: v.id,
                                                    name: v.name,
                                                    price: v.price,
                                                    image: v.images?.split(',')[0],
                                                    quantity: 1,
                                                    sku: v.sku,
                                                    variant: v.color && v.size ? `${v.color} / ${v.size}` : v.color || v.size,
                                                    stock: v.stock
                                                })} className="px-4 py-2 bg-[#1E1E1E] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50">Add</button>
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
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
                                    <div className="flex justify-between text-gray-500 font-medium"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500 font-medium"><span>HST (13%)</span><span>${tax.toFixed(2)}</span></div>
                                    <div className="pt-4 border-t border-gray-200"><div className="flex justify-between items-baseline mb-1"><span className="text-sm font-bold text-gray-900">Total Due</span><span className="text-4xl font-black text-gray-900">${total.toFixed(2)}</span></div></div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 text-gray-400 font-bold hover:text-black hover:bg-white hover:shadow-sm rounded-xl transition-all">Cancel</button>
                            </div>

                            {/* Right: Payment Method */}
                            <div className="w-2/3 p-8">
                                <h3 className="text-xl font-black text-gray-900 mb-6">Select Payment Method</h3>
                                <div className="flex gap-4 mb-8">
                                    <button onClick={() => setPaymentTab('cash')} className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${paymentTab === 'cash' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>💵 Cash</button>
                                    <button onClick={() => setPaymentTab('card')} className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${paymentTab === 'card' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>💳 Card</button>
                                </div>

                                {paymentTab === 'cash' ? (
                                    <div className="space-y-6">
                                        <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount Tendered</label><input autoFocus type="number" value={tenderedAmount} onChange={(e) => setTenderedAmount(e.target.value)} placeholder="0.00" className="w-full text-5xl font-black text-gray-900 border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none py-2 placeholder-gray-200" /></div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[20, 50, 100].map(amount => (<button key={amount} onClick={() => setTenderedAmount(amount.toString())} className="py-2 bg-gray-50 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors">${amount}</button>))}
                                            <button onClick={() => setTenderedAmount(total.toFixed(2))} className="py-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-lg font-bold transition-colors">Exact</button>
                                        </div>
                                        <div className="bg-gray-50 p-5 rounded-xl flex justify-between items-center"><span className="font-bold text-gray-500">Change Due</span><span className={`text-2xl font-black ${parseFloat(tenderedAmount || '0') >= total ? 'text-green-600' : 'text-gray-300'}`}>${Math.max(0, parseFloat(tenderedAmount || '0') - total).toFixed(2)}</span></div>
                                        <button onClick={() => processPayment()} disabled={!tenderedAmount || parseFloat(tenderedAmount) < total} className="w-full py-4 bg-[#1E1E1E] text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none">Complete Cash Sale</button>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex flex-col pt-4">
                                        {/* READER MANAGEMENT UI */}
                                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${connectedReader ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connected Reader</p>
                                                    <p className="font-bold text-gray-900">{connectedReader ? connectedReader.label : 'None'}</p>
                                                </div>
                                            </div>
                                            {!connectedReader && (
                                                <button
                                                    onClick={discoverReaders}
                                                    disabled={isTerminalLoading}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-lg hover:border-black transition-colors flex items-center gap-2"
                                                >
                                                    {isTerminalLoading ? <RefreshCw className="animate-spin" size={12} /> : <Wifi size={12} />}
                                                    {isTerminalLoading ? 'Searching...' : 'Connect Reader'}
                                                </button>
                                            )}
                                            {connectedReader && (
                                                <button
                                                    onClick={async () => { await terminal.disconnectReader(); setConnectedReader(null); setTerminalStatus('Disconnected'); }}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <WifiOff size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Reader Discovery List */}
                                        {readers.length > 0 && !connectedReader && (
                                            <div className="flex-1 overflow-y-auto mb-4 border border-gray-100 rounded-xl p-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Discovered Readers</p>
                                                {readers.map((reader) => (
                                                    <button
                                                        key={reader.id}
                                                        onClick={() => connectToReader(reader)}
                                                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex justify-between items-center group transition-colors"
                                                    >
                                                        <span className="font-bold text-sm text-gray-700 group-hover:text-black">{reader.label}</span>
                                                        <span className="text-[10px] font-mono text-gray-400 uppercase">{reader.serial_number}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Status / Action Area */}
                                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-500 ${paymentStatus.includes('Successful') ? 'bg-green-500 text-white' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                                {paymentStatus.includes('Successful') ? '✓' : <CreditCard />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900">{terminalStatus}</h4>
                                                <p className="text-xs text-gray-400 font-bold mt-1 max-w-[200px] mx-auto min-h-[1.5em]">{paymentStatus || (connectedReader ? 'Ready for Payment' : 'Connect a reader to begin')}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <button
                                                onClick={handleCardPayment}
                                                disabled={!connectedReader || isTerminalLoading}
                                                className="w-full py-4 bg-[#D4AF37] text-white rounded-xl font-black text-lg hover:bg-[#B8962E] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                <span>⚡</span> {isTerminalLoading ? 'Processing...' : `Charge $${total.toFixed(2)}`}
                                            </button>
                                        </div>
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
