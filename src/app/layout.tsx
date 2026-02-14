import './globals.css'
import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Providers } from '@/components/Providers'
import { getActiveTheme } from '@/app/actions/themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant'
})

import { getStoreSettings } from '@/app/actions/settings'

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings()
    return {
        title: settings?.seoTitle || settings?.storeName || 'Mode AURA - Luxury Modest Fashion',
        description: settings?.seoDescription || settings?.tagline || 'Boutique collection of premium abayas and modest attire.',
        icons: {
            icon: settings?.favicon || '/favicon.ico',
        },
        openGraph: {
            title: settings?.seoTitle || settings?.storeName || 'Mode AURA',
            description: settings?.seoDescription || settings?.tagline || 'Boutique collection of premium abayas and modest attire.',
            images: [settings?.ogImage || '/images/luxury_newsletter_bg_1769661460511.png'],
        }
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const activeTheme = await getActiveTheme()

    // Create style object for the html tag to ensure immediate application
    const themeStyles: Record<string, string> = {}
    if (activeTheme) {
        if (activeTheme.primaryColor) themeStyles['--gold'] = activeTheme.primaryColor
        if (activeTheme.secondaryColor) {
            themeStyles['--brand-navy'] = activeTheme.secondaryColor
            themeStyles['--text-primary'] = activeTheme.secondaryColor
        }
        if (activeTheme.accentColor) themeStyles['--accent-seasonal'] = activeTheme.accentColor
        if (activeTheme.backgroundColor) themeStyles['--mocha-bg'] = activeTheme.backgroundColor
    }

    return (
        <html lang="en" className={`${inter.variable} ${cormorant.variable}`} style={themeStyles as React.CSSProperties}>
            <head />
            <body className={inter.className}>
                <div className="phygital-light" />
                <div className="silk-overlay" />
                <div className="aura-background" />
                <div className="seasonal-pattern" />
                <div className="hanging-visuals">
                    <div className="hanging-element-left seasonal-hanging-svg" />
                    <div className="hanging-element-right seasonal-hanging-svg" />
                </div>
                {activeTheme?.customCss && (
                    <style id="seasonal-custom-css" dangerouslySetInnerHTML={{ __html: activeTheme.customCss }} />
                )}
                <Providers initialTheme={activeTheme}>
                    <Navbar />
                    <div id="main-content-wrapper">
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}
