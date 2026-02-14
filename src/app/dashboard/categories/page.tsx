'use client'

import { useState, useEffect } from 'react'
import { getMainCategories, addCategory, deleteCategory, updateCategory } from '@/app/actions/categories'
import DashboardPageGuide from '@/components/DashboardPageGuide'

const ALL_FIELDS = [
    { id: 'size', label: 'Size' },
    { id: 'color', label: 'Color' },
    { id: 'material', label: 'Material' },
]

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddMain, setShowAddMain] = useState(false)
    const [showAddSub, setShowAddSub] = useState<string | null>(null)
    const [editingFields, setEditingFields] = useState<string | null>(null)
    const [newCat, setNewCat] = useState({ name: '', code: '', fields: ['size', 'color', 'material'] })

    useEffect(() => {
        loadCategories()
    }, [])

    async function loadCategories() {
        setLoading(true)
        const data = await getMainCategories()
        setCategories(data)
        setLoading(false)
    }

    async function handleAddMain(e: React.FormEvent) {
        e.preventDefault()
        await addCategory({
            name: newCat.name,
            code: newCat.code,
            fields: newCat.fields.join(',')
        })
        setNewCat({ name: '', code: '', fields: ['size', 'color', 'material'] })
        setShowAddMain(false)
        loadCategories()
    }

    async function handleAddSub(e: React.FormEvent, parentId: string) {
        e.preventDefault()
        await addCategory({
            name: newCat.name,
            code: newCat.code,
            parentId,
            fields: newCat.fields.join(',')
        })
        setNewCat({ name: '', code: '', fields: ['size', 'color', 'material'] })
        setShowAddSub(null)
        loadCategories()
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this category?')) return
        const result = await deleteCategory(id)
        if (!result.success) {
            alert(result.message)
        } else {
            loadCategories()
        }
    }

    async function handleUpdateFields(id: string, fields: string[]) {
        await updateCategory(id, { fields: fields.join(',') })
        setEditingFields(null)
        loadCategories()
    }

    function toggleField(field: string) {
        if (newCat.fields.includes(field)) {
            setNewCat({ ...newCat, fields: newCat.fields.filter(f => f !== field) })
        } else {
            setNewCat({ ...newCat, fields: [...newCat.fields, field] })
        }
    }

    function getCategoryFields(cat: any): string[] {
        return (cat.fields || 'size,color,material').split(',').filter(Boolean)
    }

    if (loading) return <div className="p-8">Loading categories...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic">Categories</h2>
                    <p className="text-gray-500">Manage categories and their required product fields</p>
                </div>
                <button onClick={() => setShowAddMain(true)} className="gold-btn" data-tour="add-category-btn">
                    + Add Category
                </button>
            </div>

            {/* Category Tree */}
            <div className="space-y-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Main Category */}
                        <div className="p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 gap-4">
                            <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                                <span className="shrink-0 px-2 py-1 bg-[#D4AF37] text-white rounded-lg text-[10px] lg:text-xs font-bold">
                                    {cat.code}
                                </span>
                                <span className="font-black text-base lg:text-lg truncate">{cat.name}</span>
                                <span className="text-gray-400 text-xs shrink-0">({cat.children?.length || 0})</span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => setEditingFields(editingFields === cat.id ? null : cat.id)}
                                    className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-xl transition-all ${editingFields === cat.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                                        }`}
                                >
                                    ⚙️ Fields
                                </button>
                                <button
                                    onClick={() => setShowAddSub(cat.id)}
                                    className="flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
                                >
                                    + Sub
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="flex-1 sm:flex-none px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Fields Editor */}
                        {editingFields === cat.id && (
                            <FieldsEditor
                                currentFields={getCategoryFields(cat)}
                                onSave={(fields) => handleUpdateFields(cat.id, fields)}
                                onCancel={() => setEditingFields(null)}
                            />
                        )}

                        {/* Subcategories */}
                        {cat.children && cat.children.length > 0 && (
                            <div className="divide-y divide-gray-100">
                                {cat.children.map((sub: any) => (
                                    <div key={sub.id}>
                                        <div className="p-4 pl-6 lg:pl-12 flex items-center justify-between hover:bg-gray-50 gap-4">
                                            <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                                                <span className="text-gray-300 shrink-0">└</span>
                                                <span className="shrink-0 px-2 py-0.5 bg-gray-200 rounded text-[9px] lg:text-xs font-bold">{sub.code}</span>
                                                <span className="font-bold text-sm lg:text-base truncate">{sub.name}</span>
                                                <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 bg-gray-100 rounded text-gray-500 truncate">
                                                    {getCategoryFields(sub).join(', ')}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => setEditingFields(editingFields === sub.id ? null : sub.id)}
                                                    className="p-2 text-blue-500 hover:text-blue-700 transition-all"
                                                >
                                                    ⚙️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sub.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 transition-all"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        {editingFields === sub.id && (
                                            <div className="pl-12">
                                                <FieldsEditor
                                                    currentFields={getCategoryFields(sub)}
                                                    onSave={(fields) => handleUpdateFields(sub.id, fields)}
                                                    onCancel={() => setEditingFields(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Subcategory Form */}
                        {showAddSub === cat.id && (
                            <form onSubmit={(e) => handleAddSub(e, cat.id)} className="p-4 pl-12 bg-blue-50 space-y-3">
                                <div className="flex gap-4">
                                    <input
                                        required
                                        placeholder="Subcategory name"
                                        value={newCat.name}
                                        onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                        className="flex-1 p-2 rounded-lg border"
                                    />
                                    <input
                                        required
                                        placeholder="Code (3 letters)"
                                        maxLength={3}
                                        value={newCat.code}
                                        onChange={(e) => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })}
                                        className="w-24 p-2 rounded-lg border"
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="text-xs font-bold text-gray-500">Fields:</span>
                                    {ALL_FIELDS.map(field => (
                                        <label key={field.id} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={newCat.fields.includes(field.id)}
                                                onChange={() => toggleField(field.id)}
                                            />
                                            <span className="text-sm">{field.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg font-bold">
                                        Add
                                    </button>
                                    <button type="button" onClick={() => setShowAddSub(null)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-3xl">
                        No categories yet. Add your first category!
                    </div>
                )}
            </div>

            {/* Add Main Category Modal */}
            {showAddMain && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md">
                        <h3 className="text-2xl font-black mb-6">Add Category</h3>
                        <form onSubmit={handleAddMain} className="space-y-4">
                            <input
                                required
                                placeholder="Category Name (e.g., Abayas)"
                                value={newCat.name}
                                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                className="w-full p-4 bg-gray-50 rounded-xl"
                            />
                            <input
                                required
                                placeholder="Code (3 letters, e.g., ABA)"
                                maxLength={3}
                                value={newCat.code}
                                onChange={(e) => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })}
                                className="w-full p-4 bg-gray-50 rounded-xl"
                            />

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Product Fields Required</p>
                                <div className="flex gap-4">
                                    {ALL_FIELDS.map(field => (
                                        <label key={field.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newCat.fields.includes(field.id)}
                                                onChange={() => toggleField(field.id)}
                                                className="w-5 h-5"
                                            />
                                            <span className="font-bold">{field.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-gray-400">Code is used for SKU generation (e.g., MA-ABA-001)</p>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowAddMain(false)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 gold-btn">
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Category Management", ar: "إدارة الفئات" }}
                steps={[
                    {
                        title: { en: "Main Categories", ar: "الفئات الرئيسية" },
                        description: {
                            en: "Create top-level categories like Abayas, Scarfs, and Bags to organize your product catalog.",
                            ar: "أنشئ فئات رئيسية مثل العبايات والأوشحة والحقائب لتنظيم كتالوج المنتجات."
                        },
                        icon: "📂"
                    },
                    {
                        title: { en: "Subcategories", ar: "الفئات الفرعية" },
                        description: {
                            en: "Add subcategories under each main category for more precise product classification.",
                            ar: "أضف فئات فرعية تحت كل فئة رئيسية لتصنيف المنتجات بشكل أكثر دقة."
                        },
                        icon: "🏷️"
                    },
                    {
                        title: { en: "Required Fields", ar: "الحقول المطلوبة" },
                        description: {
                            en: "Configure which product fields (Size, Color, Material) are required for each category.",
                            ar: "حدد حقول المنتج المطلوبة (الحجم، اللون، المادة) لكل فئة."
                        },
                        icon: "⚙️"
                    }
                ]}
            />
        </div>
    )
}

// Fields Editor Component
function FieldsEditor({ currentFields, onSave, onCancel }: {
    currentFields: string[]
    onSave: (fields: string[]) => void
    onCancel: () => void
}) {
    const [fields, setFields] = useState(currentFields)

    function toggle(field: string) {
        if (fields.includes(field)) {
            setFields(fields.filter(f => f !== field))
        } else {
            setFields([...fields, field])
        }
    }

    return (
        <div className="p-4 bg-blue-50 flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500">Required Fields:</span>
            {ALL_FIELDS.map(field => (
                <label key={field.id} className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={fields.includes(field.id)}
                        onChange={() => toggle(field.id)}
                    />
                    <span className="text-sm font-bold">{field.label}</span>
                </label>
            ))}
            <button onClick={() => onSave(fields)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold ml-auto">
                Save
            </button>
            <button onClick={onCancel} className="px-3 py-1 bg-gray-300 rounded-lg text-xs font-bold">
                Cancel
            </button>
        </div>
    )
}
