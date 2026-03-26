'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Zap, Loader, CheckCircle2, FlaskConical } from 'lucide-react'
import Link from 'next/link'

export default function MLIntegrationPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    N: 80,
    P: 40,
    K: 60,
    ph: 6.8,
    temperature: 30,
    humidity: 22,
    rainfall: 50,
    soil_moisture: 300,
    crop_days: 45,
    crop_type: "wheat",
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
        setLoading(false)
      }
    }
    getUser()
  }, [supabase, router])

  const handlePredict = async () => {
    setPredicting(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction')
      }
      
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPredicting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'crop_type' ? value : Number(value) 
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-8 h-8 text-green-600" />
                ML Model Integration
              </h2>
              <p className="text-gray-600 mt-1">Your local Smart Irrigation model is active and running natively!</p>
            </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 font-bold">System Online</AlertTitle>
            <AlertDescription className="text-green-800">
              The Random Forest/XGBoost smart irrigation models have been successfully loaded and bound to the <code className="font-semibold bg-green-100 px-1 py-0.5 rounded">/api/predict</code> endpoint. 
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                Live Model Testing Sandbox
              </CardTitle>
              <CardDescription>Enter test values to run a live prediction against the Python ML models, or upload a farm report document to auto-fill the fields.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Document Upload Section */}
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="h-12 w-12 bg-white border rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Upload Farm Report (PDF or Image)</span>
                  <span className="text-xs text-gray-500 mt-1">Our Vision AI will auto-extract Soil & Weather metrics!</span>
                </label>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="application/pdf, image/png, image/jpeg" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('document', file);
                    
                    setPredicting(true);
                    try {
                      const res = await fetch('/api/extract-report', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (res.ok) {
                        setFormData(prev => ({ ...prev, ...data.extractedValues }));
                        setError(null);
                        alert("✅ Vision AI successfully read the document and auto-filled the parameters!");
                      } else {
                        setError(data.error || 'Failed to extract values from document');
                      }
                    } catch (err: any) {
                      setError(err.message);
                    } finally {
                      setPredicting(false);
                    }
                  }}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or enter manually</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Nitrogen (N)</label>
                  <Input name="N" type="number" value={formData.N} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Phosphorous (P)</label>
                  <Input name="P" type="number" value={formData.P} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Potassium (K)</label>
                  <Input name="K" type="number" value={formData.K} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">pH Level</label>
                  <Input name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Temp (°C)</label>
                  <Input name="temperature" type="number" value={formData.temperature} onChange={handleChange} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Humidity (%)</label>
                  <Input name="humidity" type="number" value={formData.humidity} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Rainfall (mm)</label>
                  <Input name="rainfall" type="number" value={formData.rainfall} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Soil Moisture</label>
                  <Input name="soil_moisture" type="number" value={formData.soil_moisture} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Crop Age (Days)</label>
                  <Input name="crop_days" type="number" value={formData.crop_days} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Crop Type</label>
                  <Input name="crop_type" type="text" value={formData.crop_type} onChange={handleChange} />
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={handlePredict}
                disabled={predicting}
              >
                {predicting ? <Loader className="animate-spin mr-2" /> : 'Run Prediction Model'}
              </Button>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-lg">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">ML Prediction Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Recommended Water Amount</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{result.water_amount} <span className="text-base font-normal text-muted-foreground inline-block align-middle">L / cycle</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Irrigation Interval</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">Every {result.irrigation_days} <span className="text-base font-normal text-muted-foreground inline-block align-middle">days</span></p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
