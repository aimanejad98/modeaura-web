'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '@/app/actions/settings';
import { uploadImage } from '@/app/actions/upload';
import { registerTerminalReader, getTerminalReaders } from '@/app/actions/terminal';
import { Palette, Megaphone, Globe, Check, Save, Loader2, Upload, Image as ImageIcon, X, Plus, Phone, Mail, CreditCard, MonitorSmartphone } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function BrandingPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [announcements, setAnnouncements] = useState<string[]>(['']);
    const [activeTab, setActiveTab] = useState<'branding' | 'terminal'>('branding');

    // Terminal State
    const [readers, setReaders] = useState<any[]>([]);
    const [registrationCode, setRegistrationCode] = useState('');
    const [readerLabel, setReaderLabel] = useState('');
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        loadSettings();
        loadReaders();
    }, []);

    async function loadReaders() {
        const res = await getTerminalReaders();
        if (res.success) {
            setReaders(res.readers || []);
        }
    }

    async function loadSettings() {
        const data = await getStoreSettings();
        setSettings(data);
        if (data?.announcement) {
            try {
                const parsed = JSON.parse(data.announcement);
                if (Array.isArray(parsed)) {
                    setAnnouncements(parsed);
                } else {
                    setAnnouncements([data.announcement]);
                }
            } catch (e) {
                setAnnouncements([data.announcement]);
            }
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);

        const result = await updateStoreSettings({
            logo: settings.logo,
            favicon: settings.favicon,
            announcement: JSON.stringify(announcements.filter(a => a.trim() !== '')),
            tagline: settings.tagline,
            seoTitle: settings.seoTitle,
            seoDescription: settings.seoDescription,
            instagram: settings.instagram,
            facebook: settings.facebook,
            ogImage: settings.ogImage,
            phone: settings.phone,
            email: settings.email,
            address: settings.address,
            website: settings.website,
            taxRate: settings.taxRate,
            currency: settings.currency,
            receiptNote: settings.receiptNote
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Identity settings updated successfully' });
        } else {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        }
        setSaving(false);
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon' | 'ogImage') {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const url = await uploadImage(formData);
            setSettings({ ...settings, [field]: url });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Icon upload failed');
        }
    }

    async function handleRegisterReader() {
        if (!registrationCode) return;
        setRegistering(true);
        const res = await registerTerminalReader(registrationCode, readerLabel);
        if (res.success) {
            setMessage({ type: 'success', text: 'Card Reader Registered Successfully!' });
            setRegistrationCode('');
            setReaderLabel('');
            loadReaders();
        } else {
            setMessage({ type: 'error', text: 'Failed to register reader: ' + res.error });
        }
        setRegistering(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] rounded-full border border-[var(--gold)]/20">
                        {activeTab === 'branding' ? <Palette size={14} /> : <MonitorSmartphone size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {activeTab === 'branding' ? 'Aesthetic & Identity' : 'Hardware & POS'}
                        </span>
                    </div>
                    <h1 className="text-4xl font-display italic text-[var(--text-primary)]">
                        {activeTab === 'branding' ? 'Brand Presence' : 'Terminal Settings'}
                    </h1>
                </div>

                <div className="flex gap-3">
                    <div className="bg-white p-1 rounded-xl border border-gray-200 flex">
                        <button
                            onClick={() => setActiveTab('branding')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'branding' ? 'bg-[var(--gold)] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Identity
                        </button>
                        <button
                            onClick={() => setActiveTab('terminal')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'terminal' ? 'bg-[var(--gold)] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Terminal
                        </button>
                    </div>

                    {activeTab === 'branding' && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="gold-btn px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                            <span className="text-xs font-black uppercase tracking-widest">Deploy Changes</span>
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <Megaphone size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activeTab === 'branding' ? (
                    /* Branding Content */
                    <>
                        {/* Storefront Communication */}
                        <div className="card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-2xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-lg shadow-[var(--gold)]/5">
                                    <Megaphone size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Storefront Alerts</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Navbar Announcement Bar</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Announcement Sequence</label>

                                    {announcements.map((ann, index) => (
                                        <div key={index} className="flex gap-3 animate-in slide-in-from-left-4 duration-300">
                                            <input
                                                type="text"
                                                value={ann}
                                                onChange={(e) => {
                                                    const newAnn = [...announcements];
                                                    newAnn[index] = e.target.value;
                                                    setAnnouncements(newAnn);
                                                }}
                                                placeholder="e.g. Complimentary Shipping on Orders Above $250"
                                                className="flex-1 bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium placeholder:text-gray-300"
                                            />
                                            {announcements.length > 1 && (
                                                <button
                                                    onClick={() => setAnnouncements(announcements.filter((_, i) => i !== index))}
                                                    className="p-4 bg-red-500/10 text-red-100 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setAnnouncements([...announcements, ''])}
                                        className="w-full py-4 bg-gray-50 border border-dashed border-[var(--mocha-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:border-[var(--gold)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Add Another Alert
                                    </button>

                                    <p className="text-[9px] text-gray-500 font-medium ml-1">These messages will rotate every few seconds in the top bar.</p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Taglines & Social */}
                        <div className="card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                                    <Palette size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Identity & Social</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official Brand Slogans & Links</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Official Slogan</label>
                                    <input
                                        type="text"
                                        value={settings?.tagline || ''}
                                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                        placeholder="e.g. Where Fashion Meets Accessories"
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-top border-[var(--mocha-border)]/50">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instagram URL</label>
                                        <input
                                            type="text"
                                            value={settings?.instagram || ''}
                                            onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                            placeholder="https://instagram.com/modeaura1"
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Facebook URL</label>
                                        <input
                                            type="text"
                                            value={settings?.facebook || ''}
                                            onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                            placeholder="https://facebook.com/modeaura"
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Official Website</label>
                                        <input
                                            type="text"
                                            value={settings?.website || ''}
                                            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                            placeholder="https://www.modeaura.ca"
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Contact Section */}
                        <div className="card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <Phone size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Business Contact</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official Communications</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Public Phone</label>
                                        <input
                                            type="text"
                                            value={settings?.phone || ''}
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Public Email</label>
                                        <input
                                            type="email"
                                            value={settings?.email || ''}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Business Address</label>
                                    <input
                                        type="text"
                                        value={settings?.address || ''}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                    />
                                </div>

                                {/* Auto-Tax Province Selector */}
                                <div className="space-y-3 pt-4 border-t border-[var(--mocha-border)]/50">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Store Province (Auto-Set Tax)</label>
                                        <span className="text-[9px] font-bold text-[var(--gold)] cursor-pointer hover:underline" onClick={() => {
                                            // Reset to Ontario default if needed
                                            setSettings({ ...settings, taxRate: 13 })
                                        }}>Reset to Ontario (13%)</span>
                                    </div>
                                    <select
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium cursor-pointer"
                                        onChange={(e) => {
                                            const rate = parseFloat(e.target.value);
                                            if (!isNaN(rate)) {
                                                setSettings({ ...settings, taxRate: rate });
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Province to Auto-Set Rates...</option>
                                        <option value="5">Alberta (5% GST)</option>
                                        <option value="12">British Columbia (5% GST + 7% PST = 12%)</option>
                                        <option value="12">Manitoba (5% GST + 7% PST = 12%)</option>
                                        <option value="15">New Brunswick (15% HST)</option>
                                        <option value="15">Newfoundland and Labrador (15% HST)</option>
                                        <option value="5">Northwest Territories (5% GST)</option>
                                        <option value="15">Nova Scotia (15% HST)</option>
                                        <option value="5">Nunavut (5% GST)</option>
                                        <option value="13">Ontario (13% HST)</option>
                                        <option value="15">Prince Edward Island (15% HST)</option>
                                        <option value="14.975">Quebec (5% GST + 9.975% QST ≈ 14.975%)</option>
                                        <option value="11">Saskatchewan (5% GST + 6% PST = 11%)</option>
                                        <option value="5">Yukon (5% GST)</option>
                                    </select>
                                    <p className="text-[9px] text-gray-400 font-medium ml-1">Selecting a province will automatically update your HST Rate below.</p>
                                </div>
                            </div>
                        </div>

                        {/* Regional & Financial Hub */}
                        <div className="card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <Plus size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Regional & Financial</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Localization & Receipts</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Default Currency</label>
                                        <select
                                            value={settings?.currency || 'CAD'}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        >
                                            <option value="CAD">CAD - Canadian Dollar</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="AED">AED - UAE Dirham</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">HST Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings?.taxRate || 0}
                                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                            className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Receipt Note</label>
                                    <textarea
                                        value={settings?.receiptNote || ''}
                                        onChange={(e) => setSettings({ ...settings, receiptNote: e.target.value })}
                                        rows={2}
                                        placeholder="Thank you for shopping at Mode AURA!"
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium resize-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Optimization */}
                        <div className="lg:col-span-2 card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                    <Globe size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Search Engine Visibility</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">SEO & Discoverability</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Google Search Title</label>
                                    <input
                                        type="text"
                                        value={settings?.seoTitle || ''}
                                        onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Meta Description</label>
                                    <textarea
                                        value={settings?.seoDescription || ''}
                                        onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                                        rows={3}
                                        className="w-full bg-gray-50 border border-[var(--mocha-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            {/* Google Search Preview */}
                            <div className="mt-10 pt-10 border-t border-[var(--mocha-border)]/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <Globe size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Search Preview</span>
                                </div>
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">M</div>
                                        <div>
                                            <div className="text-[14px] text-[#202124] leading-tight">modeaura.ca</div>
                                            <div className="text-[12px] text-[#4d5156] leading-tight">https://modeaura.ca</div>
                                        </div>
                                    </div>
                                    <h3 className="text-[20px] text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1 leading-tight">
                                        {settings?.seoTitle || settings?.storeName || 'Mode AURA - Luxury Modest Fashion'}
                                    </h3>
                                    <p className="text-[14px] text-[#4d5156] leading-relaxed">
                                        {settings?.seoDescription || settings?.tagline || 'Boutique collection of premium abayas and modest attire.'}
                                    </p>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-4 font-medium italic">* This is an approximation of how your site appears on Google search results.</p>
                            </div>
                        </div>

                        {/* Visual Identity Section */}
                        <div className="lg:col-span-2 card p-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-[var(--mocha-border)] pb-6">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <ImageIcon size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display italic text-[var(--text-primary)]">Visual Identity</h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Logo & Browser Assets</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Logo Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Primary Brand Logo</label>
                                    <div className="relative group aspect-video bg-gray-50 border border-dashed border-[var(--mocha-border)] rounded-[2rem] flex items-center justify-center overflow-hidden transition-all hover:border-[var(--gold)]/50">
                                        {settings?.logo ? (
                                            <>
                                                <img src={settings.logo} alt="Logo Preview" className="max-h-full max-w-full object-contain p-8" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all">
                                                        <Upload size={14} /> Replace Logo
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-4 group/btn">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover/btn:text-[var(--gold)] group-hover/btn:scale-110 transition-all">
                                                    <Upload size={24} strokeWidth={1.5} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-[var(--text-primary)] transition-colors">Upload Logo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-medium ml-1">Transparent PNG recommended (min. 400x400px)</p>
                                </div>

                                {/* Favicon Upload (The Icon) */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Search Result Icon (Favicon)</label>
                                    <div className="relative group aspect-square max-w-[200px] bg-gray-50 border border-dashed border-[var(--mocha-border)] rounded-[2rem] flex items-center justify-center overflow-hidden transition-all hover:border-[var(--gold)]/50">
                                        {settings?.favicon ? (
                                            <>
                                                <img src={settings.favicon} alt="Favicon Preview" className="w-16 h-16 object-contain" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all">
                                                        <Upload size={12} /> Replace
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-4 group/btn">
                                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover/btn:text-[var(--gold)] group-hover/btn:scale-110 transition-all">
                                                    <Upload size={20} strokeWidth={1.5} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-[var(--text-primary)] transition-colors">Favicon</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-medium ml-1">This appears next to your URL in Google results. (Square 32x32px recommended)</p>
                                </div>

                                {/* Social Image Upload (The Picture) */}
                                <div className="md:col-span-2 space-y-4 pt-6 border-t border-[var(--mocha-border)]/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Social Share Image (Search Picture)</label>
                                    <div className="relative group aspect-[1200/630] w-full bg-gray-50 border border-dashed border-[var(--mocha-border)] rounded-[2rem] flex items-center justify-center overflow-hidden transition-all hover:border-[var(--gold)]/50">
                                        {settings?.ogImage ? (
                                            <>
                                                <img src={settings.ogImage} alt="Social Image Preview" className="max-h-full max-w-full object-contain" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all">
                                                        <Upload size={14} /> Replace Image
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ogImage')} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-4 group/btn">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover/btn:text-[var(--gold)] group-hover/btn:scale-110 transition-all">
                                                    <Upload size={24} strokeWidth={1.5} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-[var(--text-primary)] transition-colors">Upload Search Picture</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ogImage')} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-medium ml-1">The image that appears when sharing links on Instagram/WhatsApp/Facebook. (1200x630px recommended)</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Terminal Content */
                    <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-right-4 duration-500">
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
            </div>

            <DashboardPageGuide
                pageName={{ en: activeTab === 'branding' ? "Brand Identity" : "Terminal Settings", ar: activeTab === 'branding' ? "الهوية التجارية" : "إعدادات المحطة" }}
                steps={[
                    {
                        title: { en: "Logo & Favicon", ar: "الشعار والأيقونة" },
                        description: {
                            en: "Upload your official logo and browser favicon to establish brand presence across all touchpoints.",
                            ar: "ارفع شعارك الرسمي وأيقونة المتصفح لتأسيس حضور العلامة التجارية عبر جميع نقاط الاتصال."
                        },
                        icon: "🎭"
                    },
                    {
                        title: { en: "Announcement Banner", ar: "لافتة الإعلان" },
                        description: {
                            en: "Set a site-wide announcement banner to promote sales, new arrivals, or important updates.",
                            ar: "عيّن لافتة إعلان على مستوى الموقع للترويج للتخفيضات والوافدين الجدد أو التحديثات المهمة."
                        },
                        icon: "📢"
                    },
                    {
                        title: { en: "SEO & Meta Tags", ar: "تحسين محركات البحث" },
                        description: {
                            en: "Configure meta title, description, and taglines for search engine optimization and social sharing.",
                            ar: "اضبط العنوان والوصف والشعارات لتحسين محركات البحث والمشاركة الاجتماعية."
                        },
                        icon: "🌐"
                    }
                ]}
            />
        </div>
    );
}
