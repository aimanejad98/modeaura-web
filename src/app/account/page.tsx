'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import { getOrdersByCustomer } from '@/app/actions/orders';
import { getProfile, updateProfile, changePassword, updateAddress } from '@/app/actions/profile';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import { User, ShoppingBag, LogOut, Package, Clock, ChevronRight, Layout, Pencil, MapPin, Lock, Check, X, Eye, EyeOff, Save } from 'lucide-react';
import Link from 'next/link';

type Tab = 'orders' | 'profile' | 'address' | 'security';

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('orders');

    // Profile editing
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Address editing
    const [editingAddress, setEditingAddress] = useState(false);
    const [addressData, setAddressData] = useState({ address: '', city: '', province: '', postalCode: '' });
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressMsg, setAddressMsg] = useState('');

    // Password change
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdMsg, setPwdMsg] = useState('');

    useEffect(() => {
        async function loadAccount() {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                const [userProfile, userOrders] = await Promise.all([
                    getProfile(),
                    getOrdersByCustomer(currentUser.id)
                ]);
                setProfile(userProfile);
                setOrders(userOrders);
                if (userProfile) {
                    setProfileName(userProfile.name);
                    setProfilePhone(userProfile.phone || '');
                    setAddressData({
                        address: userProfile.address || '',
                        city: userProfile.city || '',
                        province: userProfile.province || '',
                        postalCode: userProfile.postalCode || '',
                    });
                }
            }
            setLoading(false);
        }
        loadAccount();
    }, []);

    async function handleProfileSave() {
        setProfileSaving(true);
        setProfileMsg('');
        const result = await updateProfile({ name: profileName, phone: profilePhone });
        if (result.success) {
            setProfileMsg('Profile updated successfully');
            setEditingProfile(false);
            setProfile({ ...profile, name: profileName, phone: profilePhone });
        } else {
            setProfileMsg(result.error || 'Failed to update');
        }
        setProfileSaving(false);
        setTimeout(() => setProfileMsg(''), 3000);
    }

    async function handleAddressSave() {
        setAddressSaving(true);
        setAddressMsg('');
        const result = await updateAddress(addressData);
        if (result.success) {
            setAddressMsg('Address saved successfully');
            setEditingAddress(false);
            setProfile({ ...profile, ...addressData });
        } else {
            setAddressMsg(result.error || 'Failed to update');
        }
        setAddressSaving(false);
        setTimeout(() => setAddressMsg(''), 3000);
    }

    async function handlePasswordChange() {
        if (newPwd !== confirmPwd) {
            setPwdMsg('Passwords do not match');
            return;
        }
        if (newPwd.length < 6) {
            setPwdMsg('Password must be at least 6 characters');
            return;
        }
        setPwdSaving(true);
        setPwdMsg('');
        const result = await changePassword(currentPwd, newPwd);
        if (result.success) {
            setPwdMsg('Password changed successfully');
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
        } else {
            setPwdMsg(result.error || 'Failed to change password');
        }
        setPwdSaving(false);
        setTimeout(() => setPwdMsg(''), 4000);
    }

    if (loading) {
        return <div className="min-h-screen bg-[#FAF9F6] pt-64 text-center text-gray-400 font-medium">Loading your atelier profile...</div>;
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 pt-64 pb-24 text-center space-y-8">
                    <h1 className="text-4xl font-display italic text-[#1B2936]">Identity Verification Required</h1>
                    <p className="text-gray-500 max-w-md mx-auto">Please sign in to view your orders and manage your profile.</p>
                    <Link href="/login" className="inline-block bg-[#1B2936] text-white px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        Sign In
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'orders', label: 'Orders', icon: ShoppingBag },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'address', label: 'Address', icon: MapPin },
        { key: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-64 pb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="lg:w-1/3 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-[var(--gold)]/10 rounded-full flex items-center justify-center text-[var(--gold)]">
                                    <User size={40} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Online</p>
                                    </div>
                                    <h2 className="text-2xl font-display italic text-[#1B2936]">{profile?.name || user.name}</h2>
                                    <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.2em] mt-1 italic">Mode Aura Member</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-bold text-[#1B2936]">{profile?.email || user.email}</p>
                                </div>
                                {profile?.phone && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                                        <p className="text-sm font-bold text-[#1B2936]">{profile.phone}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</p>
                                    <p className="text-sm font-bold text-[#1B2936]">
                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm space-y-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all ${activeTab === tab.key
                                            ? 'bg-[#1B2936] text-white'
                                            : 'text-gray-400 hover:bg-gray-50 hover:text-[#1B2936]'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                );
                            })}

                            <div className="border-t border-gray-50 mt-2 pt-2">
                                {user.role === 'Admin' && (
                                    <Link
                                        href="/dashboard"
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] transition-all"
                                    >
                                        <Layout size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <LogOut size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-2/3 space-y-8">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-display italic text-[#1B2936]">Order History</h2>
                                    <div className="px-6 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{orders.length} ORDERS</span>
                                    </div>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center space-y-6 shadow-sm">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                                            <Package size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-display italic text-gray-400">No orders yet.</h3>
                                            <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Your future pieces will appear here.</p>
                                        </div>
                                        <Link href="/shop" className="inline-block text-[var(--gold)] text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors">
                                            Browse the Collection
                                        </Link>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                                            <div className="p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B2936]">
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                                            <p className="font-bold text-[#1B2936]">{order.orderId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-12">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                                            <p className="text-xs font-bold text-[#1B2936]">{new Date(order.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                                            <p className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter inline-block ${order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                                                order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                                                {order.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                                                        <Price amount={order.total} className="text-3xl font-display italic text-[#1B2936]" />
                                                    </div>
                                                    <div className="flex -space-x-3 justify-end">
                                                        {Array.isArray(order.items) && order.items.slice(0, 4).map((item: any, idx: number) => (
                                                            <div key={idx} className="w-12 h-16 border-4 border-white rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {Array.isArray(order.items) && order.items.length > 4 && (
                                                            <div className="w-12 h-16 border-4 border-white rounded-lg bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                                                +{order.items.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50/50 p-6 flex justify-between items-center border-t border-gray-50">
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Shipping to: {order.city || 'Standard Address'}</p>
                                                {order.status === 'Shipped' && (
                                                    <Link href={`/track-order`} className="text-[var(--gold)] text-[9px] font-black uppercase tracking-widest hover:text-black transition-colors">
                                                        Track Order →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-display italic text-[#1B2936]">Profile Details</h2>
                                    {!editingProfile && (
                                        <button
                                            onClick={() => setEditingProfile(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all shadow-sm"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                                    {profileMsg && (
                                        <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${profileMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {profileMsg.includes('success') ? <Check size={14} /> : <X size={14} />}
                                            {profileMsg}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Full Name</label>
                                            {editingProfile ? (
                                                <input
                                                    type="text"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] focus:border-[var(--gold)] focus:outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address</label>
                                            <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-400">{profile?.email}</p>
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Email cannot be changed for security reasons</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Phone Number</label>
                                            {editingProfile ? (
                                                <input
                                                    type="tel"
                                                    value={profilePhone}
                                                    onChange={(e) => setProfilePhone(e.target.value)}
                                                    placeholder="e.g. +1 (647) 555-1234"
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.phone || 'Not set'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {editingProfile && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={handleProfileSave}
                                                disabled={profileSaving}
                                                className="flex items-center gap-2 px-8 py-4 bg-[#1B2936] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all"
                                            >
                                                <Save size={14} />
                                                {profileSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingProfile(false);
                                                    setProfileName(profile?.name || '');
                                                    setProfilePhone(profile?.phone || '');
                                                }}
                                                className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-display italic text-[#1B2936]">Shipping Address</h2>
                                    {!editingAddress && (
                                        <button
                                            onClick={() => setEditingAddress(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all shadow-sm"
                                        >
                                            <Pencil size={14} /> {profile?.address ? 'Edit' : 'Add Address'}
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                                    {addressMsg && (
                                        <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${addressMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {addressMsg.includes('success') ? <Check size={14} /> : <X size={14} />}
                                            {addressMsg}
                                        </div>
                                    )}

                                    {!editingAddress && !profile?.address ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                                                <MapPin size={32} />
                                            </div>
                                            <h3 className="text-lg font-display italic text-gray-400">No address saved</h3>
                                            <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Add your shipping address for faster checkout</p>
                                            <button
                                                onClick={() => setEditingAddress(true)}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B2936] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                <MapPin size={14} /> Add Address
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Street Address</label>
                                                {editingAddress ? (
                                                    <input
                                                        type="text"
                                                        value={addressData.address}
                                                        onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                                                        placeholder="123 Fashion Street, Unit 4B"
                                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all"
                                                    />
                                                ) : (
                                                    <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.address}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">City</label>
                                                    {editingAddress ? (
                                                        <input
                                                            type="text"
                                                            value={addressData.city}
                                                            onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                                            placeholder="Toronto"
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.city || '—'}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Province</label>
                                                    {editingAddress ? (
                                                        <input
                                                            type="text"
                                                            value={addressData.province}
                                                            onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
                                                            placeholder="Ontario"
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.province || '—'}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Postal Code</label>
                                                    {editingAddress ? (
                                                        <input
                                                            type="text"
                                                            value={addressData.postalCode}
                                                            onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                                                            placeholder="M5V 2H1"
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <p className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-[#1B2936]">{profile?.postalCode || '—'}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {editingAddress && (
                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        onClick={handleAddressSave}
                                                        disabled={addressSaving}
                                                        className="flex items-center gap-2 px-8 py-4 bg-[#1B2936] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all"
                                                    >
                                                        <Save size={14} />
                                                        {addressSaving ? 'Saving...' : 'Save Address'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingAddress(false);
                                                            setAddressData({
                                                                address: profile?.address || '',
                                                                city: profile?.city || '',
                                                                province: profile?.province || '',
                                                                postalCode: profile?.postalCode || '',
                                                            });
                                                        }}
                                                        className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <h2 className="text-4xl font-display italic text-[#1B2936]">Security</h2>

                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                                    <div>
                                        <h3 className="text-lg font-display italic text-[#1B2936] mb-2">Change Password</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update your password to keep your account secure</p>
                                    </div>

                                    {pwdMsg && (
                                        <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${pwdMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {pwdMsg.includes('success') ? <Check size={14} /> : <X size={14} />}
                                            {pwdMsg}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPwd ? 'text' : 'password'}
                                                    value={currentPwd}
                                                    onChange={(e) => setCurrentPwd(e.target.value)}
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] focus:border-[var(--gold)] focus:outline-none transition-all pr-14"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                                >
                                                    {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPwd ? 'text' : 'password'}
                                                    value={newPwd}
                                                    onChange={(e) => setNewPwd(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1B2936] placeholder:text-gray-300 focus:border-[var(--gold)] focus:outline-none transition-all pr-14"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPwd(!showNewPwd)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                                >
                                                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPwd}
                                                onChange={(e) => setConfirmPwd(e.target.value)}
                                                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl text-sm font-bold text-[#1B2936] focus:outline-none transition-all ${confirmPwd && confirmPwd !== newPwd ? 'border-red-300 focus:border-red-400' : 'border-gray-100 focus:border-[var(--gold)]'}`}
                                            />
                                            {confirmPwd && confirmPwd !== newPwd && (
                                                <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-2">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={pwdSaving || !currentPwd || !newPwd || newPwd !== confirmPwd}
                                        className="flex items-center gap-2 px-8 py-4 bg-[#1B2936] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Lock size={14} />
                                        {pwdSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
