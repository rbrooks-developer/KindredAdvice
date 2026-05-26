import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { RequestCard } from '@/components/requests/RequestCard'
import type { HelpRequest } from '@/lib/types'
import { Heart, Users, Shield, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url), request_images(id, storage_path, display_order, is_hidden)`)
    .eq('is_private', false)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6)

  const { count: replyCount } = await supabase.from('replies').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="w-4 h-4 fill-primary" />
            A safe space for real advice
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            You don&apos;t have to figure it out{' '}
            <span className="text-primary">alone</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Share what&apos;s on your heart. Get genuine advice from a community that listens without judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/requests/new" className={cn(buttonVariants({ size: 'lg' }), 'text-base px-8')}>
              Ask for Advice
            </Link>
            <Link href="/requests" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base px-8')}>
              Browse Requests
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{userCount?.toLocaleString() ?? '0'}</div>
            <div className="text-sm text-muted-foreground mt-1">Community Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{requests?.length ?? '0'}+</div>
            <div className="text-sm text-muted-foreground mt-1">Active Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{replyCount?.toLocaleString() ?? '0'}</div>
            <div className="text-sm text-muted-foreground mt-1">Replies Given</div>
          </div>
        </div>
      </section>

      {/* Recent requests */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Recent Requests</h2>
            <p className="text-muted-foreground mt-1">Real situations from real people — add your voice.</p>
          </div>
          <Link href="/requests" className={cn(buttonVariants({ variant: 'outline' }))}>Browse All</Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(requests as HelpRequest[]).map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No requests yet. Be the first to ask!</p>
            <Link href="/requests/new" className={cn(buttonVariants(), 'mt-4')}>Ask for Advice</Link>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How KindredAdvice Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Share Your Situation</h3>
              <p className="text-sm text-muted-foreground">Post what&apos;s going on — publicly or privately. Add photos if it helps explain.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Community Responds</h3>
              <p className="text-sm text-muted-foreground">Signed-in members offer their genuine perspective, advice, and support.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Stay Safe</h3>
              <p className="text-sm text-muted-foreground">Admins moderate all content. Report anything inappropriate and we&apos;ll act fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">Join for free. No judgment. Just kindred spirits looking out for each other.</p>
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>Join KindredAdvice Free</Link>
        </div>
      </section>
    </div>
  )
}
