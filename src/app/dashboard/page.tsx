'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats } from '@/app/actions/finance'
import { getStaff } from '@/app/actions/staff'
import { getProducts } from '@/app/actions/inventory'
import { getOrders } from '@/app/actions/orders'
import { getSalesAnalytics } from '@/app/actions/analytics'
import Link from 'next/link'
import WeatherWidget from '@/components/WeatherWidget'
import SalesChart from '@/components/SalesChart'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [staff, setStaff] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [chartData, setChartData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        // Hydrate user
        const savedUser = localStorage.getItem('dashboard_user')
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser))
        }
        loadData()
    }, [])

    async function loadData() {
        setLoading(true);
        try {
            console.log('🚀 Starting dashboard data fetch...');

            // Fetch Stats
            try {
                console.time('📊 Stats Fetch');
                const statsData = await getDashboardStats();
                setStats(statsData || { totalRevenue: 0, totalSales: 0, avgOrderValue: 0, totalTraffic: 0 });
                console.timeEnd('📊 Stats Fetch');
            } catch (e) { console.error('Stats error:', e); }

            // Fetch Staff
            try {
                console.time('🤵 Staff Fetch');
                const staffData = await getStaff();
                setStaff(staffData || []);
                console.timeEnd('🤵 Staff Fetch');
            } catch (e) { console.error('Staff error:', e); }

            // Fetch Products
            try {
                console.time('🧥 Products Fetch');
                const productsData = await getProducts();
                setProducts(productsData || []);
                console.timeEnd('🧥 Products Fetch');
            } catch (e) { console.error('Products error:', e); }

            // Fetch Orders
            try {
                console.time('📜 Orders Fetch');
                const ordersData = await getOrders();
                setOrders(ordersData || []);
                console.timeEnd('📜 Orders Fetch');
            } catch (e) { console.error('Orders error:', e); }

            // Fetch Analytics
            try {
                console.time('📈 Analytics Fetch');
                const analyticsData = await getSalesAnalytics();
                setChartData(analyticsData || { labels: [], datasets: [] });
                console.timeEnd('📈 Analytics Fetch');
            } catch (e) { console.error('Analytics error:', e); }

            console.log('✅ Dashboard data fetch complete.');
        } catch (error) {
            console.error('❌ Dashboard Load Failed:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-[#D4AF37] font-bold animate-pulse text-xl">Loading Dashboard...</div>
            </div>
        )
    }

    const role = currentUser?.role || 'Cashier' // Default to safest role if unknown
    const isAdmin = role === 'Admin'
    const isManager = role === 'Manager'

    // Logic:
    // Admin: Sees ALL.
    // Manager: Sees everything EXCEPT Finance/Payroll/Staff (so no Revenue/Salary stats).
    // Cashier: Sees ONLY Catalog/Operations (so no revenue, no charts, just actions & stock).

    const showFinancials = isAdmin
    const showCharts = isAdmin
    const showManagementStats = isAdmin
    const showOrdersList = isAdmin || isManager
    const showTraffic = isAdmin || isManager

    const lowStockProducts = products.filter((p: any) => p.stock <= 5)
    const recentOrders = orders.slice(0, 5)

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Weather & Time Widget */}
            <WeatherWidget />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-display font-medium text-[var(--text-primary)] italic">
                        {isAdmin ? 'Executive Overview' : isManager ? 'Store Overview' : 'Associate Portal'}
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium mt-1">
                        {isAdmin ? 'Financial & Operational Control Center' : 'Operational performance for Mode AURA Windsor'}
                    </p>
                </div>
            </div>

            {/* Stats Grid - Role Restricted */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-tour="revenue-stats">
                {showFinancials ? (
                    <>
                        <StatCard
                            icon="✨"
                            title="Gross Revenue"
                            value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            change="+12%"
                            changeType="positive"
                        />
                        <StatCard
                            icon="👜"
                            title="Client Orders"
                            value={stats.totalSales.toString()}
                            change="+5"
                            changeType="positive"
                        />
                        <StatCard
                            icon="💎"
                            title="Average Basket"
                            value={`$${stats.avgOrderValue.toFixed(2)}`}
                            change="+3%"
                            changeType="positive"
                        />
                    </>
                ) : (
                    // Placeholder or reduced stats for non-admins
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 p-6 bg-[var(--mocha-bg)] rounded-3xl border border-[var(--mocha-border)] flex items-center gap-4">
                        <span className="text-4xl">👋</span>
                        <div>
                            <h3 className="font-bold text-[var(--text-primary)] text-lg">Welcome back, {currentUser?.name || 'Associate'}</h3>
                            <p className="text-[var(--text-secondary)]">Ready to deliver excellence today?</p>
                        </div>
                    </div>
                )}

                {showTraffic && (
                    <StatCard
                        icon="🤝"
                        title="Total Traffic"
                        value={stats.totalTraffic.toString()}
                        change="New"
                        changeType="neutral"
                    />
                )}
            </div>

            {/* Chart Section - Admin Only */}
            {showCharts && (
                <div className="card p-8 border-[var(--mocha-border)]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-display font-medium text-[var(--text-primary)]">Revenue Visualization</h3>
                            <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest mt-1">Daily trend across all payment channels</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[var(--gold)]"></div>
                                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Total Revenue</span>
                            </div>
                        </div>
                    </div>
                    <SalesChart data={chartData} />
                </div>
            )}

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions - Available to ALL (Layout handles routing protection) */}
                <div className="card p-6 border-[var(--mocha-border)]">
                    <h3 className="font-display font-medium text-[var(--text-primary)] mb-6 text-xl">Service Console</h3>
                    <div className="space-y-3">
                        <Link href="/cashier" target="_blank" className="flex items-center gap-4 p-4 bg-[var(--mocha-bg)] rounded-xl hover:bg-[var(--gold)]/5 hover:border-[var(--gold)]/40 border border-transparent transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">💳</span>
                            <div>
                                <p className="font-bold text-sm text-[var(--text-primary)]">POS Terminal</p>
                                <p className="text-xs text-[var(--text-secondary)]">Process new sales</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/inventory" className="flex items-center gap-4 p-4 bg-[var(--mocha-bg)] rounded-xl hover:bg-[var(--gold)]/5 hover:border-[var(--gold)]/40 border border-transparent transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">🏷️</span>
                            <div>
                                <p className="font-bold text-sm text-[var(--text-primary)]">Collection Registry</p>
                                <p className="text-xs text-[var(--text-secondary)]">Manage inventory</p>
                            </div>
                        </Link>
                        {/* Archives/Orders is usually Operations, so Cashier/Manager/Admin all have it */}
                        <Link href="/dashboard/orders" className="flex items-center gap-4 p-4 bg-[var(--mocha-bg)] rounded-xl hover:bg-[var(--gold)]/5 hover:border-[var(--gold)]/40 border border-transparent transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📜</span>
                            <div>
                                <p className="font-bold text-sm text-[var(--text-primary)]">Archives</p>
                                <p className="text-xs text-[var(--text-secondary)]">Review transactions</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Store Stats - Management Only */}
                {showManagementStats ? (
                    <div className="card p-6 border-[var(--mocha-border)]">
                        <h3 className="font-display font-medium text-[var(--text-primary)] mb-6 text-xl">Property Registry</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[var(--mocha-bg)] rounded-xl border border-[var(--mocha-border)]/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">🤵</span>
                                    <span className="font-medium text-[var(--text-secondary)]">Associates</span>
                                </div>
                                <span className="text-xl font-bold text-[var(--mocha-sidebar)]">{staff.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[var(--mocha-bg)] rounded-xl border border-[var(--mocha-border)]/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">🧥</span>
                                    <span className="font-medium text-[var(--text-secondary)]">Curated Items</span>
                                </div>
                                <span className="text-xl font-bold text-[var(--mocha-sidebar)]">{products.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-[var(--mocha-bg)] rounded-xl border border-[var(--mocha-border)]/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">📝</span>
                                    <span className="font-medium text-[var(--text-secondary)]">Life Records</span>
                                </div>
                                <span className="text-xl font-bold text-[var(--mocha-sidebar)]">{orders.length}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card p-6 border-[var(--mocha-border)] flex flex-col justify-center items-center text-center">
                        <span className="text-4xl mb-4">🛡️</span>
                        <h3 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-widest">Restricted Zone</h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-2">Management stats are hidden.</p>
                    </div>
                )}

                {/* Low Stock Alert - Everyone */}
                <div className="card p-6" data-tour="low-stock">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Low Stock Alert</h3>
                        {lowStockProducts.length > 0 && (
                            <span className="badge badge-red">{lowStockProducts.length} items</span>
                        )}
                    </div>
                    {lowStockProducts.length > 0 ? (
                        <div className="space-y-2">
                            {lowStockProducts.slice(0, 4).map((product: any) => (
                                <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                    <span className="text-sm font-medium truncate flex-1">{product.name}</span>
                                    <span className="text-red-600 font-bold text-sm ml-2">{product.stock} left</span>
                                </div>
                            ))}
                            {lowStockProducts.length > 4 && (
                                <Link href="/dashboard/inventory" className="text-sm text-[#D4AF37] font-bold hover:underline">
                                    View all {lowStockProducts.length} items →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <p className="text-3xl mb-2">✅</p>
                            <p className="text-sm">All products in stock!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders - Hidden for Cashier */}
            {showOrdersList && (
                <div className="card overflow-hidden border-[var(--mocha-border)]">
                    <div className="p-6 border-b border-[var(--mocha-border)] flex justify-between items-center bg-[var(--mocha-bg)]/30">
                        <h3 className="font-display font-medium text-[var(--text-primary)] text-xl">Recent Commissions</h3>
                        <Link href="/dashboard/orders" className="text-xs text-[var(--gold)] font-bold uppercase tracking-widest hover:brightness-110 transition-all">
                            View Records →
                        </Link>
                    </div>

                    {/* Desktop Table: Hidden on Mobile */}
                    <table className="w-full hidden lg:table">
                        <thead className="bg-white/[0.02]">
                            <tr className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                <th className="p-5 text-left">Order Reference</th>
                                <th className="p-5 text-left">Client</th>
                                <th className="p-5 text-left">Timestamp</th>
                                <th className="p-5 text-right">Value</th>
                                <th className="p-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{order.orderId}</code>
                                    </td>
                                    <td className="p-4 font-medium">{order.customer}</td>
                                    <td className="p-4 text-gray-500">{order.date}</td>
                                    <td className="p-4 text-right font-black text-[#D4AF37]">${order.total.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`badge ${order.status === 'Completed' ? 'badge-green' :
                                            order.status === 'Cancelled' ? 'badge-red' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Cards: Hidden on Desktop */}
                    <div className="lg:hidden divide-y divide-[#E8E2D9]/30">
                        {recentOrders.map((order: any) => (
                            <div key={order.id} className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[var(--text-primary)]">{order.orderId}</code>
                                        <p className="font-bold text-[var(--text-primary)]">{order.customer}</p>
                                    </div>
                                    <span className={`badge ${order.status === 'Completed' ? 'badge-green' :
                                        order.status === 'Cancelled' ? 'badge-red' :
                                            'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-[var(--text-secondary)]">{order.date}</p>
                                    <p className="font-black text-[var(--gold)] text-lg">${order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {recentOrders.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No orders yet. Open the cashier to start selling!
                        </div>
                    )}
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Executive Overview", ar: "نظرة عامة على الإدارة" }}
                steps={[
                    {
                        title: { en: "Executive KPIs", ar: "مؤشرات الأداء" },
                        description: {
                            en: "Monitor Gross Revenue, Client Orders, and Average Basket value in real-time to track atelier growth.",
                            ar: "راقب إجمالي الإيرادات وطلبات العملاء ومتوسط قيمة السلة في الوقت الفعلي لتتبع نمو الأتيليه."
                        },
                        icon: "📊"
                    },
                    {
                        title: { en: "Service Console", ar: "لوحة الخدمات" },
                        description: {
                            en: "Direct shortcuts to the POS Terminal, Inventory Registry, and Transaction Archives for rapid operations.",
                            ar: "اختصارات مباشرة لنقطة البيع (POS) وسجل المخزون وأرشيف المعاملات لعمليات سريعة."
                        },
                        icon: "🛠️"
                    },
                    {
                        title: { en: "Atelier Performance", ar: "أداء الأتيليه" },
                        description: {
                            en: "Visualize daily revenue trends across all payment channels with the high-contrast analytics chart.",
                            ar: "شاهد اتجاهات الإيرادات اليومية عبر جميع قنوات الدفع باستخدام مخطط التحليلات عالي التباين."
                        },
                        icon: "📈"
                    },
                    {
                        title: { en: "Inventory Watch", ar: "مراقبة المخزون" },
                        description: {
                            en: "Stay ahead of demand with automated alerts for items that are low in stock or sold out.",
                            ar: "ابق على اطلاع دائم بطلبات السوق من خلال تنبيهات تلقائية للعناصر منخفضة المخزون أو المباعة."
                        },
                        icon: "⚠️"
                    }
                ]}
            />
        </div>
    )
}

function StatCard({ icon, title, value, change, changeType }: {
    icon: string
    title: string
    value: string
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
}) {
    return (
        <div className="stat-card group relative p-6">
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="p-3 bg-[var(--mocha-bg)] rounded-xl text-2xl group-hover:scale-110 transition-all duration-300">
                    {icon}
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${changeType === 'positive' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    changeType === 'negative' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>
                    {change}
                </span>
            </div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1.5 relative z-10">{title}</p>
            <p className="text-3xl font-display font-medium text-[var(--text-primary)] relative z-10">{value}</p>
        </div>
    )
}
