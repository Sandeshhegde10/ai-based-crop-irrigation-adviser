'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Leaf, Droplets, CloudRain, ThermometerSun, UploadCloud, ChevronRight, Activity, Sprout, Wind, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'

export default function DashboardPage() {

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    ph: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    soil_moisture: '',
    crop_days: '',
    crop_type: '',
  })
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    
    try {
      const form = new FormData()
      form.append('document', file)
      
      const res = await fetch('/api/extract-report', { method: 'POST', body: form })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to analyze document')
      
      const ev = data.extractedValues
      setFormData({
        N: String(ev.N),
        P: String(ev.P),
        K: String(ev.K),
        ph: String(ev.ph),
        temperature: String(ev.temperature),
        humidity: String(ev.humidity),
        rainfall: String(ev.rainfall),
        soil_moisture: String(ev.soil_moisture),
        crop_days: String(ev.crop_days),
        crop_type: String(ev.crop_type),
      })
      
      // Auto trigger prediction if we also got prediction data
      if (data.prediction) {
        setResult(data.prediction)
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setPredicting(true)
    setError(null)
    setResult(null)
    
    // Convert string inputs to numbers
    const payload = {
      N: Number(formData.N) || 0,
      P: Number(formData.P) || 0,
      K: Number(formData.K) || 0,
      ph: Number(formData.ph) || 0,
      temperature: Number(formData.temperature) || 0,
      humidity: Number(formData.humidity) || 0,
      rainfall: Number(formData.rainfall) || 0,
      soil_moisture: Number(formData.soil_moisture) || 0,
      crop_days: Number(formData.crop_days) || 0,
      crop_type: formData.crop_type || 'wheat',
    }

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to run prediction')
      
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPredicting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <Droplets className="w-12 h-12 text-blue-500 animate-bounce mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading AquaSync...</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AquaSync</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
              {user?.user_metadata?.first_name ? `Farmer ${user.user_metadata.first_name}` : 'Welcome, Farmer'}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Analysis Input */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Crop & Irrigation Analysis</h2>
              <p className="text-gray-500 mt-2 text-lg">Enter your farm details or leverage our Vision ML to scan your soil health report for instant insights.</p>
            </div>

            {/* Smart Upload Card */}
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors shadow-none">
              <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Soil Health Report</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md">
                  Have a lab report or soil document? Upload an image or PDF. Our ML Vision model will detect all NPK values, humidity, and weather data automatically!
                </p>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 shadow-md shadow-blue-200 text-base"
                  disabled={uploading || predicting}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-pulse" /> Analyzing Document...</span>
                  ) : (
                    "Select Report File"
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or enter manually</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* Manual Form Card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-white rounded-t-xl border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" /> Farm Parameters
                </CardTitle>
                <CardDescription>Verify or manually enter your crop and soil conditions.</CardDescription>
              </CardHeader>
              
              <form onSubmit={handlePredict}>
                <CardContent className="p-6">
                  
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Nitrogen (N)
                      </label>
                      <Input name="N" type="number" value={formData.N} onChange={handleChange} placeholder="e.g. 80" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Phosphorous (P)
                      </label>
                      <Input name="P" type="number" value={formData.P} onChange={handleChange} placeholder="e.g. 40" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Potassium (K)
                      </label>
                      <Input name="K" type="number" value={formData.K} onChange={handleChange} placeholder="e.g. 60" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Soil pH Level
                      </label>
                      <Input name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} placeholder="e.g. 6.5" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <ThermometerSun className="w-4 h-4 text-orange-500" /> Temperature (°C)
                      </label>
                      <Input name="temperature" type="number" value={formData.temperature} onChange={handleChange} placeholder="e.g. 28" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <Wind className="w-4 h-4 text-sky-500" /> Humidity (%)
                      </label>
                      <Input name="humidity" type="number" value={formData.humidity} onChange={handleChange} placeholder="e.g. 55" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-blue-500" /> Rainfall (mm)
                      </label>
                      <Input name="rainfall" type="number" value={formData.rainfall} onChange={handleChange} placeholder="e.g. 15" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Soil Moisture
                      </label>
                      <Input name="soil_moisture" type="number" value={formData.soil_moisture} onChange={handleChange} placeholder="e.g. 400" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-500" /> Crop Age (Days)
                      </label>
                      <Input name="crop_days" type="number" value={formData.crop_days} onChange={handleChange} placeholder="e.g. 30" className="bg-gray-50" required />
                    </div>
                    <div className="space-y-2 lg:col-span-3">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        Crop Type
                      </label>
                      <select 
                        name="crop_type" 
                        value={formData.crop_type} 
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="" disabled>Select crop type...</option>
                        <option value="wheat">Wheat</option>
                        <option value="rice">Rice</option>
                        <option value="maize">Maize</option>
                        <option value="cotton">Cotton</option>
                        <option value="sugarcane">Sugarcane</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 rounded-b-xl border-t p-6 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8"
                    disabled={predicting || uploading}
                  >
                    {predicting ? (
                      <><Activity className="w-4 h-4 animate-spin" /> Generating Advice...</>
                    ) : (
                      <>Run Irrigation ML Analysis <ChevronRight className="w-4 h-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: AI Advice / Results */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">ML Irrigation Advice</h3>
              
              {!result && !predicting && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-2">Awaiting Analysis</h4>
                  <p className="text-sm text-gray-500">
                    Upload a soil report or fill out your crop details on the left, then click analyze to get personalized irrigation advice.
                  </p>
                </div>
              )}

              {predicting && (
                <div className="bg-white border border-green-200 rounded-xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-200 animate-pulse opacity-50"></div>
                    <Leaf className="w-8 h-8 text-green-600 relative z-10" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Data</h4>
                  <p className="text-sm text-gray-500">
                    Our AI model is calculating the optimal water requirements based on your specific conditions...
                  </p>
                </div>
              )}

              {result && !predicting && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-1 shadow-lg pointer-events-none mb-4">
                    <div className="bg-white rounded-lg p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-0"></div>
                      
                      <div className="flex items-center gap-2 mb-6 relative z-10">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <h4 className="font-bold text-gray-900">Analysis Complete</h4>
                      </div>

                      <div className="space-y-6 relative z-10">
                        {/* Recommendation 1 */}
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended Water Volume</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-blue-600">{result.water_amount}</span>
                            <span className="text-lg font-medium text-gray-600">Liters / acre</span>
                          </div>
                          <p className="text-xs text-blue-600/80 mt-1 font-medium bg-blue-50 px-2 py-1 rounded inline-block">Precise requirement per cycle</p>
                        </div>

                        <div className="h-px w-full bg-gray-100"></div>

                        {/* Recommendation 2 */}
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Irrigation Interval</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-emerald-600">Every {result.irrigation_days} Days</span>
                          </div>
                          <p className="text-xs text-emerald-600 mt-1 py-1">Based on current evaporation and climate rates</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertTitle className="font-semibold mb-1 flex items-center gap-2"><CloudRain className="w-4 h-4"/> Next Steps</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed">
                      Following this exact schedule will ensure your <span className="font-bold underline capitalize">{formData.crop_type || 'crop'}</span> receives optimal hydration while conserving water resources.
                    </AlertDescription>
                  </Alert>

                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
