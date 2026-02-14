'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'CAD' | 'USD' | 'SAR' | 'AED' | 'GBP' | 'EUR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatPrice: (price: number) => string;
    exchangeRate: number;
}

const rates: Record<Currency, number> = {
    CAD: 1,
    USD: 0.74,
    SAR: 2.78,
    AED: 2.72,
    GBP: 0.58,
    EUR: 0.69
};

const symbols: Record<Currency, string> = {
    CAD: 'CAD $',
    USD: 'USD $',
    SAR: 'SAR ',
    AED: 'AED ',
    GBP: '£',
    EUR: '€'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('CAD');

    useEffect(() => {
        const saved = localStorage.getItem('mode_aura_currency') as Currency;
        if (saved && rates[saved]) {
            setCurrencyState(saved);
        }
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('mode_aura_currency', c);
    };

    const formatPrice = (price: number) => {
        const converted = price * rates[currency];
        return `${symbols[currency]}${converted.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, exchangeRate: rates[currency] }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
}
