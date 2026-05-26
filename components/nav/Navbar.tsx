'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Menu, X, Shield } from 'lucide-react'
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

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '??'

  return (
    <header className={cn(
      'sticky top-0 z-50 border-b transition-all duration-200',
      scrolled
        ? 'border-border/60 bg-white/90 shadow-sm shadow-black/5 backdrop-blur-xl'
        : 'border-transparent bg-white/60 backdrop-blur-md'
    )}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-500/30">
            <Heart className="w-4 h-4 fill-white stroke-white" />
          </div>
          <span className="gradient-text-purple">KindredAdvice</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-lg transition-colors">
            Browse
          </Link>
          <Link href="/guidelines" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 py-2 rounded-lg transition-colors">
            Guidelines
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/requests/new" className={cn(buttonVariants({ size: 'sm' }), 'shadow-sm shadow-violet-500/20')}>
                Ask for Advice
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1" />}>
                  <Avatar className="w-8 h-8 ring-2 ring-border hover:ring-primary/40 transition-all">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-violet-700 text-white">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={`/profile/${user.id}`} />}>
                    My Profile
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link href="/admin" />}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>Sign In</Link>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }), 'shadow-sm shadow-violet-500/20')}>Join Free</Link>
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
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1">
          <Link href="/requests" className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors" onClick={() => setMenuOpen(false)}>
            Browse Requests
          </Link>
          <Link href="/guidelines" className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors" onClick={() => setMenuOpen(false)}>
            Community Guidelines
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-muted/60 text-primary transition-colors" onClick={() => setMenuOpen(false)}>
              <Shield className="w-4 h-4 mr-2" />Admin Dashboard
            </Link>
          )}
          <div className="pt-2 space-y-2">
            {user ? (
              <>
                <Link href="/requests/new" className={cn(buttonVariants(), 'w-full text-center')} onClick={() => setMenuOpen(false)}>
                  Ask for Advice
                </Link>
                <Button variant="outline" className="w-full" onClick={() => { setMenuOpen(false); handleSignOut() }}>Sign Out</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 text-center')} onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className={cn(buttonVariants(), 'flex-1 text-center')} onClick={() => setMenuOpen(false)}>Join Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
