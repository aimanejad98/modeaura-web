'use client'

import { useState, useEffect } from 'react'
import { getStoreSettings, updateStoreSettings, updateStaffPassword, updateStaffInfo } from '@/app/actions/settings'
import { registerTerminalReader, getTerminalReaders } from '@/app/actions/terminal'
import MediaPicker from '@/components/MediaPicker'
import { Phone, Mail, Instagram, Facebook, Globe, MonitorSmartphone, Check, Megaphone, Loader2 } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function SettingsPage() {
    const [tab, setTab] = useState<'store' | 'terminal' | 'account'>('store')
    const [settings, setSettings] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | null>(null)

    // Terminal State
    const [readers, setReaders] = useState<any[]>([])
    const [registrationCode, setRegistrationCode] = useState('')
    const [readerLabel, setReaderLabel] = useState('')
    const [registering, setRegistering] = useState(false)

    // Password change
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        loadData()
        loadReaders()
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

    async function loadReaders() {
        const res = await getTerminalReaders()
        if (res.success) {
            setReaders(res.readers || [])
        }
    }

    async function handleSaveStore(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        await updateStoreSettings(settings)
        setMessage('✅ Store settings saved!')
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    async function handleRegisterReader() {
        if (!registrationCode) return
        setRegistering(true)
        const res = await registerTerminalReader(registrationCode, readerLabel)
        if (res.success) {
            setMessage('✅ Card Reader Registered Successfully!')
            setRegistrationCode('')
            setReaderLabel('')
            loadReaders()
        } else {
            setMessage('❌ Failed to register reader: ' + res.error)
        }
        setRegistering(false)
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
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black italic text-gray-900">Settings</h2>
                        <p className="text-gray-500 mt-1">Manage store configuration, hardware, and account</p>
                    </div>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message.startsWith('✅') ? <Check size={18} /> : <Megaphone size={18} />}
                        {message.replace('✅ ', '').replace('❌ ', '')}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setTab('store')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'store' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setTab('terminal')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'terminal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Terminal
                    </button>
                    <button
                        onClick={() => setTab('account')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Account
                    </button>
                </div>

                {/* Store Settings Tab */}
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

                {/* Terminal Settings Tab */}
                {tab === 'terminal' && canEditStore && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                    <MonitorSmartphone size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Stripe Terminal</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Manage Card Readers</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Registration Form */}
                                <div className="space-y-6">
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <h3 className="font-bold text-indigo-900 mb-2">How to Connect</h3>
                                        <ol className="list-decimal list-inside text-xs text-indigo-700 space-y-1 font-medium">
                                            <li>Turn on your Stripe Reader (WisePOS E).</li>
                                            <li>Connect it to the <strong>SAME Wi-Fi</strong> as this device.</li>
                                            <li>Go to <strong>Settings</strong> {'>'} <strong>Generate Pairing Code</strong> on the reader.</li>
                                            <li>Enter the code below.</li>
                                        </ol>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pairing Code</label>
                                        <input
                                            type="text"
                                            value={registrationCode}
                                            onChange={(e) => setRegistrationCode(e.target.value)}
                                            placeholder="e.g. 123-456"
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] font-mono text-lg tracking-widest focus:outline-none focus:border-[var(--gold)] transition-all uppercase placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reader Label (Optional)</label>
                                        <input
                                            type="text"
                                            value={readerLabel}
                                            onChange={(e) => setReaderLabel(e.target.value)}
                                            placeholder="e.g. Front Counter iPad"
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>

                                    <button
                                        onClick={handleRegisterReader}
                                        disabled={registering || !registrationCode}
                                        className="w-full gold-btn py-4 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {registering ? 'Connecting...' : 'Register Reader'}
                                    </button>
                                </div>

                                {/* Connected Readers List */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Connected Readers</h3>
                                    <div className="space-y-3">
                                        {readers.length === 0 ? (
                                            <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                                                <p className="text-gray-400 text-sm font-medium">No readers connected yet.</p>
                                            </div>
                                        ) : (
                                            readers.map((reader) => (
                                                <div key={reader.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${reader.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-300'}`} />
                                                        <div>
                                                            <p className="font-bold text-sm text-[var(--text-primary)]">{reader.label || 'Unnamed Reader'}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono">{reader.serial_number}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">{reader.device_type}</p>
                                                        <div className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full inline-block mt-1 ${reader.status === 'online' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'
                                                            }`}>
                                                            {reader.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
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
                        title: { en: "Terminal Setup", ar: "إعدادات المحطة" },
                        description: {
                            en: "Pair and manage your Stripe WisePOS E readers for in-person payments.",
                            ar: "اقتران وإدارة قارئات Stripe WisePOS E للمدفوعات الشخصية."
                        },
                        icon: "💳"
                    },
                    {
                        title: { en: "Account Security", ar: "أمان الحساب" },
                        description: {
                            en: "Update your name, email, and password. Use strong passwords to protect dashboard access.",
                            ar: "حدّث اسمك وبريدك وكلمة مرورك. استخدم كلمات مرور قوية لحماية الوصول للوحة التحكم."
                        },
                        icon: "🔒"
                    }
                ]}
            />
        </>
    )
}
