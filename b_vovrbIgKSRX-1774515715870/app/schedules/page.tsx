'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Calendar, Droplets, Loader } from 'lucide-react'
import Link from 'next/link'

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([])
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

      const response = await fetch('/api/schedules')
      const data = await response.json()
      setSchedules(data || [])
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
            <h2 className="text-3xl font-bold text-gray-900">Irrigation Schedules</h2>
            <p className="text-gray-600 mt-1">Manage your automated watering plans</p>
          </div>
          <Link href="/schedules/create">
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4" />
              Create Schedule
            </Button>
          </Link>
        </div>

        {schedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules yet</h3>
              <p className="text-gray-600 mb-6">Create an irrigation schedule for your gardens</p>
              <Link href="/schedules/create">
                <Button className="bg-green-600 hover:bg-green-700">Create First Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        {schedule.crop_type}
                      </CardTitle>
                      <CardDescription>Created on {new Date(schedule.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Frequency</p>
                      <p className="font-semibold">{schedule.frequency || '--'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Water Amount</p>
                      <p className="font-semibold">{schedule.water_amount || '--'} L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold">{schedule.start_date ? new Date(schedule.start_date).toLocaleDateString() : '--'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-600">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
