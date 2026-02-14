'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface FilterDropdownProps {
    label: string;
    options: string[];
    selected: string[];
    onApply: (vals: string[]) => void;
    variant?: 'dropdown' | 'sidebar';
}

export default function FilterDropdown({ label, options, selected, onApply, variant = 'dropdown' }: FilterDropdownProps) {
    const [staged, setStaged] = useState<string[]>(selected);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) setStaged(selected);
    }, [isOpen, selected]);

    const toggle = (val: string) => {
        setStaged(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    if (variant === 'sidebar') {
        return (
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">{label}</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {options.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">No {label} available</p>
                    ) : options.map(opt => (
                        <label key={opt} className="flex items-center gap-4 cursor-pointer group/item">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${staged.includes(opt) ? 'bg-black border-black' : 'border-gray-200 group-hover/item:border-gray-300'
                                }`}>
                                {staged.includes(opt) && <Check size={10} className="text-white" strokeWidth={4} />}
                            </div>
                            <input type="checkbox" className="hidden" checked={staged.includes(opt)} onChange={() => {
                                const next = staged.includes(opt) ? staged.filter(v => v !== opt) : [...staged, opt];
                                setStaged(next);
                                onApply(next);
                            }} />
                            <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${staged.includes(opt) ? 'text-black' : 'text-gray-600 group-hover/item:text-gray-800'
                                }`}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative group z-30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap py-2 ${isOpen || selected.length > 0 ? 'text-black' : 'text-[#6B7280] hover:text-black'
                    }`}
            >
                {label} {selected.length > 0 && <span className="text-[#B45309] text-[9px]">({selected.length})</span>}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsOpen(false)} />
                    <div className="fixed inset-0 z-40 hidden lg:block" onClick={() => setIsOpen(false)} />

                    {/* Mobile Drawer / Desktop Dropdown */}
                    <div className={`
                        z-50 animate-in duration-300
                        fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] p-8 shadow-2xl max-h-[85vh] flex flex-col
                        lg:absolute lg:top-full lg:left-0 lg:bottom-auto lg:inset-x-auto lg:mt-4 lg:rounded-3xl lg:p-8 lg:min-w-[280px] lg:max-h-[500px] lg:animate-in lg:fade-in lg:slide-in-from-top-2
                        ${isOpen ? 'slide-in-from-bottom-full' : 'slide-out-to-bottom-full'}
                    `}>
                        {/* Drawer Handle (Mobile Only) */}
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 lg:hidden shrink-0" />

                        <div className="flex items-center justify-between mb-8 lg:hidden shrink-0">
                            <h3 className="text-xl font-display italic text-gray-900">{label}</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8 space-y-5">
                            {options.length === 0 ? (
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic text-center py-10 border-2 border-dashed border-gray-50 rounded-2xl">No {label} available</p>
                            ) : options.map(opt => (
                                <label key={opt} className="flex items-center gap-5 cursor-pointer group/item py-2 lg:py-0">
                                    <div className={`w-6 h-6 lg:w-5 lg:h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${staged.includes(opt) ? 'bg-black border-black' : 'border-gray-200 group-hover/item:border-gray-300'
                                        }`}>
                                        {staged.includes(opt) && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={staged.includes(opt)} onChange={() => toggle(opt)} />
                                    <span className={`text-[14px] lg:text-[12px] font-bold uppercase tracking-widest transition-colors ${staged.includes(opt) ? 'text-black' : 'text-gray-400 group-hover/item:text-gray-600'
                                        }`}>{opt}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-4 shrink-0 pb-6 lg:pb-0">
                            <button
                                onClick={() => { onApply(staged); setIsOpen(false); }}
                                className="flex-1 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                            >
                                Apply Changes
                            </button>
                            {staged.length > 0 && (
                                <button
                                    onClick={() => { setStaged([]); onApply([]); setIsOpen(false); }}
                                    className="p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all text-gray-400 hover:text-black"
                                    title="Clear"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
