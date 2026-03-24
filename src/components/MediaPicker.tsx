'use client'

import { useState, useEffect } from 'react'
import { getMediaAssets, uploadToGallery } from '@/app/actions/media'
import { Image as ImageIcon, Upload, Check, Search, X, ZoomIn } from 'lucide-react'

interface MediaPickerProps {
    onSelect: (url: string) => void;
    onMultiSelect?: (urls: string[]) => void;
    onClose: () => void;
    title?: string;
    multiSelect?: boolean;
}

export default function MediaPicker({ onSelect, onMultiSelect, onClose, title = "Atelier Library", multiSelect = false }: MediaPickerProps) {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
    const [previewAsset, setPreviewAsset] = useState<any>(null)

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
        try {
            const uploadPromises = Array.from(files).map(file => {
                const formData = new FormData()
                formData.append('file', file)
                return uploadToGallery(formData)
            })

            const results = await Promise.allSettled(uploadPromises)
            const successful = results.filter(r => r.status === 'fulfilled')
            const failed = results.filter(r => r.status === 'rejected').length

            if (failed > 0) {
                alert(`${successful.length} uploaded, ${failed} failed.`)
            }

            if (successful.length > 0) {
                await loadAssets()
                // If single select & single upload, auto-select it
                if (!multiSelect && successful.length === 1 && successful[0].status === 'fulfilled') {
                    const asset = (successful[0] as PromiseFulfilledResult<any>).value
                    onSelect(asset.url)
                    onClose()
                }
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed.')
        } finally {
            setUploading(false)
        }
    }

    function toggleMultiSelect(url: string) {
        setSelectedUrls(prev => {
            const next = new Set(prev)
            if (next.has(url)) next.delete(url)
            else next.add(url)
            return next
        })
    }

    function handleInsert() {
        if (multiSelect && onMultiSelect) {
            onMultiSelect(Array.from(selectedUrls))
            onClose()
        } else if (selectedUrl) {
            onSelect(selectedUrl)
            onClose()
        }
    }

    const filteredAssets = assets.filter(asset =>
        asset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const hasSelection = multiSelect ? selectedUrls.size > 0 : !!selectedUrl

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl bg-[#FAF9F6] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col h-[85vh]">

                {/* Header */}
                <div className="p-8 lg:p-12 border-b border-[#E8E2D9] flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-display italic text-[#1B2936]">{title}</h3>
                        <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.4em]">
                            {multiSelect ? 'Select multiple assets' : 'Select or upload atelier assets'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-[#F5F2ED] rounded-full transition-colors">
                        <X size={24} className="text-black/40" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-8 lg:px-12 py-6 bg-white border-b border-[#E8E2D9] flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH LIBRARY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#FAF9F6] border border-[#E8E2D9] rounded-2xl pl-12 pr-6 py-3 text-[9px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40"
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className={`
                            cursor-pointer bg-[#1B2936] text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-[var(--gold)] hover:-translate-y-0.5
                            ${uploading ? 'opacity-50 pointer-events-none' : ''}
                        `}>
                            <Upload size={14} />
                            {uploading ? 'UPLOADING...' : 'UPLOAD NEW'}
                            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" multiple={multiSelect} />
                        </label>

                        {hasSelection && (
                            <button
                                onClick={handleInsert}
                                className="bg-[var(--gold)] text-white px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-right-4"
                            >
                                <Check size={14} />
                                {multiSelect ? `INSERT ${selectedUrls.size} IMAGE${selectedUrls.size > 1 ? 'S' : ''}` : 'INSERT SELECTION'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
                            <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest">FETCHING ASSETS...</p>
                        </div>
                    ) : filteredAssets.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {filteredAssets.map((asset) => {
                                const isSelected = multiSelect ? selectedUrls.has(asset.url) : selectedUrl === asset.url

                                return (
                                    <div
                                        key={asset.id}
                                        className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
                                    >
                                        <div
                                            onClick={() => {
                                                if (multiSelect) {
                                                    toggleMultiSelect(asset.url)
                                                } else {
                                                    setSelectedUrl(asset.url)
                                                }
                                            }}
                                            className={`w-full h-full ${isSelected ? 'ring-4 ring-[var(--gold)] ring-offset-4 ring-offset-[#FAF9F6] rounded-3xl' : 'hover:scale-[0.98] border border-[#E8E2D9] rounded-3xl'}`}
                                        >
                                            <img
                                                src={asset.url}
                                                alt={asset.filename}
                                                className="w-full h-full object-cover rounded-3xl"
                                            />
                                        </div>

                                        {/* Selection indicator */}
                                        <div className={`
                                            absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-3xl
                                            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}
                                        `}>
                                            <div className="bg-[var(--gold)] text-white p-3 rounded-full shadow-xl">
                                                <Check size={20} />
                                            </div>
                                        </div>

                                        {/* Enlarge button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset) }}
                                            className="absolute top-2 right-2 p-2 bg-white/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg z-10"
                                            title="Enlarge preview"
                                        >
                                            <ZoomIn size={14} className="text-black" />
                                        </button>

                                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-3xl">
                                            <p className="text-[7px] font-black text-white/90 uppercase tracking-widest truncate">{asset.filename}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 text-black/10">
                            <ImageIcon size={60} />
                            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">No matching assets found</p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-12 py-6 bg-white border-t border-[#E8E2D9] flex justify-between items-center text-[8px] font-black text-black/30 uppercase tracking-[0.3em]">
                    <span>{filteredAssets.length} PIECES DISCOVERED</span>
                    <span className="text-[var(--gold)]">MODE AURA ATELIER V7</span>
                </div>
            </div>

            {/* Enlarge Preview Modal (within picker) */}
            {previewAsset && (
                <div
                    className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
                    onClick={() => setPreviewAsset(null)}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <div className="relative max-w-[85vw] max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewAsset(null)}
                            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center text-black hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <img
                            src={previewAsset.url}
                            alt={previewAsset.filename}
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                        />
                        <p className="text-center text-white/70 text-xs mt-3 font-bold">{previewAsset.filename}</p>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E2D9; border-radius: 10px; }
            `}</style>
        </div>
    )
}
