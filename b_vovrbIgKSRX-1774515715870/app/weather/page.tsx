'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Cloud, Droplets, Wind, Sun, Loader } from 'lucide-react'
import Link from 'next/link'

export default function WeatherPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    getUser()
  }, [supabase, router])

  const [fetchingWeather, setFetchingWeather] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetWeather = async () => {
    if (!location.trim()) return
    setFetchingWeather(true)
    setError(null)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
      if (!apiKey) {
        throw new Error('Weather API key is missing. Please restart the dev server.')
      }

      // Fetch 5-day forecast from WeatherAPI
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=5`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch weather data. Please check the location.')
      }

      const data = await res.json()
      
      setWeather({
        location: `${data.location.name}, ${data.location.country}`,
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        rainfall: data.current.precip_mm,
        windSpeed: data.current.wind_kph,
        conditionIcon: data.current.condition.icon,
        forecast: data.forecast.forecastday.map((day: any, i: number) => ({
          day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          high: day.day.maxtemp_c,
          low: day.day.mintemp_c,
          rainfall: day.day.totalprecip_mm,
          icon: day.day.condition.icon
        }))
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFetchingWeather(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AquaSync
            </h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="w-8 h-8 text-sky-600" />
            Weather & Forecast
          </h2>
          <p className="text-gray-600 mt-1">Real-time weather data for irrigation planning</p>
        </div>

        {/* Location Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or farm name..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetWeather()}
              />
              <Button onClick={handleGetWeather} className="bg-blue-600 hover:bg-blue-700" disabled={fetchingWeather}>
                {fetchingWeather ? <Loader className="animate-spin" /> : 'Get Weather'}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {weather ? (
          <div className="space-y-6">
            {/* Current Weather */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={weather.conditionIcon} alt="weather" className="w-8 h-8" />
                  Current Weather in {weather.location}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-2xl font-bold">{weather.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplets className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Cloud className="w-8 h-8 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Rainfall</p>
                      <p className="text-2xl font-bold">{weather.rainfall} mm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="w-8 h-8 text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>5-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {weather.forecast.map((day: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 text-center">
                      <p className="font-semibold mb-1">{day.day}</p>
                      <img src={day.icon} alt="condition" className="w-12 h-12 mx-auto mb-2" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">High</p>
                          <p className="text-lg font-bold">{day.high}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Low</p>
                          <p className="text-lg font-bold">{day.low}°C</p>
                        </div>
                        <div className="flex items-center justify-center gap-1 pt-2 border-t">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <p className="text-sm">{day.rainfall} mm</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Irrigation Recommendation */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Irrigation Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-900">
                <p>
                  Based on current weather conditions and the 5-day forecast, it&apos;s recommended to water in the early morning (6:00 AM) to reduce evaporation. Expect rainfall tomorrow, so adjust irrigation accordingly.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Enter a location to view weather data and forecasts</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
