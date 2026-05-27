'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Menu, X, Shield, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })

    const onAvatarUpdated = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail.url
      setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev)
    }
    window.addEventListener('avatar-updated', onAvatarUpdated)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('avatar-updated', onAvatarUpdated)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const displayUsername =
    profile?.username ??
    user?.user_metadata?.username ??
    user?.email?.split('@')[0]
  const initials = displayUsername ? displayUsername.slice(0, 2).toUpperCase() : '??'

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 shadow-lg shadow-black/8 backdrop-blur-xl border-b border-border/40'
        : 'bg-white/70 backdrop-blur-md border-b border-transparent'
    )}>
      {/* Gradient accent strip */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #c026d3 35%, #f43f5e 65%, #7c3aed 100%)' }} />

      <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' }}
          >
            <Heart className="w-4 h-4 fill-white stroke-white" />
          </div>
          <span className="gradient-text-purple hidden sm:block">KindredAdvice</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-violet-50 px-4 py-2 rounded-lg transition-all">
            Browse
          </Link>
          <Link href="/guidelines" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-violet-50 px-4 py-2 rounded-lg transition-all">
            Guidelines
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-semibold text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-xl shadow-md shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask for Advice
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1" />}>
                  <Avatar className="w-8 h-8 ring-2 ring-violet-200 hover:ring-violet-400 transition-all cursor-pointer">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={`/profile/${user.id}`} />}>My Profile</DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/admin" />}>Admin Dashboard</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-xl shadow-md shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/50">
          {/* Mobile menu header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #7c3aed15, #9333ea10)' }}>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
            >
              <Heart className="w-3 h-3 fill-white stroke-white" />
            </div>
            <span className="text-sm font-bold gradient-text-purple">KindredAdvice</span>
          </div>

          <div className="bg-white/97 backdrop-blur-xl px-4 pb-4 space-y-1">
            <Link href="/requests" className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-violet-50 transition-colors" onClick={() => setMenuOpen(false)}>
              Browse Requests
            </Link>
            <Link href="/guidelines" className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-violet-50 transition-colors" onClick={() => setMenuOpen(false)}>
              Community Guidelines
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="flex items-center text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors" onClick={() => setMenuOpen(false)}>
                <Shield className="w-4 h-4 mr-2" />Admin Dashboard
              </Link>
            )}
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/requests/new"
                    className="flex items-center justify-center gap-2 w-full text-sm font-bold text-white py-2.5 rounded-xl shadow-md"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4" />Ask for Advice
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { setMenuOpen(false); handleSignOut() }}>Sign Out</Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1 text-center text-sm font-medium py-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white py-2.5 rounded-xl shadow-md"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
