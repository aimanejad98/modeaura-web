'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getStaff } from '@/app/actions/staff'
import GlobalSearch from '@/components/GlobalSearch'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { getStoreSettings } from '@/app/actions/settings'
import { verifyAccess } from '@/app/actions/pos'
import DashboardTour from '@/components/DashboardTour'

// Elite Concierge Navigation
const navSections: Array<{
    title: string | null;
    items: Array<{
        name: string;
        href: string;
        icon: string;
        roles: string[];
        hidden?: boolean;
    }>;
}> = [
        {
            title: null,
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['Admin', 'Manager', 'Cashier'] },
            ]
        },
        {
            title: 'CATALOG',
            items: [
                { name: 'Products', href: '/dashboard/inventory', icon: '📦', roles: ['Admin', 'Manager'] },
                { name: 'Categories', href: '/dashboard/categories', icon: '🏷️', roles: ['Admin', 'Manager'] },
                { name: 'Filters', href: '/dashboard/filters', icon: '✨', roles: ['Admin', 'Manager'] },
                { name: 'Sales', href: '/dashboard/sales', icon: '🔥', roles: ['Admin', 'Manager'] },
            ]
        },
        {
            title: 'OPERATIONS',
            items: [
                { name: 'POS Register', href: '/dashboard/pos', icon: '🛒', roles: ['Admin', 'Manager', 'Cashier'] },
                { name: 'Orders', href: '/dashboard/orders', icon: '📋', roles: ['Admin', 'Manager'] },
                { name: 'Shipping', href: '/dashboard/shipping', icon: '🚚', roles: ['Admin', 'Manager'] },
                { name: 'Customers', href: '/dashboard/customers', icon: '👤', roles: ['Admin', 'Manager'] },
                { name: 'Receipts', href: '/dashboard/receipts', icon: '🧾', roles: ['Admin', 'Manager'] },
            ]
        },
        {
            title: 'MARKETING',
            items: [
                { name: 'AI Studio', href: '/dashboard/ai-studio', icon: '🪄', roles: ['Admin', 'Manager'] },
                { name: 'Newsletter', href: '/dashboard/newsletter', icon: '📩', roles: ['Admin', 'Manager'] },
                { name: 'Branding & SEO', href: '/dashboard/branding', icon: '🌐', roles: ['Admin', 'Manager'] },
                { name: 'Discounts', href: '/dashboard/discounts', icon: '🎟️', roles: ['Admin', 'Manager'] },
                { name: 'Testimonials', href: '/dashboard/testimonials', icon: '💬', roles: ['Admin', 'Manager'] },
            ]
        },
        {
            title: 'WEBSITE',
            items: [
                { name: 'Gallery', href: '/dashboard/gallery', icon: '🖼️', roles: ['Admin', 'Manager'] },
                { name: 'Seasonal Themes', href: '/dashboard/themes', icon: '🎨', roles: ['Admin', 'Manager'] },
                { name: 'Navigation', href: '/dashboard/website/navigation', icon: '🗺️', roles: ['Admin', 'Manager'] },
                { name: 'Banners', href: '/dashboard/website/banners', icon: '🖼️', roles: ['Admin', 'Manager'] },
                { name: 'Pages', href: '/dashboard/website/pages', icon: '📄', roles: ['Admin', 'Manager'] },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { name: 'Finance Hub', href: '/dashboard/finance', icon: '💰', roles: ['Admin'] },
                { name: 'Payroll', href: '/dashboard/payroll', icon: '💵', roles: ['Admin'] },
                { name: 'Barcodes', href: '/dashboard/barcodes', icon: '🏷️', roles: ['Admin'] },
                { name: 'Staff', href: '/dashboard/staff', icon: '👥', roles: ['Admin'] },
            ]
        },
        {
            title: null,
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', roles: ['Admin'], hidden: true },
            ]
        }
    ]

const allNavItems = navSections.flatMap(s => s.items)

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [settings, setSettings] = useState<any>(null)
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState<any>(null)
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    // Security: AFK Lock
    const [isLocked, setIsLocked] = useState(false)
    const [lastActivity, setLastActivity] = useState(Date.now())
    const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
    const [unlockPin, setUnlockPin] = useState('')
    const [unlockError, setUnlockError] = useState('')
    const [isUnlocking, setIsUnlocking] = useState(false)

    const hapticEase = 'var(--haptic-ease)'

    // Initial Load
    useEffect(() => {
        const savedUser = localStorage.getItem('dashboard_user')
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser))
            } catch (e) {
                console.error('Failed to parse saved user:', e)
            }
        }
        loadStaff()
    }, []) // Run once on mount

    // AFK Lock & Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
            setLastActivity(Date.now())
        }

        const trackActivity = () => setLastActivity(Date.now())
        window.addEventListener('mousemove', trackActivity)
        window.addEventListener('mousedown', trackActivity)
        window.addEventListener('keypress', trackActivity)
        window.addEventListener('touchstart', trackActivity)
        window.addEventListener('scroll', handleScroll)

        const idleCheck = setInterval(() => {
            if (currentUser && !isLocked && Date.now() - lastActivity > IDLE_TIMEOUT) {
                setIsLocked(true)
            }
        }, 30000)

        return () => {
            window.removeEventListener('mousemove', trackActivity)
            window.removeEventListener('mousedown', trackActivity)
            window.removeEventListener('keypress', trackActivity)
            window.removeEventListener('touchstart', trackActivity)
            window.removeEventListener('scroll', handleScroll)
            clearInterval(idleCheck)
        }
    }, [currentUser, isLocked, lastActivity]) // Activity tracking logic

    useEffect(() => {
        setIsSidebarOpen(false)
    }, [pathname])

    useEffect(() => {
        if (pathname) {
            navSections.forEach(section => {
                if (section.title && section.items.some(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))) {
                    setExpandedSections(prev => ({ ...prev, [section.title!]: true }))
                }
            })
        }
    }, [pathname])

    async function loadStaff() {
        try {
            const [staffData, settingsData] = await Promise.all([
                getStaff().catch(() => []),
                getStoreSettings().catch(() => null)
            ])
            setStaff(staffData || [])
            setSettings(settingsData)
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            setStaff([])
        } finally {
            setLoading(false)
        }
    }

    function handleLogout() {
        setCurrentUser(null)
        setIsLocked(false)
        localStorage.removeItem('dashboard_user')
        logout()
        window.location.href = '/atelier-portal-v7'
    }

    async function handleUnlock(e?: React.FormEvent) {
        if (e) e.preventDefault()
        if (!currentUser || !unlockPin) return

        setIsUnlocking(true)
        setUnlockError('')

        try {
            const result = await verifyAccess(currentUser.id, unlockPin)
            if (result.success) {
                setIsLocked(false)
                setUnlockPin('')
                setLastActivity(Date.now())
            } else {
                setUnlockError('Invalid PIN or Password')
                setUnlockPin('')
            }
        } catch (error) {
            setUnlockError('Verification failed. Please try again.')
        } finally {
            setIsUnlocking(false)
        }
    }

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1216] flex items-center justify-center p-8 phygital-light silk-overlay overflow-hidden">
                <div className="flex flex-col items-center animate-pulse">
                    <h1 className="editorial-display text-white italic mb-4">Mode Aura</h1>
                    <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                        <span className="text-[10px] font-black uppercase text-[var(--gold)] tracking-[0.5em]">
                            ATELIER OPENING
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-[#0F1216] flex items-center justify-center p-8 phygital-light silk-overlay overflow-hidden">
                <div className="max-w-2xl w-full space-y-16 animate-in fade-in zoom-in-95 duration-1000">
                    <div className="text-center space-y-4">
                        <h1 className="editorial-display text-white italic">Mode Aura</h1>
                        <div className="inline-block bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                            <span className="text-[10px] font-black uppercase text-[var(--gold)] tracking-[0.6em]">
                                CONCIERGE ATELIER
                            </span>
                        </div>
                    </div>

                    <div className="p-20 text-center max-w-xl mx-auto rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        {/* Elegant background texture */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                        <div className="text-7xl mb-12 opacity-80 group-hover:scale-110 transition-transform duration-1000">🔑</div>
                        <h2 className="editorial-display text-4xl text-white mb-6 italic">Reserved Area</h2>
                        <p className="editorial-meta text-white/40 mb-12 max-w-xs mx-auto leading-relaxed">
                            This gateway is designated for atelier management. Access is restricted to authorized personnel with private entry credentials.
                        </p>

                        <div className="space-y-6">
                            <Link href="/" target="_blank" className="inline-block editorial-meta text-[var(--gold)]/60 hover:text-[var(--gold)] transition-colors border-b border-[var(--gold)]/20 pb-1">
                                Return to Storefront
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const navItemsList = navSections.flatMap(s => s.items).filter(item => item.roles.includes(currentUser.role))
    const isAllowedRoute = navItemsList.some(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
    const showAccessDenied = !isAllowedRoute && pathname !== '/dashboard'
    const isPosPage = pathname === '/dashboard/pos'

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row font-sans page-transition overflow-hidden">
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {!isPosPage && (
                <aside className={`print:hidden fixed inset-y-0 left-0 ${isSidebarCollapsed ? 'w-16' : 'w-60'} bg-[#1B2936] text-white flex flex-col z-50 transition-all duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className={`p-6 ${isSidebarCollapsed ? 'px-1' : ''} shrink-0 text-center border-b border-white/[0.05]`}>
                        <Link href="/dashboard" className="flex flex-col items-center group">
                            {settings?.logo ? (
                                <img
                                    src={settings.logo}
                                    alt={settings?.storeName || 'Atelier'}
                                    className={`${isSidebarCollapsed ? 'h-8' : 'h-16'} w-auto object-contain transition-all duration-300 group-hover:opacity-90`}
                                />
                            ) : (
                                <img
                                    src="/logo_v3_flat.png"
                                    alt="Mode Aura"
                                    className={`${isSidebarCollapsed ? 'h-6' : 'h-12'} w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-all`}
                                />
                            )}
                            {!isSidebarCollapsed && (
                                <div className="bg-[var(--gold)]/10 px-3 py-1 rounded-full border border-[var(--gold)]/20 mt-3">
                                    <span className="text-[7px] font-black uppercase text-[var(--gold)] tracking-[0.4em]">
                                        ATELIER CONTROL
                                    </span>
                                </div>
                            )}
                        </Link>
                    </div>

                    <nav className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-1' : 'px-4'} py-6 space-y-3 custom-scrollbar`}>
                        {navSections.map((section, idx) => {
                            const sectionItems = section.items.filter(item => item.roles.includes(currentUser.role))
                            if (sectionItems.length === 0) return null
                            const isExpanded = !section.title || expandedSections[section.title]

                            return (
                                <div key={idx} className="space-y-1">
                                    {section.title && !isSidebarCollapsed && (
                                        <button onClick={() => toggleSection(section.title!)} className="w-full flex items-center justify-between px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors group">
                                            <span>{section.title}</span>
                                            <span className={`text-[8px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                        </button>
                                    )}
                                    <div className={`space-y-1 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded || isSidebarCollapsed ? 'max-h-[800px] opacity-100 py-1' : 'max-h-0 opacity-0 py-0'}`}>
                                        {sectionItems.filter(i => !i.hidden).map((item) => {
                                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    title={isSidebarCollapsed ? item.name : undefined}
                                                    className={`group flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} rounded-lg text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${isActive
                                                        ? 'bg-[var(--gold)] text-white shadow-lg shadow-[var(--gold)]/20'
                                                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                        }`}
                                                >
                                                    <span className={`text-lg transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                        {item.icon}
                                                    </span>
                                                    {!isSidebarCollapsed && item.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </nav>

                    <div className={`${isSidebarCollapsed ? 'p-1' : 'p-4'} border-t border-white/[0.05]`}>
                        <div className={`bg-white/5 rounded-2xl ${isSidebarCollapsed ? 'p-1 justify-center' : 'p-3'} flex items-center gap-2 group`}>
                            <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 group-hover:scale-105 transition-transform shrink-0 text-sm">
                                {currentUser.name[0]}
                            </div>
                            {!isSidebarCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest truncate">{currentUser.name}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] truncate">{currentUser.role}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {currentUser.role === 'Admin' && (
                                            <Link href="/dashboard/branding" title="Settings" className="p-2 text-white/20 hover:text-[var(--gold)] transition-colors">
                                                <span className="text-lg">⚙️</span>
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} title="Logout" className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                            <span className="text-lg">🚪</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </aside>
            )}

            <main className={`flex-1 flex flex-col min-w-0 bg-[#FAF9F6] relative transition-all duration-500 ${!isPosPage ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60') : ''}`}>
                {!isPosPage && (
                    <header className={`print:hidden sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-[#E8E2D9] px-4 lg:px-8 h-14 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-xl shadow-black/[0.03]' : ''}`}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    if (window.innerWidth < 1024) setIsSidebarOpen(true)
                                    else setIsSidebarCollapsed(!isSidebarCollapsed)
                                }}
                                className="p-2 rounded-lg bg-white border border-[#E8E2D9] shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Menu size={16} />
                            </button>
                            <div className="hidden sm:block">
                                <h2 className="text-base font-display italic text-[#1B2936] tracking-tight">
                                    {allNavItems.find(i => i.href === pathname)?.name || 'Atelier Overview'}
                                </h2>
                            </div>
                        </div>

                        <div className="hidden xl:block">
                            <GlobalSearch />
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/pos" className="gold-btn px-5 py-2 rounded-full text-[10px] gap-2 shadow-lg shadow-[var(--gold)]/10 animate-in fade-in slide-in-from-right-4 duration-1000">
                                POS REGISTER
                            </Link>
                            <div className="h-6 w-px bg-[#E8E2D9] hidden sm:block" />
                            <Link href="/" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">VIST STORE</Link>
                        </div>
                    </header>
                )}

                <div className={`${isPosPage ? 'p-0' : 'p-4 lg:p-6'} flex-1 overflow-y-auto custom-scrollbar`}>
                    {showAccessDenied ? (
                        <div className="p-20 text-center max-w-xl mx-auto rounded-[4rem] bg-white border border-[#E8E2D9] shadow-2xl mt-10 animate-in zoom-in-95 duration-700">
                            <div className="text-7xl mb-10">🔐</div>
                            <h2 className="editorial-display text-4xl text-[#1B2936] mb-4 italic">Reserved Area</h2>
                            <p className="editorial-meta text-[#1B2936]/40 mb-12 max-w-xs mx-auto">This section is restricted to management. Please use the POS terminal for transactions.</p>
                            <Link href="/dashboard/pos" className="gold-btn px-16 py-5 rounded-full">Return to POS</Link>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
                            {/* Dashboard Tour - Available on all pages */}
                            <DashboardTour userRole={currentUser?.role || 'Cashier'} />
                            {children}
                        </div>
                    )}
                </div>
            </main>

            {/* AFK Lock Overlay */}
            {isLocked && (
                <div className="fixed inset-0 z-[100] bg-[#0F1216] flex items-center justify-center p-8 phygital-light silk-overlay overflow-hidden animate-in fade-in duration-500">
                    <div className="max-w-md w-full space-y-12 text-center animate-in zoom-in-95 duration-700">
                        <div className="space-y-4">
                            <h1 className="editorial-display text-white italic text-5xl">Mode Aura</h1>
                            <div className="inline-block bg-[var(--gold)]/10 px-6 py-2 rounded-full border border-[var(--gold)]/20">
                                <span className="text-[9px] font-black uppercase text-[var(--gold)] tracking-[0.5em]">
                                    SESSION LOCKED
                                </span>
                            </div>
                        </div>

                        <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative">
                            <div className="mb-8">
                                <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 mx-auto text-2xl font-black mb-4">
                                    {currentUser.name[0]}
                                </div>
                                <h3 className="editorial-display text-2xl text-white italic">{currentUser.name}</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Security Verification Required</p>
                            </div>

                            <form onSubmit={handleUnlock} className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="password"
                                        placeholder="Enter PIN or Password"
                                        value={unlockPin}
                                        onChange={(e) => setUnlockPin(e.target.value)}
                                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-5 text-center text-white font-black tracking-[0.5em] focus:border-[var(--gold)] focus:bg-white/[0.08] transition-all outline-none"
                                        autoFocus
                                    />
                                    {unlockError && (
                                        <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-3 animate-bounce">
                                            {unlockError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUnlocking || !unlockPin}
                                    className="w-full gold-btn py-5 rounded-2xl font-black tracking-[0.2em] shadow-2xl shadow-[var(--gold)]/20 disabled:opacity-50"
                                >
                                    {isUnlocking ? 'AUTHENTICATING...' : 'RESUME SESSION'}
                                </button>
                            </form>

                            <button
                                onClick={handleLogout}
                                className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-400 transition-colors"
                            >
                                Switch Account / Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
