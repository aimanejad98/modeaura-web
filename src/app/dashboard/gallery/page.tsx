'use client'

import { useState, useEffect, useRef } from 'react'
import { getMediaAssets, uploadToGallery, deleteFromGallery } from '@/app/actions/media'
import { Trash2, Upload, Copy, Check, Image as ImageIcon, Search } from 'lucide-react'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function GalleryPage() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadAssets()
    }, [])

    async function loadAssets() {
        setLoading(true)
        const data = await getMediaAssets()
        setAssets(data)
        setLoading(false)
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const uploadPromises = Array.from(files).map(file => {
            const formData = new FormData()
            formData.append('file', file)
            return uploadToGallery(formData)
        })

        try {
            const results = await Promise.allSettled(uploadPromises)
            const successful = results.filter(r => r.status === 'fulfilled').length
            const failed = results.filter(r => r.status === 'rejected').length

            if (failed > 0) {
                console.error('Some uploads failed', results.filter(r => r.status === 'rejected'))
                alert(`Upload complete: ${successful} successful, ${failed} failed.`)
            }

            if (successful > 0) {
                await loadAssets()
            }
        } catch (error) {
            console.error('Critical upload error:', error)
            alert('Upload process encountered an error.')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this asset? This cannot be undone.')) return

        const success = await deleteFromGallery(id)
        if (success) {
            setAssets(assets.filter(a => a.id !== id))
        } else {
            alert('Delete failed.')
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredAssets = assets.filter(asset =>
        asset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Opening Atelier Vault...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Control Panel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-10 rounded-[2.5rem] border border-[#E8E2D9] shadow-sm">
                <div className="space-y-2">
                    <h2 className="text-4xl font-display italic text-[#1B2936] tracking-tight">Media Library</h2>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.3em]">Central Asset Management & Optimization</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[var(--gold)] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ATELIER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40 w-64 lg:w-80 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gold-btn lg:px-10 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-[var(--gold)]/10 disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="animate-pulse">UPLOADING...</span>
                        ) : (
                            <>
                                <Upload size={16} />
                                <span>ADD TO LIBRARY</span>
                            </>
                        )}
                    </button>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            {filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAssets.map((asset) => (
                        <div key={asset.id} className="group relative bg-white rounded-[2rem] border border-[#E8E2D9] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
                            {/* Asset Image Container */}
                            <div className="aspect-square bg-[#F5F2ED] relative overflow-hidden">
                                <img
                                    src={asset.url}
                                    alt={asset.filename}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/40 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all transform hover:scale-110"
                                            title="Permanently Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => copyToClipboard(asset.url, asset.id)}
                                            className="w-full bg-white/90 hover:bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-md transition-all"
                                        >
                                            {copiedId === asset.id ? (
                                                <>
                                                    <Check size={12} className="text-green-600" />
                                                    <span>COPIED</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>PATH URL</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Footer */}
                            <div className="p-5 space-y-1">
                                <p className="text-[10px] font-black truncate text-[#1B2936] uppercase tracking-wider">{asset.filename}</p>
                                <div className="flex items-center justify-between text-[8px] font-bold text-black/30 uppercase tracking-widest">
                                    <span>{(asset.size / 1024).toFixed(1)} KB</span>
                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white/50 rounded-[4rem] border border-dashed border-[#E8E2D9]">
                    <div className="w-20 h-20 rounded-full bg-[#F5F2ED] flex items-center justify-center text-black/10">
                        <ImageIcon size={40} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-display italic text-black/40">Vault is Empty</h3>
                        <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.4em]">Start building your digital atelier collection</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="editorial-meta text-[var(--gold)]/60 hover:text-[var(--gold)] border-b border-[var(--gold)]/20 pb-1"
                    >
                        INITIALIZE FIRST UPLOAD
                    </button>
                </div>
            )}

            <style jsx global>{`
                .gold-btn {
                    background: #1B2936;
                    color: white;
                    border: none;
                    font-weight: 900;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .gold-btn:hover {
                    background: var(--gold);
                    transform: translateY(-2px);
                }
            `}</style>

            <DashboardPageGuide
                pageName={{ en: "Media Gallery", ar: "معرض الوسائط" }}
                steps={[
                    {
                        title: { en: "Upload Assets", ar: "رفع الملفات" },
                        description: {
                            en: "Upload images to your media library for use across products, banners, and marketing materials.",
                            ar: "ارفع صوراً إلى مكتبة الوسائط لاستخدامها في المنتجات واللافتات والمواد التسويقية."
                        },
                        icon: "⬆️"
                    },
                    {
                        title: { en: "Copy URLs", ar: "نسخ الروابط" },
                        description: {
                            en: "Click on any image to copy its URL to clipboard for quick embedding in other pages.",
                            ar: "انقر على أي صورة لنسخ رابطها إلى الحافظة للتضمين السريع في صفحات أخرى."
                        },
                        icon: "📋"
                    },
                    {
                        title: { en: "Asset Management", ar: "إدارة الملفات" },
                        description: {
                            en: "Search, filter, and delete media assets to keep your library organized and optimized.",
                            ar: "ابحث وصفّ واحذف ملفات الوسائط للحفاظ على مكتبة منظمة ومحسّنة."
                        },
                        icon: "🖼️"
                    }
                ]}
            />
        </div>
    )
}
