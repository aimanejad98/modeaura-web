'use client'

import { useState, useEffect } from 'react'
import { getStoreSettings, updateStoreSettings, updateStaffPassword, updateStaffInfo } from '@/app/actions/settings'
import MediaPicker from '@/components/MediaPicker'
import { Phone, Mail, Instagram, Facebook, Globe } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function SettingsPage() {
    const [tab, setTab] = useState<'store' | 'branding' | 'account'>('store')
    const [settings, setSettings] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | null>(null)
    const [uploadedAssets, setUploadedAssets] = useState<string[]>([])

    // Password change
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const savedUser = localStorage.getItem('dashboard_user')
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser))
        }
        const storeData = await getStoreSettings()
        setSettings(storeData)
        setLoading(false)
    }

    async function handleSaveStore(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        await updateStoreSettings(settings)
        setMessage('✅ Store settings saved!')
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setMessage('❌ Passwords do not match')
            return
        }
        if (!currentUser?.id) return

        setSaving(true)
        const result = await updateStaffPassword(currentUser.id, currentPassword, newPassword)
        if (result.success) {
            setMessage('✅ Password changed successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setMessage(`❌ ${result.error}`)
        }
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    async function handleUpdateInfo(e: React.FormEvent) {
        e.preventDefault()
        if (!currentUser?.id) return

        setSaving(true)
        await updateStaffInfo(currentUser.id, {
            name: currentUser.name,
            phone: currentUser.phone
        })
        localStorage.setItem('dashboard_user', JSON.stringify(currentUser))
        setMessage('✅ Profile updated!')
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#D4AF37] font-bold animate-pulse">Loading settings...</div>
            </div>
        )
    }

    const canEditStore = currentUser?.role === 'Admin' || currentUser?.role === 'Manager'

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Settings</h2>
                    <p className="text-gray-500 mt-1">Manage your store and account</p>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`p-4 rounded-xl font-bold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setTab('store')}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'store' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Store Info
                    </button>
                    <button
                        onClick={() => setTab('branding')}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'branding' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Branding
                    </button>
                    <button
                        onClick={() => setTab('account')}
                        className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Account
                    </button>
                </div>

                {/* Store Branding Tab */}
                {tab === 'store' && canEditStore && settings && (
                    <form onSubmit={handleSaveStore} className="card p-8 space-y-6">
                        <h3 className="text-xl font-black">Store Information</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Store Name</label>
                                <input
                                    value={settings.storeName || ''}
                                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tagline</label>
                                <input
                                    value={settings.tagline || ''}
                                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                    placeholder="e.g., Luxury Modest Fashion"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={settings.phone || ''}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={settings.email || ''}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Address</label>
                            <input
                                value={settings.address || ''}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                            />
                        </div>

                        <h3 className="text-xl font-black pt-4">Social Media</h3>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={settings.instagram || ''}
                                        onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                        placeholder="@modeaura"
                                        className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Facebook</label>
                                <div className="relative">
                                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={settings.facebook || ''}
                                        onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                        placeholder="Facebook Profile/Page"
                                        className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={settings.website || ''}
                                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                        placeholder="www.modeaura.ca"
                                        className="w-full p-4 pl-12 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-black pt-4">Tax & Currency</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.taxRate || 0}
                                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Currency</label>
                                <select
                                    value={settings.currency || 'CAD'}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                >
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Receipt Note</label>
                            <textarea
                                value={settings.receiptNote || ''}
                                onChange={(e) => setSettings({ ...settings, receiptNote: e.target.value })}
                                placeholder="Thank you for shopping at Mode AURA!"
                                rows={3}
                                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                            />
                        </div>

                        <button type="submit" disabled={saving} className="gold-btn py-4 px-8">
                            {saving ? 'Saving...' : 'Save Store Details'}
                        </button>
                    </form>
                )}

                {/* Store Branding Tab */}
                {tab === 'branding' && canEditStore && settings && (
                    <div className="card p-8 space-y-8 animate-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-xl font-black">Visual Identity</h3>
                            <p className="text-gray-500 text-sm mt-1">Manage logos and design assets for your storefront</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Logo Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Principal Logo</label>
                                <div className="relative group aspect-[16/6] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                    {settings.logo ? (
                                        <>
                                            <img src={settings.logo} alt="Logo" className="max-h-full max-w-full object-contain p-4 transition-opacity group-hover:opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setPickerTarget('logo'); setShowPicker(true); }}
                                                    className="gold-btn px-6 py-2 shadow-xl"
                                                >
                                                    Change Logo
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { setPickerTarget('logo'); setShowPicker(true); }}
                                            className="text-center group-hover:scale-110 transition-transform"
                                        >
                                            <span className="text-4xl block mb-2">🖼️</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select from Vault</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Recommended: Transparent PNG, 800x300px</p>
                            </div>

                            {/* Favicon Section */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Store Favicon</label>
                                <div className="relative group w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                    {settings.favicon ? (
                                        <>
                                            <img src={settings.favicon} alt="Favicon" className="w-16 h-16 object-contain transition-opacity group-hover:opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setPickerTarget('favicon'); setShowPicker(true); }}
                                                    className="gold-btn px-4 py-1.5 text-[10px]"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { setPickerTarget('favicon'); setShowPicker(true); }}
                                            className="text-center group-hover:scale-110 transition-transform"
                                        >
                                            <span className="text-2xl block mb-1">🔖</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Icon</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Recommended: 64x64px ICO or PNG</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8 flex justify-end">
                            <button onClick={handleSaveStore} disabled={saving} className="gold-btn py-4 px-12">
                                {saving ? 'Syncing...' : 'Update Branding'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Account Tab */}
                {tab === 'account' && currentUser && (
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <form onSubmit={handleUpdateInfo} className="card p-8 space-y-6">
                            <h3 className="text-xl font-black">Profile Information</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Name</label>
                                    <input
                                        value={currentUser.name || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone</label>
                                    <input
                                        value={currentUser.phone || ''}
                                        onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Email</label>
                                    <input value={currentUser.email || ''} disabled className="w-full p-4 bg-gray-100 rounded-xl text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Role</label>
                                    <input value={currentUser.role || ''} disabled className="w-full p-4 bg-gray-100 rounded-xl text-gray-500" />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="gold-btn py-4 px-8">
                                {saving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </form>

                        {/* Change Password */}
                        <form onSubmit={handleChangePassword} className="card p-8 space-y-6">
                            <h3 className="text-xl font-black">Change Password</h3>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {
                showPicker && (
                    <MediaPicker
                        onSelect={(url) => {
                            if (pickerTarget === 'logo') setSettings({ ...settings, logo: url });
                            if (pickerTarget === 'favicon') setSettings({ ...settings, favicon: url });
                            setShowPicker(false);
                        }}
                        onClose={() => setShowPicker(false)}
                        title={`Select ${pickerTarget === 'logo' ? 'Brand Logo' : 'Store Favicon'}`}
                    />
                )
            }

            <DashboardPageGuide
                pageName={{ en: "Settings", ar: "الإعدادات" }}
                steps={[
                    {
                        title: { en: "Store Configuration", ar: "إعدادات المتجر" },
                        description: {
                            en: "Configure store name, currency, tax rate, shipping cost, and social media links for your business.",
                            ar: "اضبط اسم المتجر والعملة ومعدل الضريبة وتكلفة الشحن وروابط التواصل الاجتماعي لعملك."
                        },
                        icon: "⚙️"
                    },
                    {
                        title: { en: "Account Security", ar: "أمان الحساب" },
                        description: {
                            en: "Update your name, email, and password. Use strong passwords to protect dashboard access.",
                            ar: "حدّث اسمك وبريدك وكلمة مرورك. استخدم كلمات مرور قوية لحماية الوصول للوحة التحكم."
                        },
                        icon: "🔒"
                    },
                    {
                        title: { en: "Brand Assets", ar: "أصول العلامة التجارية" },
                        description: {
                            en: "Upload and manage your logo and favicon through the media picker for consistent branding.",
                            ar: "ارفع وأدر شعارك وأيقونة الموقع عبر منتقي الوسائط لعلامة تجارية متسقة."
                        },
                        icon: "🎨"
                    }
                ]}
            />
        </>
    )
}
