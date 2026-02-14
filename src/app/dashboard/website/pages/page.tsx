'use client';

import { useState, useEffect } from 'react';
import { getPages, upsertPage, deletePage } from '@/app/actions/pages';
import { Plus, Edit2, Trash2, Globe, FileText, AlertCircle } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function CustomPagesPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        status: 'Draft'
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const data = await getPages();
        setPages(data);
        setLoading(false);
    }

    function handleOpenModal(page: any = null) {
        if (page) {
            setEditingPage(page);
            setFormData({
                title: page.title,
                slug: page.slug,
                content: page.content || '',
                status: page.status
            });
        } else {
            setEditingPage(null);
            setFormData({ title: '', slug: '', content: '', status: 'Draft' });
        }
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const res = await upsertPage({
            id: editingPage?.id,
            ...formData
        });
        if (res.success) {
            setIsModalOpen(false);
            loadData();
        } else {
            alert(res.error);
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this page?')) {
            await deletePage(id);
            loadData();
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-[var(--gold)] font-bold animate-pulse">
            Syncing Pages...
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in text-gray-900">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic text-gray-900">Custom Pages</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest mt-2 font-bold">Manage informational and policy pages</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="gold-btn px-6 py-2 text-xs flex items-center gap-2"
                >
                    <Plus size={14} />
                    Create New Page
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-400">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Page Title</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">URL Slug</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Last Modified</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                                            <FileText size={14} />
                                        </div>
                                        <span className="font-bold text-gray-900">{page.title}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-xs text-gray-500 font-medium">
                                    /{page.slug}
                                </td>
                                <td className="p-6">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${page.status === 'Published'
                                        ? 'bg-green-50 border-green-100 text-green-600'
                                        : 'bg-gray-50 border-gray-100 text-gray-400'
                                        }`}>
                                        {page.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-6 text-xs text-gray-400 font-medium">
                                    {new Date(page.lastModified).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenModal(page)}
                                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page.id)}
                                            className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in border border-gray-100 font-sans">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{editingPage ? 'Edit' : 'Create'} Page</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your content</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">×</button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Page Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-gold focus:bg-white outline-none transition-all text-sm font-bold text-gray-900"
                                            placeholder="e.g. Our Story"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">URL Slug</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                                            <input
                                                required
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                                className="w-full pl-7 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-gold focus:bg-white outline-none transition-all text-sm font-bold text-gray-900"
                                                placeholder="our-story"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                                        Content (HTML/Rich Text)
                                        <span className="text-gold flex items-center gap-1 normal-case font-bold"><Globe size={10} /> Preview enabled</span>
                                    </label>
                                    <textarea
                                        rows={10}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-gold focus:bg-white outline-none transition-all text-sm font-medium text-gray-900 font-mono"
                                        placeholder="<h1>Welcome</h1><p>Luxury details...</p>"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${formData.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                            <Globe size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Visibility Status</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formData.status}</p>
                                        </div>
                                    </div>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-900 outline-none focus:border-gold"
                                    >
                                        <option value="Draft">Save as Draft</option>
                                        <option value="Published">Publish Live</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-colors shadow-lg shadow-gray-200"
                                >
                                    {editingPage ? 'Update Registry' : 'Confirm & Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Custom Pages", ar: "الصفحات المخصصة" }}
                steps={[
                    {
                        title: { en: "Page Library", ar: "مكتبة الصفحات" },
                        description: {
                            en: "View all custom pages (About, Contact, Return Policy, etc.) with their slugs and publication status.",
                            ar: "عرض جميع الصفحات المخصصة (حول، اتصل، سياسة الإرجاع، إلخ) مع الروابط وحالة النشر."
                        },
                        icon: "📄"
                    },
                    {
                        title: { en: "Create Page", ar: "إنشاء صفحة" },
                        description: {
                            en: "Add new pages with a title, URL slug, and HTML content. Perfect for policies and informational pages.",
                            ar: "أضف صفحات جديدة بعنوان ورابط URL ومحتوى HTML. مثالية للسياسات والصفحات المعلوماتية."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Publish & Manage", ar: "نشر وإدارة" },
                        description: {
                            en: "Edit or delete existing pages. Published pages are accessible at /page/[slug] on your storefront.",
                            ar: "تعديل أو حذف الصفحات الموجودة. الصفحات المنشورة متاحة على /page/[slug] في واجهة متجرك."
                        },
                        icon: "🌐"
                    }
                ]}
            />
        </div>
    );
}
