'use server'

import { stripe } from '@/lib/stripe'
import { getStoreSettings } from './settings'

export async function registerTerminalReader(registrationCode: string, label: string) {
    try {
        if (!registrationCode) throw new Error('Registration code is required')

        // 1. Get Location ID (we need a location to register the reader to)
        // For now, we'll list locations and use the first one, or create one if none exist.
        const locations = await stripe.terminal.locations.list({ limit: 1 })
        let locationId = locations.data[0]?.id

        if (!locationId) {
            const settings = await getStoreSettings()
            const location = await stripe.terminal.locations.create({
                display_name: settings?.storeName || 'Mode Aura Boutique',
                address: {
                    line1: settings?.address || '785 Wyandotte St E',
                    city: 'Windsor',
                    state: 'ON',
                    country: 'CA',
                    postal_code: 'N9A 3J3',
                }
            })
            locationId = location.id
        }

        // 2. Create the Reader
        const reader = await stripe.terminal.readers.create({
            registration_code: registrationCode,
            label: label || 'Counter Reader',
            location: locationId,
        })

        return { success: true, reader }
    } catch (error: any) {
        console.error('Error registering reader:', error)
        return { success: false, error: error.message }
    }
}

export async function getTerminalReaders() {
    try {
        const readers = await stripe.terminal.readers.list({ limit: 10 })
        return { success: true, readers: readers.data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
