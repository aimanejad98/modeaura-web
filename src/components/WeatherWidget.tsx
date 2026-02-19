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
        if (code === 0) return { text: 'Clear Sky', icon: '☀️' }
        if (code <= 3) return { text: 'Partly Cloudy', icon: '⛅' }
        if (code <= 48) return { text: 'Foggy', icon: '🌫️' }
        if (code <= 57) return { text: 'Drizzle', icon: '🌧️' }
        if (code <= 67) return { text: 'Rainy', icon: '🌧️' }
        if (code <= 77) return { text: 'Snowfall', icon: '❄️' }
        if (code <= 82) return { text: 'Showers', icon: '🌦️' }
        if (code <= 86) return { text: 'Snow Showers', icon: '🌨️' }
        if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' }
        return { text: 'Cloudy', icon: '☁️' }
    }

    function getBackgroundClass() {
        if (!weather) return 'from-gray-800 to-gray-900'
        const condition = weather.condition.toLowerCase()
        if (condition.includes('clear') || condition.includes('sunny')) {
            return 'from-[#D4AF37]/10 via-amber-500/10 to-orange-500/10' // Golden Hour
        }
        if (condition.includes('cloud') || condition.includes('partly')) {
            return 'from-slate-400/10 via-slate-500/10 to-slate-600/10' // Overcast
        }
        if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
            return 'from-indigo-900/20 via-slate-800/20 to-slate-900/20' // Moody Rain
        }
        if (condition.includes('snow')) {
            return 'from-blue-100/10 via-blue-200/5 to-white/10' // Frosty
        }
        if (condition.includes('thunder')) {
            return 'from-purple-900/20 via-slate-900/20 to-black/20' // Storm
        }
        return 'from-gray-500/10 to-slate-600/10'
    }

    const hours = time.getHours()
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening'

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${getBackgroundClass()} backdrop-blur-2xl border border-white/20 shadow-2xl min-h-[180px] group transition-all duration-1000`}>

            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-gradient-to-br from-white/20 to-transparent transform rotate-12 blur-3xl opacity-40"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-black/30 to-transparent transform -rotate-12 blur-3xl opacity-30"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-8 md:p-10 gap-8">

                {/* 1. Time & Greeting (Left) */}
                <div className="text-center md:text-left flex-1 min-w-[200px]">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">{greeting}</p>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-display font-medium text-white tracking-tight leading-none drop-shadow-lg">
                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/AM|PM/, '')}
                        <span className="text-2xl md:text-3xl ml-1 font-light opacity-60">
                            {time.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]}
                        </span>
                    </h2>
                    <p className="text-white/60 font-medium mt-2 text-lg tracking-wide">
                        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* 2. Visual Divider (Center - Tablet+) */}
                <div className="hidden md:flex flex-col items-center opacity-20">
                    <div className="w-px h-16 bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white my-2"></div>
                    <div className="w-px h-16 bg-white"></div>
                </div>

                {/* 3. Weather Conditions (Right) */}
                <div className="text-center md:text-right flex-1 min-w-[200px]">
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center md:items-end gap-2">
                            <div className="h-10 w-32 bg-white/10 rounded"></div>
                            <div className="h-6 w-24 bg-white/5 rounded"></div>
                        </div>
                    ) : weather ? (
                        <div className="flex flex-col items-center md:items-end">
                            <div className="flex items-center gap-4 mb-1">
                                <span className="text-5xl drop-shadow-md filter">{weather.icon}</span>
                                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                                    {weather.temp}°
                                </span>
                            </div>
                            <p className="text-white/90 font-medium text-lg capitalize tracking-wide mb-3">{weather.condition}</p>

                            <div className="flex items-center gap-4 text-xs font-bold text-white/60 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="opacity-70">💧</span> {weather.humidity}%
                                </span>
                                <div className="w-px h-3 bg-white/20"></div>
                                <span className="flex items-center gap-1.5">
                                    <span className="opacity-70">💨</span> {weather.wind} km/h
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-white/60">Weather unavailable</p>
                    )}
                </div>
            </div>

            {/* Location Badge (Bottom Corner) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:bottom-6 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <span className="text-xs">📍</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Windsor, ON</span>
            </div>
        </div>
    )
}
