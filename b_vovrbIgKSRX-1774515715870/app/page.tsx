import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets, Leaf, BarChart3, MessageSquare, Cloud, Zap, Github } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata = {
  title: 'AquaSync - Smart Irrigation Management',
  description: 'AI-powered irrigation advisory system for farmers and agricultural professionals. Optimize water usage, reduce costs, and increase crop yields.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-green-950 dark:via-blue-950 dark:to-emerald-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-black/40 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
            AquaSync
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="hidden sm:inline-block">
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
            <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-tight">
              Smart Irrigation for Modern Farmers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              AquaSync uses AI, machine learning and real-time weather data to optimize irrigation schedules, reduce water waste, and maximize crop yields for agricultural professionals.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="dark:bg-slate-900">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
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
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50 mb-12">
          Powerful Features for Every Farm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="dark:bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Crop Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="dark:text-gray-400">
                Detailed profiles tracking nitrogen, potassium, and soil health with dynamic condition modeling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="dark:text-gray-400">
                AI-generated irrigation schedules optimizing exact water liters required per watering cycle.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>AI Farm Advisor</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="dark:text-gray-400">
                Upload lab reports via Gemini Vision AI to instantly receive intelligent farming advice.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Meet the Team / Portfolio */}
      <section className="bg-white/50 dark:bg-slate-900/30 py-24 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12">
            Meet the Builders
          </h3>
          <div className="flex justify-center flex-wrap gap-8">
            <div className="max-w-xs text-center border p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border-gray-200 dark:border-gray-800">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=AquaSync1&backgroundColor=ffd5dc`} alt="Team Member 1" className="w-full h-full object-cover"/>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Sandesh Hegde</h4>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">Lead Developer & Innovator</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Built the core architecture, full-stack framework, and ML model connections for the hackathon.</p>
              <div className="flex justify-center gap-4 text-gray-500">
                <a href="https://github.com/Sandeshhegde10" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-3xl text-white mb-2">
              Ready to Upgrade Your Farm?
            </CardTitle>
            <CardDescription className="text-green-50 text-lg max-w-2xl mx-auto">
              Deploy our AI model on your farm today to minimize resource waste and grow healthier crops.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center relative z-10 pt-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 hover:scale-105 transition-transform">
                Open Dashboard Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 backdrop-blur mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 AquaSync. Created by Sandesh Hegde for agricultural modernization.</p>
        </div>
      </footer>
    </div>
  )
}
