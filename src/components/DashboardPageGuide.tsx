"use client";

import { useState, useEffect } from 'react';
import { Compass, HelpCircle, X, ChevronRight, Info, Globe } from 'lucide-react';

interface BilingualString {
    en: string;
    ar: string;
}

interface GuideStep {
    title: BilingualString;
    description: BilingualString;
    icon?: React.ReactNode;
}

interface DashboardPageGuideProps {
    pageName: BilingualString;
    steps: GuideStep[];
}

export default function DashboardPageGuide({ pageName, steps }: DashboardPageGuideProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('tour_language') as 'en' | 'ar' | null;
        if (savedLang) setLanguage(savedLang);
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        localStorage.setItem('tour_language', newLang);
        // Dispatch event so DashboardTour (if any) can sync
        window.dispatchEvent(new CustomEvent('tour-language-change', { detail: newLang }));
    };

    const isRtl = language === 'ar';

    return (
        <>
            {/* Floating Compass Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-[40] w-10 h-10 bg-white/80 backdrop-blur-sm text-[#1B2936]/50 hover:text-[var(--gold)] hover:bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all group border border-gray-200"
                title={language === 'en' ? 'Atelier Guide' : 'دليل المشغل'}
            >
                <Compass className="group-hover:rotate-180 transition-transform duration-500" size={18} />
            </button>

            {/* Guide Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className={`relative w-full max-w-md bg-white h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
                        {/* Header */}
                        <div className="p-8 border-b border-[#F1EEE9] flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black italic text-[#1B2936]">
                                    {language === 'en' ? 'Atelier Compass' : 'بوصلة الأتيليه'}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">
                                    {language === 'en' ? 'Guide:' : 'الدليل:'} {pageName[language]}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleLanguage}
                                    className="p-2.5 bg-gray-50 text-[#1B2936] rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 border border-gray-100"
                                >
                                    <Globe size={14} className="text-[var(--gold)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {language === 'en' ? 'AR' : 'EN'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border border-[#E8E2D9]">
                                <div className="flex items-center gap-4 text-[#1B2936] mb-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E8E2D9] flex items-center justify-center">
                                        <Info size={18} className="text-[var(--gold)]" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {language === 'en' ? 'Navigation Intelligence' : 'ذكاء الملاحة'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    {language === 'en'
                                        ? `Welcome to the ${pageName.en} interface. Follow these steps to master the workflow.`
                                        : `مرحباً بك في واجهة ${pageName.ar}. اتبع هذه الخطوات لإتقان سير العمل.`
                                    }
                                </p>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-5 group">
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <div className="w-8 h-8 rounded-full border-2 border-[#E8E2D9] flex items-center justify-center text-[10px] font-black text-gray-300 group-hover:border-[var(--gold)] group-hover:text-[var(--gold)] transition-colors">
                                                {idx + 1}
                                            </div>
                                            {idx !== steps.length - 1 && (
                                                <div className="w-px flex-1 bg-[#F1EEE9]" />
                                            )}
                                        </div>
                                        <div className="pb-8 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {step.icon && <span className="text-[var(--gold)]">{step.icon}</span>}
                                                <h4 className="font-bold text-[#1B2936] text-sm uppercase tracking-wider">{step.title[language]}</h4>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                {step.description[language]}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-[#FAF9F6] border-t border-[#F1EEE9] space-y-3">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.dispatchEvent(new CustomEvent('start-dashboard-tour', { detail: { language } }));
                                }}
                                className="w-full bg-[#1B2936] text-white rounded-2xl py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                <HelpCircle size={14} className="text-[var(--gold)]" />
                                {language === 'en' ? 'Start Interactive Walkthrough' : 'بدء الجولة التفاعلية'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full gold-btn rounded-2xl py-5"
                            >
                                {language === 'en' ? 'Understood, Begin Workflow' : 'فهمت، ابدأ العمل'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
