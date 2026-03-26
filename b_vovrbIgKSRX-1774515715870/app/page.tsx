import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets, Leaf, BarChart3, MessageSquare, Cloud, Zap } from 'lucide-react'

export const metadata = {
  title: 'AquaAdvisor - Smart Irrigation Management',
  description: 'AI-powered irrigation advisory system for farmers and agricultural professionals. Optimize water usage, reduce costs, and increase crop yields.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            AquaAdvisor
          </h1>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Irrigation for Modern Farmers
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              AquaAdvisor uses AI and real-time weather data to optimize irrigation schedules, reduce water waste, and maximize crop yields for agricultural professionals.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZldP6XEonKzrWzefL7YLxD13AZoZm6.png"
              alt="Irrigation farming"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Every Farm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Garden Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and manage multiple gardens or fields with detailed crop information and soil profiles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-generated irrigation schedules optimized for your crops, weather, and soil conditions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Cloud className="w-6 h-6 text-sky-600" />
                </div>
                <CardTitle>Weather Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time weather data and forecasts to adjust irrigation in response to rainfall and climate.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>AI Chat Advisor</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Talk to our AI irrigation expert to get personalized advice and answers to your farming questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>Water Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track water usage, costs, and efficiency metrics to optimize your irrigation budget.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>ML Model Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Integrate your custom ML model for highly accurate, field-specific irrigation predictions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-2">
              Ready to Optimize Your Irrigation?
            </CardTitle>
            <CardDescription className="text-green-100 text-lg">
              Join hundreds of farmers already using AquaAdvisor to save water and increase yields.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Start Your Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2024 AquaAdvisor. Helping farmers worldwide optimize water usage.</p>
        </div>
      </footer>
    </div>
  )
}
