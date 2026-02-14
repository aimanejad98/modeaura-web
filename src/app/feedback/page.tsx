'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, CheckCircle, X, Camera, Upload } from 'lucide-react';
import { addTestimonial, getTestimonials } from '@/app/actions/testimonials';
import Footer from '@/components/Footer';

export default function FeedbackPage() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        content: '',
        location: 'Verified Client'
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getTestimonials();
        setTestimonials(data.filter((t: any) => t.isVerified));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.content) return;

        setSending(true);
        const res = await addTestimonial({
            ...formData,
            rating,
            showOnHome: false,
            isVerified: false
        });

        setSending(false);
        if (res.success) {
            setSubmitted(true);
            setShowModal(false);
            // Reset form
            setFormData({ name: '', email: '', title: '', content: '', location: 'Verified Client' });
            setRating(5);
        }
    };

    if (submitted) {
        return (
            <div className="pt-40 pb-24 min-h-screen flex items-center justify-center bg-white px-6">
                <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-8">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="text-4xl font-display text-[#1B2936]">Message Received</h1>
                    <p className="text-[#6B5E54] leading-relaxed">
                        Your feedback has been sent to our Atelier for review. Thank you for sharing your Mode AURA experience.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-[#1B2936] text-white px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                        Return to Gallery
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="pt-64 pb-24 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-8 space-y-20">
                {/* Header Section */}
                <div className="space-y-8">
                    <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] flex items-center justify-start gap-3">
                        <Link href="/" className="hover:text-[#1B2936] transition-colors">Home</Link>
                        <span className="text-[#B45309]/40">/</span>
                        <span className="text-[#B45309]">Happy Customers</span>
                    </nav>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-display text-[#1B2936] uppercase tracking-wider">Happy Customers</h1>
                        <p className="text-[#374151] text-sm max-w-2xl leading-relaxed font-medium">
                            Your opinion is very important to us. We appreciate your feedback and will use it to evaluate changes and make improvements to our site.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#1B2936] text-white hover:bg-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl rounded-sm"
                    >
                        Submit Review
                    </button>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-12">
                    {testimonials.map((t) => (
                        <div key={t.id} className="border border-gray-100 p-12 space-y-8 hover:shadow-xl transition-all duration-500 bg-[#FCFBFA]">
                            <div className="space-y-4">
                                <h3 className="text-base font-black uppercase tracking-widest text-[#1B2936] border-b border-gray-100 pb-4">
                                    {t.title || 'Exceptional Piece'}
                                </h3>
                                <p className="text-sm leading-relaxed text-[#6B5E54] min-h-[80px]">
                                    {t.content}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={i < t.rating ? '#D4AF37' : 'none'}
                                            className={i < t.rating ? 'text-[#D4AF37]' : 'text-gray-200'}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-[#1B2936]">{t.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submission Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-[#1B2936]/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    <div className="relative bg-white w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 pb-0 flex justify-between items-start">
                            <h2 className="text-4xl font-display text-center flex-1 text-[#1B2936]">Submit your views here</h2>
                            <button onClick={() => setShowModal(false)} className="bg-[#1B2936] text-white p-3 hover:bg-black transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[80vh]">
                            <div className="space-y-6">
                                {/* Customer Name */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">Customer Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Your name please"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Customer Email */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">Customer Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter email here"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Star Rating Selection */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">Star rating</label>
                                    <div className="flex gap-2 text-[var(--gold)]">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(s)}
                                                className="transition-transform active:scale-95"
                                            >
                                                <Star
                                                    size={28}
                                                    fill={(hoverRating || rating) >= s ? '#D4AF37' : 'none'}
                                                    className={(hoverRating || rating) >= s ? 'text-[#D4AF37]' : 'text-gray-200'}
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonial Heading */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">Testimonial heading title</label>
                                    <input
                                        type="text"
                                        placeholder="Add heading to your testimonial"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">File upload (optional)</label>
                                    <div className="flex items-center gap-4">
                                        <button type="button" className="bg-gray-100 px-6 py-3 text-[10px] font-bold border border-gray-200 hover:bg-gray-200 transition-all">
                                            Choose File
                                        </button>
                                        <span className="text-[10px] text-gray-400 font-bold">No file chosen</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-[#1B2936] uppercase tracking-widest block">Add Testimonial/Review Here</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="add your review here"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full border border-gray-200 p-4 text-sm focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300 resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={sending}
                                className="bg-[#1B2936] text-white w-40 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </main>
    );
}
