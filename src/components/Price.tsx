'use client';

import { useCurrency } from '@/context/CurrencyContext';

interface PriceProps {
    amount: number;
    className?: string;
}

export default function Price({ amount, className = "" }: PriceProps) {
    const { formatPrice } = useCurrency();

    return (
        <span className={`font-price ${className}`}>
            {formatPrice(amount)}
        </span>
    );
}
