'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZldP6XEonKzrWzefL7YLxD13AZoZm6.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Authentication Error</CardTitle>
          <CardDescription>
            {error || 'An error occurred during authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-2">
            <Link href="/auth/login" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
            <Link href="/auth/sign-up" className="flex-1">
              <Button className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
