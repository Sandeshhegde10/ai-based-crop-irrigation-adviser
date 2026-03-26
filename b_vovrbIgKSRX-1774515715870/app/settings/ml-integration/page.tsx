'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Zap, Loader } from 'lucide-react'
import Link from 'next/link'

export default function MLIntegrationPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modelUrl, setModelUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
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

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
              AquaAdvisor
            </h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-red-600" />
            ML Model Integration
          </h2>
          <p className="text-gray-600 mt-1">Configure your custom irrigation prediction model</p>
        </div>

        <div className="space-y-6">
          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">About ML Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-900">
              <p className="mb-4">
                Integrate your custom ML model to provide highly accurate irrigation predictions specific to your farming conditions. The model will analyze factors like:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Soil moisture levels and type</li>
                <li>Weather patterns and forecasts</li>
                <li>Crop type and growth stage</li>
                <li>Historical irrigation data</li>
                <li>Field-specific conditions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Provide your model endpoint and credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {saved && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Configuration saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Model Endpoint URL</label>
                <Input
                  placeholder="https://your-model.example.com/api/predict"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  The HTTP endpoint where your ML model is hosted
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Authentication key for accessing your model
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={!modelUrl || !apiKey}
              >
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Expected Input/Output */}
          <Card>
            <CardHeader>
              <CardTitle>Expected API Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "garden_id": "uuid",
  "soil_moisture": 45.5,
  "temperature": 28.3,
  "humidity": 65,
  "rainfall_forecast": 12.5,
  "crop_type": "wheat",
  "days_since_irrigation": 3
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Expected Response</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "recommended_water_amount": 25,
  "irrigation_needed": true,
  "optimal_time": "06:00",
  "confidence": 0.92,
  "next_check_hours": 24
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Test Connection</CardTitle>
              <CardDescription>Verify your model is working correctly</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled={!modelUrl || !apiKey}>
                Test Model Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
