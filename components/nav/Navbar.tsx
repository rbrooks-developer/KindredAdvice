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

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '??'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Heart className="w-6 h-6 fill-primary stroke-primary" />
          KindredAdvice
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
          <Link href="/guidelines" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Guidelines</Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" />Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/requests/new" className={cn(buttonVariants({ size: 'sm' }))}>
                Ask for Advice
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
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
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>Join Free</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
          <Link href="/requests" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Browse Requests</Link>
          <Link href="/guidelines" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Community Guidelines</Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="block text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {user ? (
            <>
              <Link href="/requests/new" className={cn(buttonVariants(), 'w-full text-center')} onClick={() => setMenuOpen(false)}>Ask for Advice</Link>
              <Button variant="outline" className="w-full" onClick={() => { setMenuOpen(false); handleSignOut() }}>Sign Out</Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 text-center')} onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/signup" className={cn(buttonVariants(), 'flex-1 text-center')} onClick={() => setMenuOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
