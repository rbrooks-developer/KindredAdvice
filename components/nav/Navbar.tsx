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

const BRAND_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-playfair)',
  fontStyle: 'italic',
}

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
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
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
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'shadow-2xl shadow-black/40' : 'shadow-lg shadow-black/20'
      )}
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d0854 50%, #1e0a3c 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-5 h-[70px] flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Heart className="w-5 h-5 fill-rose-300 stroke-rose-300 group-hover:fill-rose-200 group-hover:stroke-rose-200 transition-colors duration-200" />
          <span className="text-[1.55rem] font-bold leading-none" style={BRAND_STYLE}>
            <span className="text-white">Kindred</span>
            <span style={{ color: '#f9a87c' }}> Advice</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {[
            { href: '/requests', label: 'Browse' },
            { href: '/guidelines', label: 'Guidelines' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-white/65 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              {label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200 hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Shield className="w-3.5 h-3.5" />Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {user ? (
            <>
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #f9a87c 0%, #f472b6 60%, #c084fc 100%)',
                  color: '#1a0533',
                  boxShadow: '0 4px 20px rgba(249,168,124,0.35)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask for Advice
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/50" />}>
                  <Avatar className="w-9 h-9 ring-2 ring-white/30 hover:ring-white/60 transition-all cursor-pointer">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: 'white' }}>{initials}</AvatarFallback>
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
              <Link
                href="/login"
                className="text-sm font-semibold text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #f9a87c 0%, #f472b6 60%, #c084fc 100%)',
                  color: '#1a0533',
                  boxShadow: '0 4px 20px rgba(249,168,124,0.35)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #f9a87c 0%, #f472b6 40%, #c084fc 70%, #7c3aed 100%)' }} />

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{ background: 'linear-gradient(180deg, #220840 0%, #1a0533 100%)' }}>
          {/* Mobile brand */}
          <div className="px-5 py-4 flex items-center gap-2 border-b border-white/10">
            <Heart className="w-4 h-4 fill-rose-300 stroke-rose-300 shrink-0" />
            <span className="text-lg font-bold leading-none" style={BRAND_STYLE}>
              <span className="text-white">Kindred</span>
              <span style={{ color: '#f9a87c' }}> Advice</span>
            </span>
          </div>

          <div className="px-4 py-3 space-y-1">
            <Link
              href="/requests"
              className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Browse Requests
            </Link>
            <Link
              href="/guidelines"
              className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Community Guidelines
            </Link>
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center text-sm font-semibold py-2.5 px-3 rounded-lg text-violet-300 hover:text-violet-200 hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Shield className="w-4 h-4 mr-2" />Admin Dashboard
              </Link>
            )}
          </div>

          <div className="px-4 pb-5 pt-1 space-y-2">
            {user ? (
              <>
                <Link
                  href="/requests/new"
                  className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #f9a87c 0%, #f472b6 60%, #c084fc 100%)',
                    color: '#1a0533',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />Ask for Advice
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-transparent"
                  onClick={() => { setMenuOpen(false); handleSignOut() }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #f9a87c 0%, #f472b6 60%, #c084fc 100%)',
                    color: '#1a0533',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Sparkles className="w-3.5 h-3.5" />Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
