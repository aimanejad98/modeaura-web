'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { getInventory, getStaffList, verifyAccess, getProductBySku, getProductVariants } from '@/app/actions/pos'
import { getCategories } from '@/app/actions/categories'
import { createOrder } from '@/app/actions/orders'
import { getCustomers, addCustomer, updateCustomer } from '@/app/actions/customers'
import { X, RefreshCw, Wifi, WifiOff, CreditCard, UserPlus, Search, User, ChevronRight, Boxes, Scan, Package, ChevronLeft } from 'lucide-react'
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
    const [finalizing, setFinalizing] = useState(false)
    const scanInputRef = useRef<HTMLInputElement>(null)

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentTab, setPaymentTab] = useState<'cash' | 'card'>('cash')
    const [tenderedAmount, setTenderedAmount] = useState('')
    const [lastOrder, setLastOrder] = useState<any>(null)

    // Login State
    const [lastActivity, setLastActivity] = useState<number>(0)
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

    // Customer Management State
    const [allCustomers, setAllCustomers] = useState<any[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [customerForm, setCustomerForm] = useState({
        name: '', email: '', phone: '', address: '', city: '', province: '', postalCode: ''
    })
    const [customerSearch, setCustomerSearch] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [mounted, setMounted] = useState(false)
    const [taxRate, setTaxRate] = useState(0.13) // Default to 13%
    // Email Receipt State
    const [receiptEmail, setReceiptEmail] = useState('')
    const [emailSending, setEmailSending] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [storeSettings, setStoreSettings] = useState<any>(null)

    useEffect(() => {
        // Fetch settings on mount
        import('@/app/actions/settings').then(mod => {
            mod.getStoreSettings().then(setStoreSettings)
        })
    }, [])

    const generateId = () => `ID #${Date.now().toString().slice(-4)}`

    // Initial Load: Run exactly once
    useEffect(() => {
        setMounted(true)
        setLastActivity(Date.now())
        loadData()
        initializeTerminal()
        setTransactionId(generateId())
    }, [])

    // AFK Lock: Track activity separately
    useEffect(() => {
        const trackActivity = () => setLastActivity(Date.now())
        window.addEventListener('mousemove', trackActivity)
        window.addEventListener('mousedown', trackActivity)
        window.addEventListener('keypress', trackActivity)
        window.addEventListener('touchstart', trackActivity)

        // Periodic check for idle timeout
        const idleCheck = setInterval(() => {
            if (selectedStaff && Date.now() - lastActivity > IDLE_TIMEOUT) {
                // Return to login screen
                setSelectedStaff(null)
                setAttemptingUser(null)
                setTenderedAmount('')
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
    }, [selectedStaff, lastActivity, IDLE_TIMEOUT])

    async function loadData() {
        setLoading(true)
        try {
            // Dynamically import settings action
            const { getStoreSettings } = await import('@/app/actions/settings')

            const [staffData, productData, categoriesData, customerData, settingsData] = await Promise.all([
                getStaffList(),
                getInventory(),
                getCategories(),
                getCustomers(),
                getStoreSettings()
            ])
            setStaff(staffData)
            setProducts(productData)
            setCategories(categoriesData)
            setAllCustomers(customerData)

            if (settingsData && settingsData.taxRate) {
                setTaxRate(settingsData.taxRate / 100)
            }
        } catch (e) {
            console.error("Load failed", e);
        }
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
    const tax = taxableAmount * taxRate
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

    // Finalize Handle
    function handleFinalizeTransaction() {
        if (cart.length === 0) return
        handleCheckout()
    }

    function clearCart() {
        if (confirm('Discard this draft?')) {
            setCart([])
            setAppliedDiscount(null)
            setTransactionId(`#${Math.floor(1000 + Math.random() * 9000)}`)
        }
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
                customer: selectedCustomer?.name || selectedCustomerType,
                customerId: selectedCustomer?.id,
                total,
                date: new Date().toISOString().split('T')[0],
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    sku: item.sku,
                    variant: item.variant,
                    size: item.size,
                    color: item.color,
                    image: item.image
                })),
                paymentMethod,
                amountPaid: received,
                change: changeDue,
                source: 'POS',
                status: 'Completed',
                address: selectedCustomer?.address,
                city: selectedCustomer?.city,
                postalCode: selectedCustomer?.postalCode,
                discountCode: appliedDiscount?.code,
                discountAmount: discountAmount
            })

            if (appliedDiscount) {
                const { incrementDiscountUses } = await import('@/app/actions/discounts')
                await incrementDiscountUses(appliedDiscount.code)
            }

            setLastOrder({
                ...order,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    sku: item.sku,
                    variant: item.variant,
                    size: item.size,
                    color: item.color,
                    image: item.image
                })),
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
            setAppliedDiscount(null)
            setShowPaymentModal(false)
            setTransactionId(generateId())
            // Pre-fill email if customer is selected
            if (selectedCustomer && selectedCustomer.email) {
                setReceiptEmail(selectedCustomer.email)
            } else {
                setReceiptEmail('')
            }
            setEmailSent(false)
            setEmailSending(false)
        } catch (error) {
            console.error('Checkout failed:', error)
            alert('Failed to process transaction. Please try again.')
        }
    }

    async function handleEmailReceipt() {
        if (!receiptEmail || !lastOrder) return
        setEmailSending(true)
        try {
            const { emailReceipt } = await import('@/app/actions/orders')
            const result = await emailReceipt(receiptEmail, lastOrder)
            if (result.success) {
                setEmailSent(true)
            } else {
                alert(`Failed to send email: ${JSON.stringify(result.error)}`)
            }
        } catch (e) {
            console.error(e)
            alert('Error sending email: ' + (e as any).message)
        }
        setEmailSending(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[100dvh] bg-[#F8F9FB]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
    )

    if (!mounted) return null // Prevent hydration mismatches

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
            <div className="flex flex-col md:flex-row h-[100dvh] gap-1 lg:gap-1.5 bg-[#F8F9FB] p-1 lg:p-1.5 overflow-hidden font-sans print:hidden">
                {/* LEFT Side (Product Browser) */}
                <div className="h-[55dvh] md:h-full flex-1 flex flex-col gap-1.5 lg:overflow-hidden min-h-0">
                    {/* Header */}
                    <div className="bg-white p-2 lg:p-3 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                            <h2 className="text-base lg:text-lg font-black text-gray-900 leading-tight">Product Browser</h2>
                            <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Operator: {selectedStaff.name}</p>
                        </div>
                        <form onSubmit={handleScan} className="flex-1 w-full max-w-sm relative group">
                            <input ref={scanInputRef} autoFocus type="text" placeholder="Scan or search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-5 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/5 outline-none transition-all text-xs font-bold" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-[var(--gold)]">🔍</span>
                        </form>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedStaff(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors whitespace-nowrap">Switch Staff</button>
                            <div className="w-px h-3 bg-gray-200" />
                            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap">Admin Exit</Link>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['All Items', ...categories.filter(c => !c.parentId).map(c => c.name), 'Kids'].map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-gray-900 text-white shadow-lg shadow-black/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}>{cat}</button>
                        ))}
                    </div>

                    {/* Grid */}
                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto lg:pr-1">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 lg:gap-2.5">
                            {filteredProducts.map((product) => (
                                <button key={product.id} onClick={() => openVariantLookup(product)} className="bg-white p-1.5 rounded-lg hover:shadow-xl transition-all border border-gray-100 group flex flex-col items-center text-center relative">
                                    {product.stock <= 3 && (
                                        <span className="absolute top-1 right-1 flex h-1.5 w-1.5 z-10">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                        </span>
                                    )}
                                    <div className="w-full aspect-[1/1.1] bg-gray-50 rounded mb-1.5 overflow-hidden relative border border-gray-50">
                                        {product.images ? <img src={product.images.split(',')[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">🛍️</div>}
                                        <div className="absolute bottom-1 right-1 bg-white/95 backdrop-blur text-[10px] font-black px-1.5 py-0.5 rounded shadow border border-gray-50 text-[#1E1E1E] tracking-tighter">${product.price}</div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-[10px] line-clamp-1 mb-0.5 group-hover:text-[var(--gold)] transition-colors leading-tight">{product.name}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-auto opacity-70">{product.category?.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT Side (Cart) */}
                <div className="w-full md:w-[220px] lg:w-[260px] xl:w-[280px] 2xl:w-[320px] bg-white rounded-lg shadow-xl border border-gray-50 flex flex-col h-[45dvh] md:h-full overflow-hidden shrink-0 relative transition-all duration-500">
                    <div className="p-2 lg:p-2.5 border-b border-gray-50 bg-gray-50/20">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 leading-none">Order Basket</h3>
                                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Stream ID</p>
                            </div>
                            <span className="bg-[var(--gold)]/10 text-[var(--gold)] px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest">{transactionId}</span>
                        </div>
                        {/* Selected Client Dropdown */}
                        <div className="relative">
                            <div className="flex gap-1">
                                <button onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)} className={`flex-1 bg-white border ${customerDropdownOpen ? 'border-[var(--gold)]' : 'border-gray-50'} rounded-lg p-1.5 flex items-center gap-1.5 cursor-pointer hover:border-[var(--gold)] transition-all shadow-sm`}>
                                    <User size={10} className="text-gray-400" />
                                    <div className="text-left min-w-0">
                                        <p className="text-[7px] font-black text-gray-900 truncate tracking-tight uppercase">
                                            {selectedCustomer?.name || selectedCustomerType}
                                        </p>
                                    </div>
                                    <ChevronRight size={10} className={`ml-auto text-gray-300 transition-transform ${customerDropdownOpen ? 'rotate-90' : ''}`} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedCustomer) {
                                            setCustomerForm({
                                                name: selectedCustomer.name || '',
                                                email: selectedCustomer.email || '',
                                                phone: selectedCustomer.phone || '',
                                                address: selectedCustomer.address || '',
                                                city: selectedCustomer.city || '',
                                                province: selectedCustomer.province || '',
                                                postalCode: selectedCustomer.postalCode || ''
                                            })
                                        } else {
                                            setCustomerForm({ name: '', email: '', phone: '', address: '', city: '', province: '', postalCode: '' })
                                        }
                                        setShowCustomerModal(true)
                                    }}
                                    className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-all flex items-center justify-center shrink-0"
                                    title="Add/Edit Customer"
                                >
                                    <UserPlus size={14} />
                                </button>
                            </div>

                            {customerDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-300">
                                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search customers..."
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold outline-none focus:border-[var(--gold)]"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto">
                                        {customerTypes.map(type => (
                                            <button key={type} onClick={() => { setSelectedCustomerType(type); setSelectedCustomer(null); setCustomerDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-[10px] font-bold text-gray-500 hover:bg-gray-50 hover:text-black transition-colors border-b border-gray-50 last:border-0 uppercase tracking-widest">{type}</button>
                                        ))}
                                        {allCustomers.filter(c =>
                                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                            c.phone?.includes(customerSearch) ||
                                            c.email?.toLowerCase().includes(customerSearch.toLowerCase())
                                        ).map(customer => (
                                            <button
                                                key={customer.id}
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setSelectedCustomerType('Registered Client');
                                                    setCustomerDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <p className="text-[11px] font-black text-gray-900">{customer.name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold">{customer.phone || customer.email || 'No contact info'}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-2 bg-white custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-2xl">🛒</div>
                                <p className="font-bold text-[9px] uppercase tracking-widest opacity-50 text-center">Empty Basket</p>
                            </div>
                        ) : cart.map((item: any) => (
                            <div key={item.id} className="flex gap-2 p-2 rounded-lg border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                                <div className="w-10 h-10 bg-gray-50 rounded flex-shrink-0 border border-gray-50 overflow-hidden">
                                    {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[12px]">👕</div>}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0 min-w-0">
                                    <div>
                                        <div className="flex justify-between items-start gap-1">
                                            <p className="font-bold text-gray-900 text-[10px] line-clamp-1 leading-tight">{item.name}</p>
                                            <button onClick={() => removeFromCart(item.id, item.variant)} className="text-gray-300 hover:text-red-500 transition-all shrink-0"><X size={14} /></button>
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-400 tracking-tight uppercase truncate">{item.size || 'OS'} • {item.color || 'ST'}</p>
                                    </div>
                                    <div className="flex justify-between items-end gap-1.5">
                                        <p className="font-black text-xs text-gray-900 leading-none">${(item.price * item.qty).toFixed(2)}</p>
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm shrink-0">
                                            <button className="text-gray-400 hover:text-black font-black text-[10px]" onClick={() => setCart(cart.map(c => (c.id === item.id && c.variant === item.variant) ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}>-</button>
                                            <span className="text-[10px] font-black min-w-4 text-center">{item.qty}</span>
                                            <button className="text-gray-400 hover:text-black font-black text-[10px]" onClick={() => {
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

                    <div className="p-3 lg:p-4 bg-gray-50/50 border-t border-gray-100 z-10 glass-effect">
                        {/* Discount Input */}
                        <div className="mb-3">
                            {appliedDiscount ? (
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider">🏷️ {appliedDiscount.code}</span>
                                        <span className="text-[9px] font-bold text-green-500">(-{appliedDiscount.type === 'Percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`})</span>
                                    </div>
                                    <button onClick={removeDiscount} className="text-gray-400 hover:text-red-500 font-bold p-1 text-xs">×</button>
                                </div>
                            ) : (
                                <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                        <input type="text" placeholder="Promo / Gift Card" value={discountCode} onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }} className={`w-full p-2 bg-white border ${discountError ? 'border-red-300' : 'border-gray-100'} rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--gold)]`} />
                                        {discountError && <span className="absolute right-1 text-[7px] text-red-500 font-bold">{discountError}</span>}
                                    </div>
                                    <button onClick={handleApplyDiscount} disabled={!discountCode} className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[var(--gold)] disabled:opacity-50 transition-colors">Apply</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5 mb-3">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex justify-between text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                    <span>Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 my-1 pt-2 flex justify-between text-base font-black text-gray-900">
                                <span className="font-display italic text-sm font-normal">Total Due</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button disabled={cart.length === 0 || finalizing} onClick={handleFinalizeTransaction} className="w-full py-3 gold-btn rounded-lg text-[10px] shadow-lg disabled:opacity-50 disabled:filter-none transition-all uppercase font-black tracking-widest leading-none">
                            {finalizing ? '...' : 'Finalize Sale'}
                        </button>
                        <button onClick={clearCart} className="w-full mt-1.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-red-500 transition-colors">Discard</button>
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

                                {/* Email Receipt Section */}
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter email for receipt..."
                                        value={receiptEmail}
                                        onChange={(e) => setReceiptEmail(e.target.value)}
                                        disabled={emailSent || emailSending}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#D4AF37]"
                                    />
                                    <button
                                        onClick={handleEmailReceipt}
                                        disabled={!receiptEmail || emailSent || emailSending}
                                        className={`px-4 py-3 rounded-xl font-bold text-white transition-all ${emailSent ? 'bg-green-500' : 'bg-[#1E1E1E] hover:bg-black'}`}
                                    >
                                        {emailSending ? '...' : emailSent ? '✓' : '✉️'}
                                    </button>
                                </div>

                                <button onClick={() => setLastOrder(null)} className="w-full py-4 bg-[#1E1E1E] text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200">
                                    New Sale
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer Modal */}
                {showCustomerModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{selectedCustomer ? 'Edit Profile' : 'New Customer'}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Customer CRM Integration</p>
                                </div>
                                <button onClick={() => setShowCustomerModal(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors text-2xl font-bold">×</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={customerForm.name}
                                            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                            placeholder="Jane Doe"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--gold)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={customerForm.email}
                                            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                            placeholder="jane@example.com"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--gold)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={customerForm.phone}
                                            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--gold)]"
                                        />
                                    </div>
                                    <div className="col-span-2 border-t border-gray-50 pt-5 mt-2">
                                        <p className="text-[11px] font-black text-[var(--gold)] uppercase tracking-widest mb-5 italic">Mailing Address (Optional)</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={customerForm.address}
                                                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                                    placeholder="123 Atelier Way"
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--gold)]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City</label>
                                                    <input
                                                        type="text"
                                                        value={customerForm.city}
                                                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                                                        placeholder="Windsor"
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--gold)]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Province</label>
                                                    <input
                                                        type="text"
                                                        value={customerForm.province}
                                                        onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value })}
                                                        placeholder="ON"
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--gold)]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Postal</label>
                                                    <input
                                                        type="text"
                                                        value={customerForm.postalCode}
                                                        onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                                                        placeholder="N8X 1A1"
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[var(--gold)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    onClick={async () => {
                                        if (!customerForm.name) return alert('Name is required');
                                        setLoading(true);
                                        try {
                                            let saved;
                                            if (selectedCustomer) {
                                                saved = await updateCustomer(selectedCustomer.id, customerForm as any);
                                            } else {
                                                saved = await addCustomer(customerForm as any);
                                            }
                                            setSelectedCustomer(saved);
                                            setSelectedCustomerType('Registered Client');
                                            setShowCustomerModal(false);
                                            const updated = await getCustomers();
                                            setAllCustomers(updated);
                                        } catch (e) {
                                            alert('Failed to save customer. Email might already exist.');
                                        }
                                        setLoading(false);
                                    }}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[var(--gold)] hover:scale-[1.02] transition-all shadow-xl"
                                >
                                    {selectedCustomer ? 'Sync Profile' : 'Register Customer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* PRINT ONLY RECEIPT LAYOUT */}
            {lastOrder && (
                <div className="hidden print:block print:w-[80mm] print:p-2 bg-white text-black font-mono text-[10px] leading-tight print:pb-20">
                    <div className="text-center mb-2">
                        <h1 className="text-xl font-black tracking-tighter mb-1">{storeSettings?.storeName || 'MODE AURA'}</h1>
                        <p className="font-bold">{storeSettings?.tagline || 'Fashion and Accessories'}</p>
                        <p>{storeSettings?.address || '2670 Kevin St'}</p>
                        {storeSettings?.city && <p>{storeSettings.city}, {storeSettings.province} {storeSettings.postalCode}</p>}
                        {storeSettings?.phone && <p>Tel: {storeSettings.phone}</p>}
                        <p>{storeSettings?.taxId ? `GST/HST Reg. No. ${storeSettings.taxId}` : ''}</p>
                        <p className="mt-1">Visit Us At {storeSettings?.website || 'www.modeaura.ca'}</p>
                    </div>

                    <div className="flex justify-between mb-1">
                        <span>Store: 001</span>
                        <span>Register: 1</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Date: {new Date().toLocaleDateString()}</span>
                        <span>Time: {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Trans: {lastOrder.orderId.replace('MA-', '')}</span>
                        <span>Cashier: Admin</span>
                    </div>

                    <div className="mb-2 border-b border-black border-dashed"></div>

                    <div className="grid grid-cols-12 font-bold mb-1">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Amnt</div>
                    </div>

                    <div className="mb-2 border-b border-black border-dashed"></div>

                    <div className="space-y-2 mb-2">
                        {lastOrder.items.map((item: any, i: number) => {
                            const itemPrice = Number(item.price) || 0;
                            const itemQty = Number(item.qty) || 1;
                            return (
                                <div key={i}>
                                    <div className="font-bold">{item.sku || 'ITEM-' + i}</div>
                                    <div className="grid grid-cols-12">
                                        <div className="col-span-6 pr-1">
                                            <div className="truncate">{item.name}</div>
                                            <div className="text-[8px] font-normal text-gray-500">
                                                {item.variant ? item.variant : [item.size, item.color].filter(Boolean).join(' / ')}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center">{itemQty}</div>
                                        <div className="col-span-2 text-right">{itemPrice.toFixed(2)}</div>
                                        <div className="col-span-2 text-right">{(itemPrice * itemQty).toFixed(2)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-2 border-b border-black border-dashed"></div>

                    <div className="space-y-1 text-right max-w-[80%] ml-auto">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{lastOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>GST (5%)</span>
                            <span>{(lastOrder.subtotal * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>HST (8%)</span>
                            <span>{(lastOrder.subtotal * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-black text-sm mt-1">
                            <span>Total</span>
                            <span>{lastOrder.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-4 mb-2 border-b border-black border-dashed"></div>

                    <div className="space-y-1 text-right max-w-[80%] ml-auto">
                        <div className="flex justify-between">
                            <span>{lastOrder.payment || 'Payment'}</span>
                            <span>{lastOrder.amountReceived?.toFixed(2) || lastOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Change</span>
                            <span>{lastOrder.changeDue.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center space-y-2">
                        <p>***********************************</p>
                        <p className="font-bold">{storeSettings?.receiptNote || 'Thank you for shopping with us!'}</p>
                        <p>NO REFUNDS OR EXCHANGES</p>
                        <p>ON FINAL SALE ITEMS</p>
                        <p>***********************************</p>

                        <div className="mt-4 pt-2">
                            {/* Simulated Barcode */}
                            <div className="h-12 bg-black w-3/4 mx-auto mask-barcode flex items-end justify-center text-white text-[8px] pb-1 tracking-[4px]">
                                ||| || ||| || |||
                            </div>
                            <p className="text-[8px] mt-1">{lastOrder.orderId}</p>
                        </div>
                        <div className="pt-2 text-[8px] uppercase tracking-widest">
                            Mode Aura &bull; Customer Copy
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
