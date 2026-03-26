'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { Droplets, Loader } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); setLoading(false); return }
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-blue-100 dark:from-slate-950 dark:to-slate-900">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-green-600 to-blue-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZldP6XEonKzrWzefL7YLxD13AZoZm6.png')] bg-cover bg-center"></div>
        <div className="relative z-10 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Droplets className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-black tracking-tight">AquaSync</h1>
          </div>
          <p className="text-xl text-green-100 font-medium mb-4">Smart Irrigation Management</p>
          <p className="text-green-200 text-base max-w-xs mx-auto leading-relaxed">
            Use AI-powered analysis to give every crop exactly the water it needs — no more, no less.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            {[['40%', 'Water Saved'], ['3×', 'Better Yields'], ['Real-time', 'ML Insights']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-green-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600 lg:hidden" />
            <span className="font-bold text-gray-900 dark:text-white lg:hidden">AquaSync</span>
          </Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your AquaSync account</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                <Input id="email" type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                  className="bg-white dark:bg-slate-800 h-12"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required disabled={loading}
                  className="bg-white dark:bg-slate-800 h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base" disabled={loading}>
                {loading ? <><Loader className="w-4 h-4 animate-spin mr-2" /> Signing in...</> : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/sign-up" className="text-green-600 hover:text-green-700 font-semibold">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
