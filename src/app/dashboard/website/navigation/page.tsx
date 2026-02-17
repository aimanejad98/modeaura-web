'use client';

import React, { useState, useEffect } from 'react';
import { getNavItems, getAllNavItems, addNavItem, updateNavItem, deleteNavItem } from '@/app/actions/navigation';
import { getMainCategories } from '@/app/actions/categories';
import { X, ChevronDown, ChevronRight, Edit2, Trash2, Plus, Link as LinkIcon, RefreshCw } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function NavigationPage() {
    const [items, setItems] = useState<any[]>([]);
    const [allItems, setAllItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        label: '',
        href: '',
        parentId: '',
        order: 0,
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [tree, flat, cats] = await Promise.all([
                getNavItems(),
                getAllNavItems(),
                getMainCategories()
            ]);
            setItems(tree);
            setAllItems(flat);
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load navigation:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                label: item.label,
                href: item.href,
                parentId: item.parentId || '',
                order: item.order || 0,
                active: item.active
            });
        } else {
            setEditingItem(null);
            setFormData({
                label: '',
                href: '',
                parentId: '',
                order: (allItems.length > 0 ? Math.max(...allItems.map(i => i.order)) + 1 : 0),
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCategorySelect = (catId: string) => {
        if (!catId) return;
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setFormData({
                ...formData,
                label: cat.name,
                href: `/shop?category=${cat.id}`
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateNavItem(editingItem.id, formData);
            } else {
                await addNavItem(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to save navigation item.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? Deleting a parent will delete all its children.')) return;
        try {
            await deleteNavItem(id);
            loadData();
        } catch (error) {
            alert('Failed to delete item.');
        }
    };

    if (loading) return <div className="p-12 text-center text-[#D4AF37] font-bold animate-pulse">Loading Navigation...</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-16 border-b border-black/5 pb-12">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white border border-black/5 flex items-center justify-center p-3 shadow-sm rounded-sm">
                        <img src="/logo.png" alt="Mode AURA" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-display text-[#1a1817] italic font-light tracking-tight">Navigation</h1>
                        <p className="text-[#6B645E] text-[10px] uppercase font-black tracking-[0.4em] mt-3">Design your storefront menu hierarchy</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#1a1817] text-[#FAF9F6] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                >
                    <Plus size={14} /> Add New Link
                </button>
            </div>

            {/* Menu List */}
            <div className="space-y-4">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white border-2 border-dashed border-black/5 rounded-xl">
                        <p className="text-[#6B645E] text-sm uppercase font-black tracking-widest">No navigation items found. Add your first link.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-black/[0.03] shadow-sm rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#FAF9F6] border-b border-black/[0.05]">
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1817]/40 w-1/3">Label</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1817]/40">Destination</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1817]/40">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1817]/40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.02]">
                                {items.map((item) => {
                                    // Check if this item is a category link with subcategories
                                    const catIdMatch = item.href.match(/category=([^&]+)/);
                                    const linkedCat = catIdMatch ? categories.find(c => c.id === catIdMatch[1]) : null;
                                    const hasAutoSubs = linkedCat && linkedCat.children?.length > 0 && (!item.children || item.children.length === 0);

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr className="hover:bg-[#FAF9F6]/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        {(item.children?.length > 0 || hasAutoSubs) ? (
                                                            <ChevronDown size={14} className="text-[var(--gold)]" />
                                                        ) : (
                                                            <div className="w-3.5" />
                                                        )}
                                                        <span className="text-lg font-display text-[#1a1817]">{item.label}</span>
                                                        {linkedCat && (
                                                            <span className="bg-[var(--gold)]/10 text-[var(--gold)] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <LinkIcon size={8} /> Category Link
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <code className="text-[11px] text-[var(--gold)] font-mono tracking-wider bg-[#D4AF37]/5 px-2 py-1 rounded">
                                                        {item.href}
                                                    </code>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                                        {item.parentId ? 'Sub-item' : 'Main Menu'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-4">
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-2 text-black/20 hover:text-[var(--gold)] transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-black/20 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Explicit Nav Children */}
                                            {item.children?.map((child: any) => (
                                                <tr key={child.id} className="bg-[#FAF9F6]/30 hover:bg-[#FAF9F6]/60 transition-colors group border-b border-black/[0.01]">
                                                    <td className="px-8 py-4 pl-16">
                                                        <div className="flex items-center gap-3">
                                                            <ChevronRight size={12} className="text-black/20" />
                                                            <span className="text-sm font-medium text-[#6B645E]">{child.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <code className="text-[10px] text-black/40 font-mono tracking-wider">
                                                            {child.href}
                                                        </code>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/20">
                                                            Dropdown Item
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => handleOpenModal(child)}
                                                                className="p-1.5 text-black/10 hover:text-[var(--gold)] transition-colors"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(child.id)}
                                                                className="p-1.5 text-black/10 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Auto-Synchronized Subcategories Indicator */}
                                            {hasAutoSubs && linkedCat.children.map((sub: any) => (
                                                <tr key={`auto-${sub.id}`} className="bg-[var(--gold)]/[0.02] border-b border-[var(--gold)]/[0.05]">
                                                    <td className="px-8 py-4 pl-16">
                                                        <div className="flex items-center gap-3">
                                                            <RefreshCw size={10} className="text-[var(--gold)] opacity-40 animate-spin-slow" />
                                                            <span className="text-sm font-medium text-[#6B645E] italic">{sub.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <code className="text-[10px] text-[var(--gold)]/40 font-mono tracking-wider">
                                                            /shop?category={sub.id}
                                                        </code>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--gold)]/40">
                                                            Auto-Linked Subcategory
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <span className="text-[8px] font-bold text-gray-300 italic px-4">Managed via Categories</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1a1817]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#FAF9F6] p-8 border-b border-black/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-display italic text-[#1a1817]">{editingItem ? 'Edit Navigation' : 'Add New Link'}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--gold)] mt-1">Configure your menu node</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-black/20 hover:text-black transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Category Link Quick-Picker */}
                            {!editingItem && (
                                <div className="p-6 bg-[var(--gold)]/5 rounded-2xl border border-[var(--gold)]/10 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
                                        <LinkIcon size={12} /> Quick Link to Category
                                    </label>
                                    <select
                                        onChange={(e) => handleCategorySelect(e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-4 text-xs font-bold focus:ring-1 focus:ring-[var(--gold)]/30 outline-none transition-all shadow-sm"
                                    >
                                        <option value="">Select a Category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[8px] text-[var(--gold)]/60 font-bold uppercase tracking-wider italic">Picking a category automatically sets the label and destination.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#6B645E]">Menu Label</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g., Summer Collection"
                                    className="w-full bg-[#FAF9F6] border-none rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-[var(--gold)]/30 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#6B645E]">Destination URL</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.href}
                                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                    placeholder="e.g., /shop?category=sale"
                                    className="w-full bg-[#FAF9F6] border-none rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-[var(--gold)]/30 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6B645E]">Parent Menu</label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        className="w-full bg-[#FAF9F6] border-none rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-[var(--gold)]/30 outline-none transition-all appearance-none"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {allItems.filter(i => i.id !== editingItem?.id && !i.parentId).map(item => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6B645E]">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-[#FAF9F6] border-none rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-[var(--gold)]/30 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-[#1a1817] text-[#FAF9F6] py-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-black/10 mt-4 active:scale-95 duration-200">
                                {editingItem ? 'Update Navigation' : 'Create Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <DashboardPageGuide
                pageName={{ en: "Navigation Editor", ar: "محرر التنقل" }}
                steps={[
                    {
                        title: { en: "Menu Structure", ar: "هيكل القائمة" },
                        description: {
                            en: "View and manage your storefront navigation menu with parent links and dropdown submenus.",
                            ar: "عرض وإدارة قائمة التنقل في واجهة المتجر مع الروابط الرئيسية والقوائم المنسدلة."
                        },
                        icon: "📂"
                    },
                    {
                        title: { en: "Add Menu Items", ar: "إضافة عناصر القائمة" },
                        description: {
                            en: "Create navigation links with labels and URLs. Set parent items for dropdown organization.",
                            ar: "أنشئ روابط تنقل بعناوين وروابط. حدد العناصر الرئيسية لتنظيم القوائم المنسدلة."
                        },
                        icon: "➕"
                    },
                    {
                        title: { en: "Edit & Delete", ar: "تعديل وحذف" },
                        description: {
                            en: "Modify existing menu items or remove them. Changes reflect immediately on the live storefront.",
                            ar: "تعديل عناصر القائمة الموجودة أو إزالتها. التغييرات تنعكس فوراً على واجهة المتجر المباشرة."
                        },
                        icon: "✏️"
                    }
                ]}
            />
        </div>
    );
}
