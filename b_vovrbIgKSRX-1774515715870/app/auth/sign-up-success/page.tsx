'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
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
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Account Created!</CardTitle>
          <CardDescription>
            Please check your email to verify your account before signing in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your account and start managing your irrigation systems.
          </p>
          <Link href="/auth/login" className="block">
            <Button className="w-full">
              Return to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
