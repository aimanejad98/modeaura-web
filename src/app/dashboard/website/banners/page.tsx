'use client';

import { useState, useEffect, useRef } from 'react';
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/app/actions/banners';
import { uploadImage } from '@/app/actions/upload';

import MediaPicker from '@/components/MediaPicker';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', subtitle: '', image: '', link: '', designLayout: 'Full', order: 0, active: true,
        textColor: '#000000', subtitleColor: '#D4AF37',
        titleFont: 'font-display italic', subtitleFont: 'font-sans', buttonText: 'Discover More'
    });
    const imageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadBanners();
    }, []);

    async function loadBanners() {
        setLoading(true);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (err) {
            console.error('Failed to load banners:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const url = await uploadImage(formDataUpload);
            setFormData({ ...formData, image: url });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    function handleEdit(banner: any) {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            image: banner.image,
            link: banner.link || '',
            designLayout: banner.designLayout || 'Full',
            order: banner.order,
            active: banner.active,
            textColor: banner.textColor || '#000000',
            subtitleColor: banner.subtitleColor || '#D4AF37',
            titleFont: banner.titleFont || 'font-display italic',
            subtitleFont: banner.subtitleFont || 'font-sans',
            buttonText: banner.buttonText || 'Discover More'
        });
        setShowAdd(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.image) {
            alert('Please upload an image');
            return;
        }
        try {
            setUploading(true);
            if (editingBanner) {
                // Update existing banner
                await updateBanner(editingBanner.id, formData);
            } else {
                // Add new banner
                await addBanner(formData);
            }
            setFormData({
                title: '', subtitle: '', image: '', link: '', designLayout: 'Full',
                order: banners.length + 1, active: true, textColor: '#000000', subtitleColor: '#D4AF37',
                titleFont: 'font-display italic', subtitleFont: 'font-sans', buttonText: 'Discover More'
            });
            setShowAdd(false);
            setEditingBanner(null);
            await loadBanners();
        } catch (error) {
            console.error(editingBanner ? 'Update failed:' : 'Add failed:', error);
            alert(`Failed to ${editingBanner ? 'update' : 'add'} banner. Check console for details.`);
        } finally {
            setUploading(false);
        }
    }

    async function handleToggle(id: string, active: boolean) {
        try {
            await updateBanner(id, { active: !active });
            await loadBanners();
        } catch (error) {
            console.error('Toggle failed:', error);
            alert('Failed to update banner.');
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this banner?')) {
            try {
                await deleteBanner(id);
                await loadBanners();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete banner.');
            }
        }
    }

    // Banner Preview Component (Internal)
    const BannerPreview = ({ data }: { data: typeof formData }) => {
        const slide = data;
        const layout = slide.designLayout || 'Full';

        // Mock the slide rendering from HeroSlider
        return (
            <div className="relative w-full h-64 md:h-96 overflow-hidden bg-[#FAF7F2] rounded-xl border border-[var(--gold)]/20 shadow-2xl">
                {/* Full Layout */}
                {layout === 'Full' && (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image || '/placeholder.jpg'})` }}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30" />
                        <div className="relative h-full w-full flex items-center justify-center text-center">
                            <div className="max-w-xl space-y-4">
                                <div className="max-w-xl space-y-4">
                                    <h5 className={`${slide.subtitleFont || 'font-sans'} uppercase tracking-[0.6em] text-[10px]`} style={{ color: slide.subtitleColor || 'var(--gold)' }}>{slide.subtitle || 'Subtitle'}</h5>
                                    <h1 className={`text-3xl md:text-5xl ${slide.titleFont || 'font-display italic'}`} style={{ color: slide.textColor || 'white' }}>{slide.title || 'Banner Title'}</h1>
                                    <span className="inline-block px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'black' }}>{slide.buttonText || 'Shop Now'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Split Layouts */}
                {(layout === 'Split-Left' || layout === 'Split-Right' || layout === 'Split-Blur-Left' || layout === 'Split-Blur-Right') && (
                    <div className={`flex h-full ${layout.includes('Right') ? 'flex-row-reverse' : ''}`}>
                        <div className="w-1/2 h-full flex items-center justify-center p-8 bg-white relative z-10">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="space-y-4 text-center md:text-left">
                                    <h5 className={`${slide.subtitleFont || 'font-sans'} uppercase tracking-[0.4em] text-[8px]`} style={{ color: slide.subtitleColor || 'var(--gold)' }}>{slide.subtitle || 'Subtitle'}</h5>
                                    <h1 className={`text-2xl md:text-4xl ${slide.titleFont || 'font-display italic'} leading-tight`} style={{ color: slide.textColor || '#111827' }}>{slide.title || 'Title'}</h1>
                                    <span className="inline-block border-2 px-6 py-2 text-[8px] font-black uppercase tracking-[0.2em]" style={{ borderColor: slide.textColor || 'black', color: slide.textColor || 'black' }}>{slide.buttonText || 'Discover'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 h-full relative">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image || '/placeholder.jpg'})` }} />
                            {layout === 'Split-Blur-Left' && <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>}
                            {layout === 'Split-Blur-Right' && <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>}
                        </div>
                    </div>
                )}

                {/* Glass Layout */}
                {layout === 'Glass' && (
                    <div className="h-full flex items-center justify-center p-8 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image || '/placeholder.jpg'})` }}>
                        <div className="backdrop-blur-md bg-white/10 p-8 rounded-3xl border border-white/20 text-center space-y-4 max-w-sm">
                            <h1 className={`text-2xl ${slide.titleFont || 'font-display italic'} text-white`} style={{ color: slide.textColor || 'white' }}>{slide.title || 'Title'}</h1>
                            <p className={`text-white/80 text-xs ${slide.subtitleFont || 'font-sans'}`} style={{ color: slide.subtitleColor || 'white' }}>{slide.subtitle || 'Subtitle'}</p>
                            <span className="inline-block bg-[var(--gold)] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase">{slide.buttonText || 'View'}</span>
                        </div>
                    </div>
                )}

                {/* Minimal Layout */}
                {layout === 'Minimal' && (
                    <div className="absolute inset-0 bg-cover bg-center flex flex-col justify-end p-8" style={{ backgroundImage: `url(${slide.image || '/placeholder.jpg'})` }}>
                        <div className="space-y-2">
                            <div className="w-8 h-0.5 bg-[var(--gold)]" />
                            <h1 className={`text-2xl font-black uppercase ${slide.titleFont || ''}`} style={{ color: slide.textColor || 'white' }}>{slide.title || 'Title'}</h1>
                            <span className={`text-[10px] uppercase tracking-widest text-[var(--gold)] ${slide.subtitleFont || ''}`}>{slide.buttonText || 'Shop'} →</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[var(--text-primary)]/50 animate-pulse font-display italic">Loading banners...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ... (Header) ... */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display text-[var(--text-primary)] italic">Banners</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Manage homepage hero & promotional slides</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="gold-btn px-6 py-2 text-xs">
                    + Add New Banner
                </button>
            </div>

            {/* Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="card overflow-hidden group">
                        <div className="aspect-[16/9] relative overflow-hidden">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 right-4">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border backdrop-blur-md cursor-pointer ${banner.active
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                    : 'bg-red-500/10 border-red-500/20 text-red-600'
                                    }`}
                                    onClick={() => handleToggle(banner.id, banner.active)}
                                >
                                    {banner.active ? 'LIVE' : 'DRAFT'}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-black/50 backdrop-blur-md text-white/70 uppercase tracking-widest border border-white/10">
                                    {banner.designLayout || 'Full'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-[var(--text-primary)] font-bold">{banner.title}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 line-clamp-1">{banner.subtitle}</p>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-[var(--mocha-border)]">
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest border border-[var(--gold)]/20 hover:bg-[var(--gold)]/10 rounded-xl transition-all text-[var(--gold)]"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="px-4 py-2 hover:bg-red-500/10 rounded transition-colors text-red-400"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Banner Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-[#1B2936] border border-[#D4AF37] p-8 w-full max-w-4xl shadow-2xl shadow-[var(--gold)]/10 relative overflow-hidden rounded-2xl my-8">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50"></div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-display text-white tracking-wide">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
                            <button onClick={() => setShowAdd(false)} className="text-white/50 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form Column */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Banner Image *</label>
                                    {formData.image ? (
                                        <div className="relative group">
                                            <img src={formData.image} alt="Preview" className="w-full h-32 object-cover border border-white/10 rounded-lg" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMediaPicker(true)}
                                                    className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-[var(--gold)] transition-colors"
                                                >
                                                    CHANGE
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, image: '' })}
                                                    className="bg-red-500/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowMediaPicker(true)}
                                            className="w-full h-32 bg-black/20 border border-dashed border-white/10 hover:border-[var(--gold)] cursor-pointer flex flex-col items-center justify-center transition-all group rounded-lg gap-3"
                                        >
                                            <div className="p-3 bg-white/5 rounded-full group-hover:bg-[var(--gold)]/20 transition-colors">
                                                <span className="text-2xl">🖼️</span>
                                            </div>
                                            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:text-[var(--gold)]">
                                                Open Atelier Library
                                            </span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Title *</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Subtitle</label>
                                        <input
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Text Color (Title)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.textColor || '#000000'}
                                                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                                className="h-10 w-10 bg-transparent border-0 cursor-pointer"
                                            />
                                            <div className="flex gap-1">
                                                {['#D4AF37', '#FFFFFF', '#000000'].map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, textColor: color })}
                                                        className="w-10 h-10 rounded-lg border border-white/10"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Subtitle Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.subtitleColor || '#D4AF37'}
                                                onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                                                className="h-10 w-10 bg-transparent border-0 cursor-pointer"
                                            />
                                            <div className="flex gap-1">
                                                {['#D4AF37', '#FFFFFF', '#000000'].map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, subtitleColor: color })}
                                                        className="w-10 h-10 rounded-lg border border-white/10"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Title Font</label>
                                        <select
                                            value={formData.titleFont}
                                            onChange={(e) => setFormData({ ...formData, titleFont: e.target.value })}
                                            className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                            style={{ backgroundColor: '#1B2936' }}
                                        >
                                            <option value="font-display italic">Luxury Italic (Garamond)</option>
                                            <option value="font-display">Luxury Classic (Garamond)</option>
                                            <option value="font-sans font-black uppercase">Modern Bold (Inter)</option>
                                            <option value="font-sans italic">Modern Italic (Inter)</option>
                                            <option value="font-sans">Modern Clean (Inter)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Subtitle Font</label>
                                        <select
                                            value={formData.subtitleFont}
                                            onChange={(e) => setFormData({ ...formData, subtitleFont: e.target.value })}
                                            className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                            style={{ backgroundColor: '#1B2936' }}
                                        >
                                            <option value="font-sans">Modern Clean (Inter)</option>
                                            <option value="font-sans italic">Modern Italic (Inter)</option>
                                            <option value="font-display italic">Luxury Italic (Garamond)</option>
                                            <option value="font-display">Luxury Classic (Garamond)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Button Text</label>
                                        <input
                                            value={formData.buttonText}
                                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                            placeholder="Discover More"
                                            className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Button Link (URL)</label>
                                        <input
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder="/shop or https://..."
                                            className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3968C] mb-2 block">Layout</label>
                                    <select
                                        value={formData.designLayout}
                                        onChange={(e) => setFormData({ ...formData, designLayout: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 p-3 text-white outline-none focus:border-[var(--gold)] rounded-lg"
                                        style={{ backgroundColor: '#1B2936' }}
                                    >
                                        <option value="Full">Full Background</option>
                                        <option value="Split-Left">Split (Text Left)</option>
                                        <option value="Split-Right">Split (Text Right)</option>
                                        <option value="Split-Blur-Left">Split with Blur (Text Left)</option>
                                        <option value="Split-Blur-Right">Split with Blur (Text Right)</option>
                                        <option value="Glass">Glass Overlay</option>
                                        <option value="Minimal">Minimal</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={uploading} className="flex-1 bg-[var(--gold)] text-[#1B2936] py-3 text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.2)]">
                                        {editingBanner ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>

                            {/* Preview Column */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold)] mb-2 block">Live Preview</label>
                                <BannerPreview data={formData} />
                                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">
                                    * Preview approximation. Actual rendering may vary slightly based on screen size.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <MediaPicker
                    onSelect={(url) => {
                        setFormData({ ...formData, image: url });
                        setShowMediaPicker(false);
                    }}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}

            <DashboardPageGuide
                pageName={{ en: "Website Banners", ar: "لافتات الموقع" }}
                steps={[
                    {
                        title: { en: "Banner Collection", ar: "مجموعة اللافتات" },
                        description: {
                            en: "Manage your homepage hero banners. Preview how each banner looks with its overlay text and CTA button.",
                            ar: "إدارة لافتات البطل في الصفحة الرئيسية. معاينة كيف تبدو كل لافتة مع النص وزر الدعوة."
                        },
                        icon: "🎠"
                    },
                    {
                        title: { en: "Create & Edit", ar: "إنشاء وتعديل" },
                        description: {
                            en: "Design banners with image, heading, subtitle, CTA text, link, overlay color, and text alignment.",
                            ar: "صمم لافتات بصورة وعنوان وعنوان فرعي ونص CTA ورابط ولون التراكب ومحاذاة النص."
                        },
                        icon: "✏️"
                    },
                    {
                        title: { en: "Live Preview", ar: "معاينة مباشرة" },
                        description: {
                            en: "See real-time banner previews as you customize settings before publishing to your storefront.",
                            ar: "شاهد معاينة اللافتات في الوقت الفعلي أثناء تخصيص الإعدادات قبل النشر على واجهة المتجر."
                        },
                        icon: "👁️"
                    }
                ]}
            />
        </div>
    );
}
