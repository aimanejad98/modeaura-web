import { Metadata } from 'next'
import TrackOrderClient from './TrackOrderClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Track Your Order | Mode AURA',
    description: 'Track the status of your Mode AURA order. Enter your order number to see real-time shipping updates and estimated delivery.',
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">Loading...</div>}>
            <TrackOrderClient />
        </Suspense>
    )
}
