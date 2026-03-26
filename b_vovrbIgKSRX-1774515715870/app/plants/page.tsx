'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Leaf, Search, Loader } from 'lucide-react'
import Link from 'next/link'

export default function PlantsPage() {
  const [plants, setPlants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchPlants = async () => {
      const response = await fetch(`/api/plants?search=${searchTerm}`)
      const data = await response.json()
      setPlants(data || [])
      setLoading(false)
    }
    
    const timer = setTimeout(() => {
      fetchPlants()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Plant Database</h2>
          <p className="text-gray-600">Browse crops and their water requirements</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" />
          </div>
        ) : plants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Leaf className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No plants found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <Card key={plant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    {plant.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Water Requirement</p>
                    <p className="font-semibold">{plant.water_requirement} mm/week</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Growing Period</p>
                    <p className="font-semibold">{plant.growing_period} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-sm text-gray-700">{plant.description}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add to Garden
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
