import { Suspense } from 'react';
import ShopClient from './ShopClient';

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#FAF9F6] border-t-[var(--gold)] rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--gold)] animate-pulse">Entering the Atelier...</p>
            </div>
        }>
            <ShopClient />
        </Suspense>
    );
}
