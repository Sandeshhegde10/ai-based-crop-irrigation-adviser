'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { Droplets, Loader, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/sign-up-success`,
          data: { first_name: firstName, last_name: lastName },
        },
      })

      if (authError) { setError(authError.message); setLoading(false); return }
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const perks = [
    'Upload soil reports → AI extracts all values',
    'ML model predicts exact water requirements',
    'Real-time weather-adjusted irrigation advice',
    'Dark & light mode for comfortable use',
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-blue-100 dark:from-slate-950 dark:to-slate-900">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-emerald-600 to-green-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZldP6XEonKzrWzefL7YLxD13AZoZm6.png')] bg-cover bg-center"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Droplets className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-black tracking-tight">AquaSync</h1>
          </div>
          <p className="text-xl text-green-100 font-medium mb-2">Join thousands of smart farmers</p>
          <p className="text-green-200 text-base mb-10 max-w-xs leading-relaxed">
            Get ML-powered irrigation advice tailored to your exact soil conditions — completely free.
          </p>
          <div className="space-y-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                <p className="text-green-100 text-sm">{perk}</p>
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Start optimizing your farm irrigation in seconds</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                  <Input id="firstName" placeholder="John" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} disabled={loading}
                    className="bg-white dark:bg-slate-800 h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                  <Input id="lastName" placeholder="Doe" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} disabled={loading}
                    className="bg-white dark:bg-slate-800 h-12"
                  />
                </div>
              </div>
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
              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base mt-2" disabled={loading}>
                {loading ? <><Loader className="w-4 h-4 animate-spin mr-2" /> Creating Account...</> : 'Create Free Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              By creating an account, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
