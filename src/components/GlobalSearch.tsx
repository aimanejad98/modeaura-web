'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { globalSearch } from '@/app/actions/search'

export default function GlobalSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any>({ products: [], staff: [], orders: [], customers: [], pages: [], categories: [] })
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Dashboard pages for navigational search
    const adminPages = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Inventory/Products', href: '/dashboard/inventory', icon: '📦' },
        { name: 'Categories', href: '/dashboard/categories', icon: '🏷️' },
        { name: 'Filters', href: '/dashboard/filters', icon: '✨' },
        { name: 'POS Register', href: '/dashboard/pos', icon: '🛒' },
        { name: 'Orders', href: '/dashboard/orders', icon: '📋' },
        { name: 'Shipping', href: '/dashboard/shipping', icon: '🚚' },
        { name: 'Customers', href: '/dashboard/customers', icon: '👤' },
        { name: 'Receipts', href: '/dashboard/receipts', icon: '🧾' },
        { name: 'Finance Hub', href: '/dashboard/finance', icon: '💰' },
        { name: 'Payroll', href: '/dashboard/payroll', icon: '💵' },
        { name: 'Staff Management', href: '/dashboard/staff', icon: '👥' },
        { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
        { name: 'Branding & SEO', href: '/dashboard/branding', icon: '🎨' },
        { name: 'AI Studio', href: '/dashboard/ai-studio', icon: '🪄' },
        { name: 'Newsletter', href: '/dashboard/newsletter', icon: '📩' },
        { name: 'Banners', href: '/dashboard/website/banners', icon: '🖼️' },
        { name: 'Page Management', href: '/dashboard/website/pages', icon: '📄' },
    ]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                const data = await globalSearch(query)

                // Add navigational search
                const matchedPages = adminPages.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase())
                )

                setResults({ ...data, pages: matchedPages })
                setIsOpen(true)
                setLoading(false)
            } else {
                setResults({ products: [], staff: [], orders: [], customers: [], pages: [], categories: [] })
                setIsOpen(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    function handleSelect(type: string, idOrHref: string) {
        setQuery('')
        setIsOpen(false)
        if (type === 'page') router.push(idOrHref)
        else if (type === 'product') router.push(`/dashboard/inventory?highlight=${idOrHref}`)
        else if (type === 'staff') router.push(`/dashboard/staff`)
        else if (type === 'order') router.push(`/dashboard/orders`)
        else if (type === 'customer') router.push(`/dashboard/customers`)
        else if (type === 'category') router.push(`/dashboard/categories`)
    }

    const hasResults = results.products.length > 0 || results.staff.length > 0 ||
        results.orders.length > 0 || results.customers.length > 0 || results.categories?.length > 0

    return (
        <div ref={searchRef} className="relative w-80">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages, products, categories..."
                    className="w-full pr-4 py-3 bg-[#FDFBF7] rounded-xl border border-[var(--mocha-border)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 outline-none text-sm transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    style={{ paddingLeft: '5rem' }}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--gold)] transition-colors text-xl">
                    {loading ? '⏳' : '🔍'}
                </span>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-3 w-max min-w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(45,36,30,0.15)] border border-[var(--mocha-border)] overflow-hidden z-50 max-h-[450px] overflow-y-auto animate-fade-in shadow-xl">
                    {!hasResults && results.pages.length === 0 && query.length >= 2 && (
                        <div className="p-8 text-center text-[var(--text-secondary)] italic text-sm">
                            No matching items found for "{query}"
                        </div>
                    )}

                    {results.pages.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#F9F4EE] text-[10px] font-black text-[var(--gold)] uppercase tracking-widest border-b border-[var(--mocha-border)] flex items-center justify-between">
                                <span>🚀 Quick Navigation</span>
                                <span className="text-[8px] opacity-60">Admin Shortcut</span>
                            </div>
                            {results.pages.map((item: any) => (
                                <button
                                    key={item.href}
                                    onClick={() => handleSelect('page', item.href)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FDFBF7] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors group"
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">{item.name}</span>
                                    <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono uppercase">GO TO PAGE</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.products.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#FAF7F2] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--mocha-border)]">
                                📦 Collection
                            </div>
                            {results.products.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('product', item.id)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FAF7F2] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors group"
                                >
                                    <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">{item.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{item.sku}</span>
                                    <span className="ml-auto text-sm font-bold text-[var(--gold)]">${item.price.toFixed(2)}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.staff.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#FAF7F2] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--mocha-border)]">
                                👥 Staff Directory
                            </div>
                            {results.staff.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('staff', item.id)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FAF7F2] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors"
                                >
                                    <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                                    <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${item.role === 'Admin' ? 'bg-[#F3E8FF] text-[#6B21A8]' :
                                        item.role === 'Manager' ? 'bg-[#E0F2FE] text-[#075985]' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{item.role}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.orders.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#FAF7F2] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--mocha-border)]">
                                📋 Transaction History
                            </div>
                            {results.orders.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('order', item.id)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FAF7F2] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors group"
                                >
                                    <span className="font-bold text-[var(--gold)] group-hover:brightness-90">{item.orderId}</span>
                                    <span className="text-sm text-[var(--text-secondary)] font-medium">{item.customer}</span>
                                    <span className="ml-auto text-sm font-black text-[var(--text-primary)]">${item.total.toFixed(2)}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.categories?.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#FAF7F2] text-[10px] font-black text-[var(--gold)] uppercase tracking-widest border-b border-[var(--mocha-border)] flex items-center justify-between">
                                <span>🏷️ Catalog Categories</span>
                                <span className="text-[8px] opacity-60">Database Master</span>
                            </div>
                            {results.categories.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('category', item.id)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FAF7F2] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors group"
                                >
                                    <span className="text-xl">🏷️</span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">{item.name}</span>
                                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{item.parentId ? 'Sub-Category' : 'Main Collection'}</span>
                                    </div>
                                    <span className="ml-auto text-[10px] text-[var(--gold)] font-black opacity-0 group-hover:opacity-100 transition-opacity">GO TO EDIT</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.customers.length > 0 && (
                        <div>
                            <div className="px-5 py-2.5 bg-[#FAF7F2] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--mocha-border)]">
                                👤 Client Directory
                            </div>
                            {results.customers.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('customer', item.id)}
                                    className="w-full px-5 py-3.5 text-left hover:bg-[#FAF7F2] flex items-center gap-4 border-b border-[#F9F4EE]/50 transition-colors"
                                >
                                    <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-medium">{item.phone || item.email}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
