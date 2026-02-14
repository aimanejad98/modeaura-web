'use client';

import { useState, useEffect } from 'react';
import { getSubscribers, deleteSubscriber } from '@/app/actions/newsletter';
import { Mail, Trash2, Download } from 'lucide-react';
import DashboardPageGuide from '@/components/DashboardPageGuide';

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const data = await getSubscribers();
        setSubscribers(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm('Remove this subscriber?')) {
            await deleteSubscriber(id);
            loadData();
        }
    }

    function exportCsv() {
        const headers = ['Email', 'Subscribed At'];
        const rows = subscribers.map(s => [s.email, s.createdAt]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in text-gray-800">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic text-gray-900">Newsletter</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest mt-2 font-bold">Manage your mailing list</p>
                </div>
                <button
                    onClick={exportCsv}
                    className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-400">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Email Address</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Date Subscribed</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                            <Mail size={14} />
                                        </div>
                                        <span className="font-bold">{sub.email}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-sm text-gray-400 font-medium">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-right">
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {subscribers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-20 text-center text-gray-400 font-bold italic">
                                    No subscribers found in your registry yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DashboardPageGuide
                pageName={{ en: "Newsletter Hub", ar: "مركز النشرة الإخبارية" }}
                steps={[
                    {
                        title: { en: "Subscriber List", ar: "قائمة المشتركين" },
                        description: {
                            en: "View all newsletter subscribers with their email addresses and subscription dates.",
                            ar: "عرض جميع مشتركي النشرة الإخبارية مع عناوين البريد الإلكتروني وتواريخ الاشتراك."
                        },
                        icon: "📧"
                    },
                    {
                        title: { en: "Export Data", ar: "تصدير البيانات" },
                        description: {
                            en: "Download your subscriber list as a CSV file for use in external email marketing platforms.",
                            ar: "تنزيل قائمة المشتركين كملف CSV للاستخدام في منصات التسويق عبر البريد الإلكتروني الخارجية."
                        },
                        icon: "📥"
                    },
                    {
                        title: { en: "Manage Subscribers", ar: "إدارة المشتركين" },
                        description: {
                            en: "Remove subscribers from the mailing list if they request to unsubscribe or are no longer active.",
                            ar: "إزالة المشتركين من قائمة البريد إذا طلبوا إلغاء الاشتراك أو لم يعودوا نشطين."
                        },
                        icon: "🗑️"
                    }
                ]}
            />
        </div>
    );
}
