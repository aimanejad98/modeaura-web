'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
    temp: number
    condition: string
    icon: string
    humidity: number
    wind: number
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [time, setTime] = useState(new Date())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchWeather()
        // Refresh weather every 30 minutes
        const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000)
        return () => clearInterval(weatherTimer)
    }, [])

    async function fetchWeather() {
        try {
            // Windsor, ON coordinates
            const lat = 42.3149
            const lon = -83.0364

            // Using Open-Meteo API (free, no key required)
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America/Toronto`
            )
            const data = await res.json()

            const weatherCode = data.current.weather_code
            const condition = getWeatherCondition(weatherCode)

            setWeather({
                temp: Math.round(data.current.temperature_2m),
                condition: condition.text,
                icon: condition.icon,
                humidity: data.current.relative_humidity_2m,
                wind: Math.round(data.current.wind_speed_10m)
            })
            setLoading(false)
        } catch (error) {
            console.error('Weather fetch failed:', error)
            setLoading(false)
        }
    }

    function getWeatherCondition(code: number): { text: string; icon: string } {
        if (code === 0) return { text: 'Clear', icon: '☀️' }
        if (code <= 3) return { text: 'Partly Cloudy', icon: '⛅' }
        if (code <= 48) return { text: 'Foggy', icon: '🌫️' }
        if (code <= 57) return { text: 'Drizzle', icon: '🌧️' }
        if (code <= 67) return { text: 'Rain', icon: '🌧️' }
        if (code <= 77) return { text: 'Snow', icon: '❄️' }
        if (code <= 82) return { text: 'Showers', icon: '🌦️' }
        if (code <= 86) return { text: 'Snow Showers', icon: '🌨️' }
        if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' }
        return { text: 'Cloudy', icon: '☁️' }
    }

    function getBackgroundClass() {
        if (!weather) return 'from-gray-700 to-gray-900'
        const condition = weather.condition.toLowerCase()
        if (condition.includes('clear') || condition.includes('sunny')) {
            return 'from-amber-400 via-orange-500 to-rose-500'
        }
        if (condition.includes('cloud') || condition.includes('partly')) {
            return 'from-slate-400 via-slate-500 to-slate-600'
        }
        if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
            return 'from-slate-600 via-slate-700 to-slate-800'
        }
        if (condition.includes('snow')) {
            return 'from-blue-200 via-blue-300 to-blue-400'
        }
        if (condition.includes('thunder')) {
            return 'from-purple-800 via-slate-800 to-slate-900'
        }
        return 'from-slate-500 to-slate-700'
    }

    const hours = time.getHours()
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening'

    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getBackgroundClass()} text-white p-10 min-h-[220px] shadow-xl shadow-[var(--mocha-sidebar)]/5 border border-[var(--mocha-border)]/20`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {weather?.condition.toLowerCase().includes('rain') && (
                    <>
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 bg-white/30 animate-rain"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    height: `${20 + Math.random() * 30}px`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                                }}
                            />
                        ))}
                    </>
                )}
                {weather?.condition.toLowerCase().includes('snow') && (
                    <>
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full animate-snow opacity-40"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${3 + Math.random() * 4}s`
                                }}
                            />
                        ))}
                    </>
                )}
                {(weather?.condition.toLowerCase().includes('clear') || weather?.condition.toLowerCase().includes('sunny')) && (
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
                )}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex justify-between items-center h-full">
                <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{greeting}</p>
                    <p className="text-6xl font-display font-medium tabular-nums tracking-tighter italic">
                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p className="text-white/80 font-medium mt-3">
                        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Windsor, Ontario</p>
                </div>

                {loading ? (
                    <div className="text-white/50 animate-pulse">Loading weather...</div>
                ) : weather ? (
                    <div className="text-right">
                        <div className="text-6xl mb-2">{weather.icon}</div>
                        <p className="text-4xl font-black">{weather.temp}°C</p>
                        <p className="text-white/70 font-medium">{weather.condition}</p>
                        <div className="flex gap-4 mt-3 text-sm text-white/60">
                            <span>💧 {weather.humidity}%</span>
                            <span>💨 {weather.wind} km/h</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-right">
                        <div className="text-6xl mb-2">🌡️</div>
                        <p className="text-white/70">Weather unavailable</p>
                    </div>
                )}
            </div>
        </div>
    )
}
