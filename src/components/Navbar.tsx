'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, ChevronDown, Menu, X, Instagram, Facebook, Twitter, Phone, Mail, Heart, User, Globe, LogOut, Moon, PartyPopper } from 'lucide-react';
import { getMainCategories } from '@/app/actions/categories';
import { getNavItems } from '@/app/actions/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { useWishlist } from '@/context/WishlistContext';
import { getStoreSettings } from '@/app/actions/settings';
import { useTheme } from '@/components/ThemeProvider';
import SearchOverlay from '@/components/SearchOverlay';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [navItems, setNavItems] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const { currency, setCurrency } = useCurrency();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const [user, setUser] = useState<any>(null);
    const [currentAnnIndex, setCurrentAnnIndex] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [parsedAnnouncements, setParsedAnnouncements] = useState<string[]>([]);

    const { theme } = useTheme();

    const currencies: ('CAD' | 'USD' | 'SAR' | 'AED' | 'GBP' | 'EUR')[] = ['CAD', 'USD', 'SAR', 'AED', 'GBP', 'EUR'];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (parsedAnnouncements.length > 1) {
            const interval = setInterval(() => {
                setCurrentAnnIndex(prev => (prev + 1) % parsedAnnouncements.length);
            }, 5000); // Cycle every 5 seconds
            return () => clearInterval(interval);
        }
    }, [parsedAnnouncements]);

    async function loadData() {
        const [cats, navs, currentUser, storeSettings] = await Promise.all([
            getMainCategories(),
            getNavItems(),
            getCurrentUser(),
            getStoreSettings()
        ]);
        setCategories(cats);
        setNavItems(navs);
        setUser(currentUser);
        setSettings(storeSettings);

        // Combine announcements
        let allAnnouncements: string[] = [];
        if (theme?.announcement) {
            allAnnouncements.push(theme.announcement);
        }

        if (storeSettings?.announcement) {
            try {
                const parsed = JSON.parse(storeSettings.announcement);
                if (Array.isArray(parsed)) {
                    allAnnouncements = [...allAnnouncements, ...parsed];
                } else {
                    allAnnouncements.push(storeSettings.announcement);
                }
            } catch (e) {
                allAnnouncements.push(storeSettings.announcement);
            }
        }

        if (allAnnouncements.length === 0) {
            allAnnouncements.push('Complimentary Shipping on Orders Above $250');
        }

        setParsedAnnouncements(allAnnouncements);
    }

    // Do not show on dashboard or cashier
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/cashier')) {
        return null;
    }

    // Unified design properties
    const navTextColor = 'text-[var(--text-primary)]';
    const navBorderColor = scrolled ? 'border-[var(--mocha-border)]' : 'border-transparent';
    const bgColor = scrolled ? 'bg-white/95' : 'bg-[var(--mocha-bg)]';

    // Seasonal Accents
    const seasonalColor = theme?.primaryColor || 'var(--gold)';

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* Layer 1: Global Utility Bar */}
                {!scrolled && (
                    <div
                        className="text-white/80 py-2.5 border-b border-white/5 transition-colors duration-500"
                        style={{ backgroundColor: theme?.secondaryColor || 'var(--brand-navy)' }}
                    >
                        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em]">
                            {/* Left: Socials */}
                            <div className="hidden md:flex items-center gap-4">
                                <a href="https://www.instagram.com/modeaura1/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram size={13} strokeWidth={1.5} /></a>
                                <a href="https://www.facebook.com/profile.php?id=61561081692244" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook size={13} strokeWidth={1.5} /></a>
                            </div>

                            {/* Center: Rotating Announcement (Desktop) / Marquee (Mobile) */}
                            <div className="flex-1 text-center relative h-5 overflow-hidden group">
                                {/* Desktop: Rotating (Hidden on small) */}
                                <div className="hidden lg:block h-full">
                                    {parsedAnnouncements.length > 0 ? (
                                        parsedAnnouncements.map((ann, index) => (
                                            <div
                                                key={index}
                                                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 transform ${index === currentAnnIndex
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-4'
                                                    }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                                    {ann}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                            Complimentary Shipping on Orders Above $250
                                        </span>
                                    )}
                                </div>

                                {/* Mobile/Tablet: Marquee (Visible on small) */}
                                <div className="lg:hidden h-full flex items-center overflow-hidden">
                                    <div className="marquee-container">
                                        <div className="marquee-content pr-12">
                                            {parsedAnnouncements.map((ann, idx) => (
                                                <span key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                                    {ann}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="marquee-content pr-12" aria-hidden="true">
                                            {parsedAnnouncements.map((ann, idx) => (<span key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                                {ann}
                                            </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Contact & Currency */}
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex items-center gap-4">
                                    <a href="tel:+12265060808" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        <Phone size={11} strokeWidth={2} /> +1 (226) 506-0808
                                    </a>
                                    <a href="mailto:modeaura1@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        <Mail size={11} strokeWidth={2} /> modeaura1@gmail.com
                                    </a>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                                        className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors border-l border-white/10 pl-4"
                                    >
                                        $ {currency} <ChevronDown size={10} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isCurrencyOpen && (
                                        <div className="absolute top-full right-0 mt-2 bg-[var(--brand-navy)] border border-white/10 shadow-2xl rounded-xl p-2 min-w-[100px] z-[110] grid gap-1 animate-in fade-in slide-in-from-top-2">
                                            {currencies.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setCurrency(c);
                                                        setIsCurrencyOpen(false);
                                                    }}
                                                    className={`text-[9px] font-black uppercase tracking-widest p-2 rounded-lg text-left transition-colors ${currency === c ? 'bg-[var(--gold)] text-white' : 'hover:bg-white/5 text-white/60'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Layer 2: Brand Identity & Search Bar */}
                <div className={`transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-xl py-3 shadow-xl shadow-black/[0.03]' : 'bg-white py-8'} border-b border-[var(--mocha-border)] relative`}>
                    <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">

                        {/* Left: Branding - Text-Based (Aesthetic Restoration) */}
                        <Link href="/" className="flex items-center gap-4 group shrink-0">
                            {settings?.logo ? (
                                <img
                                    src={settings.logo}
                                    alt="Mode Aura"
                                    className={`transition-all duration-500 object-contain ${scrolled ? 'h-6' : 'h-10 md:h-14'}`}
                                />
                            ) : (
                                <div className="flex flex-col items-start translate-y-[-2px]">
                                    <div className="flex items-center translate-x-[-2px]">
                                        <h1 className={`font-display font-light italic transition-all duration-500 group-hover:tracking-wider text-[var(--brand-navy)] ${scrolled ? 'text-xl' : 'text-2xl md:text-5xl'}`}
                                        >Mode</h1>
                                        <h1 className={`font-bold uppercase text-[var(--gold)] ml-[-0.08em] tracking-[0.05em] transition-all duration-500 group-hover:text-[var(--brand-navy)] ${scrolled ? 'text-xl' : 'text-2xl md:text-5xl'}`}
                                        >Aura</h1>

                                        {/* Seasonal Theme Icons */}
                                        {theme?.name.includes('Ramadan') && (
                                            <div className={`ml-2 text-[var(--gold)] animate-pulse ${scrolled ? 'scale-75' : 'scale-100'}`}>
                                                <Moon size={scrolled ? 18 : 28} strokeWidth={1.5} className="fill-[var(--gold)]/20" />
                                            </div>
                                        )}
                                        {theme?.name.includes('Eid') && (
                                            <div className={`ml-2 text-[var(--gold)] animate-bounce ${scrolled ? 'scale-75' : 'scale-100'}`}>
                                                <PartyPopper size={scrolled ? 18 : 28} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>
                                    {!scrolled && (
                                        <div className="overflow-hidden">
                                            <span className="text-[7px] font-black uppercase text-[var(--gold)] tracking-[0.35em] opacity-80 block animate-in slide-in-from-left-4 duration-700">
                                                {theme?.name.includes('Ramadan') ? 'Ramadan Kareem' :
                                                    theme?.name.includes('Eid') ? 'Eid Mubarak' :
                                                        'WHERE FASHION MEETS ACCESSORIES'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Link>

                        {/* Center: Search Bar Trigger */}
                        <div className="hidden lg:flex flex-1 justify-center px-12">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-full max-w-[500px] bg-[#f8f5f0] rounded-full py-3.5 px-12 text-[10px] font-black tracking-widest text-gray-400 text-left flex items-center gap-3 hover:bg-[#f3efe8] transition-all group"
                            >
                                <Search size={16} strokeWidth={2.5} className="text-[var(--gold)] opacity-40 group-hover:opacity-100 transition-opacity" />
                                SEARCH THE ATELIER...
                            </button>
                        </div>

                        {/* Right: Personalization Icons */}
                        <div className="flex items-center gap-6 shrink-0">
                            {/* Mobile Search Icon */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="lg:hidden text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors"
                            >
                                <Search size={20} strokeWidth={1.2} />
                            </button>
                            <Link href="/wishlist" className="hidden sm:flex relative text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors group">
                                <Heart size={20} strokeWidth={1.2} className="group-hover:scale-110 transition-transform" />
                                {wishlist.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 bg-[#1B2936] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in scale-in duration-300">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link href="/account" className="flex items-center gap-3 group">
                                        <div className="w-9 h-9 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white transition-all">
                                            <User size={18} strokeWidth={1.2} />
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">{user.name.split(' ')[0]}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--gold)]">View Profile</p>
                                        </div>
                                    </Link>
                                    <button onClick={() => logout()} className="hidden lg:block p-2 text-gray-300 hover:text-red-500 transition-colors">
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="flex items-center gap-3 group">
                                    <div className="w-9 h-9 rounded-full bg-[#FAF9F6] flex items-center justify-center transition-all group-hover:bg-[var(--gold)]/10 text-[var(--text-primary)] group-hover:text-[var(--gold)]">
                                        <User size={18} strokeWidth={1.2} />
                                    </div>
                                    <span className="hidden lg:block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors">Sign In</span>
                                </Link>
                            )}

                            <Link href="/bag" className="relative group text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors">
                                <ShoppingBag size={21} strokeWidth={1.2} className="group-hover:-translate-y-0.5 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 bg-[var(--gold)] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in scale-in duration-300">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden p-2 text-[var(--text-primary)]"
                                onClick={() => setIsMenuOpen(true)}
                            >
                                <Menu size={24} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Layer 3: Category Navigation (Always visible on desktop) */}
                <div className={`transition-all duration-700 bg-white/80 backdrop-blur-md border-b border-[var(--mocha-border)] hidden lg:block ${scrolled ? 'h-10' : 'h-12'}`}>
                    <div className="max-w-7xl mx-auto px-8 h-full flex justify-center items-center gap-10">
                        {navItems.length > 0 ? (
                            navItems.map((item) => {
                                // Dynamic children injection: If no nav children, check for category subcategories
                                let displayChildren = item.children || [];
                                if (displayChildren.length === 0) {
                                    const catIdMatch = item.href.match(/category=([^&]+)/);
                                    if (catIdMatch) {
                                        const catId = catIdMatch[1];
                                        const cat = categories.find(c => c.id === catId);
                                        if (cat && cat.children?.length > 0) {
                                            displayChildren = cat.children.map((sub: any) => ({
                                                id: sub.id,
                                                label: sub.name,
                                                href: `/shop?category=${sub.id}`
                                            }));
                                        }
                                    }
                                }

                                return (
                                    <div key={item.id} className="relative group h-full flex items-center">
                                        <NavLink
                                            href={item.href}
                                            label={item.label.toUpperCase()}
                                            color={item.href === '/shop?filter=new' ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}
                                        />
                                        {displayChildren.length > 0 && (
                                            <>
                                                <ChevronDown size={10} className="ml-1 text-[var(--gold)] opacity-50 group-hover:rotate-180 transition-transform" />
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                    <div className="bg-white border border-[var(--mocha-border)] shadow-2xl rounded-2xl p-4 min-w-[200px] grid gap-2">
                                                        {displayChildren.map((child: any) => (
                                                            <Link
                                                                key={child.id}
                                                                href={child.href}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--gold)] p-2 hover:bg-[#FAF9F6] rounded-xl transition-all"
                                                            >
                                                                {child.label || child.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                <NavLink href="/shop?filter=new" label="NEW ARRIVALS" color="text-[var(--gold)]" />
                                {['ABAYAS', 'THOBES', 'HIJABS', 'BAGS', 'ACCESSORIES'].map(catName => {
                                    const cat = categories.find(c => c.name.toUpperCase() === catName);
                                    if (!cat) return null;
                                    return (
                                        <div key={cat.id} className="relative group h-full flex items-center">
                                            <NavLink
                                                href={`/shop?category=${cat.id}`}
                                                label={cat.name.toUpperCase()}
                                                color="text-[var(--text-primary)]"
                                            />
                                            {cat.children?.length > 0 && (
                                                <>
                                                    <ChevronDown size={10} className="ml-1 text-[var(--gold)] opacity-50 group-hover:rotate-180 transition-transform" />
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                        <div className="bg-white border border-[var(--mocha-border)] shadow-2xl rounded-2xl p-4 min-w-[200px] grid gap-2">
                                                            {cat.children.map((sub: any) => (
                                                                <Link
                                                                    key={sub.id}
                                                                    href={`/shop?category=${sub.id}`}
                                                                    className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--gold)] p-2 hover:bg-[#FAF9F6] rounded-xl transition-all"
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                                <NavLink href="/shop?kids=true" label="KIDS" color="text-[var(--text-primary)]" />
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Slide-out */}
                <div className={`fixed inset-0 bg-white z-[100] transition-transform duration-700 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-8 h-full flex flex-col pt-24 text-center overflow-y-auto">
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-2 text-[var(--text-secondary)]">
                            <X size={32} strokeWidth={1} />
                        </button>

                        <div className="space-y-12">
                            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-baseline justify-center">
                                <span className="font-display text-4xl font-medium italic text-[var(--brand-navy)]">Mode</span>
                                <span className="font-bold text-4xl uppercase text-[var(--gold)] tracking-widest ml-1">Aura</span>
                            </Link>

                            <div className="space-y-8 pb-12">
                                {navItems.length > 0 ? (
                                    navItems.map((item) => {
                                        // Same injection logic as desktop
                                        let displayChildren = item.children || [];
                                        if (displayChildren.length === 0) {
                                            const catIdMatch = item.href.match(/category=([^&]+)/);
                                            if (catIdMatch) {
                                                const catId = catIdMatch[1];
                                                const cat = categories.find(c => c.id === catId);
                                                if (cat && cat.children?.length > 0) {
                                                    displayChildren = cat.children.map((sub: any) => ({
                                                        id: sub.id,
                                                        label: sub.name,
                                                        href: `/shop?category=${sub.id}`
                                                    }));
                                                }
                                            }
                                        }

                                        return (
                                            <div key={item.id} className="space-y-4">
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`block text-3xl font-display italic ${item.href === '/shop?filter=new' ? 'text-[var(--gold)]' : 'text-[var(--brand-navy)]'}`}
                                                >
                                                    {item.label}
                                                </Link>
                                                {displayChildren.length > 0 && (
                                                    <div className="flex flex-wrap justify-center gap-4">
                                                        {displayChildren.map((child: any) => (
                                                            <Link
                                                                key={child.id}
                                                                href={child.href}
                                                                onClick={() => setIsMenuOpen(false)}
                                                                className="text-sm font-black uppercase tracking-widest text-[var(--gold)]"
                                                            >
                                                                {child.label || child.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <Link href="/shop?filter=new" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-display italic text-[var(--gold)]">New Arrivals</Link>
                                        <Link href="/shop?kids=true" onClick={() => setIsMenuOpen(false)} className="block text-3xl font-display italic text-[var(--brand-navy)]">Kids Collection</Link>
                                        {categories.map(cat => (
                                            <div key={cat.id} className="space-y-4">
                                                <Link
                                                    href={`/shop?category=${cat.id}`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="block text-3xl font-display italic text-[var(--brand-navy)]"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {cat.children?.length > 0 && (
                                                    <div className="flex flex-wrap justify-center gap-4">
                                                        {cat.children.map((sub: any) => (
                                                            <Link
                                                                key={sub.id}
                                                                href={`/shop?category=${sub.id}`}
                                                                onClick={() => setIsMenuOpen(false)}
                                                                className="text-sm font-black uppercase tracking-widest text-[var(--gold)]"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-display italic text-gray-300">Our Heritage</Link>
                                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block text-2xl font-display italic text-gray-300">Contact Atelier</Link>
                            </div>
                        </div>

                        <div className="mt-auto pt-10 border-t border-[var(--mocha-border)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--gold)]">Mode AURA Windsor</p>
                            <div className="flex justify-center gap-6 mt-4 text-[var(--text-muted)]">
                                <a href="https://www.instagram.com/modeaura1/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                                <Facebook size={18} />
                                <Twitter size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

function NavLink({ href, label, color }: { href: string, label: string, color: string }) {
    return (
        <Link
            href={href}
            className={`text-[9px] font-black uppercase tracking-[0.4em] transition-all relative group ${color} opacity-80 hover:opacity-100`}
        >
            {label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--gold)] group-hover:w-full transition-all duration-500"></span>
        </Link>
    );
}
