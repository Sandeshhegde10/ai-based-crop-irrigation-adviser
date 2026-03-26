'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Droplets, Leaf, Cloud, BarChart3, MessageSquare, Plus, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AquaAdvisor
            </h1>
            <p className="text-sm text-muted-foreground">Smart Irrigation Management</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.first_name || 'Farmer'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AquaAdvisor</h2>
          <p className="text-gray-600">Your intelligent irrigation management system for optimal crop yields</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                Your Gardens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Active gardens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Irrigation plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-600" />
                Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground mt-1">Location not set</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0L</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Get Started */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Set up your first garden to begin receiving irrigation recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Get started by creating your first garden and adding plants. Our AI will recommend optimal watering schedules based on weather and soil conditions.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/gardens/create">
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                      Create Garden
                    </Button>
                  </Link>
                  <Link href="/plants">
                    <Button variant="outline" className="w-full gap-2">
                      <Leaf className="w-4 h-4" />
                      Plant Library
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    AI Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Get personalized irrigation advice from our AI chatbot</p>
                  <Link href="/chat">
                    <Button size="sm" variant="outline" className="w-full">
                      Chat Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-600" />
                    Weather Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Real-time weather and location-based recommendations</p>
                  <Link href="/weather">
                    <Button size="sm" variant="outline" className="w-full">
                      View Weather
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Track water usage and optimize your irrigation</p>
                  <Link href="/analytics">
                    <Button size="sm" variant="outline" className="w-full">
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Create and manage irrigation schedules</p>
                  <Link href="/schedules">
                    <Button size="sm" variant="outline" className="w-full">
                      Manage Schedules
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/gardens" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  My Gardens
                </Button>
              </Link>
              <Link href="/plants" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  Plant Database
                </Button>
              </Link>
              <Link href="/chat" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  AI Chat Advisor
                </Button>
              </Link>
              <Link href="/schedules" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  My Schedules
                </Button>
              </Link>
              <Link href="/weather" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  Weather & Forecast
                </Button>
              </Link>
              <Link href="/analytics" className="block">
                <Button variant="ghost" className="w-full justify-start text-left">
                  Water Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ML Model Integration Info */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">ML Model Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900">
            <p className="text-sm mb-4">
              Your custom ML model for irrigation prediction is ready to be integrated. Once configured, it will provide highly accurate water requirement predictions tailored to your specific fields and crops.
            </p>
            <Link href="/settings/ml-integration">
              <Button variant="outline" className="border-amber-300 hover:bg-amber-100">
                Configure ML Model
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
