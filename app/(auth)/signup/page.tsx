'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, CheckCircle2, ArrowRight, MessageSquare, Image as ImageIcon, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'


export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length < 3 || username.length > 20) { toast.error('Username must be 3–20 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { toast.error('Username can only contain letters, numbers, and underscores.'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) { toast.error(error.message) } else { setDone(true) }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf8f6 60%, #fff1f2 100%)' }}>
        <div className="w-full max-w-md text-center space-y-6 bg-card border border-border rounded-3xl p-12 shadow-xl shadow-black/5">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold mb-2">Check your email!</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              <strong className="text-foreground">{email}</strong>.
              <br />Click it to activate your account.
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            Back to Sign In
          </Link>
        </div>
      </div>
    )
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
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-48 w-48 -translate-y-1/2 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="KindredAdvice" width={64} height={64} className="rounded-full" />
          </Link>
        </div>

        {/* Main message */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">
              Find your kindred spirits
            </h2>
            <p className="text-white/70 leading-relaxed text-base">
              Thousands of people share their situations every day and get genuine advice from a caring community. Join them — it&apos;s free.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: MessageSquare, text: 'Share publicly or privately' },
              { icon: ImageIcon, text: 'Upload up to 5 supporting photos' },
              { icon: Lock, text: 'Safe, moderated community' },
              { icon: Check, text: 'Always completely free' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-white/85 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 border-l-2 border-white/25 pl-4">
          <p className="text-sm text-white/60 italic leading-relaxed">
            &ldquo;The best advice comes from people who&apos;ve been there.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20"
        style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 40%)' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="KindredAdvice" width={80} height={80} className="rounded-full" />
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto space-y-7">
          <div>
            <h1 className="text-2xl font-extrabold">Create your account</h1>
            <p className="text-muted-foreground mt-1 text-sm">Join a safe community of kindred spirits</p>
          </div>

          {/* Email form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
              <Input
                id="username"
                placeholder="kindred_soul"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                autoComplete="username"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">3–20 characters · letters, numbers, underscores</p>
            </div>
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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11"
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              By joining, you agree to keep KindredAdvice a safe and respectful community.
            </p>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all"
              disabled={loading}
            >
              {loading ? 'Creating account…' : <>Create Account <ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
