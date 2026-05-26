import { createClient } from '@/lib/supabase/server'
import { RequestCard } from '@/components/requests/RequestCard'
import type { HelpRequest, Category } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchParams {
  category?: string
  page?: string
}

const PAGE_SIZE = 10

const CATEGORY_PILL_ACTIVE: Record<string, string> = {
  romantic: 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600',
  family: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
  friendship: 'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
  general: 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700',
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const category = params.category as Category | undefined
  const page = parseInt(params.page ?? '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  let query = supabase
    .from('help_requests')
    .select(`*, profiles(id, username, avatar_url), request_images(id, storage_path, display_order, is_hidden)`, { count: 'exact' })
    .eq('is_private', false)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (category) {
    query = query.eq('category', category)
  }

  const { data: requests, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const categories = ['romantic', 'family', 'friendship', 'general'] as Category[]

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf8f6 60%, #fff1f2 100%)' }} className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Community</p>
          <h1 className="text-3xl font-extrabold">Browse Requests</h1>
          <p className="text-muted-foreground mt-1.5">Real people, real situations. Offer your perspective or just read along.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/requests"
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold border transition-all duration-150',
              !category
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/requests?category=${cat}`}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold border transition-all duration-150',
                category === cat
                  ? CATEGORY_PILL_ACTIVE[cat]
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>

        {requests && requests.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(requests as HelpRequest[]).map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                {page > 1 ? (
                  <Link
                    href={`/requests?${category ? `category=${category}&` : ''}page=${page - 1}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1')}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-muted-foreground font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={`/requests?${category ? `category=${category}&` : ''}page=${page + 1}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1')}
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary opacity-60" />
            </div>
            <p className="font-bold text-lg">No requests found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {category ? `No ${CATEGORY_LABELS[category]} requests yet.` : 'Be the first to ask!'}
            </p>
            <Link href="/requests/new" className={cn(buttonVariants(), 'mt-6')}>Ask for Advice</Link>
          </div>
        )}
      </div>
    </div>
  )
}
