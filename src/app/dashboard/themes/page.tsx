'use client'

import { useState, useEffect } from 'react'
import { getThemes, createTheme, activateTheme, deleteTheme } from '@/app/actions/themes'
import { Palette, Plus, Trash2, CheckCircle2, Moon, Sun, Sparkles, Loader2, PartyPopper, Leaf, Flower2 } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function ThemesPage() {
    const [themes, setThemes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [newTheme, setNewTheme] = useState({
        name: '',
        primaryColor: '#D4AF37',
        secondaryColor: '#1B2936',
        backgroundColor: '#FAF9F6',
        accentColor: '#C9A227',
        announcement: ''
    })

    useEffect(() => {
        loadThemes()
    }, [])

    async function loadThemes() {
        const data = await getThemes()
        setThemes(data)
        setLoading(false)
    }

    // Helper to get icon based on theme name
    const getThemeIcon = (name: string) => {
        if (name.includes('Ramadan')) return <Moon className="absolute top-4 right-4 text-black/5" size={32} />
        if (name.includes('Eid')) return <PartyPopper className="absolute top-4 right-4 text-black/5" size={32} />
        if (name.includes('Autumn')) return <Leaf className="absolute top-4 right-4 text-black/5" size={32} />
        if (name.includes('Spring')) return <Flower2 className="absolute top-4 right-4 text-black/5" size={32} />
        return <Sparkles className="absolute top-4 right-4 text-black/5" size={32} />
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)
        const result = await createTheme(newTheme)
        if (result.success) {
            setIsCreating(false)
            setNewTheme({
                name: '',
                primaryColor: '#D4AF37',
                secondaryColor: '#1B2936',
                backgroundColor: '#FAF9F6',
                accentColor: '#C9A227',
                announcement: ''
            })
            loadThemes()
        } else {
            alert('Failed to create theme: ' + result.error)
        }
        setIsSaving(false)
    }

    async function handleActivate(id: string) {
        const result = await activateTheme(id)
        if (result.success) {
            loadThemes()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this theme?')) return
        const result = await deleteTheme(id)
        if (result.success) {
            loadThemes()
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-[var(--text-primary)]/50 animate-pulse font-display italic">Loading Atelier Themes...</div>
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--gold)]">Seasonal Customization</p>
                    <h1 className="text-4xl font-display italic text-[var(--text-primary)]">Atelier Themes</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            const { seedThemes } = await import('@/app/actions/themes')
                            if (confirm('Curate seasonal presets?')) {
                                const result = await seedThemes()
                                if (result.success) {
                                    window.location.reload()
                                } else {
                                    alert('Seeding failed: ' + result.error)
                                }
                            }
                        }}
                        className="p-3 text-[var(--text-secondary)] hover:text-[var(--gold)] border border-[var(--mocha-border)] rounded-full transition-all"
                        title="Seed Presets"
                    >
                        <Sparkles size={20} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="gold-btn px-8 py-3 flex items-center gap-2"
                    >
                        <Plus size={18} /> New Seasonal Theme
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Standard Theme Card */}
                <div className={`card overflow-hidden group border-2 transition-all ${themes.every(t => !t.isActive) ? 'border-[var(--gold)] shadow-xl' : 'border-transparent'}`}>
                    <div className="h-24 bg-gradient-to-br from-[#FAF9F6] to-[#EBE9E1] flex items-center justify-center">
                        <Sun className="text-[var(--gold)]/20" size={48} />
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Standard Boutique</h3>
                                <p className="text-xs text-gray-500 font-medium">The original Mode Aura identity</p>
                            </div>
                            {themes.every(t => !t.isActive) && <CheckCircle2 className="text-[var(--gold)]" size={24} />}
                        </div>
                        <button
                            disabled={themes.every(t => !t.isActive)}
                            onClick={() => handleActivate('standard')}
                            className={`w-full py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${themes.every(t => !t.isActive) ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[var(--text-primary)] text-white hover:bg-black'}`}
                        >
                            {themes.every(t => !t.isActive) ? 'Active Design' : 'Restore Standard'}
                        </button>
                    </div>
                </div>

                {/* Seasonal Themes */}
                {themes.map((theme) => (
                    <div key={theme.id} className={`card overflow-hidden group border-2 transition-all ${theme.isActive ? 'border-[var(--gold)] shadow-xl' : 'border-transparent'}`}>
                        <div
                            className="h-24 flex items-center justify-center relative"
                            style={{ backgroundColor: theme.backgroundColor }}
                        >
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: theme.primaryColor }} />
                                <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: theme.accentColor }} />
                            </div>
                            {getThemeIcon(theme.name)}
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{theme.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{theme.announcement || 'No special announcement'}</p>
                                </div>
                                {theme.isActive && <CheckCircle2 className="text-[var(--gold)]" size={24} />}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    disabled={theme.isActive}
                                    onClick={() => handleActivate(theme.id)}
                                    className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${theme.isActive ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[var(--text-primary)] text-white hover:bg-black'}`}
                                >
                                    {theme.isActive ? 'Active Theme' : 'Activate Theme'}
                                </button>
                                <button
                                    onClick={() => handleDelete(theme.id)}
                                    className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Theme Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl my-auto">
                        <form onSubmit={handleCreate} className="p-6 lg:p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl lg:text-3xl font-display italic text-[var(--text-primary)]">Curate Seasonal Theme</h2>
                                <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-black">✕</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Theme Occasion</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Ramadan Mubarak 2026"
                                        value={newTheme.name}
                                        onChange={e => setNewTheme({ ...newTheme, name: e.target.value })}
                                        className="w-full bg-[#FAF9F6] border border-[#EBE9E1] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--gold)] transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">Color Palette</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={newTheme.primaryColor} onChange={e => setNewTheme({ ...newTheme, primaryColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-none p-0" />
                                            <span className="text-[10px] font-bold text-gray-700">Primary Color</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={newTheme.accentColor} onChange={e => setNewTheme({ ...newTheme, accentColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-none p-0" />
                                            <span className="text-[10px] font-bold text-gray-700">Accent Color</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={newTheme.backgroundColor} onChange={e => setNewTheme({ ...newTheme, backgroundColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-none p-0" />
                                            <span className="text-[10px] font-bold text-gray-700">Background Tint</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">Preview</label>
                                    <div className="aspect-square rounded-[2rem] border-4 border-white shadow-xl flex flex-col overflow-hidden" style={{ backgroundColor: newTheme.backgroundColor }}>
                                        <div className="h-6 w-full" style={{ backgroundColor: newTheme.primaryColor }} />
                                        <div className="flex-1 flex items-center justify-center">
                                            <Sparkles className="animate-pulse" style={{ color: newTheme.accentColor }} size={32} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Seasonal Announcement</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ramadan Kareem from Mode Aura Windsor"
                                        value={newTheme.announcement}
                                        onChange={e => setNewTheme({ ...newTheme, announcement: e.target.value })}
                                        className="w-full bg-[#FAF9F6] border border-[#EBE9E1] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--gold)] transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full gold-btn py-5 rounded-full flex items-center justify-center gap-3 shadow-xl"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                Save Atelier Theme
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Theme Designer", ar: "مصمم السمات" }}
                steps={[
                    {
                        title: { en: "Theme Gallery", ar: "معرض السمات" },
                        description: {
                            en: "Browse your collection of themes with color previews. The active theme is highlighted with a gold border.",
                            ar: "تصفح مجموعة السمات مع معاينة الألوان. السمة النشطة مميزة بإطار ذهبي."
                        },
                        icon: "🎨"
                    },
                    {
                        title: { en: "Create Theme", ar: "إنشاء سمة" },
                        description: {
                            en: "Design a new theme by defining a name, primary color, background, text, and accent colors.",
                            ar: "صمم سمة جديدة بتحديد الاسم واللون الأساسي والخلفية والنص وألوان التمييز."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Activate & Deploy", ar: "تفعيل ونشر" },
                        description: {
                            en: "Click 'Activate' on any theme to instantly apply it across your entire storefront.",
                            ar: "انقر على 'تفعيل' على أي سمة لتطبيقها فوراً على واجهة متجرك بالكامل."
                        },
                        icon: "🚀"
                    }
                ]}
            />
        </div>
    )
}
