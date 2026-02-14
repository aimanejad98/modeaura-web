'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface PriceFilterProps {
    min: number;
    max: number;
    selectedRange: [number, number];
    onApply: (range: [number, number]) => void;
}

export default function PriceFilter({ min, max, selectedRange, onApply }: PriceFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Internal numeric range for slider
    const [localRange, setLocalRange] = useState<[number, number]>(selectedRange);

    // String state for inputs to allow free typing
    const [minInput, setMinInput] = useState(selectedRange[0].toString());
    const [maxInput, setMaxInput] = useState(selectedRange[1].toString());

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync when opening or when props change
    useEffect(() => {
        if (isOpen) {
            setLocalRange(selectedRange);
            setMinInput(selectedRange[0].toString());
            setMaxInput(selectedRange[1].toString());
        }
    }, [isOpen, selectedRange]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Input Handlers ---

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMinInput(e.target.value);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxInput(e.target.value);
    };

    const validateMin = () => {
        let val = parseInt(minInput);
        if (isNaN(val)) val = min;
        // Clamp: min <= val <= localRange[1]
        if (val < min) val = min;
        if (val > localRange[1]) val = localRange[1];

        setMinInput(val.toString());
        setLocalRange([val, localRange[1]]);
    };

    const validateMax = () => {
        let val = parseInt(maxInput);
        if (isNaN(val)) val = max;
        // Clamp: localRange[0] <= val <= max
        if (val < localRange[0]) val = localRange[0];
        if (val > max) val = max;

        setMaxInput(val.toString());
        setLocalRange([localRange[0], val]);
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: 'min' | 'max') => {
        if (e.key === 'Enter') {
            type === 'min' ? validateMin() : validateMax();
            (e.target as HTMLInputElement).blur();
        }
    };

    // --- Slider Handlers ---

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const val = Number(e.target.value);
        const newRange = [...localRange] as [number, number];

        // Prevent crossing
        if (index === 0) {
            newRange[0] = Math.min(val, newRange[1] - 1); // Keep min below max
            setMinInput(newRange[0].toString());
        } else {
            newRange[1] = Math.max(val, newRange[0] + 1); // Keep max above min
            setMaxInput(newRange[1].toString());
        }

        setLocalRange(newRange);
    };

    // Calculate percentage for slider track positions
    const getPercent = (value: number) => {
        if (max === min) return 0;
        return Math.round(((value - min) / (max - min)) * 100);
    };

    return (
        <div className="relative z-40" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap py-2 ${isOpen || (selectedRange[0] > min || selectedRange[1] < max) ? 'text-black' : 'text-gray-900 hover:text-[var(--gold)]'}`}
            >
                Price
                {(selectedRange[0] > min || selectedRange[1] < max) && <span className="text-[var(--gold)] text-[9px]">(${selectedRange[0]} - ${selectedRange[1]})</span>}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-[240px] z-[100] border border-gray-200">

                    {/* Inputs Row - Compact */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">$</span>
                            <input
                                type="text"
                                value={minInput}
                                onChange={handleMinChange}
                                onBlur={validateMin}
                                onKeyDown={(e) => handleKeyDown(e, 'min')}
                                className="w-full pl-5 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-black transition-all text-center"
                            />
                        </div>
                        <span className="text-gray-300 text-sm">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">$</span>
                            <input
                                type="text"
                                value={maxInput}
                                onChange={handleMaxChange}
                                onBlur={validateMax}
                                onKeyDown={(e) => handleKeyDown(e, 'max')}
                                className="w-full pl-5 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-black focus:outline-none focus:bg-white focus:border-black transition-all text-center"
                            />
                        </div>
                    </div>

                    {/* Slider - Compact */}
                    <div className="relative h-1 mb-2">
                        <div className="absolute w-full h-full bg-gray-100 rounded-full"></div>
                        <div
                            className="absolute h-full bg-black rounded-full"
                            style={{
                                left: `${getPercent(localRange[0])}%`,
                                width: `${getPercent(localRange[1]) - getPercent(localRange[0])}%`
                            }}
                        ></div>

                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={localRange[0]}
                            onChange={(e) => handleSliderChange(e, 0)}
                            className="absolute top-1/2 -translate-y-1/2 w-full h-5 appearance-none bg-transparent pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow cursor-grab active:cursor-grabbing"
                        />
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={localRange[1]}
                            onChange={(e) => handleSliderChange(e, 1)}
                            className="absolute top-1/2 -translate-y-1/2 w-full h-5 appearance-none bg-transparent pointer-events-none z-40 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow cursor-grab active:cursor-grabbing"
                        />
                    </div>

                    {/* Buttons - Compact */}
                    <button
                        onClick={() => { onApply(localRange); setIsOpen(false); }}
                        className="w-full bg-black text-white text-[9px] font-bold uppercase tracking-wide py-1.5 rounded hover:bg-gray-800 transition-all"
                    >
                        Apply
                    </button>

                    <button
                        onClick={() => {
                            onApply([min, max]);
                            setLocalRange([min, max]);
                            setMinInput(min.toString());
                            setMaxInput(max.toString());
                        }}
                        className="w-full mt-1 py-0.5 text-[8px] font-semibold text-gray-500 uppercase hover:text-black transition-colors"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
