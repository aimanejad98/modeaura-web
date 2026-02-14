'use client';

import { useState, useEffect } from 'react';
import { getTestimonials, getPendingTestimonials, addTestimonial, toggleTestimonialHome, deleteTestimonial, verifyTestimonial } from '@/app/actions/testimonials';
import { Star, Home, Trash2, MessageSquarePlus, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        name: '', title: '', content: '', location: 'Verified Client', rating: 5, showOnHome: true, isVerified: true
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [activeData, pendingData] = await Promise.all([
            getTestimonials(),
            getPendingTestimonials()
        ]);
        setTestimonials(activeData);
        setPending(pendingData);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await addTestimonial(formData);
        if (result.success) {
            setFormData({ name: '', title: '', content: '', location: 'Verified Client', rating: 5, showOnHome: true, isVerified: true });
            setShowAdd(false);
            console.log("Submission successful, reloading data...");
            // Force a small delay to allow DB propagation
            setTimeout(() => loadData(), 500);
        } else {
            console.error("Submission failed");
            alert("Failed to post message. Please try again.");
        }
    }

    async function handleToggle(id: string, current: boolean) {
        await toggleTestimonialHome(id, !current);
        loadData();
    }

    async function handleVerify(id: string) {
        await verifyTestimonial(id);
        loadData();
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this testimonial?')) {
            await deleteTestimonial(id);
            loadData();
        }
    }

    if (loading) return <div className="p-8 text-[var(--text-primary)]/50 animate-pulse font-display italic">Loading Client Voice...</div>;

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex justify-between items-end border-b border-[#1B2936]/10 pb-8">
                <div>
                    <h1 className="text-4xl font-display text-[#1B2936]">Client Voice</h1>
                    <p className="text-[#6B5E54] text-[10px] font-black uppercase tracking-[0.4em] mt-2">Manage customer testimonials & website messages</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="bg-[#1B2936] text-white hover:bg-black px-8 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl rounded-xl">
                    <MessageSquarePlus size={16} /> Add New Entry
                </button>
            </div>

            {/* Pending Approvals Section */}
            {pending.length > 0 && (
                <div className="bg-amber-50/50 -mx-8 px-8 py-12 border-y border-amber-100 space-y-8">
                    <div className="flex items-center gap-2 text-amber-700">
                        <AlertCircle size={18} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Pending Verification ({pending.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pending.map((t) => (
                            <div key={t.id} className="bg-white border-2 border-amber-200 rounded-3xl p-8 shadow-xl flex flex-col justify-between group">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < t.rating ? '#D4AF37' : 'none'} className={i < t.rating ? 'text-[#D4AF37]' : 'text-gray-200'} strokeWidth={2} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full uppercase font-black tracking-widest border border-amber-200">New Response</span>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#1B2936]">{t.title || 'Review Message'}</h4>
                                        <p className="text-sm italic text-[#1B2936]/80 leading-relaxed font-medium">"{t.content}"</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">{t.name}</p>
                                            <p className="text-[10px] text-[#6B5E54] font-bold uppercase tracking-widest mt-1 opacity-60">Website Visitor</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleVerify(t.id)} className="flex-1 bg-green-700 text-white hover:bg-green-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
                                            <CheckCircle size={14} /> Approve Review
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#1B2936]/10"></div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1B2936]/30">Published Client Voices</h2>
                    <div className="h-px flex-1 bg-[#1B2936]/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.filter(t => t.isVerified).map((t) => (
                        <div key={t.id} className="bg-white border-2 border-[#1B2936]/5 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col justify-between group hover:border-[#D4AF37] transition-all duration-300">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < t.rating ? '#D4AF37' : 'none'} className={i < t.rating ? 'text-[#D4AF37]' : 'text-gray-200'} strokeWidth={2} />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleToggle(t.id, t.showOnHome)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-md ${t.showOnHome
                                            ? 'bg-[#D4AF37] text-white shadow-[#D4AF37]/30'
                                            : 'bg-[#1B2936] text-white hover:bg-black shadow-black/20'}`}
                                    >
                                        <Home size={12} strokeWidth={2.5} />
                                        <span>{t.showOnHome ? 'Featuring' : 'Feature'}</span>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] opacity-80">{t.title || 'Verified Review'}</h4>
                                    <p className="text-sm italic text-[#1B2936] leading-relaxed font-medium">"{t.content}"</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B2936]">{t.name}</p>
                                    <p className="text-[9px] text-[#6B5E54] font-bold uppercase tracking-widest mt-1 opacity-60">{t.location}</p>
                                </div>
                                <button onClick={() => handleDelete(t.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600/10">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {testimonials.length === 0 && pending.length === 0 && (
                <div className="bg-white border-2 border-dashed border-[#1B2936]/10 p-24 text-center rounded-[3rem]">
                    <p className="font-display italic text-3xl mb-4 text-[#1B2936]/40">"Awaiting voices..."</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1B2936]/20">No testimonials found in database</p>
                </div>
            )}

            {/* Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-[#1B2936]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-10 w-full max-w-lg shadow-2xl relative">
                        <h3 className="text-3xl font-display text-[#1B2936] mb-8 text-center uppercase tracking-tight">Manual Entry</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B2936]/40 mb-2 block">Client Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-[#1B2936] outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-300 text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B2936]/40 mb-2 block">Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-[#1B2936] outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-300 text-sm"
                                        placeholder="e.g. Windsor, ON"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B2936]/40 mb-2 block">Heading Title</label>
                                <input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border border-gray-200 p-4 text-[#1B2936] outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-300 text-sm"
                                    placeholder="e.g. Perfect Fitz"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B2936]/40 mb-2 block">Review Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full border border-gray-200 p-4 text-[#1B2936] outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-300 text-sm resize-none"
                                    placeholder="Enter review here..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAdd(false)}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1B2936] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#1B2936] text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                                >
                                    Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Testimonials", ar: "الشهادات" }}
                steps={[
                    {
                        title: { en: "Review Management", ar: "إدارة المراجعات" },
                        description: {
                            en: "View all customer testimonials. Verify pending reviews and choose which ones to display on homepage.",
                            ar: "عرض جميع شهادات العملاء. تحقق من المراجعات المعلقة واختر أيها تعرض على الصفحة الرئيسية."
                        },
                        icon: "⭐"
                    },
                    {
                        title: { en: "Add Testimonial", ar: "إضافة شهادة" },
                        description: {
                            en: "Manually add verified customer testimonials with name, rating, and review text.",
                            ar: "إضافة شهادات عملاء موثقة يدوياً بالاسم والتقييم ونص المراجعة."
                        },
                        icon: "✍️"
                    },
                    {
                        title: { en: "Homepage Display", ar: "عرض الصفحة الرئيسية" },
                        description: {
                            en: "Toggle the home icon to feature select testimonials on the storefront for social proof.",
                            ar: "بدّل أيقونة الصفحة الرئيسية لعرض شهادات مختارة على واجهة المتجر كدليل اجتماعي."
                        },
                        icon: "🏠"
                    }
                ]}
            />
        </div>
    );
}
