'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ArrowRight } from 'lucide-react'
import Image from 'next/image'


function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #9333ea 100%)' }}
      >
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-800/40" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-48 w-48 -translate-y-1/2 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="KindredAdvice" width={128} height={128} className="rounded-full w-32 h-32" />
          </Link>
        </div>

        {/* Main message */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">
              Good to have you back
            </h2>
            <p className="text-white/70 leading-relaxed text-base">
              Your community missed you. Sign in to continue sharing, supporting, and connecting with kindred spirits.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'Real advice from real people',
              'Moderated for safety & kindness',
              'Post privately if you prefer',
              'Always free',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-white/80">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-l-2 border-white/25 pl-4">
          <p className="text-sm text-white/60 italic leading-relaxed">
            &ldquo;Sometimes you just need someone who understands.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 40%)' }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="KindredAdvice" width={80} height={80} className="rounded-full" />
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto space-y-7">
          <div>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your KindredAdvice account</p>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all"
              disabled={loading}
            >
              {loading ? 'Signing in…' : <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Join free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
