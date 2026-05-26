import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { RequestCard } from '@/components/requests/RequestCard'
import type { HelpRequest } from '@/lib/types'
import { Heart, Users, MessageSquare, Shield, ArrowRight, Sparkles } from 'lucide-react'
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
  const { count: requestCount } = await supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('is_private', false).eq('status', 'open')

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-32 pt-20 px-4" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf8f6 40%, #fff1f2 100%)' }}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-300/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/40 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            A safe space for real advice
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
            You don&apos;t have to
            <br />
            figure it out{' '}
            <span className="gradient-text">alone</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Share what&apos;s on your heart. Get genuine advice from a community that listens without judgment.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/requests/new"
              className={cn(buttonVariants({ size: 'lg' }), 'text-base px-8 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200 hover:-translate-y-0.5')}
            >
              Ask for Advice <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/requests"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base px-8 bg-white/80 backdrop-blur border-violet-200 hover:bg-white hover:border-violet-300')}
            >
              Browse Requests
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Free to join · Anonymous posting available · Moderated community
          </p>
        </div>
      </section>

      {/* ── Floating stats ── */}
      <section className="relative z-10 -mt-16 mb-4 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
          {[
            { icon: Users, value: userCount?.toLocaleString() ?? '0', label: 'Members' },
            { icon: MessageSquare, value: requestCount?.toLocaleString() ?? '0', label: 'Open Posts' },
            { icon: Heart, value: replyCount?.toLocaleString() ?? '0', label: 'Replies Given' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-card rounded-2xl border border-border shadow-xl shadow-black/5 p-5 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-extrabold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent requests ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Community</p>
            <h2 className="text-3xl font-extrabold">Recent Requests</h2>
            <p className="text-muted-foreground mt-1.5">Real situations from real people — add your voice.</p>
          </div>
          <Link href="/requests" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:flex gap-1 items-center')}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requests && requests.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(requests as HelpRequest[]).map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary opacity-60" />
            </div>
            <p className="font-semibold text-lg">No requests yet</p>
            <p className="text-muted-foreground text-sm mt-1">Be the first to ask for advice!</p>
            <Link href="/requests/new" className={cn(buttonVariants(), 'mt-5')}>Ask for Advice</Link>
          </div>
        )}

        <div className="sm:hidden text-center mt-6">
          <Link href="/requests" className={cn(buttonVariants({ variant: 'outline' }))}>View all requests</Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, transparent 0%, #f5f3ff10 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Simple process</p>
            <h2 className="text-3xl font-extrabold">How KindredAdvice works</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Three simple steps to get the support you need</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                num: '01',
                title: 'Share Your Situation',
                body: 'Post what\'s going on — publicly or privately. Add up to 5 photos if they help explain your situation.',
                gradient: 'from-rose-500 to-pink-600',
                bg: 'bg-rose-50',
                shadow: 'shadow-rose-200',
              },
              {
                icon: Users,
                num: '02',
                title: 'Community Responds',
                body: 'Signed-in members offer their genuine perspective, personal experience, and heartfelt advice.',
                gradient: 'from-violet-500 to-purple-600',
                bg: 'bg-violet-50',
                shadow: 'shadow-violet-200',
              },
              {
                icon: Shield,
                num: '03',
                title: 'Stay Safe',
                body: 'Admins moderate all content. Report anything inappropriate and we\'ll act fast to keep this community kind.',
                gradient: 'from-teal-500 to-emerald-600',
                bg: 'bg-teal-50',
                shadow: 'shadow-teal-200',
              },
            ].map(({ icon: Icon, num, title, body, gradient, bg, shadow }) => (
              <div key={num} className={`${bg} rounded-3xl p-8 border border-white shadow-lg ${shadow}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-muted-foreground/50 tracking-widest mb-2">{num}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center text-white shadow-2xl shadow-violet-500/25"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #9333ea 100%)' }}
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute top-1/2 left-1/4 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />

            <div className="relative z-10 space-y-6 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles className="w-3.5 h-3.5" />
                Free forever · No credit card
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Ready to find your people?
              </h2>
              <p className="text-white/75 text-lg leading-relaxed">
                Join thousands of people sharing and supporting each other. No judgment, just kindred spirits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: 'lg' }), 'text-base px-8 bg-white text-violet-700 hover:bg-white/90 font-bold shadow-xl border-0')}
                >
                  Join KindredAdvice Free <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/requests"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base px-8 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent')}
                >
                  Browse first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
