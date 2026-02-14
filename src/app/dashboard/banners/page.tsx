'use client'

import { useState, useEffect, useRef } from 'react'
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/app/actions/banners'
import { uploadImage } from '@/app/actions/upload'
import MediaPicker from '@/components/MediaPicker'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [showPicker, setShowPicker] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        title: '', subtitle: '', image: '', link: '', designLayout: 'Full', order: 0, active: true
    })
    const imageRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadBanners()
    }, [])

    async function loadBanners() {
        setLoading(true)
        const data = await getBanners()
        setBanners(data)
        setLoading(false)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        try {
            const url = await uploadImage(formDataUpload)
            setFormData({ ...formData, image: url })
        } catch (error) {
            console.error('Upload failed:', error)
        }
        setUploading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.image) {
            alert('Please upload an image')
            return
        }
        try {
            setUploading(true)
            await addBanner(formData)
            setFormData({ title: '', subtitle: '', image: '', link: '', designLayout: 'Full', order: banners.length + 1, active: true })
            setShowAdd(false)
            await loadBanners()
        } catch (error) {
            console.error('Add failed:', error)
            alert('Failed to add banner. Check console for details.')
        } finally {
            setUploading(false)
        }
    }

    async function handleToggle(id: string, active: boolean) {
        try {
            await updateBanner(id, { active: !active })
            await loadBanners()
        } catch (error) {
            console.error('Toggle failed:', error)
            alert('Failed to update banner.')
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this banner?')) {
            try {
                await deleteBanner(id)
                await loadBanners()
            } catch (error) {
                console.error('Delete failed:', error)
                alert('Failed to delete banner.')
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#D4AF37] font-bold animate-pulse">Loading banners...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Homepage Banners</h2>
                    <p className="text-gray-500 mt-1">{banners.length} banners • Hero images for your website</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="gold-btn">
                    + Add Banner
                </button>
            </div>

            {/* Banners List */}
            <div className="space-y-4">
                {banners.map((banner, index) => (
                    <div key={banner.id} className="card p-4 flex items-center gap-6">
                        <div className="text-2xl font-black text-gray-300 w-8">
                            #{index + 1}
                        </div>

                        <div className="w-48 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{banner.title}</h3>
                            {banner.subtitle && (
                                <p className="text-gray-500 text-sm">{banner.subtitle}</p>
                            )}
                            {banner.link && (
                                <p className="text-xs text-blue-500 mt-1">🔗 {banner.link}</p>
                            )}
                            <div className="mt-2 inline-block px-2 py-0.5 bg-gray-50 text-[8px] font-black uppercase tracking-widest text-gray-400 rounded-md border border-gray-100">
                                Style: {banner.designLayout || 'Full'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleToggle(banner.id, banner.active)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold ${banner.active
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {banner.active ? '✓ Active' : 'Inactive'}
                            </button>
                            <button
                                onClick={() => handleDelete(banner.id)}
                                className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length === 0 && (
                <div className="card p-16 text-center text-gray-400">
                    <div className="text-4xl mb-4">🖼️</div>
                    <p className="font-bold">No banners yet</p>
                    <p className="text-sm">Add hero images that will appear on your website homepage</p>
                </div>
            )}

            {/* Add Banner Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg animate-fade-in">
                        <h3 className="text-2xl font-black mb-6">Add Banner</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Image Selection */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Banner Image *</label>
                                {formData.image ? (
                                    <div className="relative group">
                                        <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setShowPicker(true)}
                                                className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Change
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setShowPicker(true)}
                                        className="block w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#D4AF37] cursor-pointer flex items-center justify-center transition-all"
                                    >
                                        <div className="text-center">
                                            <div className="text-4xl mb-2 text-gray-300">🖼️</div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select from Atelier Library</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Title *</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g., New Collection 2025"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Subtitle</label>
                                <input
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="e.g., Discover the latest in modest fashion"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Link URL</label>
                                <input
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="e.g., /collections/new"
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Design Layout</label>
                                <select
                                    value={formData.designLayout}
                                    onChange={(e) => setFormData({ ...formData, designLayout: e.target.value })}
                                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                                >
                                    <option value="Full">Full Background</option>
                                    <option value="Split-Left">Split Screen (Text Left)</option>
                                    <option value="Split-Right">Split Screen (Text Right)</option>
                                    <option value="Glass">Glassmorphism Overlay</option>
                                    <option value="Minimal">Minimal (Centric)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 gold-btn py-4">
                                    Add Banner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Media Picker Modal */}
            {showPicker && (
                <MediaPicker
                    onSelect={(url) => setFormData({ ...formData, image: url })}
                    onClose={() => setShowPicker(false)}
                    title="Select Banner Image"
                />
            )}

            <DashboardPageGuide
                pageName={{ en: "Banner Carousel", ar: "عرض اللافتات" }}
                steps={[
                    {
                        title: { en: "Banner Gallery", ar: "معرض اللافتات" },
                        description: {
                            en: "View all homepage banners with their images, headings, subheadings, and active status.",
                            ar: "عرض جميع لافتات الصفحة الرئيسية مع صورها وعناوينها وعناوينها الفرعية وحالة التفعيل."
                        },
                        icon: "🖼️"
                    },
                    {
                        title: { en: "Create Banner", ar: "إنشاء لافتة" },
                        description: {
                            en: "Add a new banner with an image, heading, subheading, call-to-action button, and link URL.",
                            ar: "أضف لافتة جديدة بصورة وعنوان وعنوان فرعي وزر دعوة للإجراء ورابط."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Toggle & Reorder", ar: "تبديل وإعادة ترتيب" },
                        description: {
                            en: "Activate or deactivate banners instantly. Active banners rotate on the storefront carousel.",
                            ar: "تفعيل أو تعطيل اللافتات فوراً. اللافتات النشطة تدور على عرض واجهة المتجر."
                        },
                        icon: "🔄"
                    }
                ]}
            />
        </div>
    )
}
