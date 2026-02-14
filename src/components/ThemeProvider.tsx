'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
    theme: any | null
    isActive: boolean
}

const ThemeContext = createContext<ThemeContextType>({ theme: null, isActive: false })

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode, initialTheme?: any }) {
    const [theme, setTheme] = useState<any>(initialTheme || null)

    useEffect(() => {
        if (initialTheme) {
            setTheme(initialTheme)
            applyTheme(initialTheme)
        } else {
            setTheme(null)
            removeTheme()
        }
    }, [initialTheme])

    function applyTheme(t: any) {
        if (typeof document === 'undefined') return
        const root = document.documentElement

        // Basic Colors
        if (t.primaryColor) root.style.setProperty('--gold', t.primaryColor)
        if (t.secondaryColor) {
            root.style.setProperty('--brand-navy', t.secondaryColor)
            root.style.setProperty('--text-primary', t.secondaryColor)
        }
        if (t.accentColor) root.style.setProperty('--accent-seasonal', t.accentColor)
        if (t.backgroundColor) root.style.setProperty('--mocha-bg', t.backgroundColor)

        // Cinematic Aura & Font Support
        if (t.auraColor) root.style.setProperty('--seasonal-aura', t.auraColor)
        if (t.fontFamily) root.style.setProperty('--seasonal-font', t.fontFamily)

        // Handle Custom CSS
        const existingStyles = document.getElementById('seasonal-custom-css')
        if (t.customCss) {
            if (existingStyles) {
                existingStyles.textContent = t.customCss
            } else {
                const style = document.createElement('style')
                style.id = 'seasonal-custom-css'
                style.textContent = t.customCss
                document.head.appendChild(style)
            }
        } else if (existingStyles) {
            existingStyles.remove()
        }

        root.classList.add('seasonal-active')
    }

    function removeTheme() {
        if (typeof document === 'undefined') return
        const root = document.documentElement
        root.style.removeProperty('--gold')
        root.style.removeProperty('--brand-navy')
        root.style.removeProperty('--text-primary')
        root.style.removeProperty('--accent-seasonal')
        root.style.removeProperty('--mocha-bg')
        root.style.removeProperty('--seasonal-aura')
        root.style.removeProperty('--seasonal-font')

        const existingStyles = document.getElementById('seasonal-custom-css')
        if (existingStyles) existingStyles.remove()

        root.classList.remove('seasonal-active')
    }

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, isActive: !!theme }}>
            {children}
            {theme && mounted && (
                <ParticleRenderer themeName={theme.name} />
            )}
        </ThemeContext.Provider>
    )
}

function ParticleRenderer({ themeName }: { themeName: string }) {
    const [particles, setParticles] = useState<React.ReactElement[]>([])

    useEffect(() => {
        const generated: React.ReactElement[] = []

        if (themeName.includes('Ramadan')) {
            // Stars
            for (let i = 0; i < 50; i++) {
                generated.push(
                    <div
                        key={`star-${i}`}
                        className="star-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                )
            }
            // Lanterns
            for (let i = 0; i < 8; i++) {
                generated.push(
                    <div
                        key={`lantern-${i}`}
                        className="lantern-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`,
                            animationDuration: `${15 + Math.random() * 10}s`,
                        }}
                    />
                )
            }
        } else if (themeName.includes('Eid')) {
            const colors = ['#10B981', '#D4AF37', '#FFD700', '#FF6B9D', '#4ECDC4']
            for (let i = 0; i < 60; i++) {
                generated.push(
                    <div
                        key={`confetti-${i}`}
                        className="confetti-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${6 + Math.random() * 4}s`,
                        }}
                    />
                )
            }
        } else if (themeName.includes('Autumn')) {
            for (let i = 0; i < 30; i++) {
                generated.push(
                    <div
                        key={`leaf-${i}`}
                        className="leaf-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 12}s`,
                            animationDuration: `${10 + Math.random() * 6}s`,
                        }}
                    />
                )
            }
        } else if (themeName.includes('Spring')) {
            for (let i = 0; i < 40; i++) {
                generated.push(
                    <div
                        key={`petal-${i}`}
                        className="petal-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 10}s`,
                            animationDuration: `${8 + Math.random() * 5}s`,
                        }}
                    />
                )
            }
        }

        setParticles(generated)
    }, [themeName])

    return (
        <div className="fixed inset-0 pointer-events-none z-[85]">
            <div className="particle-container">{particles}</div>
        </div>
    )
}

export const useTheme = () => useContext(ThemeContext)
