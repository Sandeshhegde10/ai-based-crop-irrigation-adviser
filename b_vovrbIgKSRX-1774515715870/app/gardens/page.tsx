'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Leaf, MapPin, Loader } from 'lucide-react'
import Link from 'next/link'

export default function GardensPage() {
  const [gardens, setGardens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const response = await fetch('/api/gardens')
      const data = await response.json()
      setGardens(data || [])
      setLoading(false)
    }
    fetchData()
  }, [supabase, router])

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
              AquaAdvisor
            </h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Gardens</h2>
            <p className="text-gray-600 mt-1">Manage your fields and irrigation settings</p>
          </div>
          <Link href="/gardens/create">
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
              Add Garden
            </Button>
          </Link>
        </div>

        {gardens.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Leaf className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No gardens yet</h3>
              <p className="text-gray-600 mb-6">Create your first garden to get started with irrigation planning</p>
              <Link href="/gardens/create">
                <Button className="bg-green-600 hover:bg-green-700">Create First Garden</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map((garden) => (
              <Card key={garden.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{garden.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <MapPin className="w-4 h-4" />
                        {garden.location || 'No location set'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Size</p>
                      <p className="font-semibold">{garden.size || '--'} acres</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Soil Type</p>
                      <p className="font-semibold">{garden.soil_type || 'Unknown'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
